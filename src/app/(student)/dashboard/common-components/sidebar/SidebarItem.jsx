import Link from "next/link";

export default function SidebarItem({
  item,
  active,
  onNavigate,
}) {
  const Icon =
    item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={item.label}
      className={`
        group
        relative

        flex
        min-h-[52px]
        items-center
        justify-center
        gap-3

        rounded-[14px]

        px-2
        py-2.5

        transition-all
        duration-200

        xl:justify-start
        xl:px-3

        ${
          active
            ? `
                bg-white/[0.08]
                shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
              `
            : `
                hover:bg-white/[0.045]
              `
        }
      `}
    >
      {active && (
        <span
          className="
            absolute
            bottom-2
            left-0
            top-2

            w-[3px]

            rounded-r-full

            bg-gradient-to-b
            from-cyan-400
            via-blue-500
            to-violet-500
          "
        />
      )}

      <span
        className={`
          relative
          z-10

          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center

          rounded-[12px]

          border

          text-white

          transition-all
          duration-200

          ${
            active
              ? `
                  border-blue-400/20

                  bg-gradient-to-br
                  from-blue-500
                  to-violet-600

                  shadow-[0_8px_24px_rgba(59,130,246,0.25)]
                `
              : `
                  border-white/[0.05]

                  bg-white/[0.055]

                  group-hover:border-white/[0.10]
                  group-hover:bg-white/[0.09]
                `
          }
        `}
      >
        <Icon
          size={18}
          strokeWidth={2}
          className="text-white"
        />
      </span>

      <span
  className={`
    relative
    z-10

    hidden
    min-w-0
    flex-1

    truncate

    text-[11px]
    font-semibold
    tracking-[0.005em]

    transition-all
    duration-200

    xl:block

    ${
      active
        ? `
            text-[#7dd3fc]
            drop-shadow-[0_0_8px_rgba(56,189,248,0.20)]
          `
        : `
            text-slate-300
            group-hover:text-cyan-200
          `
    }
  `}
>
  {item.label}
</span>

      {item.badge && (
        <span
          className="
            absolute
            right-1
            top-1
            z-20

            flex
            h-[18px]
            min-w-[18px]
            items-center
            justify-center

            rounded-full

            bg-[#ff3f74]

            px-1

            text-[8px]
            font-bold
            text-white

            shadow-[0_5px_12px_rgba(255,63,116,0.35)]

            xl:static
            xl:h-[21px]
            xl:min-w-[21px]
            xl:text-[9px]
          "
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}