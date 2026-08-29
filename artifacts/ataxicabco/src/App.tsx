import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Mail,
  MapPin,
  Menu,
  Plane,
  Phone,
  Route as RouteIcon,
  ShieldCheck,
  X,
} from "lucide-react";
import { Link, Route, Switch, Router as WouterRouter } from "wouter";

const PHONE = "843-575-5000";
const EMAIL = "happycabco@gmail.com";
const turnstileSiteKey = (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined)?.trim();

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => string;
  remove: (widgetId: string | HTMLElement) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const serviceAreas = [
  "Okatie",
  "Bluffton",
  "Sun City",
  "Hardeeville",
  "Ridgeland",
  "Estill",
  "Hampton",
  "Yemassee",
  "Green Pond",
  "Walterboro",
  "Brunson",
  "Port Royal",
];

const seaIslands = [
  "Brays Island",
  "Cat Island",
  "Fripp Island",
  "St. Helena Island",
  "Ladys Island",
  "Spring Island",
  "Callawassie Island",
  "Parris Island",
];

const airports = [
  "Savannah/Hilton Head International Airport",
  "Hilton Head Island Airport",
  "Charleston International Airport",
];

function usePageMeta(title: string, description: string, path: string) {
  useEffect(() => {
    document.title = title;

    const setMeta = (selector: string, attributes: Record<string, string>) => {
      let element = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement("meta");
        document.head.appendChild(element);
      }
      Object.entries(attributes).forEach(([name, value]) => element?.setAttribute(name, value));
    };

    const canonicalUrl = `https://ataxicabco.com${path}`;
    setMeta('meta[name="description"]', { name: "description", content: description });
    setMeta('meta[property="og:title"]', { property: "og:title", content: title });
    setMeta('meta[property="og:description"]', { property: "og:description", content: description });
    setMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
    setMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    setMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });

    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [description, path, title]);
}

type FormValues = {
  name: string;
  phone: string;
  email: string;
  pickupAddress: string;
  date: string;
  time: string;
  passengers: string;
  destinationAddress: string;
  airline: string;
  flightNumber: string;
  airportArrivalTime: string;
  roundTrip: "Yes" | "No";
  payment: string;
  website: string;
};

const initialForm: FormValues = {
  name: "",
  phone: "",
  email: "",
  pickupAddress: "",
  date: "",
  time: "",
  passengers: "1",
  destinationAddress: "",
  airline: "",
  flightNumber: "",
  airportArrivalTime: "",
  roundTrip: "No",
  payment: "No preference",
  website: "",
};

function BrandMark({ dark = false }: { dark?: boolean }) {
  return (
    <span className={`flex items-center gap-3 ${dark ? "text-[#fbf6e9]" : "text-[#172536]"}`}>
      <span className={`block shrink-0 overflow-hidden rounded-xl p-1 ${dark ? "bg-[#fbf6e9]" : "bg-white mix-blend-multiply"}`}>
        <img src="/images/archive/logonew.jpg" alt="A Happy Taxi Cab Co." className="h-9 w-[194px] object-contain sm:h-10 sm:w-[220px]" />
      </span>
    </span>
  );
}

function ButtonLink({
  href,
  children,
  variant = "dark",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "dark" | "yellow" | "outline";
  className?: string;
}) {
  const styles = {
    dark: "bg-[#172536] text-[#fbf6e9] hover:bg-[#31505c]",
    yellow: "bg-[#f8d34e] text-[#172536] hover:bg-[#f5c72d]",
    outline: "border border-[#b6c5bb] bg-transparent text-[#172536] hover:border-[#172536] hover:bg-[#e9efe7]",
  };
  const content = (
    <>
      {children}
    </>
  );
  if (href.startsWith("tel:") || href.startsWith("mailto:")) {
    return (
      <a
        href={href}
        data-testid={`link-${href.replaceAll("/", "") || "home"}`}
        className={`group inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-colors ${styles[variant]} ${className}`}
      >
        {content}
      </a>
    );
  }
  return (
    <Link
      href={href}
      data-testid={`link-${href.replaceAll("/", "") || "home"}`}
      className={`group inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-colors ${styles[variant]} ${className}`}
    >
      {content}
    </Link>
  );
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    ["/", "Home"],
    ["/airport/", "Airport service"],
    ["/reservations/", "Reservations"],
    ["/contact/", "Contact"],
  ];
  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-[#f8d34e] focus:px-4 focus:py-2 focus:text-sm focus:font-bold">
        Skip to content
      </a>
      <div className="bg-[#31505c] px-4 py-2 text-center font-mono text-[.61rem] uppercase tracking-[.16em] text-[#d6e5d9]">
        <span className="hidden sm:inline">Serving Beaufort, the Lowcountry & Sea Islands</span>
        <span className="sm:hidden">Beaufort · Lowcountry · Sea Islands</span>
      </div>
      <header className="sticky top-0 z-50 border-b border-[#d7dfd3] bg-[#fbf6e9]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" data-testid="link-brand-home" aria-label="A Happy Taxi Cab Co. home">
            <BrandMark />
          </Link>
          <nav aria-label="Main navigation" className="hidden items-center gap-7 lg:flex">
            {links.map(([href, label]) => (
              <Link key={href} href={href} data-testid={`link-nav-${label.toLowerCase().replaceAll(" ", "-")}`} className="text-sm font-semibold text-[#31505c] transition-colors hover:text-[#172536]">
                {label}
              </Link>
            ))}
            <ButtonLink href={`tel:${PHONE}`} variant="yellow" className="min-h-10 px-4 py-2">
              Call now <ArrowUpRight size={16} />
            </ButtonLink>
          </nav>
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            data-testid="button-toggle-navigation"
            className="grid h-11 w-11 place-items-center rounded-full border border-[#b6c5bb] text-[#172536] lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
        {menuOpen && (
          <nav id="mobile-navigation" aria-label="Mobile navigation" className="border-t border-[#d7dfd3] bg-[#f1f5ed] px-4 py-4 lg:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              {links.map(([href, label]) => (
                <Link key={href} href={href} data-testid={`link-mobile-${label.toLowerCase().replaceAll(" ", "-")}`} onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 text-base font-semibold text-[#172536] hover:bg-[#e1ebe1]">
                  {label}
                </Link>
              ))}
              <a href={`tel:${PHONE}`} data-testid="link-mobile-call" className="mt-2 flex items-center justify-center gap-2 rounded-full bg-[#f8d34e] px-4 py-3 font-bold text-[#172536]">
                Call now <ArrowUpRight size={16} />
              </a>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}

