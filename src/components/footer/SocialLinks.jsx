// src/components/footer/SocialLinks.jsx

import {
  socialLinks,
} from "./footerData";

export default function SocialLinks() {
  if (
    !Array.isArray(
      socialLinks
    ) ||
    socialLinks.length === 0
  ) {
    return null;
  }

  return (
    <div
      className="
        mt-5
        flex
        items-center
        gap-2
      "
    >
      {socialLinks.map(
        (item) => (
          <a
            key={item.label}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.label}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-[10px]
              border
              border-white/10
              bg-white/[0.04]
              text-white/70
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-[#00b5e8]/50
              hover:bg-[#00b5e8]
              hover:text-[#03101f]
            "
          >
            <SocialIcon
              type={item.type}
            />
          </a>
        )
      )}
    </div>
  );
}

function SocialIcon({
  type,
}) {
  switch (type) {
    case "facebook":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M13.5 8H16V4.5c-.4-.1-1.7-.2-3.1-.2-3.1 0-5.2 1.9-5.2 5.4V12H4.3v3.9h3.4V24h4.2v-8.1h3.5L16 12h-4.1V10c0-1.1.3-2 1.6-2Z" />
        </svg>
      );

    case "instagram":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="5"
          />

          <circle
            cx="12"
            cy="12"
            r="4"
          />

          <circle
            cx="17.5"
            cy="6.5"
            r="1"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      );

    case "linkedin":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M5.3 7.7A2.2 2.2 0 1 0 5.3 3.3a2.2 2.2 0 0 0 0 4.4ZM3.5 9.3h3.6V21H3.5V9.3Zm5.8 0h3.5v1.6h.1c.5-.9 1.7-2 3.5-2 3.7 0 4.4 2.4 4.4 5.6V21h-3.6v-5.8c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1V21H9.3V9.3Z" />
        </svg>
      );

    case "youtube":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M23.5 6.2c-.3-1.2-1.2-2.1-2.4-2.4C19.1 3.3 12 3.3 12 3.3s-7.1 0-9.1.5C1.7 4.1.8 5 .5 6.2 0 8.2 0 12 0 12s0 3.8.5 5.8c.3 1.2 1.2 2.1 2.4 2.4 2 .5 9.1.5 9.1.5s7.1 0 9.1-.5c1.2-.3 2.1-1.2 2.4-2.4.5-2 .5-5.8.5-5.8s0-3.8-.5-5.8ZM9.6 15.7V8.3l6.2 3.7-6.2 3.7Z" />
        </svg>
      );

    default:
      return null;
  }
}