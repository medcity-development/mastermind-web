"use client";

import {
  CheckCircle2,
  Target,
  Trophy,
  X,
  XCircle,
} from "lucide-react";

import {
  calculateExamCounts,
  toResultNumber,
} from "@/lib/examResultUtils";

export default function MockResultModal({
  open = false,
  result = null,
  examTitle = "",
  onClose,
}) {
  if (
    !open ||
    !result
  ) {
    return null;
  }

  const totalQuestions =
    toResultNumber(
      result?.total_questions
    );

  const totalMark =
    toResultNumber(
      result?.total_mark
    );

  const score =
    toResultNumber(
      result?.user_score
    );

  const {
    attempted,
    correct,
    wrong,
  } =
    calculateExamCounts(
      result
    );

  const percentage =
    totalMark > 0
      ? Math.round(
        (score /
          totalMark) *
        100
      )
      : 0;

  const resolvedExamTitle =
    String(
      result?.exam_name ??
      result?.examName ??
      result?.exam_title ??
      result?.examTitle ??
      result?.title ??
      result?.name ??
      examTitle ??
      ""
    ).trim();

  return (
    <div
      className="
        fixed
        inset-0
        z-[9999]

        flex
        items-center
        justify-center

        bg-[#020817]/70

        px-4
        py-8

        backdrop-blur-sm
      "
    >
      <div
        className="
          relative

          w-full
          max-w-[760px]

          overflow-hidden

          rounded-[28px]

          bg-white

          shadow-[0_30px_100px_rgba(2,8,23,0.35)]
        "
      >
        <button
          type="button"
          onClick={
            onClose
          }
          className="
            absolute
            right-4
            top-4
            z-20

            flex
            h-10
            w-10
            items-center
            justify-center

            rounded-full

            bg-white/15

            text-white

            transition

            hover:bg-white/25
          "
        >
          <X
            size={18}
          />
        </button>

        <div
          className="
            bg-gradient-to-r
            from-[#071f55]
            via-[#164fa5]
            to-[#017dc0]

            px-7
            py-8

            text-white
          "
        >
          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center

              rounded-[15px]

              bg-white/15
            "
          >
            <Trophy
              size={23}
            />
          </div>

          <p
            className="
              mt-5

              text-[10px]
              font-black
              uppercase
              tracking-[0.16em]

              text-blue-100
            "
          >
            {result?.exam_status ||
              "Result"}
          </p>

          <h2
            className="
              mt-1

              text-3xl
              font-black
            "
          >
            Your Result
          </h2>

          {resolvedExamTitle ? (
            <p
              className="
                mt-2

                max-w-[560px]

                text-sm
                font-semibold

                text-blue-100
              "
            >
              {resolvedExamTitle}
            </p>
          ) : null}
        </div>

        <div
          className="
            flex
            items-center
            justify-between

            border-b
            border-slate-100

            bg-[#f8fbff]

            px-7
            py-6
          "
        >
          <div>
            <p
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[0.12em]

                text-slate-400
              "
            >
              Score
            </p>

            <p
              className="
                mt-1

                text-4xl
                font-black

                text-[#071f55]
              "
            >
              {score}

              <span
                className="
                  ml-1

                  text-sm

                  text-slate-400
                "
              >
                / {totalMark}
              </span>
            </p>
          </div>

          <div
            className="
              flex
              h-20
              w-20
              items-center
              justify-center

              rounded-full

              border-[7px]
              border-[#dff4fe]

              bg-white

              text-xl
              font-black

              text-[#017dc0]
            "
          >
            {percentage}%
          </div>
        </div>

        <div
          className="
            grid
            gap-3

            p-7

            sm:grid-cols-3
          "
        >
          <ResultStat
            icon={Target}
            label="Attempted"
            value={`${attempted}/${totalQuestions}`}
          />

          <ResultStat
            icon={
              CheckCircle2
            }
            label="Correct"
            value={
              correct
            }
          />

          <ResultStat
            icon={
              XCircle
            }
            label="Wrong"
            value={
              wrong
            }
          />
        </div>

        <div
          className="
            border-t
            border-slate-100

            bg-slate-50

            px-7
            py-5
          "
        >
          <button
            type="button"
            onClick={
              onClose
            }
            className="
              w-full

              rounded-[14px]

              bg-gradient-to-r
              from-[#0b216c]
              via-[#164fa5]
              to-[#017dc0]

              px-6
              py-4

              text-sm
              font-extrabold

              text-white

              transition

              hover:opacity-95
            "
          >
            View Exam Analysis
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultStat({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-4

        rounded-[17px]

        border
        border-[#e5edf8]

        bg-[#f8fbff]

        p-4
      "
    >
      <div
        className="
          flex
          h-11
          w-11
          items-center
          justify-center

          rounded-[13px]

          bg-[#eaf7fe]

          text-[#017dc0]
        "
      >
        <Icon
          size={19}
        />
      </div>

      <div>
        <p
          className="
            text-xl
            font-black

            text-[#071f55]
          "
        >
          {value}
        </p>

        <p
          className="
            mt-0.5

            text-[9px]
            font-black
            uppercase
            tracking-[0.08em]

            text-slate-400
          "
        >
          {label}
        </p>
      </div>
    </div>
  );
}