function Footer() {
  return (
    <footer className="bg-[#172536] text-[#fbf6e9]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_.8fr_.9fr_.9fr] lg:px-8 lg:py-16">
        <div>
          <BrandMark dark />
          <p className="mt-6 max-w-sm text-sm leading-7 text-[#bed2c8]">A Happy Taxi Cab Co. connects Beaufort, the Lowcountry, and the Sea Islands with straightforward taxi service.</p>
        </div>
        <div>
          <p className="font-mono text-[.62rem] uppercase tracking-[.18em] text-[#f8d34e]">Explore</p>
          <div className="mt-4 flex flex-col items-start gap-3 text-sm text-[#d6e5d9]">
            <Link href="/airport/" data-testid="link-footer-airport" className="hover:text-[#f8d34e]">Airport service</Link>
            <Link href="/reservations/" data-testid="link-footer-reservations" className="hover:text-[#f8d34e]">Reservations</Link>
            <Link href="/contact/" data-testid="link-footer-contact" className="hover:text-[#f8d34e]">Contact</Link>
          </div>
        </div>
        <div>
          <p className="font-mono text-[.62rem] uppercase tracking-[.18em] text-[#f8d34e]">Reach us</p>
          <div className="mt-4 flex flex-col items-start gap-3 text-sm text-[#d6e5d9]">
            <a href={`tel:${PHONE}`} data-testid="link-footer-phone" className="hover:text-[#f8d34e]">{PHONE}</a>
            <a href={`mailto:${EMAIL}`} data-testid="link-footer-email" className="break-all hover:text-[#f8d34e]">{EMAIL}</a>
            <span>Beaufort, South Carolina</span>
          </div>
        </div>
        <div>
          <p className="font-mono text-[.62rem] uppercase tracking-[.18em] text-[#f8d34e]">You can also visit us at:</p>
          <div className="mt-4 flex flex-col items-start gap-3 text-sm text-[#d6e5d9]">
            <a href="http://www.happycabco.com" target="_blank" rel="noopener noreferrer" data-testid="link-footer-happy-cab-co" className="rounded-md py-1 hover:text-[#f8d34e]">Happy Cab Co.</a>
            <a href="http://www.adrtaxi.com" target="_blank" rel="noopener noreferrer" data-testid="link-footer-adr-taxi" className="rounded-md py-1 hover:text-[#f8d34e]">ADR Taxi</a>
          </div>
        </div>
      </div>
      <div className="border-t border-[#314250] px-4 py-5 text-center font-mono text-[.61rem] uppercase tracking-[.13em] text-[#8eaba3]">A Happy Taxi Cab Co. · Serving the Lowcountry and Sea Islands</div>
    </footer>
  );
}

function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-[#fbf6e9] text-[#172536]">
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </div>
  );
}

function SectionHeading({ eyebrow, title, body, light = false }: { eyebrow: string; title: string; body?: string; light?: boolean }) {
  return (
    <div className={light ? "text-[#fbf6e9]" : "text-[#172536]"}>
      <p className={`font-mono text-[.66rem] font-bold uppercase tracking-[.2em] ${light ? "text-[#f8d34e]" : "text-[#4e8585]"}`}>{eyebrow}</p>
      <h2 className="mt-3 max-w-2xl font-serif text-4xl font-bold leading-[.98] tracking-[-.04em] sm:text-5xl">{title}</h2>
      {body && <p className={`mt-5 max-w-xl text-base leading-7 ${light ? "text-[#c9d9ce]" : "text-[#527477]"}`}>{body}</p>}
    </div>
  );
}

function ArchivePhoto({
  src,
  alt,
  caption,
  className = "",
  imageClassName = "",
}: {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  imageClassName?: string;
}) {
  const webpSrc = src.replace("/archive/", "/archive/web/").replace(/\.jpg$/, ".webp");
  return (
    <figure className={className}>
      <div className="overflow-hidden rounded-[1.5rem] border border-[#b6c5bb] bg-[#e6eee5]">
        <picture>
          <source srcSet={webpSrc} type="image/webp" />
          <img src={src} alt={alt} loading="lazy" className={`block h-full w-full object-cover ${imageClassName}`} />
        </picture>
      </div>
      {caption && <figcaption className="mt-3 font-mono text-[.59rem] uppercase tracking-[.13em] text-[#527477]">{caption}</figcaption>}
    </figure>
  );
}

