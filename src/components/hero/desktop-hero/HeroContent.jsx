"use client";

import Image from "next/image";
import Link from "next/link";

import {
  useState,
} from "react";

import MainCoursesModal from "@/components/main-course-modal/MainCoursesModal";

export default function HeroContent() {
  const [
    showMainCourses,
    setShowMainCourses,
  ] = useState(false);

  return (
    <>
      <div
        className="
          relative
          z-10
          flex
          h-full
          min-h-0
          items-center
          px-5
          py-5

          sm:px-6
          sm:py-6

          lg:px-6
          lg:py-5

          xl:px-8
          xl:py-6

          2xl:px-12
          2xl:py-8
        "
      >
        <div
          className="
            w-full
            max-w-[430px]

            xl:max-w-[450px]

            2xl:max-w-[520px]
          "
        >
          {/* =========================================
              EYEBROW
          ========================================= */}

          <div
            className="
              mb-3
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-[#164fa5]/10
              bg-white/80
              px-3
              py-1.5
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.13em]
              text-[#164fa5]
              shadow-[0_5px_15px_rgba(22,79,165,0.05)]
              backdrop-blur-md

              xl:mb-4
              xl:px-3.5
              xl:py-2
              xl:text-[10px]
            "
          >
            <span
              className="
                relative
                flex
                h-2
                w-2
              "
            >
              <span
                className="
                  absolute
                  inline-flex
                  h-full
                  w-full
                  animate-ping
                  rounded-full
                  bg-[#00b5e8]/40
                "
              />

              <span
                className="
                  relative
                  inline-flex
                  h-2
                  w-2
                  rounded-full
                  bg-[#00b5e8]
                "
              />
            </span>

            Kerala PSC Preparation
          </div>

          {/* =========================================
              HEADING
          ========================================= */}

          <h1
            className="
              text-[clamp(2.2rem,3vw,3.15rem)]
              font-semibold
              leading-[1.02]
              tracking-[-0.052em]
              text-black

              xl:text-[clamp(2.5rem,3.15vw,3.45rem)]

              2xl:text-[clamp(3rem,3.4vw,3.85rem)]
            "
          >
            <span className="block">
              Your Dream.
            </span>

            <span className="mt-1 block">
              Our Guidance.
            </span>

            <span
              className="
                mt-1
                block
                bg-gradient-to-r
                from-[#164fa5]
                via-[#017cc0]
                to-[#00b5e8]
                bg-clip-text
                pb-1
                text-transparent
              "
            >
              Your Success!
            </span>
          </h1>

          {/* =========================================
              ACCENT
          ========================================= */}

          <div
            className="
              mt-4
              flex
              items-center
              gap-2

              xl:mt-5
            "
          >
            <span
              className="
                h-[3px]
                w-10
                rounded-full
                bg-gradient-to-r
                from-[#164fa5]
                via-[#017cc0]
                to-[#00b5e8]

                xl:w-12
              "
            />

            <span
              className="
                h-[3px]
                w-2
                rounded-full
                bg-[#00b5e8]/30
              "
            />
          </div>

          {/* =========================================
              DESCRIPTION
          ========================================= */}

          <p
            className="
              mt-4
              max-w-[390px]
              text-[12px]
              leading-6
              text-[#2c2b2b]/80

              xl:mt-5
              xl:max-w-[420px]
              xl:text-[13px]
              xl:leading-7

              2xl:max-w-[450px]
              2xl:text-[14px]
            "
          >
            Comprehensive preparation for Kerala PSC exams
            with expert guidance, quality content and proven
            strategies.
          </p>

          {/* =========================================
              ACTIONS
          ========================================= */}

          <div
            className="
              mt-5
              flex
              w-full
              max-w-[430px]
              flex-col
              gap-2.5

              sm:flex-row

              xl:mt-6
              xl:gap-3

              2xl:max-w-[470px]
            "
          >
            {/* MAIN COURSES */}

            <button
              type="button"
              onClick={() =>
                setShowMainCourses(true)
              }
              className="
                group
                flex
                h-[46px]
                flex-1
                items-center
                justify-center
                gap-2
                rounded-full
                bg-gradient-to-r
                from-[#164fa5]
                via-[#017cc0]
                to-[#164fa5]
                px-4
                text-[11px]
                font-semibold
                text-white
                shadow-[0_10px_24px_rgba(22,79,165,0.20)]
                transition-all cursor-pointer
                duration-300
                hover:-translate-y-0.5
                hover:shadow-[0_14px_30px_rgba(22,79,165,0.28)]

                xl:h-[50px]
                xl:text-[12px]

                2xl:h-[54px]
                2xl:text-[13px]
              "
            >
              <span className="whitespace-nowrap">
                Explore Main Courses
              </span>

              <span
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              >
                →
              </span>
            </button>

            {/* AI VIDEOS */}

            <Link
              href="/government-exams-coaching/kerala-psc/ai-videos"
              className="
                group
                flex
                h-[46px]
                flex-1
                items-center
                justify-center
                gap-2
                rounded-full
                border
                border-[#164fa5]/10
                bg-white/85
                px-4
                text-[11px]
                font-semibold
                text-[#164fa5]
                shadow-[0_7px_18px_rgba(22,79,165,0.07)]
                backdrop-blur-lg
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:border-[#00b5e8]/25
                hover:bg-white
                hover:shadow-[0_12px_26px_rgba(22,79,165,0.11)]

                xl:h-[50px]
                xl:text-[12px]

                2xl:h-[54px]
                2xl:text-[13px]
              "
            >
              <span
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#164fa5]
                  pl-[2px]
                  text-[9px]
                  text-white
                  shadow-[0_5px_12px_rgba(22,79,165,0.18)]
                  transition-all
                  duration-300
                  group-hover:scale-105
                  group-hover:bg-[#017cc0]

                  2xl:h-9
                  2xl:w-9
                "
              >
                ▶
              </span>

              <span className="whitespace-nowrap">
                Watch AI Videos
              </span>
            </Link>
          </div>

          {/* =========================================
              TRUST ROW
          ========================================= */}

          <div
            className="
              mt-4
              flex
              flex-wrap
              items-center
              gap-2.5

              xl:mt-5
            "
          >
            <div className="flex -space-x-1.5">
              <StudentAvatar
                src="/assets/psc-candidate1.png"
                alt="PSC student"
              />

              <StudentAvatar
                src="/assets/psc-candidate2.png"
                alt="PSC student"
              />

              <StudentAvatar
                src="/assets/psc-candidate3.png"
                alt="PSC student"
              />
            </div>

            <span
              className="
                text-[9px]
                font-medium
                text-black/55

                xl:text-[10px]

                2xl:text-[11px]
              "
            >
              Trusted by thousands of aspirants
            </span>
          </div>
        </div>
      </div>

      <MainCoursesModal
        open={showMainCourses}
        onClose={() =>
          setShowMainCourses(false)
        }
      />
    </>
  );
}

function StudentAvatar({
  src,
  alt,
}) {
  return (
    <span
      className="
        relative
        h-6
        w-6
        overflow-hidden
        rounded-full
        border-2
        border-white
        bg-[#00b5e8]
      "
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="24px"
        className="object-cover"
      />
    </span>
  );
}