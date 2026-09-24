import {
  Award,
  BookOpen,
  BookOpenCheck,
  Check,
  GraduationCap,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

import AboutHeroVisual from "./AboutHeroVisual";

const studentPoints = [
  "Expert Faculty",
  "Personal Mentorship",
  "Doubt Clearing Sessions",
  "Regular Assessments",
];

const learningPoints = [
  "Comprehensive Study Materials",
  "Chapter-wise Practice Tests",
  "Current Affairs Updates",
  "Performance Tracking",
];

export default function AboutHeroCards() {
  return (
    <div
      className="
        grid
        w-full
        grid-cols-1
        items-stretch
        gap-4

        lg:grid-cols-[280px_minmax(0,1fr)_280px]
        lg:gap-5

        xl:grid-cols-[300px_minmax(0,1fr)_300px]
      "
    >
      {/* =====================================================
          LEFT CARD
      ====================================================== */}
      <article
        className="
          relative
          overflow-hidden
          rounded-[22px]
          border
          border-white/90
          bg-gradient-to-br
          from-[#fff8fb]
          via-[#fffafd]
          to-[#fcedf5]
          p-5
          shadow-[0_16px_40px_rgba(112,30,74,0.08)]

          sm:p-6
          lg:h-[420px]
        "
      >
        {/* background glow */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-12
            -top-12
            h-36
            w-36
            rounded-full
            bg-[#ec1164]/10
            blur-[40px]
          "
        />

        {/* Content */}
        <div className="relative z-10">
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-gradient-to-br
              from-[#f31768]
              to-[#d70452]
              text-white
              shadow-[0_8px_18px_rgba(236,17,100,0.2)]
            "
          >
            <Users size={17} strokeWidth={2.2} />
          </div>

          <p
            className="
              mt-4
              text-[8px]
              font-black
              uppercase
              tracking-[0.22em]
              text-[#081f5c]
            "
          >
            Our Students
          </p>

          <h2
            className="
              mt-2
              text-[19px]
              font-black
              leading-[1.08]
              tracking-[-0.03em]
              text-[#081f5c]

              sm:text-[21px]
            "
          >
            Guided Aspirants.

            <span className="block text-[#e81262]">
              Confident Futures.
            </span>
          </h2>

          <p
            className="
              mt-3
              text-[11px]
              leading-[1.7]
              text-[#5d6981]

              sm:text-[12px]
            "
          >
            Personal guidance, consistent support and expert
            mentorship throughout your preparation journey.
          </p>

          <div className="mt-4 space-y-2">
            {studentPoints.map((item) => (
              <div
                key={item}
                className="
                  flex
                  items-center
                  gap-2.5
                  text-[11px]
                  font-medium
                  text-[#193568]
                "
              >
                <span
                  className="
                    flex
                    h-5
                    w-5
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#e81262]
                    text-white
                  "
                >
                  <Check size={11} strokeWidth={3} />
                </span>

                {item}
              </div>
            ))}
          </div>
        </div>

        {/* =================================================
            STUDENT SUCCESS ILLUSTRATION
        ================================================== */}
        {/* Book icon */}
<div
  aria-hidden="true"
  className="
    pointer-events-none
    absolute
    bottom-6
    right-6
    hidden
    lg:block
  "
>
  <BookOpen
    size={58}
    strokeWidth={1.5}
    className="
      text-[#e81262]
      opacity-90
    "
  />
</div>
      </article>

      {/* =====================================================
          CENTER IMAGE
      ====================================================== */}

      <AboutHeroVisual />

      {/* =====================================================
          RIGHT CARD
      ====================================================== */}
      <article
        className="
          relative
          overflow-hidden
          rounded-[22px]
          border
          border-white/90
          bg-gradient-to-br
          from-[#f9fcff]
          via-[#f4faff]
          to-[#e8f5ff]
          p-5
          shadow-[0_16px_40px_rgba(22,79,165,0.08)]

          sm:p-6
          lg:h-[420px]
        "
      >
        {/* background glow */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-12
            -top-12
            h-40
            w-40
            rounded-full
            bg-[#00b5e8]/10
            blur-[40px]
          "
        />

        {/* Content */}
        <div className="relative z-10">
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-gradient-to-br
              from-[#146de5]
              to-[#00a9e7]
              text-white
              shadow-[0_8px_18px_rgba(20,109,229,0.2)]
            "
          >
            <TrendingUp size={17} strokeWidth={2.2} />
          </div>

          <p
            className="
              mt-4
              text-[8px]
              font-black
              uppercase
              tracking-[0.22em]
              text-[#081f5c]
            "
          >
            Our Approach
          </p>

          <h2
            className="
              mt-2
              text-[19px]
              font-black
              leading-[1.08]
              tracking-[-0.03em]
              text-[#081f5c]

              sm:text-[21px]
            "
          >
            Structured Learning.

            <span className="block text-[#1178e8]">
              Real Progress.
            </span>
          </h2>

          <p
            className="
              mt-3
              text-[11px]
              leading-[1.7]
              text-[#5d6981]

              sm:text-[12px]
            "
          >
            Smart preparation built around quality materials,
            practice, current affairs and regular evaluation.
          </p>

          <div className="mt-4 space-y-2">
            {learningPoints.map((item) => (
              <div
                key={item}
                className="
                  flex
                  items-center
                  gap-2.5
                  text-[11px]
                  font-medium
                  text-[#193568]
                "
              >
                <span
                  className="
                    flex
                    h-5
                    w-5
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#1475e5]
                    text-white
                  "
                >
                  <Check size={11} strokeWidth={3} />
                </span>

                {item}
              </div>
            ))}
          </div>
        </div>

        {/* =================================================
            PROGRESS GRAPH
        ================================================== */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            bottom-5
            right-5
            hidden
            h-[90px]
            w-[112px]
            lg:block
          "
        >
          {/* soft graph background */}
          <div
            className="
              absolute
              bottom-0
              right-0
              h-[72px]
              w-[104px]
              rounded-[22px]
              bg-gradient-to-br
              from-[#edf8ff]
              to-[#dcefff]/60
            "
          />

          {/* bars */}
          <div
            className="
              absolute
              bottom-[10px]
              left-[12px]
              z-10
              flex
              items-end
              gap-[5px]
            "
          >
            <span
              className="
                h-[20px]
                w-[15px]
                rounded-t-[5px]
                bg-[#cbe8ff]
              "
            />

            <span
              className="
                h-[32px]
                w-[15px]
                rounded-t-[5px]
                bg-[#a9d9ff]
              "
            />

            <span
              className="
                h-[45px]
                w-[15px]
                rounded-t-[5px]
                bg-[#72bdff]
              "
            />

            <span
              className="
                h-[59px]
                w-[15px]
                rounded-t-[5px]
                bg-[#2b84e5]
              "
            />
          </div>

          {/* floating book icon */}
          <div
            className="
              absolute
              right-0
              top-0
              z-20
              flex
              h-[29px]
              w-[29px]
              items-center
              justify-center
              rounded-full
              border
              border-[#1475e5]/10
              bg-white
              text-[#1475e5]
              shadow-[0_6px_16px_rgba(20,117,229,0.12)]
            "
          >
            <BookOpenCheck size={13} strokeWidth={2} />
          </div>

          {/* tiny decorative dot */}
          <span
            className="
              absolute
              left-[2px]
              top-[20px]
              h-1.5
              w-1.5
              rounded-full
              bg-[#00b5e8]/60
            "
          />
        </div>
      </article>
    </div>
  );
}