import Link from "next/link";

import {
  ArrowRight,
} from "lucide-react";

export default function DashboardHero({
  config,
}) {
  if (!config) {
    return null;
  }

  const isRrb =
    config.slug === "rrb-ssc";

  const image =
    config?.hero?.image ||
    (
      isRrb
        ? "/assets/rrb-ssc-coaching.webp"
        : "/assets/kerala-psc-coaching.webp"
    );

  const eyebrow =
    config?.hero?.eyebrow ||
    (
      isRrb
        ? "RRB & SSC Preparation"
        : "Kerala PSC Preparation"
    );

  const heading =
    config?.hero?.headingPrefix ||
    (
      isRrb
        ? "Prepare Smarter."
        : "Your Dream."
    );

  const highlight =
    config?.hero?.headingHighlight ||
    (
      isRrb
        ? "Achieve More!"
        : "Your Success!"
    );

  const description =
    config?.hero?.description ||
    "Quality Classes | Expert Faculty | Mock Tests | Previous Questions | Study Materials";

  return (
    <section
      className="
        relative
        min-h-[300px]
        overflow-hidden
        rounded-[26px]
        bg-[#071b59]
        shadow-[0_22px_60px_rgba(7,27,89,0.15)]
      "
    >
      {/* Background image */}
      <div
        className="
          absolute
          inset-0
          bg-cover
          bg-center
        "
        style={{
          backgroundImage: `
            linear-gradient(
              90deg,
              rgba(4,24,82,0.98) 0%,
              rgba(6,75,172,0.82) 42%,
              rgba(4,52,133,0.15) 78%,
              rgba(0,0,0,0.05) 100%
            ),
            url("${image}")
          `,
        }}
      />

      {/* Glow */}
      <div
        className="
          absolute
          -left-20
          -top-24
          h-[280px]
          w-[280px]
          rounded-full
          bg-[#0eb6ff]/20
          blur-3xl
        "
      />

      <div
        className="
          relative
          z-10
          flex
          min-h-[300px]
          max-w-[720px]
          flex-col
          justify-center
          px-7
          py-9
          sm:px-10
          lg:px-12
        "
      >
        <span
          className="
            w-fit
            rounded-full
            border
            border-white/25
            bg-white/10
            px-4
            py-2
            text-[9px]
            font-bold
            uppercase
            tracking-[0.17em]
            text-white
            backdrop-blur-md
          "
        >
          {eyebrow}
        </span>

        <h1
          className="
            mt-5
            text-[38px]
            font-extrabold
            leading-[0.98]
            tracking-[-0.04em]
            text-white
            sm:text-[50px]
            xl:text-[56px]
          "
        >
          {heading}

          <span
            className="
              block
              bg-gradient-to-r
              from-[#15d8f3]
              to-[#35f0dc]
              bg-clip-text
              text-transparent
            "
          >
            {highlight}
          </span>
        </h1>

        <p
          className="
            mt-4
            max-w-[610px]
            text-[11px]
            leading-6
            text-white/80
            sm:text-[12px]
          "
        >
          {description}
        </p>

        <Link
          href={`${config.basePath}/recommended-courses`}
          className="
            mt-6
            inline-flex
            h-[48px]
            w-fit
            items-center
            gap-3
            rounded-[12px]
            bg-white
            px-6
            text-[11px]
            font-bold
            text-[#164fa5]
            shadow-[0_12px_30px_rgba(0,0,0,0.15)]
            transition-all
            duration-300

            hover:-translate-y-0.5
            hover:shadow-[0_16px_35px_rgba(0,0,0,0.2)]
          "
        >
          Continue Learning

          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}