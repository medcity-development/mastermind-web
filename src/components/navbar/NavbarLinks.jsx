import Link from "next/link";

export default function NavbarLinks({
  items,
  pathname,
}) {
  function isActive(href) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(
      href
    );
  }

  return (
    <>
      {items.map((item) => {
        const Icon =
          item.icon;

        const active =
          isActive(
            item.href
          );

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              inline-flex
              items-center
              gap-2
              rounded-[12px]
              px-4
              py-2.5
              text-[13px]
              font-bold
              transition-all
              duration-200

              ${
                active
                  ? `
                      bg-[#edf7ff]
                      text-[#075fc8]
                    `
                  : `
                      text-[#0b2554]
                      hover:bg-[#f4f9ff]
                      hover:text-[#075fc8]
                    `
              }
            `}
          >
            {Icon && (
              <Icon
                size={16}
                strokeWidth={2.2}
              />
            )}

            {item.label}
          </Link>
        );
      })}
    </>
  );
}