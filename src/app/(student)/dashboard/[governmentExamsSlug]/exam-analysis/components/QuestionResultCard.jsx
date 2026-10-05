"use client";

import {
  CheckCircle2,
  CircleMinus,
  XCircle,
} from "lucide-react";

/* =========================================================
   QUESTION RESULT CARD
========================================================= */

export default function QuestionResultCard({
  row,
}) {
  if (!row) {
    return null;
  }

  /* =======================================================
     USER ANSWER

     examAnalysisUtils.js already creates:

     A. Kerala
     B. Delhi
     C. 2775
     D. 2/5

     So DO NOT rebuild it here.
  ======================================================= */

  const userAnswer =
    row?.attempted
      ? String(
        row?.userAnswerDisplay ??
        ""
      ).trim() ||
      "Not Answered"
      : "Not Answered";

  /* =======================================================
     CORRECT ANSWER

     This also comes already formatted from utility.
  ======================================================= */

  const correctAnswer =
    String(
      row?.correctAnswerDisplay ??
      ""
    ).trim() || "-";

  return (
    <article
      className="
        overflow-hidden
        rounded-[22px]
        border
        border-[#d8e5f4]
        bg-white
        shadow-[0_8px_25px_rgba(15,23,42,0.035)]
      "
    >
      {/* ===================================================
          QUESTION
      =================================================== */}

      <div
        className="
          flex
          items-start
          gap-4

          border-b
          border-slate-100

          px-5
          py-5
        "
      >
        {/* NUMBER */}

        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center

            rounded-[12px]

            bg-[#e8f6fc]

            text-[13px]
            font-black
            text-[#017dc0]
          "
        >
          {row?.number ?? "-"}
        </div>

        {/* CONTENT */}

        <div
          className="
            min-w-0
            flex-1
          "
        >
          <div
            className="
              flex
              items-start
              justify-between
              gap-3
            "
          >
            <p
              className="
                pt-1
                text-[9px]
                font-black
                uppercase
                tracking-[0.13em]
                text-slate-400
              "
            >
              Question{" "}
              {row?.number ?? ""}
            </p>

            <QuestionStatus
              row={row}
            />
          </div>

          <h3
            className="
              mt-2

              whitespace-pre-wrap

              text-[15px]
              font-extrabold
              leading-7

              text-[#071f55]
            "
          >
            {row?.questionText ||
              "Question"}
          </h3>
        </div>
      </div>

      {/* ===================================================
          ANSWERS
      =================================================== */}

      <div
        className="
          grid
          gap-4

          px-5
          py-5

          lg:grid-cols-2
        "
      >
        <AnswerCard
          label="Your Answer"
          value={userAnswer}
          type={
            !row?.attempted
              ? "default"
              : row?.isCorrect
                ? "correct"
                : "wrong"
          }
        />

        <AnswerCard
          label="Correct Answer"
          value={correctAnswer}
          type="correct"
        />
      </div>
    </article>
  );
}

/* =========================================================
   ANSWER CARD
========================================================= */

function AnswerCard({
  label,
  value,
  type = "default",
}) {
  const styles = {
    correct: {
      container:
        "border-emerald-200 bg-emerald-50/80",

      label:
        "text-emerald-600",

      value:
        "text-emerald-900",
    },

    wrong: {
      container:
        "border-red-200 bg-red-50/70",

      label:
        "text-red-500",

      value:
        "text-red-900",
    },

    default: {
      container:
        "border-slate-200 bg-[#f8fbff]",

      label:
        "text-slate-400",

      value:
        "text-slate-700",
    },
  };

  const current =
    styles[type] ??
    styles.default;

  return (
    <div
      className={`
        min-h-[105px]

        rounded-[16px]

        border

        px-4
        py-4

        ${current.container}
      `}
    >
      <p
        className={`
          text-[9px]
          font-black
          uppercase
          tracking-[0.13em]

          ${current.label}
        `}
      >
        {label}
      </p>

      <p
        className={`
          mt-4

          whitespace-pre-wrap
          break-words

          text-[14px]
          font-extrabold
          leading-6

          ${current.value}
        `}
      >
        {value || "-"}
      </p>
    </div>
  );
}

/* =========================================================
   QUESTION STATUS
========================================================= */

function QuestionStatus({
  row,
}) {
  /* =======================================================
     SKIPPED
  ======================================================= */

  if (!row?.attempted) {
    return (
      <span
        className="
          inline-flex
          shrink-0
          items-center
          gap-1.5

          rounded-full

          bg-slate-100

          px-3
          py-1.5

          text-[9px]
          font-black
          uppercase

          text-slate-500
        "
      >
        <CircleMinus
          size={12}
        />

        Skipped
      </span>
    );
  }

  /* =======================================================
     CORRECT
  ======================================================= */

  if (row?.isCorrect) {
    return (
      <span
        className="
          inline-flex
          shrink-0
          items-center
          gap-1.5

          rounded-full

          bg-emerald-50

          px-3
          py-1.5

          text-[9px]
          font-black
          uppercase

          text-emerald-600
        "
      >
        <CheckCircle2
          size={12}
        />

        Correct
      </span>
    );
  }

  /* =======================================================
     WRONG
  ======================================================= */

  return (
    <span
      className="
        inline-flex
        shrink-0
        items-center
        gap-1.5

        rounded-full

        bg-red-50

        px-3
        py-1.5

        text-[9px]
        font-black
        uppercase

        text-red-500
      "
    >
      <XCircle
        size={12}
      />

      Wrong
    </span>
  );
}