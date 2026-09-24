// components/FeatureCard.jsx

"use client";

const FeatureCard = ({
  title,
  text,
  icon: Icon,
  index,
  iconColor = "blue",
}) => {
  const colors = {
    blue: {
      icon: "text-blue-600",
      bg: "bg-blue-50",
      ring: "ring-blue-100",
      glow: "group-hover:shadow-blue-100/70",
      line: "from-blue-500 to-cyan-400",
    },

    violet: {
      icon: "text-violet-600",
      bg: "bg-violet-50",
      ring: "ring-violet-100",
      glow: "group-hover:shadow-violet-100/70",
      line: "from-violet-500 to-fuchsia-400",
    },

    green: {
      icon: "text-emerald-600",
      bg: "bg-emerald-50",
      ring: "ring-emerald-100",
      glow: "group-hover:shadow-emerald-100/70",
      line: "from-emerald-500 to-green-400",
    },

    orange: {
      icon: "text-orange-500",
      bg: "bg-orange-50",
      ring: "ring-orange-100",
      glow: "group-hover:shadow-orange-100/70",
      line: "from-orange-500 to-amber-400",
    },

    red: {
      icon: "text-rose-500",
      bg: "bg-rose-50",
      ring: "ring-rose-100",
      glow: "group-hover:shadow-rose-100/70",
      line: "from-rose-500 to-pink-400",
    },

    indigo: {
      icon: "text-indigo-600",
      bg: "bg-indigo-50",
      ring: "ring-indigo-100",
      glow: "group-hover:shadow-indigo-100/70",
      line: "from-indigo-500 to-blue-400",
    },
  };

  const theme = colors[iconColor] || colors.blue;

  return (
    <div
      data-aos="fade-up"
      data-aos-delay={index * 70}
      className={`
        group
        relative
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-slate-200/80
        bg-white
        p-5
        shadow-[0_8px_30px_rgba(15,23,42,0.05)]
        transition-all
        duration-300
        hover:-translate-y-1.5
        hover:border-blue-100
        hover:shadow-xl
        ${theme.glow}
        sm:p-6
      `}
    >
      {/* grid pattern */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.035]
          transition-opacity
          duration-300
          group-hover:opacity-[0.07]
        "
        style={{
          backgroundImage: `
            linear-gradient(to right, rgb(37 99 235) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(37 99 235) 1px, transparent 1px)
          `,
          backgroundSize: "22px 22px",
        }}
      />

      {/* soft corner glow */}
      <div
        className="
          pointer-events-none
          absolute
          -right-10
          -top-10
          h-32
          w-32
          rounded-full
          bg-blue-100/40
          blur-3xl
          transition-all
          duration-500
          group-hover:bg-blue-200/50
        "
      />

      {/* top accent */}
      <div
        className={`
          absolute
          left-0
          top-0
          z-10
          h-[3px]
          w-full
          origin-left
          scale-x-0
          bg-gradient-to-r
          ${theme.line}
          transition-transform
          duration-300
          group-hover:scale-x-100
        `}
      />

      {/* icon */}
      <div
        className={`
          relative
          z-10
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          ${theme.bg}
          ${theme.icon}
          ring-1
          ${theme.ring}
          shadow-sm
          transition-all
          duration-300
          group-hover:-translate-y-1
          group-hover:scale-105
        `}
      >
        <Icon className="h-7 w-7" />
      </div>

      {/* content */}
      <div className="relative z-10 mt-5">
        <h3
          className="
            text-[17px]
            font-bold
            leading-snug
            tracking-tight
            text-[#091653]
            transition-colors
            duration-300
            group-hover:text-blue-600
          "
        >
          {title}
        </h3>

        <p
          className="
            mt-3
            text-[13px]
            leading-6
            text-slate-500
            sm:text-[13.5px]
          "
        >
          {text}
        </p>
      </div>

      {/* bottom accent */}
      <div className="relative z-10 mt-auto pt-5">
        <div
          className={`
            h-1
            w-10
            rounded-full
            bg-gradient-to-r
            ${theme.line}
            transition-all
            duration-300
            group-hover:w-16
          `}
        />
      </div>
    </div>
  );
};

export default FeatureCard;