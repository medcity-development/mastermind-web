// SubExamHero.jsx

import Link from "next/link";

import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Sparkles,
} from "lucide-react";

export default function SubExamHero({
  title,
}) {
  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[28px]
        border
        border-white/15
        bg-gradient-to-r
        from-[#081f5c]
        via-[#075fc8]
        to-[#7c3aed]
        px-5
        py-8
        text-white
        shadow-[0_20px_55px_rgba(22,79,165,0.20)]
        sm:px-8
        lg:px-10
      "
    >
      {/* GRID PATTERN */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.06]
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
          -left-16
          -top-20
          h-60
          w-60
          rounded-full
          bg-[#00b5e8]/20
          blur-3xl
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-20
          -top-16
          h-64
          w-64
          rounded-full
          bg-[#e83e8c]/20
          blur-3xl
        "
      />

      <div
        className="
          relative
          z-10
        "
      >
        <Link
          href="/government-exams-coaching/kerala-psc"
          className="
            inline-flex
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
            text-white/80
            backdrop-blur-md
            transition-all
            duration-300
            hover:-translate-x-0.5
            hover:bg-white/15
            hover:text-white
          "
        >
          <ArrowLeft
            size={14}
          />

          Kerala PSC
        </Link>

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
                bg-white/10
                text-white
                shadow-[0_10px_24px_rgba(0,0,0,0.12)]
                backdrop-blur
              "
            >
              <GraduationCap
                size={26}
              />
            </span>

            <div>
              <p
                className="
                  flex
                  items-center
                  gap-2
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-cyan-200
                "
              >
                <Sparkles
                  size={12}
                />

                Kerala PSC Exam Level
              </p>

              <h1
                className="
                  mt-2
                  text-3xl
                  font-black
                  tracking-[-0.04em]
                  sm:text-4xl
                  lg:text-[42px]
                "
              >
                {title}
              </h1>

              <p
                className="
                  mt-3
                  max-w-[700px]
                  text-[12px]
                  leading-6
                  text-white/70
                  sm:text-[13px]
                "
              >
                Explore available exams under {title},
                along with preparation courses, study
                materials and learning resources.
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div
            className="
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-[14px]
              border
              border-white/15
              bg-white/10
              px-4
              py-3
              text-[11px]
              font-semibold
              text-white/85
              backdrop-blur
            "
          >
            <BookOpen
              size={16}
            />

            Choose an exam to continue
          </div>
        </div>
      </div>
    </section>
  );
}