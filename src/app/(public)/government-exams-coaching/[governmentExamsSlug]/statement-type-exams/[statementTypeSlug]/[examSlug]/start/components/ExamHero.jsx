import Link from "next/link";

import {
  ArrowLeft,
  Clock3,
  FileQuestion,
} from "lucide-react";

import {
  formatTime,
} from "../utils/examUtils";

export default function ExamHero({
  exam,
  questionsCount,
  timeLeft,
  durationMinutes,
  statementTypeSlug,
  examSlug,
}) {
  const isTimeOver =
    durationMinutes > 0 &&
    timeLeft <= 0;

  const isLowTime =
    timeLeft > 0 &&
    timeLeft <= 60;

  return (
    <>
      <Link
        href={
          `/government-exams-coaching/kerala-psc/statement-type-exams/${statementTypeSlug}/${examSlug}`
        }
        className="
          mb-5
          inline-flex
          items-center
          gap-2
          text-sm
          font-bold
          text-[#075fc8] mt-20
        "
      >
        <ArrowLeft
          size={16}
        />

        Back to Instructions
      </Link>

      <section
        className="
          relative
          overflow-hidden
          rounded-[28px]
          bg-gradient-to-r
          from-[#071f55]
          via-[#075fc8]
          to-[#7c3aed]
          p-6
          text-white
          sm:p-8
        "
      >
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

        <div
          className="
            relative
            z-10
            grid
            gap-8
            lg:grid-cols-[1fr_auto]
            lg:items-center
          "
        >
          <div>
            <p
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[0.16em]
                text-blue-100
              "
            >
              Kerala PSC Statement Type
            </p>

            <h1
              className="
                mt-2
                text-2xl
                font-black
                sm:text-3xl
              "
            >
              {exam?.exam_name}
            </h1>

            <div
              className="
                mt-5
                flex
                flex-wrap
                gap-3
              "
            >
              <Badge
                icon={
                  FileQuestion
                }
              >
                {questionsCount} Questions
              </Badge>

              <Badge
                icon={Clock3}
              >
                {durationMinutes} Minutes
              </Badge>
            </div>
          </div>

          {/* TIMER */}

          <div
            className={`
              min-w-[220px]
              rounded-[22px]
              border
              p-5
              backdrop-blur-sm

              ${
                isTimeOver
                  ? `
                    border-red-300/30
                    bg-red-500/15
                  `
                  : isLowTime
                    ? `
                      border-amber-300/30
                      bg-amber-400/15
                    `
                    : `
                      border-white/20
                      bg-white/10
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
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-[14px]
                  bg-white/15
                "
              >
                <Clock3
                  size={20}
                />
              </div>

              <div>
                <p
                  className="
                    text-[9px]
                    font-black
                    uppercase
                    tracking-[0.14em]
                    text-blue-100
                  "
                >
                  Time Left
                </p>

                <p
                  className="
                    mt-1
                    text-3xl
                    font-black
                    tabular-nums
                  "
                >
                  {formatTime(
                    timeLeft
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Badge({
  icon: Icon,
  children,
}) {
  return (
    <span
      className="
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        border-white/10
        bg-white/10
        px-4
        py-2
        text-xs
        font-bold
      "
    >
      <Icon size={15} />

      {children}
    </span>
  );
}