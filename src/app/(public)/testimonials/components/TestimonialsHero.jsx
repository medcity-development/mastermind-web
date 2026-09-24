import Link from "next/link";

import {
  ArrowRight,
  Users,
} from "lucide-react";

import TestimonialsPortraits from "./TestimonialsPortraits";
import TestimonialsStats from "./TestimonialsStats";

export default function TestimonialsHero() {
  return (
    <section
      className="
        relative
        isolate
        overflow-hidden
        bg-[#f8fcff]
        pb-14
        pt-16
        sm:pb-16
        sm:pt-20
        lg:pb-20
        lg:pt-24
      "
    >
      {/* =====================================================
          BACKGROUND GLOWS
      ===================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-0
          -z-10
          h-[500px]
          w-[950px]
          max-w-[95vw]
          -translate-x-1/2
          rounded-full
          bg-white
          blur-[110px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-32
          top-20
          -z-10
          h-[350px]
          w-[350px]
          rounded-full
          bg-[#e1f3ff]/70
          blur-[100px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-32
          bottom-0
          -z-10
          h-[350px]
          w-[350px]
          rounded-full
          bg-[#fbeaf2]/60
          blur-[100px]
        "
      />

      {/* =====================================================
          DOTTED PATTERNS
      ===================================================== */}

  {/* FULL HERO SMALL DOT PATTERN */}
<div
  aria-hidden="true"
  className="
    pointer-events-none
    absolute
    inset-0
    z-0
    opacity-60
  "
  style={{
    backgroundImage:
      "radial-gradient(circle, rgba(20,117,229,0.30) 1.2px, transparent 1.2px)",
    backgroundSize: "18px 18px",
  }}
/>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-[1500px]
          px-4
          sm:px-6
          lg:px-8
          xl:px-10
        "
      >
        {/* Portrait collage */}
        <TestimonialsPortraits />

        {/* Main content */}
        <div
          className="
            relative
            z-20
            mx-auto
            mt-1
            max-w-[900px]
            text-center
          "  data-aos="fade-right"
        >
          {/* Eyebrow */}
          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-[#1475e5]/10
              bg-white/85
              px-4
              py-2
              shadow-[0_6px_20px_rgba(8,31,92,0.05)]
              backdrop-blur-md
            "
          >
            <Users
              size={13}
              strokeWidth={2}
              className="text-[#1475e5]"
            />

            <span
              className="
                text-[8px]
                font-black
                uppercase
                tracking-[0.24em]
                text-[#1475e5]
              "
            >
              Student Testimonials
            </span>
          </div>

          {/* Heading */}
          <h1
            className="
              mx-auto
              mt-5
              max-w-[920px]
              text-[34px]
              font-black
              leading-[1.03]
              tracking-[-0.045em]
              text-[#081f5c]
              sm:text-[44px]
              md:text-[54px]
              lg:text-[62px]
            "
          >
            Trusted by Aspirants

            <span
              className="
                mt-1
                block
                bg-gradient-to-r
                from-[#1667d9]
                via-[#1475e5]
                to-[#00aee7]
                bg-clip-text
                text-transparent
              "
            >
              Across Kerala and Beyond.
            </span>
          </h1>

          {/* Description */}
          <p
            className="
              mx-auto
              mt-5
              max-w-[680px]
              text-[12px]
              leading-6
              text-[#60708a]
              sm:text-[13px]
              sm:leading-7
              md:text-[14px]
            "
          >
            Hear real stories from our students who turned their hard
            work into success with MasterMind Academy.
          </p>

          {/* CTA */}
          <Link
            href="#student-stories"
            className="
              group
              mt-6
              inline-flex
              h-[46px]
              items-center
              justify-center
              gap-2
              rounded-full
              bg-gradient-to-r
              from-[#1676e8]
              via-[#1375e5]
              to-[#0468d8]
              px-7
              text-sm md:text-base
              font-bold
              text-white
              shadow-[0_12px_28px_rgba(20,117,229,0.22)]
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:shadow-[0_16px_34px_rgba(20,117,229,0.28)]
            "
          >
            Read Student Stories

            <ArrowRight
              size={13}
              strokeWidth={2.3}
              className="
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            />
          </Link>
        </div>

        {/* Stats */}
        <TestimonialsStats />
      </div>
    </section>
  );
}