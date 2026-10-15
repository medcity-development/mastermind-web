
"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import QuestionResultCard from "./QuestionResultCard";

const QUESTIONS_PER_PAGE = 10;

/* =========================================================
   QUESTION ANALYSIS LIST
========================================================= */

export default function QuestionAnalysisList({
  rows = [],
  loading = false,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const safeRows = Array.isArray(rows) ? rows : [];

  const totalPages = Math.max(
    1,
    Math.ceil(safeRows.length / QUESTIONS_PER_PAGE)
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [rows]);

  const safePage = Math.min(currentPage, totalPages);

  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * QUESTIONS_PER_PAGE;

    return safeRows.slice(
      start,
      start + QUESTIONS_PER_PAGE
    );
  }, [rows, safePage]);

  const startQuestion = safeRows.length
    ? (safePage - 1) * QUESTIONS_PER_PAGE + 1
    : 0;

  const endQuestion = Math.min(
    safePage * QUESTIONS_PER_PAGE,
    safeRows.length
  );

  function goToPage(page) {
    const nextPage = Math.min(
      Math.max(page, 1),
      totalPages
    );

    setCurrentPage(nextPage);

    window.requestAnimationFrame(() => {
      document
        .getElementById("question-analysis")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    });
  }

  if (loading) {
    return (
      <section
        id="question-analysis"
        className="scroll-mt-24 space-y-4"
      >
        <SectionHeader />

        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="
              h-44 animate-pulse rounded-[22px]
              border border-slate-200 bg-white
            "
          />
        ))}
      </section>
    );
  }

  if (!safeRows.length) {
    return (
      <section
        id="question-analysis"
        className="scroll-mt-24 space-y-4"
      >
        <SectionHeader />

        <div
          className="
            rounded-[22px] border border-slate-200
            bg-white px-6 py-12 text-center
            text-sm font-semibold text-slate-500
          "
        >
          Questions are not available for this exam attempt.
        </div>
      </section>
    );
  }

  return (
    <section
      id="question-analysis"
      className="scroll-mt-24 space-y-5"
    >
      {/* HEADER */}

      <div
        className="
          flex flex-col gap-4
          sm:flex-row sm:items-end sm:justify-between
        "
      >
        <SectionHeader />

        <div
          className="
            w-fit rounded-full border border-slate-200
            bg-white px-4 py-2
            text-xs font-bold text-slate-500
          "
        >
          Showing{" "}
          <span className="text-[#017dc0]">
            {startQuestion}
          </span>
          {" - "}
          <span className="text-[#017dc0]">
            {endQuestion}
          </span>
          {" of "}
          <span className="text-[#082e5a]">
            {safeRows.length}
          </span>
        </div>
      </div>

      {/* QUESTION + YOUR ANSWER + CORRECT ANSWER */}

      <div className="space-y-4">
        {paginatedRows.map((row, index) => {
          const actualIndex =
            (safePage - 1) * QUESTIONS_PER_PAGE + index;

          return (
            <QuestionResultCard
              key={`${row?.id ?? "question"}-${actualIndex}`}
              row={{
                ...row,
                number: actualIndex + 1,
              }}
            />
          );
        })}
      </div>

      {/* PAGINATION */}

      {totalPages > 1 && (
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={goToPage}
        />
      )}
    </section>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader() {
  return (
    <div>
      <p
        className="
          text-[10px] font-extrabold uppercase
          tracking-[0.18em] text-[#017dc0]
        "
      >
        Exam Analytics
      </p>

      <h2
        className="
          mt-1 text-2xl font-black tracking-tight
          text-[#082e5a] sm:text-[27px]
        "
      >
        Questions & Answers
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Review your answer and the correct answer
        for each question.
      </p>
    </div>
  );
}

/* =========================================================
   PAGINATION
========================================================= */

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
  const pages = getPageNumbers({
    currentPage,
    totalPages,
  });

  return (
    <div
      className="
        flex flex-col gap-4 rounded-[20px]
        border border-slate-200 bg-white
        px-4 py-4
        sm:flex-row sm:items-center sm:justify-between
      "
    >
      <p className="text-xs font-bold text-slate-500">
        Page{" "}
        <span className="text-[#082e5a]">
          {currentPage}
        </span>
        {" of "}
        <span className="text-[#082e5a]">
          {totalPages}
        </span>
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="
            inline-flex h-10 items-center gap-1
            rounded-xl border border-slate-200
            px-3 text-xs font-bold text-slate-600
            hover:border-[#017dc0] hover:text-[#017dc0]
            disabled:cursor-not-allowed disabled:opacity-40
          "
        >
          <ChevronLeft size={15} />
          Previous
        </button>

        {pages.map((page, index) =>
          page === "..." ? (
            <span
              key={`dots-${index}`}
              className="
                flex h-10 w-8 items-center justify-center
                text-xs text-slate-400
              "
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-current={
                page === currentPage ? "page" : undefined
              }
              className={`
                h-10 min-w-10 rounded-xl px-3
                text-xs font-extrabold transition
                ${page === currentPage
                  ? "bg-gradient-to-r from-[#164fa5] to-[#017dc0] text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-[#017dc0]"
                }
              `}
            >
              {page}
            </button>
          )
        )}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="
            inline-flex h-10 items-center gap-1
            rounded-xl border border-slate-200
            px-3 text-xs font-bold text-slate-600
            hover:border-[#017dc0] hover:text-[#017dc0]
            disabled:cursor-not-allowed disabled:opacity-40
          "
        >
          Next
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE NUMBERS
========================================================= */

function getPageNumbers({
  currentPage,
  totalPages,
}) {
  if (totalPages <= 7) {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1
    );
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}
