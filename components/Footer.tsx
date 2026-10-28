
import Link from "next/link";
import Logo from "./Logo";
import type { Ashram, Campaign, Settings } from "@/lib/types";

const icons: Record<string, string> = {
  instagram: "M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 5a5 5 0 100 10 5 5 0 000-10zm5.5-.9a1.1 1.1 0 100 2.2 1.1 1.1 0 000-2.2z",
  facebook: "M14 8V6a1 1 0 011-1h2V1h-3a4 4 0 00-4 4v3H7v4h3v10h4V12h3l1-4h-4z",
  youtube: "M22 8s-.2-1.6-.9-2.3c-.8-.9-1.8-.9-2.2-1C16.6 4.5 12 4.5 12 4.5s-4.600 0-6.900.2c-.4.100-1.400.100-2.200 1C2.200 6.400 2 8 2 8s-.2 1.900-.2 3.800v1.800c0 1.900.2 3.800.2 3.800s.2 1.600.9 2.300c.8.900 1.900.8 2.400.9 1.700.2 7.200.2 7.200.2s4.600 0 6.900-.2c.4-.1 1.400-.1 2.200-1 .7-.7.900-2.300.9-2.300s.2-1.900.2-3.800v-1.800C22.200 9.900 22 8 22 8zM10 15V9l5.200 3L10 15z",
  threads: "M12 2a10 10 0 100 20 10 10 0 000-20zm.2 5.500c1.800 0 3.200 1 3.600 2.800l-1.400.4c-.3-1-1-1.600-2.200-1.600-1.300 0-2.200.8-2.200 1.800 0 .9.700 1.500 2.100 1.700l.8.100c2 .3 3 1.400 3 3 0 1.800-1.600 3.100-3.900 3.100-2.500 0-4-1.300-4.200-3.300l1.500-.2c.1 1.200 1 1.900 2.700 1.900 1.500 0 2.400-.6 2.400-1.600 0-.8-.6-1.300-1.800-1.500l-.9-.1c-1.900-.3-3-1.400-3-3 0-1.800 1.600-3 3.500-3z",
};

export default function Footer({
  settings,
  ashrams,
  campaigns,
}: {
  settings: Settings;
  ashrams: Ashram[];
  campaigns: Campaign[];
}) {
  const socials = Object.entries(settings.social).filter(
    ([, v]) => v && /^https?:\/\//.test(v)
  );

  return (
    <footer className="mt-0 bg-navy text-white">
      <div className="h-1 bg-gradient-to-r from-magenta via-gold to-magenta" />

      <div className="container-x grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo size={64} light />

          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/75">
            {settings.footer.intro}
          </p>

          <div className="mt-5 flex gap-3">
            {["instagram", "facebook", "youtube", "threads"].map((k) => {
              const url = (settings.social as any)[k] as string;
              const ok = url && /^https?:\/\//.test(url);

              return ok ? (
                <a
                  key={k}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={k}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/25 transition hover:border-gold hover:bg-gold hover:text-navy"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d={icons[k]} />
                  </svg>
                </a>
              ) : null;
            })}

            {socials.length === 0 && (
              <p className="text-xs text-white/50">
                Social links will appear here once added.
              </p>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-serif text-lg text-gold-light">Quick Links</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            {[
              ["About Us", "/about"],
              ["Annadan Seva", "/annadan-seva"],
              ["Community", "/community"],
              ["CSR", "/csr"],
              ["Gallery", "/gallery"],
              ["Contact Us", "/contact"],
              ["Donate Now", "/donate"],
            ].map(([l, h]) => (
              <li key={h}>
                <Link href={h} className="hover:text-gold-light">
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-serif text-lg text-gold-light">Our Ashrams</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            {ashrams.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/ashrams/${a.slug}`}
                  className="hover:text-gold-light"
                >
                  {a.name}
                </Link>
              </li>
            ))}
          </ul>

          <h3 className="mt-6 font-serif text-lg text-gold-light">
            Campaigns
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            {campaigns.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/campaigns#${c.slug}`}
                  className="hover:text-gold-light"
                >
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-serif text-lg text-gold-light">Contact</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            <li>
              WhatsApp / Call:{" "}
              <a
                className="underline-offset-2 hover:underline"
                href={`https://wa.me/${settings.contact.whatsapp_number}`}
              >
                {settings.contact.whatsapp_display}
              </a>
            </li>

            {settings.contact.email && (
              <li>
                Email:{" "}
                <a
                  className="hover:underline"
                  href={`mailto:${settings.contact.email}`}
                >
                  {settings.contact.email}
                </a>
              </li>
            )}

            {settings.contact.address && (
              <li>{settings.contact.address}</li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/60 sm:flex-row">
          <div className="text-center sm:text-left">
            <p>
              © {new Date().getFullYear()} 7 Star Help Foundation. All rights
              reserved.
            </p>
            <p className="mt-2 text-white/70">
              Reg. No.: F/6565/B.K GUJ/64 66/B.K
            </p>
          </div>

          <p className="flex gap-5">
            <Link href="/privacy" className="hover:text-gold-light">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-gold-light">
              Terms and Conditions
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
