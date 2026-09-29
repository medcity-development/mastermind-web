"use client";

import {
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  Clock3,
  FileQuestion,
  Trophy,
} from "lucide-react";

/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(
  totalSeconds
) {
  const seconds =
    Math.max(
      0,
      Number(
        totalSeconds
      ) || 0
    );

  const hours =
    Math.floor(
      seconds / 3600
    );

  const minutes =
    Math.floor(
      (seconds % 3600) /
        60
    );

  const remainingSeconds =
    seconds % 60;

  if (hours > 0) {
    return `${String(
      hours
    ).padStart(
      2,
      "0"
    )}:${String(
      minutes
    ).padStart(
      2,
      "0"
    )}:${String(
      remainingSeconds
    ).padStart(
      2,
      "0"
    )}`;
  }

  return `${String(
    minutes
  ).padStart(
    2,
    "0"
  )}:${String(
    remainingSeconds
  ).padStart(
    2,
    "0"
  )}`;
}

/* =========================================================
   HEADER
========================================================= */

export default function MockTestHeader({
  exam,
  examTitle = "",
  examName = "",
  shortName = "",
  remainingSeconds = 0,
  backHref = "",
}) {
  const router =
    useRouter();

  const safeSeconds =
    Math.max(
      0,
      Number(
        remainingSeconds
      ) || 0
    );

  /*
   * Do not show low-time warning while
   * timer is still 0 / not initialized.
   */
  const lowTime =
    safeSeconds > 0 &&
    safeSeconds <=
      5 * 60;

  const displayExamName =
    shortName ||
    examName ||
    "Mock Test";

  const title =
    exam?.exam_name ||
    examTitle ||
    `${displayExamName} Mock Test`;

  function handleBack() {
    if (backHref) {
      router.push(
        backHref
      );

      return;
    }

    router.back();
  }

  return (
    <header
      className="
        relative
        overflow-hidden

        rounded-[24px]

        border
        border-white/10

        bg-gradient-to-br
        from-[#061633]
        via-[#123c8d]
        to-[#0877b7]

        px-5
        py-5

        text-white

        shadow-[0_18px_46px_rgba(7,31,85,0.17)]

        sm:px-6
        sm:py-6

        lg:px-7
      "
    >
      {/* =====================================================
          GRID PATTERN
      ===================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0

          opacity-[0.055]

          [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
          [background-size:32px_32px]
        "
      />

      {/* =====================================================
          RIGHT GLOW
      ===================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-28
          -top-28

          h-[320px]
          w-[320px]

          rounded-full

          bg-cyan-300/20

          blur-[90px]
        "
      />

      {/* =====================================================
          LEFT GLOW
      ===================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -bottom-40
          -left-28

          h-[300px]
          w-[300px]

          rounded-full

          bg-violet-400/15

          blur-[100px]
        "
      />

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div
        className="
          relative
          z-10
        "
      >
        {/* BACK */}

        <button
          type="button"
          onClick={
            handleBack
          }
          className="
            mb-4

            inline-flex
            items-center
            gap-2

            rounded-[10px]

            border
            border-white/15

            bg-white/[0.08]

            px-3
            py-2

            text-[10px]
            font-bold

            text-white/90

            backdrop-blur-md

            transition-all
            duration-200

            hover:border-white/25
            hover:bg-white/[0.14]

            active:scale-[0.98]
          "
        >
          <ArrowLeft
            size={14}
          />

          Back
        </button>

        <div
          className="
            flex
            flex-col
            gap-5

            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          {/* =================================================
              LEFT CONTENT
          ================================================= */}

          <div
            className="
              min-w-0
              flex-1
            "
          >
            {/* EYEBROW */}

            <div
              className="
                inline-flex
                items-center
                gap-2

                rounded-full

                border
                border-cyan-300/20

                bg-cyan-300/[0.08]

                px-3
                py-1.5
              "
            >
              <span
                className="
                  h-1.5
                  w-1.5

                  rounded-full

                  bg-cyan-300

                  shadow-[0_0_10px_rgba(103,232,249,0.8)]
                "
              />

              <p
                className="
                  text-[8px]
                  font-black
                  uppercase
                  tracking-[0.18em]

                  text-cyan-100
                "
              >
                {displayExamName} Mock Test
              </p>
            </div>

            {/* TITLE */}

            <h1
              className="
                mt-3

                max-w-3xl

                text-[21px]
                font-black
                leading-[1.2]
                tracking-[-0.025em]

                text-white

                sm:text-[25px]
                lg:text-[27px]
              "
            >
              {title}
            </h1>

            {/* STATS */}

            <div
              className="
                mt-4

                flex
                flex-wrap
                gap-2.5
              "
            >
              <SmallStat
                icon={
                  FileQuestion
                }
                label="Questions"
                value={
                  exam?.total_questions ??
                  "-"
                }
              />

              <SmallStat
                icon={
                  Trophy
                }
                label="Total Marks"
                value={
                  exam?.total_mark ??
                  "-"
                }
              />
            </div>
          </div>

          {/* =================================================
              TIMER
          ================================================= */}

          <div
            className={`
              w-full

              rounded-[18px]

              border

              px-4
              py-3.5

              backdrop-blur-xl

              transition-all
              duration-300

              sm:w-auto
              sm:min-w-[195px]

              ${
                lowTime
                  ? `
                      border-rose-300/30
                      bg-gradient-to-br
                      from-rose-500/20
                      to-red-500/10

                      shadow-[0_12px_32px_rgba(244,63,94,0.10)]
                    `
                  : `
                      border-white/15

                      bg-gradient-to-br
                      from-white/[0.12]
                      to-white/[0.05]
                    `
              }
            `}
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <div
                className={`
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center

                  rounded-[12px]

                  border

                  ${
                    lowTime
                      ? `
                          border-rose-300/20
                          bg-rose-400/15
                          text-rose-100
                        `
                      : `
                          border-white/10
                          bg-white/[0.08]
                          text-cyan-100
                        `
                  }
                `}
              >
                <Clock3
                  size={19}
                />
              </div>

              <div
                className="
                  min-w-0
                "
              >
                <p
                  className="
                    text-[8px]
                    font-bold
                    uppercase
                    tracking-[0.12em]

                    text-blue-100/80
                  "
                >
                  Time Remaining
                </p>

                <p
                  className={`
                    mt-0.5

                    font-mono

                    text-[22px]
                    font-black
                    tracking-[-0.03em]

                    ${
                      lowTime
                        ? "text-rose-100"
                        : "text-white"
                    }
                  `}
                >
                  {formatTime(
                    safeSeconds
                  )}
                </p>
              </div>
            </div>

            {lowTime && (
              <div
                className="
                  mt-2.5

                  rounded-lg

                  bg-rose-400/10

                  px-2.5
                  py-1.5
                "
              >
                <p
                  className="
                    text-[8px]
                    font-bold

                    text-rose-100
                  "
                >
                  Less than 5 minutes remaining
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

/* =========================================================
   SMALL STAT
========================================================= */

function SmallStat({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-2.5

        rounded-[11px]

        border
        border-white/10

        bg-white/[0.08]

        px-3
        py-2

        backdrop-blur-md
      "
    >
      <div
        className="
          flex
          h-7
          w-7
          shrink-0
          items-center
          justify-center

          rounded-[8px]

          bg-white/10

          text-cyan-100
        "
      >
        <Icon
          size={13}
        />
      </div>

      <div>
        <p
          className="
            text-[11px]
            font-black

            text-white
          "
        >
          {value}
        </p>

        <p
          className="
            mt-0.5

            text-[8px]
            font-medium

            text-blue-100/75
          "
        >
          {label}
        </p>
      </div>
    </div>
  );
}