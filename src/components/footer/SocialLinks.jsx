
import { socialLinks } from "./footerData";

export default function SocialLinks() {
  if (!Array.isArray(socialLinks) || socialLinks.length === 0) {
    return null;
  }

  return (
    <div
      className="
        mt-5
        flex
        flex-wrap
        items-center
        gap-2
      "
    >
      {socialLinks.map((item) => (
        <a
          key={item.type}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.label}
          title={item.label}
          className="
            flex
            h-9
            w-9
            shrink-0
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
            focus-visible:outline
            focus-visible:outline-2
            focus-visible:outline-offset-2
            focus-visible:outline-[#00b5e8]
          "
        >
          <SocialIcon type={item.type} />
        </a>
      ))}
    </div>
  );
}

function SocialIcon({ type }) {
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
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="5"
          />
          <circle cx="12" cy="12" r="4" />
          <circle
            cx="17.5"
            cy="6.5"
            r="1"
            fill="currentColor"
            stroke="none"
          />
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

    case "telegram":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M21.94 4.66a1.5 1.5 0 0 0-1.62-.22L2.7 11.26a1.5 1.5 0 0 0 .12 2.84l4.32 1.36 1.67 5.15a1.5 1.5 0 0 0 2.56.48l2.44-2.64 4.3 3.15a1.5 1.5 0 0 0 2.35-.91l2.04-14.5a1.5 1.5 0 0 0-.56-1.53ZM9.18 14.68l8.77-6.2-7.17 7.67-.53 2.16-1.07-3.63Z" />
        </svg>
      );

    case "whatsapp":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M20.52 3.48A11.86 11.86 0 0 0 12.05 0C5.45 0 .08 5.36.08 11.97c0 2.1.55 4.16 1.6 5.97L0 24l6.22-1.63a11.96 11.96 0 0 0 5.82 1.49h.01c6.6 0 11.97-5.37 11.97-11.97a11.9 11.9 0 0 0-3.5-8.41ZM12.05 21.8a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.7.97.99-3.6-.24-.37a9.9 9.9 0 0 1-1.52-5.24c0-5.45 4.44-9.89 9.9-9.89a9.82 9.82 0 0 1 7 2.9 9.82 9.82 0 0 1 2.9 7c0 5.45-4.44 9.89-9.92 9.89Zm5.43-7.41c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
        </svg>
      );

    default:
      return null;
  }
}
