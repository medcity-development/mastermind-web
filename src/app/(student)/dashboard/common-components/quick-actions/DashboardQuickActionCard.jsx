import Link from "next/link";

export default function DashboardQuickActionCard({
  item,
}) {
  if (!item) {
    return null;
  }

  const Icon =
    item.icon;

  return (
    <Link
      href={item.href}
      aria-label={`Open ${item.title}`}
      className="
        group
        relative

        min-h-[145px]

        overflow-hidden

        rounded-[18px]

        border
        border-slate-100

        bg-white/90

        p-4

        shadow-[0_8px_24px_rgba(15,23,42,0.04)]

        transition-all
        duration-300

        hover:-translate-y-1
        hover:border-blue-200
        hover:shadow-[0_16px_35px_rgba(37,99,235,0.10)]
      "
    >
      <div
        className="
          pointer-events-none
          absolute
          -right-8
          -top-8

          h-20
          w-20

          rounded-full

          bg-blue-400/[0.05]

          blur-2xl
        "
      />

      <span
        className={`
          relative
          z-10

          flex
          h-11
          w-11
          items-center
          justify-center

          rounded-[13px]

          ${item.iconBg || "bg-[#eaf4ff]"}
          ${item.iconColor || "text-[#2180f4]"}

          transition-transform
          duration-300

          group-hover:scale-105
        `}
      >
        {Icon && (
          <Icon
            size={19}
            strokeWidth={1.9}
          />
        )}
      </span>

      <h3
        className="
          relative
          z-10

          mt-5

          text-[11px]
          font-bold
          leading-[1.35]

          text-[#071b59]
        "
      >
        {item.title}
      </h3>

      <p
        className="
          relative
          z-10

          mt-1

          text-[9px]
          leading-4

          text-slate-400
        "
      >
        {item.subtitle}
      </p>

      <div
        className="
          relative
          z-10

          mt-4

          flex
          justify-end
        "
      >
        <span
          className="
            flex
            h-7
            w-7
            items-center
            justify-center

            rounded-full

            bg-[#eef5ff]

            text-[13px]
            font-bold

            text-[#2563eb]

            transition-all
            duration-300

            group-hover:translate-x-1
            group-hover:bg-[#2563eb]
            group-hover:text-white
          "
        >
          →
        </span>
      </div>
    </Link>
  );
}