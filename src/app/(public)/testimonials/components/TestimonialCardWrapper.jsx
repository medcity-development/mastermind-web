"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import TestimonialCard from "./TestimonialCard";
import { studentsData } from "./studentsData";

const INITIAL_COUNT = 4;
const ROW_SIZE = 2;

export default function TestimonialCardWrapper() {
  const [visibleCount, setVisibleCount] =
    useState(INITIAL_COUNT);

  const visibleStudents =
    studentsData.slice(0, visibleCount);

  const canShowMore =
    visibleCount < studentsData.length;

  const canShowLess =
    visibleCount > INITIAL_COUNT;

  const handleViewMore = () => {
    setVisibleCount((current) =>
      Math.min(
        current + ROW_SIZE,
        studentsData.length
      )
    );
  };

  const handleShowLess = () => {
    setVisibleCount((current) =>
      Math.max(
        current - ROW_SIZE,
        INITIAL_COUNT
      )
    );
  };

  return (
    <section
      className="
        relative
        isolate
        overflow-hidden
        bg-[#f7fbff]

        pb-14
        pt-24

        sm:pb-16
        sm:pt-28

        lg:pb-20
        lg:pt-32
      "  data-aos="fade-up"
    >
      {/* =========================================
          BACKGROUND DECORATIONS
      ========================================= */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-24
          top-32
          -z-10
          h-[220px]
          w-[220px]
          rounded-full
          bg-pink-200/30
          blur-[65px]

          sm:h-[280px]
          sm:w-[280px]

          lg:h-[340px]
          lg:w-[340px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-24
          top-[24%]
          -z-10
          h-[240px]
          w-[240px]
          rounded-full
          bg-sky-200/40
          blur-[75px]

          sm:h-[300px]
          sm:w-[300px]

          lg:h-[360px]
          lg:w-[360px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-[12%]
          left-[28%]
          -z-10
          hidden
          h-[260px]
          w-[260px]
          rotate-12
          rounded-[80px]
          bg-violet-200/25
          blur-[75px]

          md:block
        "
      />

      {/* top-right decorative shape */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          right-[5%]
          top-28
          -z-10
          hidden
          h-28
          w-28
          rotate-12
          rounded-[34px]
          border
          border-cyan-300/30
          bg-cyan-100/20

          sm:block
        "
      />

      {/* left-bottom shape */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-16
          bottom-20
          -z-10
          h-32
          w-32
          rotate-45
          rounded-[38px]
          border
          border-pink-300/30
          bg-pink-100/20

          sm:h-40
          sm:w-40
        "
      />

      {/* dots */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          right-[3%]
          top-[45%]
          -z-10
          hidden
          grid-cols-5
          gap-2
          opacity-35

          lg:grid
        "
      >
        {Array.from({
          length: 25,
        }).map((_, index) => (
          <span
            key={index}
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-blue-400
            "
          />
        ))}
      </div>

      {/* =========================================
          MAIN CONTAINER
      ========================================= */}

      <div
        className="
          relative
          mx-auto
          w-full
          max-w-7xl

          px-5

          sm:px-8

          lg:px-10

          xl:px-6
        "
      >
        {/* =========================================
            HEADING
        ========================================= */}

        <div
          className="
            mx-auto
            max-w-2xl
            text-center
          "
        >
          <span
            className="
              inline-flex
              items-center
              justify-center
              rounded-full
              border
              border-sky-200
              bg-white/80

              px-3.5
              py-1.5

              text-[9px]
              font-black
              uppercase
              tracking-[0.18em]
              text-sky-600
              shadow-sm
              backdrop-blur

              sm:px-4
              sm:py-2
              sm:text-[10px]

              lg:text-[11px]
            "
          >
            Student Stories
          </span>

          <h2
            className="
              mx-auto
              mt-4
              max-w-[700px]

              text-[28px]
              font-black
              leading-[1.12]
              tracking-tight
              text-[#071936]

              sm:mt-5
              sm:text-4xl

              lg:text-[44px]
            "
          >
            What Our Aspirants{" "}
            <span
              className="
                bg-gradient-to-r
                from-blue-600
                to-cyan-500
                bg-clip-text
                text-transparent
              "
            >
              Say About Us
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-4
              max-w-xl

              px-1

              text-[13px]
              leading-6
              text-slate-600

              sm:text-sm
              sm:leading-7
            "
          >
            Real experiences from students
            preparing for Kerala PSC, SSC and
            RRB examinations with MasterMind
            Academy.
          </p>
        </div>

        {/* =========================================
            TESTIMONIAL GRID
        ========================================= */}

        <div
          className="
            mt-8
            grid
            grid-cols-1
            gap-5

            sm:mt-10
            sm:gap-6

            lg:grid-cols-2

            xl:gap-7
          "
        >
          {visibleStudents.map(
            (student) => (
              <TestimonialCard
                key={student.id}
                student={student}
              />
            )
          )}
        </div>

        {/* =========================================
            VIEW MORE / SHOW LESS
        ========================================= */}

        {(canShowMore ||
          canShowLess) && (
          <div
            className="
              mt-8
              flex
              flex-wrap
              items-center
              justify-center
              gap-3

              sm:mt-10
            "
          >
            {canShowLess && (
              <button
                type="button"
                onClick={handleShowLess}
                className="
                  inline-flex
                  h-10
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  border
                  border-slate-200
                  bg-white
                  px-5

                  text-xs
                  font-bold
                  text-[#071936]

                  shadow-sm
                  transition
                  duration-300

                  hover:-translate-y-0.5
                  hover:border-blue-200
                  hover:bg-blue-50

                  sm:h-11
                  sm:px-6
                  sm:text-sm
                "
              >
                <ChevronUp size={16} />

                Show Less
              </button>
            )}

            {canShowMore && (
              <button
                type="button"
                onClick={handleViewMore}
                className="
                  inline-flex
                  h-10
                  items-center
                  justify-center
                  gap-2
                  rounded-full

                  bg-gradient-to-r
                  from-blue-600
                  to-cyan-500

                  px-6

                  text-xs
                  font-bold
                  text-white

                  shadow-[0_10px_30px_rgba(37,99,235,0.22)]

                  transition
                  duration-300

                  hover:-translate-y-0.5
                  hover:shadow-[0_14px_35px_rgba(37,99,235,0.28)]

                  sm:h-11
                  sm:px-7
                  sm:text-sm
                "
              >
                View More

                <ChevronDown size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}