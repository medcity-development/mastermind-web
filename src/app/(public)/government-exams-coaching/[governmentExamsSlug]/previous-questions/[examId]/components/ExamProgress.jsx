import { CheckCircle2 } from "lucide-react";

export default function ExamProgress({
  answeredCount,
  totalQuestions,
  progress,
}) {
  return (
    <div
      className="
        rounded-[22px]
        border
        border-slate-200
        bg-white
        p-5
        shadow-[0_14px_40px_rgba(15,23,42,0.05)]
      "
    >
      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-[12px]
              bg-emerald-50
              text-emerald-600
            "
          >
            <CheckCircle2 size={19} />
          </div>

          <div>
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.08em]
                text-slate-400
              "
            >
              Exam Progress
            </p>

            <p
              className="
                mt-1
                text-[13px]
                font-extrabold
                text-[#0b1f44]
              "
            >
              {answeredCount} of{" "}
              {totalQuestions} answered
            </p>
          </div>
        </div>

        <div
          className="
            flex
            items-center
            gap-3
            sm:min-w-[360px]
          "
        >
          <div
            className="
              h-3
              flex-1
              overflow-hidden
              rounded-full
              bg-slate-100
            "
          >
            <div
              className="
                h-full
                rounded-full
                bg-gradient-to-r
                from-emerald-500
                via-cyan-500
                to-blue-500
                transition-all
                duration-500
              "
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div
            className="
              min-w-[52px]
              rounded-full
              bg-[#0b216c]
              px-3
              py-1.5
              text-center
              text-[11px]
              font-extrabold
              text-white
            "
          >
            {progress}%
          </div>
        </div>
      </div>
    </div>
  );
}