function ArchiveHero() {
  return (
    <div className="relative h-[360px] overflow-hidden rounded-[2rem] bg-[#dce9df] sm:h-[440px]">
      <picture>
        <source srcSet="/images/archive/web/crownvic.webp" type="image/webp" />
        <img src="/images/archive/crownvic.jpg" alt="Green taxi marked Happy Taxi Cab Co. parked beneath trees." className="h-full w-full object-cover" />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-t from-[#172536]/80 via-transparent to-[#172536]/10" />
      <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4 sm:bottom-8 sm:left-8 sm:right-8">
        <div className="rounded-2xl border border-white/30 bg-[#fbf6e9]/90 px-4 py-3 backdrop-blur-sm">
          <p className="font-mono text-[.6rem] uppercase tracking-[.16em] text-[#527477]">Company archive</p>
          <p className="mt-1 font-serif text-xl font-bold">A Happy Taxi Cab Co.</p>
        </div>
        <span className="rounded-full bg-[#f8d34e] px-3 py-2 font-mono text-[.6rem] font-bold uppercase tracking-[.13em] text-[#172536]">Beaufort, SC</span>
      </div>
    </div>
  );
}

function ArchiveFleetSection() {
  return (
    <section className="bg-[#f1f5ed]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:items-end lg:gap-20">
          <SectionHeading eyebrow="From the company archive" title="A look at the vehicles behind the service." body="These original vehicle photographs are preserved for client review. The images are shown as found, without invented model or year details." />
          <div className="grid gap-4 sm:grid-cols-3">
            <ArchivePhoto src="/images/archive/impala.jpg" alt="Black sedan taxi with ADR Taxi markings." caption="Original vehicle photo" imageClassName="aspect-[1.7] sm:aspect-[.8] lg:aspect-[.95]" />
            <ArchivePhoto src="/images/archive/cars.jpg" alt="Black sedan taxi with ADR Taxi markings parked beside a fence." caption="Original vehicle photo" imageClassName="aspect-[1.7] sm:aspect-[.8] lg:aspect-[.95]" />
            <ArchivePhoto src="/images/archive/cars1.jpg" alt="White taxis with A taxicab Co. markings." caption="Original vehicle photo" imageClassName="aspect-[1.7] sm:aspect-[.8] lg:aspect-[.95]" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Home() {
  usePageMeta(
    "A Happy Taxi Cab Co. | Beaufort Taxi Service",
    "Taxi service for Beaufort, the Lowcountry, and Sea Islands of South Carolina. Call or reserve a ride with A Happy Taxi Cab Co.",
    "/",
  );

  return (
    <>
      <section className="paper-grid border-b border-[#d7dfd3]">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:grid-cols-[.95fr_1.05fr] lg:items-center lg:gap-20 lg:px-8">
          <div className="page-enter">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#b6c5bb] bg-[#fbf6e9] px-3 py-2 font-mono text-[.61rem] font-bold uppercase tracking-[.15em] text-[#527477]">
              <span className="h-2 w-2 rounded-full bg-[#4e8585]" /> Taxi service · Beaufort, SC
            </div>
            <h1 className="max-w-xl font-serif text-[clamp(3.2rem,11vw,6.7rem)] font-bold leading-[.88] tracking-[-.065em]">A ride that starts with a hello.</h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-[#527477]">A Happy Taxi Cab Co. is your straightforward starting point for getting around Beaufort, the Lowcountry, and the Sea Islands.</p>
            <div className="mt-8 flex flex-col gap-3 min-[430px]:flex-row">
              <ButtonLink href={`tel:${PHONE}`} variant="yellow" className="w-full min-[430px]:w-auto">Call now <Phone size={16} /></ButtonLink>
              <ButtonLink href="/reservations/" variant="dark" className="w-full min-[430px]:w-auto">Reserve a ride <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></ButtonLink>
            </div>
            <div className="mt-7 flex items-start gap-3 text-sm text-[#527477]">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#4e8585]" />
              <span>Tell us where you’re going, when you need to go, and how to reach you.</span>
            </div>
          </div>
          <div className="page-enter delay-2"><ArchiveHero /></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[.68fr_1.32fr] lg:gap-20">
          <SectionHeading eyebrow="Start here" title="Choose the kind of ride you need." body="No maze of menus. Pick a next step and we’ll take it from there." />
          <div className="grid gap-4 sm:grid-cols-2">
            <ActionCard icon={<Phone />} title="Call now" body={PHONE} href={`tel:${PHONE}`} accent />
            <ActionCard icon={<CalendarDays />} title="Reserve a ride" body="Send trip details online" href="/reservations/" />
            <ActionCard icon={<Plane />} title="Airport service" body="South Carolina destinations" href="/airport/" />
            <ActionCard icon={<Mail />} title="Contact" body="Questions or service area" href="/contact/" />
          </div>
        </div>
      </section>

      <section className="bg-[#e6eee5]">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[.8fr_1.2fr] lg:items-end lg:px-8">
          <SectionHeading eyebrow="The easy part" title="Three details. One clear request." body="A reservation works best when we know the essentials up front." />
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["01", "Where", "Your pickup and destination addresses."],
              ["02", "When", "Your preferred date and time."],
              ["03", "Who", "Your name, phone, email, and passenger count."],
            ].map(([number, title, body]) => (
              <div key={number} className="border-t-2 border-[#4e8585] pt-4">
                <p className="font-mono text-xs text-[#4e8585]">{number}</p>
                <h3 className="mt-6 font-serif text-2xl font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#527477]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#31505c]">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1fr_.8fr] lg:items-center lg:px-8">
          <SectionHeading light eyebrow="Airport transportation" title="Start at an airport. Arrive in South Carolina." body="Airport pickups are available for South Carolina destinations. Review the airports we reference and share the flight details that help us understand your trip." />
          <div className="lg:justify-self-end">
            <div className="rounded-[1.7rem] border border-[#628686] bg-[#264451] p-6 sm:p-8">
              <Plane size={25} className="text-[#f8d34e]" />
              <ul className="mt-6 space-y-4">
                {airports.map((airport) => <li key={airport} className="flex gap-3 text-sm leading-6 text-[#e2ece2]"><Check size={17} className="mt-1 shrink-0 text-[#f8d34e]" />{airport}</li>)}
              </ul>
              <ButtonLink href="/airport/" variant="yellow" className="mt-7 w-full">View airport service <ArrowRight size={16} /></ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <AreaSection />
      <ArchiveFleetSection />
      <ContactBand />
    </>
  );
}

function ActionCard({ icon, title, body, href, accent = false }: { icon: ReactNode; title: string; body: string; href: string; accent?: boolean }) {
  const external = href.startsWith("tel:");
  const content = (
    <>
      <span className={`grid h-11 w-11 place-items-center rounded-xl ${accent ? "bg-[#f8d34e] text-[#172536]" : "bg-[#e6eee5] text-[#4e8585]"}`}>{icon}</span>
      <span className="min-w-0">
        <span className="block font-serif text-2xl font-bold">{title}</span>
        <span className="mt-1 block truncate text-sm text-[#527477]">{body}</span>
      </span>
      <ArrowUpRight size={18} className="ml-auto shrink-0 text-[#527477]" />
    </>
  );
  return external ? <a href={href} data-testid={`link-action-${title.toLowerCase().replaceAll(" ", "-")}`} className="group flex min-h-[116px] items-center gap-4 rounded-[1.4rem] border border-[#d7dfd3] bg-[#fbf6e9] p-5 transition-transform hover:-translate-y-1">{content}</a> : <Link href={href} data-testid={`link-action-${title.toLowerCase().replaceAll(" ", "-")}`} className="group flex min-h-[116px] items-center gap-4 rounded-[1.4rem] border border-[#d7dfd3] bg-[#fbf6e9] p-5 transition-transform hover:-translate-y-1">{content}</Link>;
}

function AreaSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
        <SectionHeading eyebrow="Service references" title="Across the Lowcountry and out to the islands." body="These are the communities and Sea Islands referenced for service. Call or send a reservation with your exact route." />
        <div>
          <div className="flex flex-wrap gap-2">
            {serviceAreas.map((area) => <span key={area} data-testid={`text-service-area-${area.toLowerCase().replaceAll(" ", "-")}`} className="rounded-full border border-[#b6c5bb] bg-[#f1f5ed] px-3 py-2 text-sm text-[#31505c]">{area}</span>)}
          </div>
          <div className="mt-7 border-t border-[#d7dfd3] pt-6">
            <p className="font-mono text-[.61rem] uppercase tracking-[.18em] text-[#4e8585]">Sea Islands</p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3">
              {seaIslands.map((area) => <span key={area} className="flex items-center gap-2 text-sm text-[#31505c]"><MapPin size={14} className="text-[#4e8585]" />{area}</span>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactBand() {
  return (
    <section className="border-t border-[#d7dfd3] bg-[#f1f5ed]">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 py-14 sm:px-6 md:flex-row md:items-center lg:px-8">
        <div>
          <p className="font-mono text-[.64rem] uppercase tracking-[.18em] text-[#4e8585]">Have a question?</p>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-[-.03em] sm:text-4xl">Let’s get the details right.</h2>
        </div>
        <div className="flex w-full flex-col gap-3 min-[430px]:w-auto min-[430px]:flex-row">
          <ButtonLink href={`mailto:${EMAIL}`} variant="outline" className="w-full min-[430px]:w-auto"><Mail size={16} /> Email us</ButtonLink>
          <ButtonLink href={`tel:${PHONE}`} variant="dark" className="w-full min-[430px]:w-auto"><Phone size={16} /> Call {PHONE}</ButtonLink>
        </div>
      </div>
    </section>
  );
}

function PageIntro({ eyebrow, title, body, children }: { eyebrow: string; title: string; body: string; children?: ReactNode }) {
  return (
    <section className="paper-grid border-b border-[#d7dfd3]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1fr_.8fr] lg:items-end lg:px-8">
        <div className="page-enter">
          <p className="font-mono text-[.66rem] font-bold uppercase tracking-[.2em] text-[#4e8585]">{eyebrow}</p>
          <h1 className="mt-4 max-w-3xl font-serif text-[clamp(3rem,8vw,5.7rem)] font-bold leading-[.9] tracking-[-.065em]">{title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#527477]">{body}</p>
        </div>
        {children && <div className="page-enter delay-1">{children}</div>}
      </div>
    </section>
  );
}

function AirportPage() {
  usePageMeta(
    "Airport Service | A Happy Taxi Cab Co.",
    "Airport transportation planning from Savannah/Hilton Head, Hilton Head Island, and Charleston International Airports to South Carolina destinations.",
    "/airport/",
  );

  return (
    <>
      <PageIntro eyebrow="Airport transportation" title="From the terminal to your South Carolina destination." body="Share your flight details with A Happy Taxi Cab Co. for airport transportation planning. Pickups are for South Carolina destinations only.">
        <div className="rounded-[1.8rem] bg-[#31505c] p-6 text-[#fbf6e9] sm:p-8">
          <Plane className="text-[#f8d34e]" size={27} />
          <p className="mt-6 font-serif text-2xl font-bold">Three airport references.</p>
          <p className="mt-2 text-sm leading-6 text-[#c9d9ce]">Choose the airport you’re arriving at in your reservation details.</p>
        </div>
      </PageIntro>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {airports.map((airport, index) => (
            <div key={airport} className="group relative overflow-hidden rounded-[1.5rem] border border-[#d7dfd3] bg-[#f1f5ed] p-6 sm:p-7">
              <span className="font-mono text-xs text-[#4e8585]">0{index + 1}</span>
              <Plane size={21} className="absolute right-6 top-6 text-[#4e8585] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
              <h2 className="mt-16 font-serif text-2xl font-bold leading-tight">{airport}</h2>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-[#e6eee5]">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1fr_1fr] lg:px-8">
          <SectionHeading eyebrow="What to include" title="A few flight details make the request clearer." body="The reservation form keeps airport information optional, so you can share only what applies to your trip." />
          <div className="space-y-3">
            {["Airline name", "Flight number", "Airport arrival time"].map((item) => <div key={item} className="flex items-center gap-4 rounded-2xl border border-[#c8d7cb] bg-[#fbf6e9] p-4"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#f8d34e] font-mono text-xs text-[#172536]"><Check size={15} /></span><span className="font-semibold">{item}</span></div>)}
            <div className="mt-5 flex gap-3 border-l-2 border-[#4e8585] pl-4 text-sm leading-6 text-[#527477]"><ShieldCheck size={17} className="mt-1 shrink-0 text-[#4e8585]" /><p>Airport pickups are limited to South Carolina destinations. If you have a question about your route, call {PHONE}.</p></div>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:px-8">
        <ArchivePhoto src="/images/archive/impala.jpg" alt="Black sedan taxi with ADR Taxi markings." caption="Original vehicle photo from the company archive" imageClassName="aspect-[2.2]" />
        <SectionHeading eyebrow="A note from the archive" title="The photos stay honest." body="The original vehicle images are included for your review. No vehicle details, dates, or historical claims are added beyond what the photographs show." />
      </section>
      <section className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 px-4 py-16 sm:px-6 md:flex-row md:items-center lg:px-8">
        <div><p className="font-mono text-[.62rem] uppercase tracking-[.18em] text-[#4e8585]">Ready when you are</p><h2 className="mt-2 font-serif text-3xl font-bold">Share your airport trip.</h2></div>
        <ButtonLink href="/reservations/" variant="yellow">Reserve airport transportation <ArrowRight size={16} /></ButtonLink>
      </section>
    </>
  );
}

function Field({ label, name, required = false, value, onChange, type = "text", placeholder, error, min, max, maxLength }: { label: string; name: string; required?: boolean; value: string; onChange: (name: string, value: string) => void; type?: string; placeholder?: string; error?: string; min?: string; max?: string; maxLength?: number }) {
  const id = `reservation-${name}`;
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-bold text-[#172536]">{label}{required && <span className="ml-1 text-[#c3493d]" aria-label="required">*</span>}</label>
       <input id={id} name={name} type={type} value={value} required={required} min={min} max={max} maxLength={maxLength} placeholder={placeholder} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} data-testid={`input-${name}`} onChange={(event) => onChange(name, event.target.value)} className={`min-h-12 w-full rounded-xl border bg-[#fbf6e9] px-4 text-base text-[#172536] placeholder:text-[#8ba09a] ${error ? "border-[#c3493d]" : "border-[#b6c5bb]"} focus:border-[#4e8585]`} />
      {error && <p id={`${id}-error`} className="mt-1.5 text-xs font-semibold text-[#a53b32]">{error}</p>}
    </div>
  );
}

function TurnstileWidget({ onToken }: { onToken: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!turnstileSiteKey || !containerRef.current) return;

    let widgetId: string | undefined;
    let cancelled = false;
    const renderWidget = () => {
      if (!cancelled && containerRef.current && window.turnstile) {
        widgetId = window.turnstile.render(containerRef.current, {
          sitekey: turnstileSiteKey,
          callback: onToken,
          "expired-callback": () => onToken(""),
          "error-callback": () => onToken(""),
        });
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.addEventListener("load", renderWidget);
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [onToken]);

  return <div ref={containerRef} aria-label="Security verification" />;
}

function ReservationsPage() {
  usePageMeta(
    "Reservations | A Happy Taxi Cab Co.",
    "Send pickup, destination, timing, passenger, and optional airport details to A Happy Taxi Cab Co. for reservation planning.",
    "/reservations/",
  );

  const [values, setValues] = useState<FormValues>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message: string }>({ type: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const submissionId = useRef(
    globalThis.crypto?.randomUUID?.() ?? `reservation-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  const today = new Date().toISOString().split("T")[0];

  const update = (name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    if (status.type !== "idle") setStatus({ type: "idle", message: "" });
  };

  const validate = () => {
    const next: Record<string, string> = {};
    const required: Array<[keyof FormValues, string]> = [
      ["name", "Enter your name."],
      ["phone", "Enter a phone number."],
      ["email", "Enter your email address."],
      ["pickupAddress", "Enter a pickup address."],
      ["date", "Choose a pickup date."],
      ["time", "Choose a pickup time."],
      ["passengers", "Enter the passenger count."],
      ["destinationAddress", "Enter a destination address."],
    ];
    required.forEach(([key, message]) => { if (!values[key].trim()) next[key] = message; });
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = "Enter a valid email address.";
    if (values.phone && values.phone.replace(/\D/g, "").length < 7) next.phone = "Enter a phone number with at least 7 digits.";
     if (values.passengers && (!/^\d+$/.test(values.passengers) || Number(values.passengers) < 1 || Number(values.passengers) > 50)) next.passengers = "Enter between 1 and 50 passengers.";
    if (values.date && values.date < today) next.date = "Choose today or a future date.";
    return next;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || submitted) return;
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setStatus({ type: "error", message: "Review the highlighted fields and try again." });
      document.getElementById(`reservation-${Object.keys(nextErrors)[0]}`)?.focus();
      return;
    }
    if (values.website) return;
    if (turnstileSiteKey && !turnstileToken) {
      setStatus({ type: "error", message: "Complete the security verification before sending." });
      return;
    }
    setIsSubmitting(true);
    setStatus({ type: "idle", message: "" });
    try {
      const response = await fetch("/api/reservation", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          phone: values.phone.trim(),
          email: values.email.trim(),
           pickupAddress: values.pickupAddress.trim(),
           pickupDate: values.date,
           pickupTime: values.time,
          passengers: Number(values.passengers),
          destinationAddress: values.destinationAddress.trim(),
           airlineName: values.airline.trim(),
          flightNumber: values.flightNumber.trim(),
          airportArrivalTime: values.airportArrivalTime,
          roundTrip: values.roundTrip,
           paymentPreference: values.payment === "Card" ? "Credit card" : values.payment === "No preference" ? "Undecided" : values.payment,
           submissionId: submissionId.current,
           website: values.website,
           turnstileToken,
        }),
      });
      if (!response.ok) throw new Error("Reservation request failed");
      setSubmitted(true);
      setStatus({ type: "success", message: "Your reservation request was sent. We’ll use the contact details you provided to follow up." });
    } catch {
      setStatus({ type: "error", message: `We couldn’t send the request right now. Please call ${PHONE} or try again.` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageIntro eyebrow="Reservations" title="Tell us about your ride." body="Share the trip essentials below. Required fields are marked. Preferred payment is only a preference; do not enter financial details.">
        <div>
          <ArchivePhoto src="/images/archive/cars1.jpg" alt="White taxis with A taxicab Co. markings." caption="Original vehicle photo from the company archive" imageClassName="aspect-[2.2]" />
          <div className="mt-5 rounded-[1.4rem] border border-[#b6c5bb] bg-[#e6eee5] p-5 sm:p-6">
            <RouteIcon size={24} className="text-[#4e8585]" />
            <p className="mt-4 font-serif text-2xl font-bold">A clear request starts here.</p>
            <p className="mt-2 text-sm leading-6 text-[#527477]">For a quick conversation, call <a href={`tel:${PHONE}`} data-testid="link-reservation-phone" className="font-bold text-[#172536] underline decoration-[#f8d34e] decoration-2 underline-offset-2">{PHONE}</a>.</p>
          </div>
        </div>
      </PageIntro>
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        {status.type !== "idle" && <div role={status.type === "success" ? "status" : "alert"} aria-live="polite" data-testid={`status-reservation-${status.type}`} className={`mb-8 rounded-2xl border p-4 text-sm leading-6 ${status.type === "success" ? "border-[#8db39f] bg-[#e6eee5] text-[#31505c]" : "border-[#dda49d] bg-[#f8e7e3] text-[#8d3029]"}`}><div className="flex gap-3">{status.type === "success" ? <Check size={18} className="mt-1 shrink-0" /> : <ShieldCheck size={18} className="mt-1 shrink-0" />}<span>{status.message}</span></div></div>}
        {submitted ? (
          <div className="ink-card rounded-[1.8rem] bg-[#e6eee5] p-7 sm:p-12">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[#f8d34e]"><Check /></span>
            <h2 className="mt-7 font-serif text-4xl font-bold tracking-[-.04em]">Request received.</h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-[#527477]">Thank you for sharing your trip details. A Happy Taxi Cab Co. can follow up using the contact information you provided.</p>
            <div className="mt-8 flex flex-col gap-3 min-[430px]:flex-row"><ButtonLink href="/" variant="dark">Back to home <ArrowRight size={16} /></ButtonLink><ButtonLink href={`tel:${PHONE}`} variant="outline"><Phone size={16} /> Call {PHONE}</ButtonLink></div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-10">
            <div className="rounded-[1.8rem] border border-[#d7dfd3] bg-[#f1f5ed] p-5 sm:p-8">
              <div className="mb-7 flex items-start justify-between gap-4"><div><p className="font-mono text-[.61rem] uppercase tracking-[.18em] text-[#4e8585]">01 / Your details</p><h2 className="mt-2 font-serif text-3xl font-bold">Who’s riding?</h2></div><span className="text-xs text-[#527477]"><span className="text-[#c3493d]">*</span> Required</span></div>
              <div className="grid gap-5 sm:grid-cols-2">
                 <Field label="Full name" name="name" value={values.name} onChange={update} required placeholder="Your name" error={errors.name} maxLength={120} />
                 <Field label="Phone" name="phone" type="tel" value={values.phone} onChange={update} required placeholder="843-555-0123" error={errors.phone} maxLength={40} />
                 <div className="sm:col-span-2"><Field label="Email" name="email" type="email" value={values.email} onChange={update} required placeholder="you@example.com" error={errors.email} maxLength={254} /></div>
              </div>
            </div>
            <div className="rounded-[1.8rem] border border-[#d7dfd3] bg-[#f1f5ed] p-5 sm:p-8">
              <div className="mb-7"><p className="font-mono text-[.61rem] uppercase tracking-[.18em] text-[#4e8585]">02 / Trip details</p><h2 className="mt-2 font-serif text-3xl font-bold">Where and when?</h2></div>
              <div className="grid gap-5 sm:grid-cols-2">
                 <div className="sm:col-span-2"><Field label="Pickup address" name="pickupAddress" value={values.pickupAddress} onChange={update} required placeholder="Street, town, state" error={errors.pickupAddress} maxLength={300} /></div>
                <Field label="Pickup date" name="date" type="date" value={values.date} onChange={update} required error={errors.date} min={today} />
                <Field label="Pickup time" name="time" type="time" value={values.time} onChange={update} required error={errors.time} />
                 <Field label="Passenger count" name="passengers" type="number" value={values.passengers} onChange={update} required placeholder="1" error={errors.passengers} min="1" max="50" />
                 <div className="sm:col-span-2"><Field label="Destination address" name="destinationAddress" value={values.destinationAddress} onChange={update} required placeholder="Street, town, state" error={errors.destinationAddress} maxLength={300} /></div>
              </div>
            </div>
            <div className="rounded-[1.8rem] border border-[#d7dfd3] bg-[#f1f5ed] p-5 sm:p-8">
              <div className="mb-7"><p className="font-mono text-[.61rem] uppercase tracking-[.18em] text-[#4e8585]">03 / Optional context</p><h2 className="mt-2 font-serif text-3xl font-bold">Anything else to note?</h2></div>
              <div className="grid gap-5 sm:grid-cols-2">
                 <Field label="Airline name" name="airline" value={values.airline} onChange={update} placeholder="If arriving by air" maxLength={120} />
                 <Field label="Flight number" name="flightNumber" value={values.flightNumber} onChange={update} placeholder="If arriving by air" maxLength={40} />
                <Field label="Airport arrival time" name="airportArrivalTime" type="time" value={values.airportArrivalTime} onChange={update} />
                <div>
                  <span className="mb-2 block text-sm font-bold">Round-trip?</span>
                  <div className="flex min-h-12 gap-2" role="radiogroup" aria-label="Round-trip preference">
                    {(["No", "Yes"] as const).map((option) => <label key={option} className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold ${values.roundTrip === option ? "border-[#4e8585] bg-[#dce9df]" : "border-[#b6c5bb] bg-[#fbf6e9]"}`}><input type="radio" name="roundTrip" value={option} checked={values.roundTrip === option} onChange={() => update("roundTrip", option)} data-testid={`radio-round-trip-${option.toLowerCase()}`} className="accent-[#4e8585]" />{option}</label>)}
                  </div>
                </div>
                <div className="sm:col-span-2"><label htmlFor="reservation-payment" className="mb-2 block text-sm font-bold">Preferred payment method <span className="font-normal text-[#527477]">(preference only)</span></label><select id="reservation-payment" name="payment" value={values.payment} onChange={(event) => update("payment", event.target.value)} data-testid="select-payment" className="min-h-12 w-full appearance-none rounded-xl border border-[#b6c5bb] bg-[#fbf6e9] px-4 text-base text-[#172536]"><option>No preference</option><option>Cash</option><option>Card</option></select><p className="mt-2 text-xs leading-5 text-[#527477]">Please do not enter card numbers or other financial details.</p></div>
              </div>
            </div>
            {turnstileSiteKey && (
              <div className="rounded-[1.4rem] border border-[#d7dfd3] bg-[#f1f5ed] p-5 sm:p-6">
                <p className="font-mono text-[.61rem] uppercase tracking-[.18em] text-[#4e8585]">Security check</p>
                <p className="mt-2 text-sm leading-6 text-[#527477]">Complete the verification before sending your request.</p>
                <div className="mt-4"><TurnstileWidget onToken={setTurnstileToken} /></div>
              </div>
            )}
            <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"><label htmlFor="reservation-website">Website</label><input id="reservation-website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={(event) => update("website", event.target.value)} /></div>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-xs leading-5 text-[#527477]">Submitting sends your reservation details to A Happy Taxi Cab Co. You can also call <a href={`tel:${PHONE}`} data-testid="link-form-phone" className="font-bold underline decoration-[#f8d34e] decoration-2 underline-offset-2">{PHONE}</a>.</p>
              <button type="submit" disabled={isSubmitting} data-testid="button-submit-reservation" className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[#172536] px-6 py-3 text-sm font-bold text-[#fbf6e9] transition-colors hover:bg-[#31505c] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">{isSubmitting ? "Sending request…" : "Send reservation request"}{!isSubmitting && <ArrowRight size={16} />}</button>
            </div>
          </form>
        )}
      </section>
    </>
  );
}

function ContactPage() {
  usePageMeta(
    "Contact | A Happy Taxi Cab Co.",
    "Contact A Happy Taxi Cab Co. in Beaufort, South Carolina by phone or email about service areas, airport trips, and reservations.",
    "/contact/",
  );

  return (
    <>
      <PageIntro eyebrow="Contact" title="A direct line to Beaufort." body="Use the phone or email below for questions about A Happy Taxi Cab Co., service areas, or a trip you’re planning.">
        <div className="rounded-[1.8rem] bg-[#f8d34e] p-6 sm:p-8">
          <MapPin size={26} />
          <p className="mt-6 font-serif text-2xl font-bold">Beaufort, South Carolina</p>
          <p className="mt-2 text-sm leading-6 text-[#31505c]">Serving the Lowcountry and Sea Islands.</p>
        </div>
      </PageIntro>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          <a href={`tel:${PHONE}`} data-testid="link-contact-phone" className="ink-card group rounded-[1.8rem] bg-[#172536] p-7 text-[#fbf6e9] transition-transform hover:-translate-y-1 sm:p-10">
            <Phone className="text-[#f8d34e]" size={25} />
            <p className="mt-16 font-mono text-[.62rem] uppercase tracking-[.18em] text-[#8eaba3]">Call</p>
            <p className="mt-2 break-all font-serif text-3xl font-bold sm:text-4xl">{PHONE}</p>
            <ArrowUpRight size={19} className="mt-7 text-[#f8d34e] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </a>
          <a href={`mailto:${EMAIL}`} data-testid="link-contact-email" className="group rounded-[1.8rem] border border-[#d7dfd3] bg-[#e6eee5] p-7 transition-transform hover:-translate-y-1 sm:p-10">
            <Mail className="text-[#4e8585]" size={25} />
            <p className="mt-16 font-mono text-[.62rem] uppercase tracking-[.18em] text-[#4e8585]">Email</p>
            <p className="mt-2 break-all font-serif text-2xl font-bold sm:text-3xl">{EMAIL}</p>
            <ArrowUpRight size={19} className="mt-7 text-[#4e8585] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </a>
        </div>
      </section>
      <section className="bg-[#e6eee5]">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
          <SectionHeading eyebrow="Where we reference service" title="Lowcountry towns and Sea Islands." body="If you’re not sure whether your pickup or destination fits, contact us with the exact locations." />
          <div className="grid gap-8 sm:grid-cols-2">
            <div><p className="font-mono text-[.61rem] uppercase tracking-[.18em] text-[#4e8585]">Lowcountry</p><ul className="mt-4 space-y-3">{serviceAreas.map((area) => <li key={area} className="flex items-center gap-2 text-sm text-[#31505c]"><Check size={15} className="text-[#4e8585]" />{area}</li>)}</ul></div>
            <div><p className="font-mono text-[.61rem] uppercase tracking-[.18em] text-[#4e8585]">Sea Islands</p><ul className="mt-4 space-y-3">{seaIslands.map((area) => <li key={area} className="flex items-center gap-2 text-sm text-[#31505c]"><Check size={15} className="text-[#4e8585]" />{area}</li>)}</ul></div>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:px-8">
        <SectionHeading eyebrow="A familiar ride" title="Keep the conversation simple." body="Call or email with the exact locations and timing for your trip. The original company vehicle photo below is included for client review." />
        <ArchivePhoto src="/images/archive/crownvic.jpg" alt="Green taxi marked Happy Taxi Cab Co. parked beneath trees." caption="Original vehicle photo from the company archive" imageClassName="aspect-[1.9]" />
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-8 rounded-[1.8rem] border border-[#d7dfd3] bg-[#f1f5ed] p-6 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div><p className="font-mono text-[.62rem] uppercase tracking-[.18em] text-[#4e8585]">Prefer a form?</p><h2 className="mt-3 font-serif text-3xl font-bold">Send the trip details online.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[#527477]">The reservation form includes pickup, destination, timing, passenger count, and optional flight details.</p></div>
          <ButtonLink href="/reservations/" variant="yellow">Make a reservation <ArrowRight size={16} /></ButtonLink>
        </div>
      </section>
    </>
  );
}

function NotFound() {
  usePageMeta(
    "Page Not Found | A Happy Taxi Cab Co.",
    "The requested page could not be found. Return to A Happy Taxi Cab Co. in Beaufort, South Carolina.",
    "/404",
  );

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-start justify-center px-4 py-20 sm:px-6 lg:px-8">
      <p className="font-mono text-[.66rem] uppercase tracking-[.2em] text-[#4e8585]">404 / Not found</p>
      <h1 className="mt-4 font-serif text-5xl font-bold tracking-[-.05em]">That road isn’t on our map.</h1>
      <p className="mt-5 max-w-md leading-7 text-[#527477]">The page you’re looking for doesn’t exist. Head back to the starting point.</p>
      <ButtonLink href="/" variant="yellow" className="mt-8">Back home <ArrowRight size={16} /></ButtonLink>
    </section>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/airport" component={AirportPage} />
        <Route path="/airport/" component={AirportPage} />
        <Route path="/reservations" component={ReservationsPage} />
        <Route path="/reservations/" component={ReservationsPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/contact/" component={ContactPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
    </WouterRouter>
  );
}

export default App;
