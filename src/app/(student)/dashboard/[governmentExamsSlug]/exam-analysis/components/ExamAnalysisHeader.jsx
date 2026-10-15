
"use client";

import {
  ArrowLeft,
  BarChart3,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export default function ExamAnalysisHeader({
  examName = "",
  loading = false,
  onRefresh,
  onBack,
}) {
  return (
    <section
      className="
        relative isolate overflow-hidden
        rounded-[28px]
        border border-[#234b86]
        bg-gradient-to-br
        from-[#06142e]
        via-[#0a2b62]
        to-[#075d99]
        px-6 py-7
        shadow-[0_20px_55px_rgba(4,34,85,0.22)]
        sm:px-9 sm:py-9
      "
    >
      {/* BACKGROUND DECORATIONS */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute
          -right-16 -top-24
          h-72 w-72 rounded-full
          bg-cyan-400/20 blur-[75px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute
          -bottom-28 left-1/3
          h-64 w-64 rounded-full
          bg-indigo-500/25 blur-[75px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute
          inset-0 opacity-[0.07]
          [background-image:linear-gradient(rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.25)_1px,transparent_1px)]
          [background-size:35px_35px]
        "
      />

      {/* MAIN CONTENT */}

      <div
        className="
          relative z-10
          flex flex-col gap-7
          sm:flex-row sm:items-center
          sm:justify-between
        "
      >
        <div className="min-w-0 flex-1">
          {/* OPTIONAL BACK BUTTON */}

          {typeof onBack === "function" && (
            <button
              type="button"
              onClick={onBack}
              className="
                mb-5 inline-flex items-center
                gap-2 text-xs font-bold
                text-blue-100/80
                transition hover:text-white me-10
              "
            >
              <ArrowLeft size={15} />
              Back to Exam History
            </button>
          )}

          {/* TOP LABEL */}

          <div
            className="
              inline-flex items-center gap-2
              rounded-full
              border border-cyan-300/20
              bg-white/10
              px-3 py-1.5
              backdrop-blur-md
            "
          >
            <Sparkles
              size={13}
              className="text-cyan-300"
            />

            <span
              className="
                text-[10px] font-extrabold
                uppercase tracking-[0.16em]
                text-cyan-100
              "
            >
              Performance Insights
            </span>
          </div>

          {/* HEADING */}

          <div className="mt-5 flex items-start gap-4">
            <div
              className="
                hidden h-12 w-12 shrink-0
                items-center justify-center
                rounded-2xl
                border border-white/15
                bg-white/10
                text-cyan-200
                shadow-inner
                sm:flex
              "
            >
              <BarChart3 size={24} />
            </div>

            <div className="min-w-0">
              <h1
                className="
                  text-2xl font-black
                  tracking-tight text-white
                  sm:text-3xl
                "
              >
                Exam Analysis
              </h1>

              {examName && (
                <p
                  className="
                    mt-2 break-words
                    text-base font-bold
                    text-cyan-200
                    sm:text-lg
                  "
                >
                  {examName}
                </p>
              )}

              <p
                className="
                  mt-3 max-w-xl
                  text-sm leading-6
                  text-blue-100/75
                "
              >
                Explore your performance,
                review your answers, and
                identify opportunities to improve.
              </p>
            </div>
          </div>
        </div>

        {/* REFRESH BUTTON */}

        <button
          type="button"
          onClick={onRefresh}
          disabled={
            loading ||
            typeof onRefresh !== "function"
          }
          className="
            group inline-flex shrink-0
            items-center justify-center
            gap-2.5
            self-start rounded-xl
            border border-white/25
            bg-white px-5 py-3
            text-sm font-extrabold
            text-[#0b3974]
            shadow-[0_8px_24px_rgba(0,0,0,0.15)]
            transition-all duration-200
            hover:-translate-y-0.5
            hover:bg-cyan-50
            hover:shadow-[0_12px_28px_rgba(0,0,0,0.2)]
            disabled:cursor-not-allowed
            disabled:opacity-60
            disabled:hover:translate-y-0
            sm:self-center
          "
        >
          {loading ? (
            <Loader2
              size={17}
              className="animate-spin"
            />
          ) : (
            <RefreshCw
              size={17}
              className="
                transition-transform
                duration-300
                group-hover:rotate-45
              "
            />
          )}

          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* BOTTOM ACCENT */}

      <div
        aria-hidden="true"
        className="
          absolute bottom-0 left-0
          h-[3px] w-full
          bg-gradient-to-r
          from-[#00b5e8]
          via-[#7c6cff]
          to-transparent
        "
      />
    </section>
  );
}
