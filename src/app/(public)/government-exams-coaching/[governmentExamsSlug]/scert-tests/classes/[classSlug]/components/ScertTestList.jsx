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

import ScertTestCard from "./ScertTestCard";

const TESTS_PER_PAGE = 10;

export default function ScertTestList({
  tests = [],
  classId,
}) {
  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  /* =========================================================
     TOTAL PAGES
  ========================================================= */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        tests.length /
          TESTS_PER_PAGE
      )
    );

  /* =========================================================
     CURRENT PAGE TESTS
  ========================================================= */

  const currentTests =
    useMemo(() => {
      const startIndex =
        (currentPage - 1) *
        TESTS_PER_PAGE;

      const endIndex =
        startIndex +
        TESTS_PER_PAGE;

      return tests.slice(
        startIndex,
        endIndex
      );
    }, [
      tests,
      currentPage,
    ]);

  /* =========================================================
     RESET PAGE WHEN CLASS CHANGES
  ========================================================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [classId]);

  /* =========================================================
     SAFETY

     Example:
     user was on page 4
     new class only has 2 pages
  ========================================================= */

  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(
        totalPages
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);

  /* =========================================================
     CHANGE PAGE
  ========================================================= */

  function handlePageChange(
    page
  ) {
    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 350,
      behavior: "smooth",
    });
  }

  /* =========================================================
     PAGE NUMBERS

     Example:
     1 2 3 4 5

     If many pages:
     3 4 5 6 7
  ========================================================= */

  const pageNumbers =
    useMemo(() => {
      const maxVisible = 5;

      if (
        totalPages <=
        maxVisible
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

      let startPage =
        Math.max(
          currentPage - 2,
          1
        );

      let endPage =
        startPage +
        maxVisible -
        1;

      if (
        endPage >
        totalPages
      ) {
        endPage =
          totalPages;

        startPage =
          endPage -
          maxVisible +
          1;
      }

      return Array.from(
        {
          length:
            endPage -
            startPage +
            1,
        },
        (_, index) =>
          startPage +
          index
      );
    }, [
      currentPage,
      totalPages,
    ]);

  /* =========================================================
     EMPTY STATE
  ========================================================= */

  if (!tests.length) {
    return (
      <section className="mt-9">
        <SectionHeading />

        <div
          className="
            mt-6
            rounded-[22px]
            border
            border-dashed
            border-slate-300
            bg-white
            px-6
            py-12
            text-center
          "
        >
          <p
            className="
              text-sm
              font-medium
              text-slate-500
            "
          >
            No SCERT tests are
            currently available
            for this class.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-9">
      {/* =================================================
          HEADING
      ================================================= */}

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
        <SectionHeading />

        <p
          className="
            text-sm
            font-medium
            text-slate-500
          "
        >
          Showing{" "}
          <span
            className="
              font-bold
              text-[#071f55]
            "
          >
            {(currentPage - 1) *
              TESTS_PER_PAGE +
              1}
          </span>
          {" - "}
          <span
            className="
              font-bold
              text-[#071f55]
            "
          >
            {Math.min(
              currentPage *
                TESTS_PER_PAGE,
              tests.length
            )}
          </span>
          {" of "}
          <span
            className="
              font-bold
              text-[#071f55]
            "
          >
            {tests.length}
          </span>
        </p>
      </div>

      {/* =================================================
          TEST CARDS
      ================================================= */}

      <div
        className="
          mt-6
          grid
          grid-cols-1
          gap-5
          md:grid-cols-2
          xl:grid-cols-3
        "
      >
        {currentTests.map(
          (test) => (
            <ScertTestCard
              key={test.id}
              test={test}
              classId={
                classId
              }
            />
          )
        )}
      </div>

      {/* =================================================
          PAGINATION
      ================================================= */}

      {totalPages > 1 ? (
        <div
          className="
            mt-10
            flex
            flex-wrap
            items-center
            justify-center
            gap-2
          "
        >
          {/* PREVIOUS */}

          <button
            type="button"
            disabled={
              currentPage === 1
            }
            onClick={() =>
              handlePageChange(
                currentPage - 1
              )
            }
            className="
              inline-flex
              h-11
              items-center
              justify-center
              gap-1.5
              rounded-xl
              border
              border-[#dce8f7]
              bg-white
              px-4
              text-sm
              font-bold
              text-[#071f55]
              transition
              hover:border-[#075fc8]
              hover:text-[#075fc8]
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <ChevronLeft
              size={17}
            />

            Previous
          </button>

          {/* FIRST PAGE */}

          {pageNumbers[0] >
          1 ? (
            <>
              <PageButton
                page={1}
                currentPage={
                  currentPage
                }
                onClick={
                  handlePageChange
                }
              />

              {pageNumbers[0] >
              2 ? (
                <span className="px-1 text-slate-400">
                  ...
                </span>
              ) : null}
            </>
          ) : null}

          {/* PAGE NUMBERS */}

          {pageNumbers.map(
            (page) => (
              <PageButton
                key={page}
                page={page}
                currentPage={
                  currentPage
                }
                onClick={
                  handlePageChange
                }
              />
            )
          )}

          {/* LAST PAGE */}

          {pageNumbers[
            pageNumbers.length -
              1
          ] < totalPages ? (
            <>
              {pageNumbers[
                pageNumbers.length -
                  1
              ] <
              totalPages - 1 ? (
                <span className="px-1 text-slate-400">
                  ...
                </span>
              ) : null}

              <PageButton
                page={
                  totalPages
                }
                currentPage={
                  currentPage
                }
                onClick={
                  handlePageChange
                }
              />
            </>
          ) : null}

          {/* NEXT */}

          <button
            type="button"
            disabled={
              currentPage ===
              totalPages
            }
            onClick={() =>
              handlePageChange(
                currentPage + 1
              )
            }
            className="
              inline-flex
              h-11
              items-center
              justify-center
              gap-1.5
              rounded-xl
              border
              border-[#dce8f7]
              bg-white
              px-4
              text-sm
              font-bold
              text-[#071f55]
              transition
              hover:border-[#075fc8]
              hover:text-[#075fc8]
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            Next

            <ChevronRight
              size={17}
            />
          </button>
        </div>
      ) : null}
    </section>
  );
}

/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading() {
  return (
    <div>
      <p
        className="
          text-xs
          font-black
          uppercase
          tracking-[0.16em]
          text-[#017dc0]
        "
      >
        Practice Tests
      </p>

      <h2
        className="
          mt-2
          text-2xl
          font-black
          text-[#071f55]
        "
      >
        Available Tests
      </h2>

      <p
        className="
          mt-2
          text-sm
          text-slate-500
        "
      >
        Select a test to
        view instructions
        and start the exam.
      </p>
    </div>
  );
}

/* =========================================================
   PAGE BUTTON
========================================================= */

function PageButton({
  page,
  currentPage,
  onClick,
}) {
  const active =
    page === currentPage;

  return (
    <button
      type="button"
      onClick={() =>
        onClick(page)
      }
      className={`
        flex
        h-11
        min-w-11
        items-center
        justify-center
        rounded-xl
        px-3
        text-sm
        font-black
        transition

        ${
          active
            ? `
              bg-gradient-to-r
              from-[#071f55]
              via-[#075fc8]
              to-[#017dc0]
              text-white
              shadow-[0_8px_20px_rgba(7,95,200,0.20)]
            `
            : `
              border
              border-[#dce8f7]
              bg-white
              text-[#071f55]
              hover:border-[#075fc8]
              hover:text-[#075fc8]
            `
        }
      `}
    >
      {page}
    </button>
  );
}