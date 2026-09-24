import {
  CalendarDays,
  FileText,
  Users,
} from "lucide-react";

export default function CurrentAffairsStats({
  totalMonths = 0,
}) {
  const stats = [
    {
      icon: CalendarDays,
      value: `${totalMonths}+`,
      label: "Months Available",

      cardBg:
        "from-[#eaf6ff] via-[#f7fbff] to-[#dff1ff]",
      borderColor:
        "border-[#1597ff]/20",

      iconBg:
        "from-[#087bea] via-[#1597ff] to-[#00b5e8]",
      iconShadow:
        "shadow-[0_10px_26px_rgba(8,123,234,0.28)]",

      accent:
        "bg-[#00b5e8]",
      textColor:
        "text-[#0b4fa8]",

      glow:
        "bg-[#00b5e8]/20",
    },

    {
      icon: FileText,
      value: "500+",
      label: "Daily Updates",

      cardBg:
        "from-[#fff0f6] via-[#fff8fb] to-[#ffe5f0]",
      borderColor:
        "border-[#e83e8c]/20",

      iconBg:
        "from-[#ff4f9a] via-[#e83e8c] to-[#c026d3]",
      iconShadow:
        "shadow-[0_10px_26px_rgba(232,62,140,0.28)]",

      accent:
        "bg-[#e83e8c]",
      textColor:
        "text-[#c0266d]",

      glow:
        "bg-[#e83e8c]/20",
    },

    {
      icon: Users,
      value: "100K+",
      label: "Aspirants Learning",

      cardBg:
        "from-[#f4efff] via-[#fbf9ff] to-[#ebe3ff]",
      borderColor:
        "border-[#7c3aed]/20",

      iconBg:
        "from-[#8b5cf6] via-[#7c3aed] to-[#5b21b6]",
      iconShadow:
        "shadow-[0_10px_26px_rgba(124,58,237,0.28)]",

      accent:
        "bg-[#7c3aed]",
      textColor:
        "text-[#6d28d9]",

      glow:
        "bg-[#7c3aed]/20",
    },
  ];

  return (
    <div
      className="
        mt-4
        grid
        grid-cols-1
        gap-3
        rounded-[24px]
        border
        border-[#dbeafe]
        bg-gradient-to-r
        from-white
        via-[#fbfdff]
        to-white
        p-3
        shadow-[0_14px_40px_rgba(22,79,165,0.08)]
        sm:grid-cols-3
        xl:hidden
      "
    >
      {stats.map(
        ({
          icon: Icon,
          value,
          label,
          cardBg,
          borderColor,
          iconBg,
          iconShadow,
          accent,
          textColor,
          glow,
        }) => (
          <div
            key={label}
            className={`
              group
              relative
              overflow-hidden
              rounded-[20px]
              border
              bg-gradient-to-br
              px-4
              py-4
              transition-all
              duration-300
              hover:-translate-y-1
              hover:shadow-[0_14px_30px_rgba(15,23,42,0.10)]
              ${cardBg}
              ${borderColor}
            `}
          >
            {/* LARGE DECORATIVE GLOW */}
            <div
              aria-hidden="true"
              className={`
                pointer-events-none
                absolute
                -right-8
                -top-8
                h-24
                w-24
                rounded-full
                blur-2xl
                ${glow}
              `}
            />

            {/* DECORATIVE CIRCLE */}
            <div
              aria-hidden="true"
              className={`
                pointer-events-none
                absolute
                right-5
                top-4
                h-3
                w-3
                rounded-full
                opacity-40
                ${accent}
              `}
            />

            <div
              className="
                relative
                z-10
                flex
                items-center
                gap-4
              "
            >
              {/* ICON */}
              <div
                className="
                  relative
                  shrink-0
                "
              >
                <span
                  className={`
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-[16px]
                    bg-gradient-to-br
                    text-white
                    transition-all
                    duration-300
                    group-hover:scale-105
                    group-hover:rotate-3
                    ${iconBg}
                    ${iconShadow}
                  `}
                >
                  <Icon
                    size={21}
                    strokeWidth={2.2}
                  />
                </span>

                {/* SMALL STATUS DOT */}
                <span
                  className={`
                    absolute
                    -bottom-1
                    -right-1
                    h-3.5
                    w-3.5
                    rounded-full
                    border-[3px]
                    border-white
                    ${accent}
                  `}
                />
              </div>

              {/* CONTENT */}
              <div
                className="
                  min-w-0
                  flex-1
                "
              >
                <strong
                  className={`
                    block
                    text-[18px]
                    font-extrabold
                    leading-none
                    tracking-[-0.03em]
                    text-pink-500
                  `}
                >
                  {value}
                </strong>

                <span
                  className="
                    mt-1.5
                    block
                    text-[10px]
                    font-semibold
                    text-slate-500
                  "
                >
                  {label}
                </span>

                {/* SMALL ACCENT LINE */}
                <div
                  className={`
                    mt-2
                    h-[3px]
                    w-8
                    rounded-full
                    transition-all
                    duration-300
                    group-hover:w-12
                    ${accent}
                  `}
                />
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}