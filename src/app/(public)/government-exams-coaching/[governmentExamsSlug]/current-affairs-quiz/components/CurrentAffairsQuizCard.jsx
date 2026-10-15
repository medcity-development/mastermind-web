import {
    ArrowRight,
    Brain,
    CalendarDays,
    LockOpen,
  } from "lucide-react";
  
  export default function CurrentAffairsQuizCard({
    quiz,
  }) {
    const quizName =
      quiz?.name ||
      "Current Affairs Quiz";
  
    const isFree =
      String(
        quiz?.type || ""
      ).toLowerCase() === "free";
  
    return (
      <article
        className={`
          group
          relative
          overflow-hidden
          rounded-[22px]
          border
          p-5
          transition-all
          duration-300

          ${
            isFree
              ? `
                  border-emerald-200
                  bg-gradient-to-br
                  from-emerald-50
                  via-white
                  to-green-50
                  hover:border-emerald-300
                  hover:shadow-[0_18px_45px_rgba(16,185,129,0.12)]
                `
              : `
                  border-amber-200
                  bg-gradient-to-br
                  from-amber-50
                  via-white
                  to-orange-50
                  hover:border-amber-300
                  hover:shadow-[0_18px_45px_rgba(245,158,11,0.12)]
                `
          }

          hover:-translate-y-1
        `}
      >
        <div
          aria-hidden="true"
          className={`
            absolute
            -right-10
            -top-10
            h-32
            w-32
            rounded-full

            ${
              isFree
                ? "bg-emerald-200/30"
                : "bg-amber-200/30"
            }
          `}
        />
  
        <div className="relative z-10">
          <div
            className="
              flex
              items-start
              justify-between
              gap-4
            "
          >
            <div
              className={`
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-[15px]

              ${
                isFree
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }
              `}
            >
              <Brain size={21} />
            </div>
  
            <span
              className={`
                inline-flex
                items-center
                gap-1.5
                rounded-full
                px-3
                py-1.5
                text-[9px]
                font-black
                uppercase
                tracking-[0.08em]
  
                ${
                  isFree
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-amber-50 text-amber-700"
                }
              `}
            >
              {isFree && (
                <LockOpen size={11} />
              )}
  
              {quiz?.type ||
                "Quiz"}
            </span>
          </div>
  
          <h3
            className="
              mt-5
              text-lg
              font-black
              text-[#102c5c]
            "
          >
            {quizName}
          </h3>
  
          {quiz?.created_at && (
            <div
              className="
                mt-3
                flex
                items-center
                gap-2
                text-[11px]
                text-slate-500
              "
            >
              <CalendarDays
                size={14}
              />
  
              <span>
                {quiz.created_at}
              </span>
            </div>
          )}
  
          <button
            type="button"
            className={`
              mt-6
              inline-flex
              items-center
              gap-2
              rounded-full
              px-5
              py-2.5
              text-[11px]
              font-bold
              transition

              ${
                isFree
                  ? "border border-emerald-200 bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                  : "border border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-200"
              }
            `}
          >
            Start Quiz
  
            <ArrowRight
              size={14}
              className="
                transition-transform
                group-hover:translate-x-1
              "
            />
          </button>
        </div>
      </article>
    );
  }