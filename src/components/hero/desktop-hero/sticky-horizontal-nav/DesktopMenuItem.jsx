import Link from "next/link";

export default function DesktopMenuItem({
  item,
  active,
}) {
  return (
    <Link
      href={item.href}
      className={`
        group
        flex
        min-w-[72px]
        cursor-pointer
        flex-col
        items-center
        justify-center
        gap-1.5
        rounded-[16px]
        px-2
        py-2
        transition-all
        duration-300
        xl:min-w-[84px]
        xl:px-3

        ${
          active
            ? `
                bg-gradient-to-br
                from-[#edf8ff]
                to-[#cfefff]
                text-[#164fa5]
                shadow-[0_8px_20px_rgba(1,124,192,0.10)]
              `
            : `
                text-[#07194f]
                hover:bg-[#f2f8ff]
                hover:text-[#017cc0]
              `
        }
      `}
    >
      <span
        className="
          flex
          h-7
          w-7
          items-center
          justify-center
          text-[19px]
        "
      >
        {item.icon}
      </span>

      <span
        className="
          whitespace-nowrap
          text-[11px]
          font-semibold
          xl:text-[12px]
        "
      >
        {item.label}
      </span>
    </Link>
  );
}