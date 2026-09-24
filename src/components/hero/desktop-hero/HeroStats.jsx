import { stats } from "./data";

const cardStyles = [
  {
    card: `
      bg-gradient-to-br
      from-blue-50/65
      via-white/45
      to-cyan-50/55
      border-blue-200/40
      hover:border-blue-300/60
    `,
    icon: "bg-blue-100/60 text-[#164fa5] border-blue-200/40",
    value: "text-[#164fa5]",
    glow: "bg-[#00b5e8]/20",
    accent: "from-[#164fa5] to-[#00b5e8]",
  },
  {
    card: `
      bg-gradient-to-br
      from-emerald-50/65
      via-white/45
      to-teal-50/55
      border-emerald-200/40
      hover:border-emerald-300/60
    `,
    icon: "bg-emerald-100/60 text-emerald-700 border-emerald-200/40",
    value: "text-emerald-700",
    glow: "bg-emerald-400/20",
    accent: "from-emerald-500 to-teal-400",
  },
  {
    card: `
      bg-gradient-to-br
      from-violet-50/65
      via-white/45
      to-fuchsia-50/55
      border-violet-200/40
      hover:border-violet-300/60
    `,
    icon: "bg-violet-100/60 text-violet-700 border-violet-200/40",
    value: "text-violet-700",
    glow: "bg-violet-400/20",
    accent: "from-violet-600 to-fuchsia-400",
  },
  {
    card: `
      bg-gradient-to-br
      from-amber-50/65
      via-white/45
      to-orange-50/55
      border-amber-200/40
      hover:border-amber-300/60
    `,
    icon: "bg-amber-100/60 text-amber-700 border-amber-200/40",
    value: "text-amber-700",
    glow: "bg-amber-400/20",
    accent: "from-amber-500 to-orange-400",
  },
];

export default function HeroStats() {
  return (
    <div
      className="
        relative
        z-20
        mx-4
        mb-5

        grid
        grid-cols-1
        gap-3

        min-[430px]:grid-cols-2

        md:mx-5
        md:mb-6

        xl:grid-cols-4

        2xl:mb-7
        2xl:gap-4 xl:pt-[73px]
      "
    >
      {stats.map((stat, index) => (
        <StatItem
          key={stat.value}
          {...stat}
          color={cardStyles[index % cardStyles.length]}
        />
      ))}
    </div>
  );
}

function StatItem({
  icon,
  value,
  title,
  subtitle,
  color,
}) {
  return (
    <div
      className={`
        group
        relative
        isolate

        flex
        min-h-[100px]
        items-center
        gap-3

        overflow-hidden
        rounded-[20px]

        border

        px-3
        py-4

        backdrop-blur-[18px]
        backdrop-saturate-150

        shadow-[0_12px_32px_rgba(22,79,165,0.10)]

        transition-all
        duration-300
        ease-out

        hover:-translate-y-1
        hover:shadow-[0_18px_40px_rgba(22,79,165,0.16)]

        2xl:min-h-[108px]
        2xl:gap-4
        2xl:px-4

        ${color.card}
      `}
    >
      {/* COLORED GLASS GLOW */}

      <div
        className={`
          pointer-events-none
          absolute
          -right-8
          -top-10
          -z-10

          h-28
          w-28

          rounded-full
          blur-2xl

          transition-all
          duration-500

          group-hover:scale-125

          ${color.glow}
        `}
      />

      {/* WHITE GLASS REFLECTION */}

      <div
        className="
          pointer-events-none
          absolute
          -left-6
          -top-12
          -z-10

          h-24
          w-[80%]

          rotate-[-10deg]

          rounded-full

          bg-white/35

          blur-2xl
        "
      />

      {/* TOP GLASS HIGHLIGHT */}

      <div
        className="
          pointer-events-none
          absolute
          left-4
          right-4
          top-0

          h-px

          bg-gradient-to-r
          from-transparent
          via-white/90
          to-transparent
        "
      />

      {/* ICON */}

      <div
        className={`
          relative

          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center

          rounded-[14px]

          border

          text-lg

          shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_6px_16px_rgba(22,79,165,0.08)]

          backdrop-blur-xl

          transition-all
          duration-300

          group-hover:-rotate-3
          group-hover:scale-110

          2xl:h-12
          2xl:w-12
          2xl:text-xl

          ${color.icon}
        `}
      >
        {icon}
      </div>

      {/* CONTENT */}

      <div className="relative min-w-0">
        <strong
          className={`
            block
            text-[18px]
            font-bold
            leading-none

            2xl:text-xl

            ${color.value}
          `}
        >
          {value}
        </strong>

        <p
          className="
            mt-2
            text-[10px]
            font-semibold
            leading-[1.35]
            text-[#2c2b2b]/75

            2xl:text-[11px]
          "
        >
          {title}
        </p>

        <span
          className="
            mt-0.5
            block
            text-[9px]
            font-medium
            text-[#2c2b2b]/50

            2xl:text-[10px]
          "
        >
          {subtitle}
        </span>
      </div>

      {/* BOTTOM ACCENT */}

      <div
        className={`
          absolute
          bottom-0
          left-5
          right-5

          h-[2px]

          origin-left
          scale-x-0

          rounded-full

          bg-gradient-to-r

          opacity-80

          transition-transform
          duration-300

          group-hover:scale-x-100

          ${color.accent}
        `}
      />
    </div>
  );
}