type PolicySection = {
  heading: string;
  text: string;
};

export const privacySections: PolicySection[] = [
  {
    heading: "Information you share",
    text: "The public online reservation form is currently deactivated. This website does not currently collect personal information through an active online form or accept online reservation submissions. If you contact us by phone or email, we may use the information you choose to share to respond to your inquiry.",
  },
  {
    heading: "Technical and security information",
    text: "When you access this website, hosting and security providers such as Cloudflare may automatically process technical information, including your IP address, browser and device information, request logs, and security or anti-abuse data. This processing helps deliver the website and protect it against misuse.",
  },
  {
    heading: "No sale of personal information",
    text: "We do not sell personal information.",
  },
  {
    heading: "External links",
    text: "Links to other websites take you to third-party sites with their own privacy practices. This policy does not cover how those sites collect or use information. Review their policies before sharing information with them.",
  },
  {
    heading: "Future changes",
    text: "If online forms or other data-collection features are reactivated or added in the future, this policy may be updated to explain those practices. Please review this page for the current policy.",
  },
];

export const termsSections: PolicySection[] = [
  {
    heading: "Using this website",
    text: "By using this website, you accept these Terms of Use. The site provides general information about A Happy Taxi Cab Co. and its services. The public online reservation form is currently deactivated; using this site does not create or confirm a booking. Please contact us directly about a ride.",
  },
  {
    heading: "Information and service availability",
    text: "We aim to provide useful information, but do not guarantee that service availability, schedules, airport information, or other website content is always current, complete, or accurate. Please confirm trip details and availability directly with us before making travel arrangements.",
  },
  {
    heading: "Third-party websites",
    text: "External links are provided for convenience. We do not control third-party websites and are not responsible for their content, availability, terms, or privacy practices. Your use of those sites is subject to their own terms.",
  },
  {
    heading: "Content, branding, and photographs",
    text: "Website text, branding, logos, photographs, and other content belong to A Happy Taxi Cab Co. or their respective rights holders and are protected by applicable intellectual-property laws. You may view the site for personal, informational use. Other use, copying, or distribution requires permission from the relevant rights holder unless permitted by law.",
  },
  {
    heading: "Limits on liability",
    text: "The website is provided as available, without a guarantee of uninterrupted or error-free access. To the extent permitted by law, A Happy Taxi Cab Co. is not liable for indirect or consequential losses arising from use of, inability to use, or reliance on this website or linked third-party sites. Nothing in these terms excludes or limits liability or rights that cannot lawfully be excluded or limited.",
  },
];

export function LegalContent({ sections }: { sections: PolicySection[] }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8 lg:py-16">
      <div className="max-w-3xl space-y-8">
        {sections.map(({ heading, text }) => (
          <section key={heading}>
            <h2 className="font-serif text-2xl font-bold text-[#172536]">{heading}</h2>
            <p className="mt-3 text-base leading-7 text-[#527477]">{text}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
