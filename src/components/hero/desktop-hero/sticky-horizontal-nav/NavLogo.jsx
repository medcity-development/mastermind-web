import Image from "next/image";
import Link from "next/link";

export default function NavLogo({
  mobile = false,
  onClick,
}) {
  return (
    <Link
      href="/"
      aria-label="MasterMind Home"
      onClick={onClick}
      className={`
        cursor-pointer

        ${
          mobile
            ? ""
            : `
                flex
                min-w-[230px]
                shrink-0
                items-center
                xl:min-w-[250px]
              `
        }
      `}
    >
      <Image
        src="/assets/logo-256.png"
        alt="MasterMind PSC Learning Hub"
        width={
          mobile
            ? 140
            : 240
        }
        height={
          mobile
            ? 52
            : 80
        }
        priority
        className={`
          w-auto
          object-contain

          ${
            mobile
              ? `
                  h-[48px]
                  sm:h-[52px]
                `
              : `
                  h-[68px]
                  xl:h-[76px]
                `
          }
        `}
      />
    </Link>
  );
}