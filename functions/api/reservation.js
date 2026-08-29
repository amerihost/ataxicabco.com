const recentSubmissions = new Map();
const duplicateWindowMs = 10 * 60 * 1000;

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

const allowedPaymentPreferences = new Set([
  "Credit card",
  "Cash",
  "Cashier's check / money order",
  "Undecided",
]);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: jsonHeaders,
  });
}

function clean(value, maxLength) {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
}

function validateSubmission(input) {
  const submission = {
    submissionId: clean(input.submissionId, 100),
    name: clean(input.name, 120),
    phone: clean(input.phone, 40),
    email: clean(input.email, 254),
    pickupAddress: clean(input.pickupAddress, 300),
    pickupDate: clean(input.pickupDate, 10),
    pickupTime: clean(input.pickupTime, 5),
    passengers: input.passengers,
    destinationAddress: clean(input.destinationAddress, 300),
    airlineName: clean(input.airlineName, 120),
    flightNumber: clean(input.flightNumber, 40),
    airportArrivalTime: clean(input.airportArrivalTime, 5),
    roundTrip: clean(input.roundTrip, 3),
    paymentPreference: clean(input.paymentPreference, 60),
  };

  const required = [
    ["name", "name"],
    ["phone", "phone number"],
    ["email", "email address"],
    ["pickupAddress", "pickup address"],
    ["pickupDate", "pickup date"],
    ["pickupTime", "pickup time"],
    ["destinationAddress", "destination address"],
    ["submissionId", "submission"],
  ];

  for (const [field, label] of required) {
    if (!submission[field]) {
      return { error: `Please provide your ${label}.` };
    }
  }

  if (!validEmail(submission.email)) {
    return { error: "Please provide a valid email address." };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(submission.pickupDate)) {
    return { error: "Please provide a valid pickup date." };
  }

  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(submission.pickupTime)) {
    return { error: "Please provide a valid pickup time." };
  }

  if (
    !Number.isInteger(submission.passengers) ||
    submission.passengers < 1 ||
    submission.passengers > 50
  ) {
    return { error: "Please provide a passenger count between 1 and 50." };
  }

  if (!["Yes", "No"].includes(submission.roundTrip)) {
    return { error: "Please choose whether your trip is round trip." };
  }

  if (
    submission.paymentPreference &&
    !allowedPaymentPreferences.has(submission.paymentPreference)
  ) {
    return { error: "Please choose a valid payment preference." };
  }

  return { submission };
}

function emailText(submission) {
  const lines = [
    "New reservation request from ataxicabco.com",
    "",
    "CUSTOMER",
    `Name: ${submission.name}`,
    `Phone: ${submission.phone}`,
    `Email: ${submission.email}`,
    "",
    "TRIP",
    `Pickup address: ${submission.pickupAddress}`,
    `Pickup date: ${submission.pickupDate}`,
    `Pickup time: ${submission.pickupTime}`,
    `Passengers: ${submission.passengers}`,
    `Destination address: ${submission.destinationAddress}`,
    `Round trip: ${submission.roundTrip}`,
    `Preferred payment method: ${submission.paymentPreference || "Not provided"} (preference only)`,
  ];

  if (
    submission.airlineName ||
    submission.flightNumber ||
    submission.airportArrivalTime
  ) {
    lines.push(
      "",
      "AIRPORT INFORMATION",
      `Airline: ${submission.airlineName || "Not provided"}`,
      `Flight number: ${submission.flightNumber || "Not provided"}`,
      `Airport arrival time: ${submission.airportArrivalTime || "Not provided"}`,
    );
  }

  return lines.join("\n");
}

async function verifyTurnstile(request, token, secret) {
  if (!secret) return true;
  if (!token) return false;

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret,
        response: token,
        remoteip: request.headers.get("CF-Connecting-IP") || undefined,
      }),
    },
  );

  if (!response.ok) return false;
  const result = await response.json();
  return result.success === true;
}

export async function onRequestPost({ request, env }) {
  let input;

  try {
    const contentType = request.headers.get("Content-Type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return json({ error: "Please submit the reservation form again." }, 415);
    }
    input = await request.json();
  } catch {
    return json({ error: "Please submit the reservation form again." }, 400);
  }

  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return json({ error: "Please submit the reservation form again." }, 400);
  }

  if (clean(input.website, 120)) {
    return json({ error: "Please submit the reservation form again." }, 400);
  }

  const validation = validateSubmission(input);
  if (validation.error) return json({ error: validation.error }, 400);

  const { submission } = validation;
  const now = Date.now();
  const lastSubmittedAt = recentSubmissions.get(submission.submissionId);
  if (lastSubmittedAt && now - lastSubmittedAt < duplicateWindowMs) {
    return json(
      { error: "This reservation has already been submitted." },
      409,
    );
  }

  try {
    const turnstileValid = await verifyTurnstile(
      request,
      clean(input.turnstileToken, 2048),
      env.TURNSTILE_SECRET_KEY,
    );
    if (!turnstileValid) {
      return json(
        { error: "Please complete the verification and try again." },
        400,
      );
    }
  } catch {
    return json(
      { error: "We could not verify the form. Please try again." },
      400,
    );
  }

  const to = clean(env.RESERVATION_TO_EMAIL, 254);
  const from = clean(env.RESERVATION_FROM_EMAIL, 254);
  const apiKey = clean(env.RESEND_API_KEY, 512);

  if (!to || !from || !apiKey) {
    return json(
      {
        error:
          "Online reservations are temporarily unavailable. Please call 843-575-5000.",
      },
      503,
    );
  }

  recentSubmissions.set(submission.submissionId, now);

  try {
    const bcc = clean(env.RESERVATION_BCC_EMAIL, 512)
      .split(",")
      .map((address) => address.trim())
      .filter(Boolean);

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        ...(bcc.length > 0 ? { bcc } : {}),
        reply_to: submission.email,
        subject: `Reservation request from ${submission.name}`,
        text: emailText(submission),
      }),
    });

    if (!resendResponse.ok) {
      recentSubmissions.delete(submission.submissionId);
      return json(
        {
          error:
            "We could not send your reservation right now. Please call 843-575-5000.",
        },
        502,
      );
    }

    return json({
      ok: true,
      message:
        "Your reservation request was sent. We will follow up using the contact information provided.",
    });
  } catch {
    recentSubmissions.delete(submission.submissionId);
    return json(
      {
        error:
          "We could not send your reservation right now. Please call 843-575-5000.",
      },
      502,
    );
  }
}