import {
    Award,
    CheckCircle2,
    FileQuestion,
    Target,
    Trophy,
  } from "lucide-react";
  
  import ResultBox from "./ResultBox";
  
  export default function ExamResult({
    totalQuestions,
    answeredCount,
    correctCount,
    wrongCount,
  }) {
    return (
      <div
        className="
          relative
          overflow-hidden
          rounded-[24px]
          border
          border-emerald-200
          bg-gradient-to-r
          from-emerald-50
          via-white
          to-cyan-50
          p-5
          shadow-[0_16px_45px_rgba(16,185,129,0.10)]
          sm:p-6
        "
      >
        <div
          aria-hidden="true"
          className="
            absolute
            -right-16
            -top-16
            h-40
            w-40
            rounded-full
            bg-emerald-200/30
            blur-3xl
          "
        />
  
        <div className="relative z-10">
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
            <div className="flex items-start gap-4">
              <div
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-[15px]
                  bg-emerald-100
                  text-emerald-700
                "
              >
                <Trophy size={22} />
              </div>
  
              <div>
                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.1em]
                    text-emerald-700
                  "
                >
                  Exam Completed
                </p>
  
                <h2
                  className="
                    mt-1
                    text-[20px]
                    font-extrabold
                    text-[#0b1f44]
                  "
                >
                  Your Result Summary
                </h2>
  
                <p
                  className="
                    mt-1
                    text-[12px]
                    leading-6
                    text-slate-500
                  "
                >
                  Review your answers and check
                  which questions were correct or
                  incorrect.
                </p>
              </div>
            </div>
  
            <div
              className="
                grid
                grid-cols-2
                gap-3
                sm:grid-cols-4
              "
            >
              <ResultBox
                label="Questions"
                value={totalQuestions}
                icon={FileQuestion}
                tone="blue"
              />
  
              <ResultBox
                label="Answered"
                value={answeredCount}
                icon={CheckCircle2}
                tone="cyan"
              />
  
              <ResultBox
                label="Correct"
                value={correctCount}
                icon={Award}
                tone="emerald"
              />
  
              <ResultBox
                label="Wrong"
                value={wrongCount}
                icon={Target}
                tone="rose"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }