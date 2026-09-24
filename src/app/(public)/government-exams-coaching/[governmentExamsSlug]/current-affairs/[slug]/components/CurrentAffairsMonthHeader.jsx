import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  Sparkles,
  Newspaper,
  Target,
} from "lucide-react";

export default function CurrentAffairsMonthHeader({
  title,
}) {
  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[30px]
        border
        border-white/20
        bg-gradient-to-r
        from-[#071f55]
        via-[#0b5bc7]
        to-[#7c3aed]
        px-5
        py-7
        text-white
        shadow-[0_24px_60px_rgba(22,79,165,0.22)]
        sm:px-7
        lg:px-9
        lg:py-8
      "
    >
      {/* GRID PATTERN */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.08]
          [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
          [background-size:34px_34px]
        "
      />

      {/* GLOWS */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-14
          -top-16
          h-52
          w-52
          rounded-full
          bg-[#00b5e8]/25
          blur-3xl
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          right-[18%]
          top-[-80px]
          h-56
          w-56
          rounded-full
          bg-[#e83e8c]/20
          blur-3xl
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -bottom-24
          right-0
          h-64
          w-64
          rounded-full
          bg-[#8b5cf6]/30
          blur-3xl
        "
      />

      {/* DECORATIVE RING */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-10
          -top-10
          h-52
          w-52
          rounded-full
          border
          border-white/10
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-4
          top-5
          h-32
          w-32
          rounded-full
          border
          border-white/10
        "
      />

      {/* CONTENT */}
      <div className="relative z-10">
        {/* TOP ROW */}
        <div
          className="
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <Link
            href="/government-exams-coaching/kerala-psc/current-affairs"
            className="
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-full
              border
              border-white/15
              bg-white/10
              px-3.5
              py-2
              text-[10px]
              font-semibold
              text-white/85
              backdrop-blur-md
              transition-all
              duration-300
              hover:-translate-x-0.5
              hover:bg-white/15
              hover:text-white
            "
          >
            <ArrowLeft size={14} />

            All Current Affairs
          </Link>

          <div
            className="
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-full
              border
              border-white/15
              bg-white/10
              px-3.5
              py-2
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.13em]
              text-cyan-100
              backdrop-blur
            "
          >
            <Sparkles size={13} />

            Monthly Current Affairs
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div
          className="
            mt-7
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          {/* LEFT */}
          <div
            className="
              flex
              items-start
              gap-4
            "
          >
            <span
              className="
                flex
                h-14
                w-14
                shrink-0
                items-center
                justify-center
                rounded-[18px]
                border
                border-white/15
                bg-gradient-to-br
                from-white/20
                to-white/5
                text-white
                shadow-[0_12px_25px_rgba(0,0,0,0.12)]
                backdrop-blur-xl
              "
            >
              <CalendarDays
                size={25}
                strokeWidth={2}
              />
            </span>

            <div>
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-[#79e8ff]
                "
              >
                Kerala PSC Preparation
              </p>

              <h1
                className="
                  mt-2
                  text-3xl
                  font-extrabold
                  tracking-[-0.04em]
                  text-white
                  sm:text-4xl
                  lg:text-[42px]
                "
              >
                {title}
              </h1>

              <div
                className="
                  mt-1
                  flex
                  flex-wrap
                  items-center
                  gap-2
                "
              >
                <span
                  className="
                    bg-gradient-to-r
                    from-[#67e8f9]
                    via-[#a5b4fc]
                    to-[#f0abfc]
                    bg-clip-text
                    text-2xl
                    font-bold
                    tracking-[-0.03em]
                    text-transparent
                    sm:text-3xl
                  "
                >
                  Current Affairs
                </span>

                <span
                  className="
                    hidden
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-[#ff5ca4]
                    sm:block
                  "
                />

                <span
                  className="
                    hidden
                    text-[11px]
                    font-medium
                    text-white/60
                    sm:block
                  "
                >
                  Daily updates & exam-focused revision
                </span>
              </div>

              <p
                className="
                  mt-3
                  max-w-[680px]
                  text-[12px]
                  leading-6
                  text-white/70
                  sm:text-[13px]
                "
              >
                Select a date below to explore the daily
                current affairs updates for {title}, curated
                for Kerala PSC preparation.
              </p>
            </div>
          </div>

          {/* RIGHT FEATURES */}
          <div
            className="
              grid
              grid-cols-2
              gap-2
              sm:flex
              sm:flex-wrap
              lg:justify-end
            "
          >
            <InfoChip
              icon={Newspaper}
              label="Daily Updates"
              tone="cyan"
            />

            <InfoChip
              icon={Target}
              label="PSC Focused"
              tone="pink"
            />

            <InfoChip
              icon={CalendarDays}
              label={title}
              tone="purple"
            />
          </div>
        </div>
      </div>

      {/* BOTTOM ACCENT */}
      <div
        aria-hidden="true"
        className="
          absolute
          bottom-0
          left-[8%]
          right-[8%]
          h-[3px]
          bg-gradient-to-r
          from-transparent
          via-[#5ee7ff]
          to-transparent
          opacity-50
        "
      />
    </section>
  );
}

function InfoChip({
  icon: Icon,
  label,
  tone,
}) {
  const styles = {
    cyan: {
      bg: "from-[#00b5e8]/20 to-[#087bea]/15",
      border: "border-cyan-200/20",
      icon: "text-cyan-200",
    },

    pink: {
      bg: "from-[#e83e8c]/20 to-[#c026d3]/15",
      border: "border-pink-200/20",
      icon: "text-pink-200",
    },

    purple: {
      bg: "from-[#8b5cf6]/20 to-[#6d28d9]/15",
      border: "border-violet-200/20",
      icon: "text-violet-200",
    },
  };

  const style =
    styles[tone] ??
    styles.cyan;

  return (
    <div
      className={`
        flex
        items-center
        gap-2
        rounded-[14px]
        border
        bg-gradient-to-br
        px-3
        py-2.5
        backdrop-blur-md
        ${style.bg}
        ${style.border}
      `}
    >
      <span
        className="
          flex
          h-8
          w-8
          items-center
          justify-center
          rounded-[10px]
          bg-white/10
        "
      >
        <Icon
          size={15}
          className={
            style.icon
          }
        />
      </span>

      <span
        className="
          whitespace-nowrap
          text-[10px]
          font-semibold
          text-white/85
        "
      >
        {label}
      </span>
    </div>
  );
}