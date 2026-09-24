const features = [
    {
      title: "Expert Faculty",
      description: "Learn from experienced mentors",
      icon: FacultyIcon,
      card:
        "border-cyan-300/20 from-cyan-400/[0.18] via-blue-500/[0.10] to-blue-300/[0.04]",
      iconStyle: "bg-cyan-300/15 text-cyan-200",
    },
    {
      title: "Daily Mock Tests",
      description: "Practice with exam-focused tests",
      icon: TestIcon,
      card:
        "border-violet-300/20 from-violet-400/[0.20] via-purple-500/[0.11] to-violet-300/[0.04]",
      iconStyle: "bg-violet-300/15 text-violet-200",
    },
    {
      title: "Updated Materials",
      description: "Study with relevant resources",
      icon: MaterialIcon,
      card:
        "border-pink-300/20 from-pink-400/[0.20] via-fuchsia-500/[0.10] to-pink-300/[0.04]",
      iconStyle: "bg-pink-300/15 text-pink-200",
    },
  ];
  
  export default function MobileHeroFeatures() {
    return (
      <div
        className="
          mt-9
          grid
          grid-cols-1
          gap-3
          sm:grid-cols-3
        "
      >
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            {...feature}
          />
        ))}
      </div>
    );
  }
  
  function FeatureCard({
    title,
    description,
    icon: Icon,
    card,
    iconStyle,
  }) {
    return (
      <div
        className={`
          group
          relative
          overflow-hidden
          rounded-2xl
          border
          bg-gradient-to-br
          p-4
          text-left
          shadow-[0_14px_35px_rgba(0,0,0,0.14)]
          backdrop-blur-xl
          transition-all
          duration-300
          hover:-translate-y-1
          ${card}
        `}
      >
        <div
          className="
            pointer-events-none
            absolute
            -right-12
            -top-12
            h-28
            w-28
            rounded-full
            bg-white/[0.10]
            blur-2xl
          "
        />
  
        <div className="relative z-10">
          <span
            className={`
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              ${iconStyle}
            `}
          >
            <Icon />
          </span>
  
          <h3 className="mt-3 text-sm font-semibold text-white">
            {title}
          </h3>
  
          <p className="mt-1 text-[11px] leading-5 text-blue-100/60">
            {description}
          </p>
        </div>
      </div>
    );
  }
  
  function FacultyIcon() {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="m4 9 8-4 8 4-8 4-8-4Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M7 11v4c2.5 2 7.5 2 10 0v-4M20 9v6"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
    );
  }
  
  function TestIcon() {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <rect
          x="5"
          y="3"
          width="14"
          height="18"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="m9 10 1.5 1.5L14 8M9 16h6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  
  function MaterialIcon() {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21V5.5ZM20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5A2.5 2.5 0 0 1 20 21V5.5Z"
          stroke="currentColor"
          strokeWidth="1.7"
        />
      </svg>
    );
  }