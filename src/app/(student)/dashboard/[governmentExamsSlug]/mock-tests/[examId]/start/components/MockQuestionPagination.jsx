"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* =========================================================
   PAGINATION
========================================================= */

export default function MockQuestionPagination({
  currentPage = 1,
  totalPages = 1,
  pages = [],
  onPageChange,
}) {
  if (
    totalPages <= 1
  ) {
    return null;
  }

  /* =======================================================
     LIMIT VISIBLE PAGE BUTTONS

     Example:
     total = 10
     current = 5
     show = 3 4 5 6 7

     This avoids showing too many buttons
     inside the dashboard.
  ======================================================= */

  const visiblePages =
    getVisiblePages({
      currentPage,
      totalPages,
      pages,
    });

  const canGoPrevious =
    currentPage > 1;

  const canGoNext =
    currentPage <
    totalPages;

  function goToPage(
    page
  ) {
    if (
      page < 1 ||
      page > totalPages ||
      page === currentPage
    ) {
      return;
    }

    onPageChange?.(
      page
    );
  }

  return (
    <div
      className="
        border-t
        border-slate-100

        bg-gradient-to-r
        from-[#fbfdff]
        via-white
        to-[#f8fbff]

        px-4
        py-4

        sm:px-5
        sm:py-5
      "
    >
      <div
        className="
          flex
          flex-col
          gap-3

          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        {/* =================================================
            PAGE INFO
        ================================================= */}

        <div
          className="
            flex
            items-center
            justify-between

            sm:justify-start
          "
        >
          <div>
            <p
              className="
                text-[9px]
                font-black
                uppercase
                tracking-[0.12em]

                text-slate-400
              "
            >
              Question Pages
            </p>

            <p
              className="
                mt-1

                text-[11px]
                font-bold

                text-[#172554]
              "
            >
              Page{" "}
              <span
                className="
                  text-[#3154ee]
                "
              >
                {currentPage}
              </span>{" "}
              of{" "}
              {totalPages}
            </p>
          </div>
        </div>

        {/* =================================================
            CONTROLS
        ================================================= */}

        <div
          className="
            flex
            items-center
            justify-center
            gap-1.5

            overflow-x-auto

            pb-1

            [scrollbar-width:none]

            [&::-webkit-scrollbar]:hidden

            sm:justify-end
          "
        >
          {/* PREVIOUS */}

          <button
            type="button"
            disabled={
              !canGoPrevious
            }
            onClick={() =>
              goToPage(
                currentPage -
                  1
              )
            }
            aria-label="Previous page"
            className="
              group

              inline-flex
              h-10
              shrink-0
              items-center
              justify-center
              gap-1.5

              rounded-[11px]

              border
              border-slate-200

              bg-white

              px-3.5

              text-[10px]
              font-bold

              text-slate-600

              shadow-[0_4px_14px_rgba(15,23,42,0.03)]

              transition-all
              duration-200

              hover:-translate-y-0.5
              hover:border-blue-200
              hover:bg-blue-50
              hover:text-[#164fa5]

              disabled:cursor-not-allowed
              disabled:opacity-35
              disabled:hover:translate-y-0
              disabled:hover:border-slate-200
              disabled:hover:bg-white
              disabled:hover:text-slate-600
            "
          >
            <ChevronLeft
              size={14}
              className="
                transition-transform
                group-hover:-translate-x-0.5
              "
            />

            <span
              className="
                hidden
                sm:inline
              "
            >
              Previous
            </span>
          </button>

          {/* PAGE NUMBERS */}

          {visiblePages.map(
            (page) => {
              const active =
                page ===
                currentPage;

              return (
                <button
                  key={
                    page
                  }
                  type="button"
                  onClick={() =>
                    goToPage(
                      page
                    )
                  }
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  aria-label={`Go to page ${page}`}
                  className={`
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center

                    rounded-[11px]

                    border

                    text-[10px]
                    font-black

                    transition-all
                    duration-200

                    ${
                      active
                        ? `
                            border-[#3154ee]

                            bg-gradient-to-br
                            from-[#3154ee]
                            via-[#245bd8]
                            to-[#017dc0]

                            text-white

                            shadow-[0_8px_20px_rgba(49,84,238,0.22)]
                          `
                        : `
                            border-slate-200

                            bg-white

                            text-slate-600

                            hover:-translate-y-0.5
                            hover:border-blue-200
                            hover:bg-blue-50
                            hover:text-[#164fa5]
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
              !canGoNext
            }
            onClick={() =>
              goToPage(
                currentPage +
                  1
              )
            }
            aria-label="Next page"
            className="
              group

              inline-flex
              h-10
              shrink-0
              items-center
              justify-center
              gap-1.5

              rounded-[11px]

              bg-gradient-to-r
              from-[#164fa5]
              via-[#1268c7]
              to-[#017dc0]

              px-3.5

              text-[10px]
              font-bold

              text-white

              shadow-[0_7px_18px_rgba(22,79,165,0.18)]

              transition-all
              duration-200

              hover:-translate-y-0.5
              hover:shadow-[0_10px_24px_rgba(22,79,165,0.24)]

              disabled:cursor-not-allowed
              disabled:opacity-35
              disabled:hover:translate-y-0
              disabled:hover:shadow-[0_7px_18px_rgba(22,79,165,0.18)]
            "
          >
            <span
              className="
                hidden
                sm:inline
              "
            >
              Next
            </span>

            <ChevronRight
              size={14}
              className="
                transition-transform
                group-hover:translate-x-0.5
              "
            />
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   VISIBLE PAGE NUMBERS
========================================================= */

function getVisiblePages({
  currentPage,
  totalPages,
  pages,
}) {
  const safePages =
    Array.isArray(
      pages
    ) &&
    pages.length > 0
      ? pages
      : Array.from(
          {
            length:
              totalPages,
          },
          (_, index) =>
            index + 1
        );

  /*
   * For small page counts,
   * show everything.
   */
  if (
    totalPages <= 5
  ) {
    return safePages;
  }

  let start =
    currentPage - 2;

  let end =
    currentPage + 2;

  if (start < 1) {
    start = 1;
    end = 5;
  }

  if (
    end >
    totalPages
  ) {
    end =
      totalPages;

    start =
      totalPages -
      4;
  }

  return safePages.filter(
    (page) =>
      page >= start &&
      page <= end
  );
}