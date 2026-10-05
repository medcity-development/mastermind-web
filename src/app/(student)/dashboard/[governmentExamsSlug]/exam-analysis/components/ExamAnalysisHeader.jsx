"use client";

import {
  Loader2,
  RefreshCw,
} from "lucide-react";

export default function ExamAnalysisHeader({
  examName,
  loading,
  onRefresh,
}) {
  return (
    <section
      className="
        rounded-[24px]

        border
        border-[#d7e5f5]

        bg-white

        px-6
        py-6

        sm:px-7
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
        <div>
          {examName ? (
            <p
              className="
                text-[9px]
                font-black
                uppercase
                tracking-[0.15em]

                text-[#017dc0]
              "
            >
              {examName}
            </p>
          ) : null}

          <h1
            className="
              mt-2

              text-2xl
              font-black

              text-[#071f55]
            "
          >
            Exam Analysis
          </h1>

          <p
            className="
              mt-2

              text-sm

              text-slate-500
            "
          >
            Saved exam result
            from your database.
          </p>
        </div>

        <button
          type="button"
          onClick={
            onRefresh
          }
          disabled={
            loading
          }
          className="
            inline-flex
            items-center
            justify-center
            gap-2

            rounded-[12px]

            border
            border-blue-100

            bg-blue-50

            px-4
            py-3

            text-[11px]
            font-extrabold

            text-[#176ed1]

            transition

            hover:bg-blue-100

            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {loading ? (
            <Loader2
              size={14}
              className="
                animate-spin
              "
            />
          ) : (
            <RefreshCw
              size={14}
            />
          )}

          Refresh
        </button>
      </div>
    </section>
  );
}