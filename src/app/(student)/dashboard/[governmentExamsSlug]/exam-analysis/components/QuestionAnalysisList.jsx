"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleMinus,
  XCircle,
} from "lucide-react";

const QUESTIONS_PER_PAGE = 10;

/* =========================================================
   COMPONENT
========================================================= */

export default function QuestionAnalysisList({
  rows = [],
  loading = false,
}) {
  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        rows.length /
        QUESTIONS_PER_PAGE
      )
    );

  /* =======================================================
     RESET PAGE
  ======================================================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [rows]);

  /* =======================================================
     PAGINATED ROWS
  ======================================================= */

  const paginatedRows =
    useMemo(() => {
      const startIndex =
        (currentPage - 1) *
        QUESTIONS_PER_PAGE;

      const endIndex =
        startIndex +
        QUESTIONS_PER_PAGE;

      return rows.slice(
        startIndex,
        endIndex
      );
    }, [
      rows,
      currentPage,
    ]);

  /* =======================================================
     PAGE RANGE
  ======================================================= */

  const startQuestion =
    rows.length > 0
      ? (currentPage - 1) *
      QUESTIONS_PER_PAGE +
      1
      : 0;

  const endQuestion =
    Math.min(
      currentPage *
      QUESTIONS_PER_PAGE,
      rows.length
    );

  /* =======================================================
     CHANGE PAGE
  ======================================================= */

  function goToPage(
    page
  ) {
    const safePage =
      Math.min(
        Math.max(
          page,
          1
        ),
        totalPages
      );

    setCurrentPage(
      safePage
    );

    /*
     * Scroll near Questions & Answers
     */
    setTimeout(() => {
      const section =
        document.getElementById(
          "question-analysis"
        );

      section?.scrollIntoView({
        behavior:
          "smooth",

        block:
          "start",
      });
    }, 50);
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <section
        id="question-analysis"
        className="
          scroll-mt-24
          space-y-4
        "
      >
        <SectionHeader />

        {Array.from({
          length: 4,
        }).map(
          (_, index) => (
            <div
              key={index}
              className="
                h-[190px]
                animate-pulse
                rounded-[22px]
                border
                border-slate-200
                bg-white
              "
            />
          )
        )}
      </section>
    );
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  if (!rows.length) {
    return (
      <section
        id="question-analysis"
        className="
          scroll-mt-24
          space-y-4
        "
      >
        <SectionHeader />

        <div
          className="
            rounded-[22px]
            border
            border-slate-200
            bg-white
            px-6
            py-12
            text-center
          "
        >
          <p
            className="
              text-sm
              font-semibold
              text-slate-500
            "
          >
            Questions are not
            available for this
            exam attempt.
          </p>
        </div>
      </section>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      id="question-analysis"
      className="
        scroll-mt-24
        space-y-5
      "
    >
      {/* HEADER */}

      <div
        className="
          flex
          flex-col
          gap-4

          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >
        <SectionHeader />

        <div
          className="
            rounded-full
            border
            border-slate-200
            bg-white
            px-4
            py-2
            text-[11px]
            font-bold
            text-slate-500
          "
        >
          Showing{" "}
          <span
            className="
              text-[#017dc0]
            "
          >
            {startQuestion}
          </span>

          {" - "}

          <span
            className="
              text-[#017dc0]
            "
          >
            {endQuestion}
          </span>

          {" of "}

          <span
            className="
              text-[#082e5a]
            "
          >
            {rows.length}
          </span>
        </div>
      </div>

      {/* QUESTIONS */}

      <div
        className="
          space-y-4
        "
      >
        {paginatedRows.map(
          (
            row,
            index
          ) => {
            const actualIndex =
              (currentPage -
                1) *
              QUESTIONS_PER_PAGE +
              index;

            return (
              <QuestionCard
                key={
                  row?.id ??
                  actualIndex
                }
                row={
                  row
                }
                index={
                  actualIndex
                }
              />
            );
          }
        )}
      </div>

      {/* PAGINATION */}

      {totalPages > 1 ? (
        <Pagination
          currentPage={
            currentPage
          }
          totalPages={
            totalPages
          }
          onPageChange={
            goToPage
          }
        />
      ) : null}
    </section>
  );
}

/* =========================================================
   HEADER
========================================================= */

function SectionHeader() {
  return (
    <div>
      <p
        className="
          text-[10px]
          font-extrabold
          uppercase
          tracking-[0.18em]
          text-[#017dc0]
        "
      >
        Exam Analytics
      </p>

      <h2
        className="
          mt-1
          text-[24px]
          font-black
          tracking-tight
          text-[#082e5a]

          sm:text-[27px]
        "
      >
        Questions & Answers
      </h2>

      <p
        className="
          mt-1
          text-sm
          text-slate-500
        "
      >
        Review your selected
        answer and the correct
        answer for every
        question.
      </p>
    </div>
  );
}

/* =========================================================
   QUESTION CARD
========================================================= */

function QuestionCard({
  row,
  index,
}) {
  const status =
    !row?.attempted
      ? "skipped"
      : row?.isCorrect
        ? "correct"
        : "wrong";

  return (
    <article
      className="
        overflow-hidden
        rounded-[22px]
        border
        border-[#dbe7f5]
        bg-white
        shadow-sm
      "
    >
      {/* QUESTION */}

      <div
        className="
          flex
          flex-col
          gap-4
          border-b
          border-slate-100
          px-5
          py-5

          sm:flex-row
          sm:items-start
          sm:justify-between
          sm:px-6
        "
      >
        <div
          className="
            flex
            min-w-0
            items-start
            gap-4
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
              text-sm
              font-black
              text-[#017dc0]
            "
          >
            {index + 1}
          </div>

          {/* QUESTION */}

          <div
            className="
              min-w-0
            "
          >
            <p
              className="
                text-[9px]
                font-extrabold
                uppercase
                tracking-[0.16em]
                text-slate-400
              "
            >
              Question{" "}
              {index + 1}
            </p>

            <div
              className="
                mt-2
                text-[15px]
                font-bold
                leading-7
                text-slate-800
              "
            >
              {row?.questionText ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      row.questionText,
                  }}
                />
              ) : (
                "Question text not available"
              )}
            </div>
          </div>
        </div>

        <StatusBadge
          status={
            status
          }
        />
      </div>

      {/* ANSWERS */}

      <div
        className="
          grid
          gap-4
          px-5
          py-5

          sm:px-6
          lg:grid-cols-2
        "
      >
        <AnswerBox
          label="Your Answer"
          value={
            row?.userAnswerText ||
            "Not Answered"
          }
          status={
            status
          }
        />

        <AnswerBox
          label="Correct Answer"
          value={
            row?.correctAnswerText ||
            "Not Available"
          }
          status="correct"
        />
      </div>
    </article>
  );
}

/* =========================================================
   ANSWER BOX
========================================================= */

function AnswerBox({
  label,
  value,
  status,
}) {
  const style =
    status === "correct"
      ? `
          border-emerald-200
          bg-emerald-50
          text-emerald-700
        `
      : status ===
        "wrong"
        ? `
            border-red-200
            bg-red-50
            text-red-600
          `
        : `
            border-slate-200
            bg-slate-50
            text-slate-500
          `;

  return (
    <div
      className={`
        rounded-[16px]
        border
        px-4
        py-4
        ${style}
      `}
    >
      <p
        className="
          text-[9px]
          font-extrabold
          uppercase
          tracking-[0.14em]
          opacity-70
        "
      >
        {label}
      </p>

      <div
        className="
          mt-2
          text-sm
          font-bold
          leading-6
        "
      >
        {typeof value ===
          "string" ? (
          <div
            dangerouslySetInnerHTML={{
              __html:
                value,
            }}
          />
        ) : (
          value
        )}
      </div>
    </div>
  );
}

/* =========================================================
   STATUS
========================================================= */

function StatusBadge({
  status,
}) {
  if (
    status === "correct"
  ) {
    return (
      <div
        className="
          inline-flex
          w-fit
          shrink-0
          items-center
          gap-1.5
          rounded-full
          bg-emerald-50
          px-3
          py-1.5
          text-[10px]
          font-extrabold
          uppercase
          tracking-wide
          text-emerald-600
        "
      >
        <CheckCircle2
          size={14}
        />

        Correct
      </div>
    );
  }

  if (
    status === "wrong"
  ) {
    return (
      <div
        className="
          inline-flex
          w-fit
          shrink-0
          items-center
          gap-1.5
          rounded-full
          bg-red-50
          px-3
          py-1.5
          text-[10px]
          font-extrabold
          uppercase
          tracking-wide
          text-red-600
        "
      >
        <XCircle
          size={14}
        />

        Wrong
      </div>
    );
  }

  return (
    <div
      className="
        inline-flex
        w-fit
        shrink-0
        items-center
        gap-1.5
        rounded-full
        bg-slate-100
        px-3
        py-1.5
        text-[10px]
        font-extrabold
        uppercase
        tracking-wide
        text-slate-500
      "
    >
      <CircleMinus
        size={14}
      />

      Skipped
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
  const pageNumbers =
    getPageNumbers({
      currentPage,
      totalPages,
    });

  return (
    <div
      className="
        flex
        flex-col
        gap-4
        rounded-[20px]
        border
        border-slate-200
        bg-white
        px-4
        py-4

        sm:flex-row
        sm:items-center
        sm:justify-between
      "
    >
      {/* PAGE INFO */}

      <p
        className="
          text-[11px]
          font-bold
          text-slate-500
        "
      >
        Page{" "}
        <span
          className="
            text-[#082e5a]
          "
        >
          {currentPage}
        </span>

        {" of "}

        <span
          className="
            text-[#082e5a]
          "
        >
          {totalPages}
        </span>
      </p>

      {/* CONTROLS */}

      <div
        className="
          flex
          flex-wrap
          items-center
          gap-2
        "
      >
        {/* PREVIOUS */}

        <button
          type="button"
          disabled={
            currentPage ===
            1
          }
          onClick={() =>
            onPageChange(
              currentPage -
              1
            )
          }
          className="
            inline-flex
            h-10
            items-center
            justify-center
            gap-1
            rounded-[12px]
            border
            border-slate-200
            bg-white
            px-3
            text-[11px]
            font-extrabold
            text-slate-600
            transition

            hover:border-[#017dc0]
            hover:text-[#017dc0]

            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          <ChevronLeft
            size={15}
          />

          Previous
        </button>

        {/* PAGE NUMBERS */}

        {pageNumbers.map(
          (
            page,
            index
          ) => {
            if (
              page === "..."
            ) {
              return (
                <span
                  key={`dots-${index}`}
                  className="
                    flex
                    h-10
                    w-8
                    items-center
                    justify-center
                    text-xs
                    font-bold
                    text-slate-400
                  "
                >
                  ...
                </span>
              );
            }

            const active =
              page ===
              currentPage;

            return (
              <button
                key={page}
                type="button"
                onClick={() =>
                  onPageChange(
                    page
                  )
                }
                className={`
                  flex
                  h-10
                  min-w-10
                  items-center
                  justify-center
                  rounded-[12px]
                  px-3
                  text-[11px]
                  font-extrabold
                  transition

                  ${active
                    ? `
                          bg-gradient-to-r
                          from-[#164fa5]
                          to-[#017dc0]
                          text-white
                          shadow-md
                        `
                    : `
                          border
                          border-slate-200
                          bg-white
                          text-slate-600

                          hover:border-[#017dc0]
                          hover:text-[#017dc0]
                        `
                  }
                `}
              >
                {page}
              </button>
            );
          }
        )}

        {/* NEXT */}

        <button
          type="button"
          disabled={
            currentPage ===
            totalPages
          }
          onClick={() =>
            onPageChange(
              currentPage +
              1
            )
          }
          className="
            inline-flex
            h-10
            items-center
            justify-center
            gap-1
            rounded-[12px]
            border
            border-slate-200
            bg-white
            px-3
            text-[11px]
            font-extrabold
            text-slate-600
            transition

            hover:border-[#017dc0]
            hover:text-[#017dc0]

            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          Next

          <ChevronRight
            size={15}
          />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE NUMBERS

   Example:

   1 2 3 4 ... 10

   or

   1 ... 4 5 6 ... 10
========================================================= */

function getPageNumbers({
  currentPage,
  totalPages,
}) {
  if (
    totalPages <= 7
  ) {
    return Array.from(
      {
        length:
          totalPages,
      },
      (_, index) =>
        index + 1
    );
  }

  if (
    currentPage <= 4
  ) {
    return [
      1,
      2,
      3,
      4,
      5,
      "...",
      totalPages,
    ];
  }

  if (
    currentPage >=
    totalPages - 3
  ) {
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