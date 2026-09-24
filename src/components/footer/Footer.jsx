import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer
      className="relative overflow-hidden bg-cover bg-center bg-no-repeat" data-aos="fade-up"
      style={{
        backgroundImage: "url('/assets/mastermind-footer-bg.webp')",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/85" />

      {/* Subtle glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-12 md:px-8 lg:px-0">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Image
              src="/assets/logo-128.png"
              alt="Master Mind"
              width={64}
              height={64}
              className="h-14 w-14 rounded-md object-contain"
            />

            <p className="mt-4 max-w-xs text-[12px] leading-5 text-white/90">
              Empowering students to achieve their academic goals through
              quality education and expert guidance.
            </p>

            {/* Social Media */}
            <div className="mt-5 flex items-center gap-3">
              <SocialIcon href="#" label="Facebook">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="currentColor"
                >
                  <path d="M13.5 8H16V4.5c-.4-.1-1.7-.2-3.1-.2-3.1 0-5.2 1.9-5.2 5.4V12H4.3v3.9h3.4V24h4.2v-8.1h3.5L16 12h-4.1V10c0-1.1.3-2 1.6-2Z" />
                </svg>
              </SocialIcon>

              <SocialIcon href="#" label="Twitter">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="currentColor"
                >
                  <path d="M18.9 2H22l-6.8 7.8L23 22h-6.1l-4.8-6.3L6.6 22H3.5l7.1-8.1L3 2h6.3l4.3 5.8L18.9 2Zm-1.1 17.8h1.7L8.4 4H6.6l11.2 15.8Z" />
                </svg>
              </SocialIcon>

              <SocialIcon href="#" label="Instagram">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </SocialIcon>

              <SocialIcon href="#" label="LinkedIn">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="currentColor"
                >
                  <path d="M5.3 7.7A2.2 2.2 0 1 0 5.3 3.3a2.2 2.2 0 0 0 0 4.4ZM3.5 9.3h3.6V21H3.5V9.3Zm5.8 0h3.5v1.6h.1c.5-.9 1.7-2 3.5-2 3.7 0 4.4 2.4 4.4 5.6V21h-3.6v-5.8c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1V21H9.3V9.3Z" />
                </svg>
              </SocialIcon>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-cyan-400">
              Quick Links
            </h3>

            <div className="flex flex-col gap-3">
              <FooterLink href="/">Home</FooterLink>
              <FooterLink href="/about">About</FooterLink>
              <FooterLink href="/courses">Courses</FooterLink>
              <FooterLink href="/careers">Careers</FooterLink>
            </div>
          </div>

          {/* Courses */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-cyan-400">
              Courses
            </h3>

            <div className="flex flex-col gap-3">
              <FooterLink href="/courses">Course 1</FooterLink>
              <FooterLink href="/courses">Course 2</FooterLink>
              <FooterLink href="/courses">Course 3</FooterLink>
              <FooterLink href="/courses">Course 4</FooterLink>
              <FooterLink href="/courses">Course 5</FooterLink>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-cyan-400">
              Contact us
            </h3>

            <div className="space-y-4">
              <a
                href="tel:+91987654321"
                className="flex items-center gap-3 text-[12px] text-white transition hover:text-cyan-400"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4 13 13 0 0 0 2.8.7A2 2 0 0 1 22 16.9Z" />
                </svg>

                <span>+91 987654321</span>
              </a>

              <a
                href="mailto:info@mastermind.in"
                className="flex items-center gap-3 text-[12px] text-white transition hover:text-cyan-400"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>

                <span>info@mastermind.in</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Divider */}
        <div className="mt-12 border-t border-white/20 pt-5">
          <div className="flex flex-col items-center justify-between gap-4 text-[11px] text-white md:flex-row">
            <p>© {new Date().getFullYear()} Mastermind. All rights reserved.</p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/privacy-policy" className="transition hover:text-cyan-400">
                Privacy Policy
              </Link>

              <Link href="/terms" className="transition hover:text-cyan-400">
                Terms of service
              </Link>

              <Link href="/cookie-policy" className="transition hover:text-cyan-400">
                Cookie policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ href, children }) => {
  return (
    <Link
      href={href}
      className="w-fit text-[12px] text-white/90 transition hover:text-cyan-400"
    >
      {children}
    </Link>
  );
};

const SocialIcon = ({ href, label, children }) => {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/80 text-white transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-400 hover:text-black"
    >
      {children}
    </a>
  );
};

export default Footer;