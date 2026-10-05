import {
  CheckCircle2,
  CircleMinus,
  FileQuestion,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";

/* =========================================================
   FORMAT
========================================================= */

function formatNumber(
  value
) {
  const number =
    Number(value);

  if (
    !Number.isFinite(
      number
    )
  ) {
    return "0";
  }

  if (
    Number.isInteger(
      number
    )
  ) {
    return String(number);
  }

  return String(
    Number(
      number.toFixed(2)
    )
  );
}

/* =========================================================
   CARD
========================================================= */

export default function SavedResultCard({
  result,
  counts,
}) {
  const score =
    Number(
      counts?.score ??
      0
    );

  const minusMark =
    Number(
      counts?.minusMark ??
      0
    );

  const attempted =
    Number(
      counts?.attempted ??
      0
    );

  const correct =
    Number(
      counts?.correct ??
      0
    );

  const wrong =
    Number(
      counts?.wrong ??
      0
    );

  const totalQuestions =
    Number(
      counts?.totalQuestions ??
      result?.total_questions ??
      0
    );

  const totalMark =
    Number(
      counts?.totalMark ??
      result?.total_mark ??
      totalQuestions
    );

  const examId =
    result?.exam_id ??
    "-";

  const examType =
    result?.exam_type ??
    "-";

  const status =
    String(
      result?.exam_status ??
      ""
    )
      .trim()
      .toLowerCase();

  const statusText =
    status === "finish" ||
      status === "finished" ||
      status === "complete" ||
      status === "completed"
      ? "Finished"
      : status ===
        "pause" ||
        status ===
        "paused"
        ? "Paused"
        : status ||
        "Finished";

  const detailCards = [
    {
      label:
        "Exam ID",

      value:
        examId,

      icon:
        FileQuestion,
    },

    {
      label:
        "Exam Type",

      value:
        examType,

      icon:
        Trophy,
    },

    {
      label:
        "Total Questions",

      value:
        totalQuestions,

      icon:
        FileQuestion,
    },

    {
      label:
        "Total Mark",

      value:
        totalMark,

      icon:
        Trophy,
    },

    {
      label:
        "Attempted",

      value:
        attempted,

      icon:
        Target,
    },

    {
      label:
        "Correct",

      value:
        correct,

      icon:
        CheckCircle2,
    },

    {
      label:
        "Wrong",

      value:
        wrong,

      icon:
        XCircle,
    },

    {
      label:
        "Minus Mark",

      value:
        formatNumber(
          minusMark
        ),

      icon:
        CircleMinus,
    },
  ];

  return (
    <section
      className="
        overflow-hidden
        rounded-[24px]
        border
        border-[#cfe0f3]
        bg-white
        shadow-sm
      "
    >
      {/* ===================================================
          RESULT HEADER
      =================================================== */}

      <div
        className="
          bg-gradient-to-r
          from-[#082e5a]
          via-[#164fa5]
          to-[#00b5e8]
          px-5
          py-7
          sm:px-7
        "
      >
        <div
          className="
            flex
            flex-col
            gap-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <p
              className="
                text-[10px]
                font-extrabold
                uppercase
                tracking-[0.18em]
                text-white/75
              "
            >
              Calculated Result
            </p>

            <p
              className="
                mt-3
                text-sm
                font-medium
                text-white/90
              "
            >
              Score
            </p>

            <div
              className="
                mt-1
                flex
                items-end
                gap-1
              "
            >
              <span
                className="
                  text-[34px]
                  font-black
                  leading-none
                  text-white
                "
              >
                {formatNumber(
                  score
                )}
              </span>

              <span
                className="
                  pb-1
                  text-sm
                  font-extrabold
                  text-white
                "
              >
                /
                {formatNumber(
                  totalMark
                )}
              </span>
            </div>
          </div>

          <div
            className="
              rounded-[16px]
              bg-white/10
              px-5
              py-3
              backdrop-blur
            "
          >
            <p
              className="
                text-[9px]
                font-extrabold
                uppercase
                tracking-[0.15em]
                text-white/70
              "
            >
              Status
            </p>

            <p
              className="
                mt-1
                text-base
                font-black
                capitalize
                text-white
              "
            >
              {statusText}
            </p>
          </div>
        </div>
      </div>

      {/* ===================================================
          DETAILS
      =================================================== */}

      <div
        className="
          grid
          gap-3
          p-4
          sm:grid-cols-2
          sm:p-5
          lg:grid-cols-4
        "
      >
        {detailCards.map(
          ({
            label,
            value,
            icon: Icon,
          }) => (
            <div
              key={label}
              className="
                rounded-[18px]
                border
                border-[#dbe7f5]
                bg-[#f8fbff]
                p-4
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-[11px]
                  bg-[#e6f6fd]
                  text-[#017dc0]
                "
              >
                <Icon
                  size={17}
                />
              </div>

              <p
                className="
                  mt-5
                  text-[9px]
                  font-extrabold
                  uppercase
                  tracking-[0.15em]
                  text-slate-400
                "
              >
                {label}
              </p>

              <p
                className="
                  mt-1
                  break-words
                  text-[14px]
                  font-black
                  capitalize
                  text-[#082e5a]
                "
              >
                {value}
              </p>
            </div>
          )
        )}
      </div>
    </section>
  );
}