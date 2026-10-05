"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function ExamHistoryPagination({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  itemsPerPage,
  onPageChange,
}) {
  const endIndex =
    Math.min(
      startIndex +
        itemsPerPage,
      totalItems
    );

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
        border-t
        border-slate-100
        bg-[#fbfdff]
        px-5
        py-4

        sm:flex-row
        sm:items-center
        sm:justify-between
      "
    >
      <p
        className="
          text-[11px]
          font-medium
          text-slate-500
        "
      >
        Showing{" "}
        <strong
          className="
            text-[#082e5a]
          "
        >
          {totalItems
            ? startIndex + 1
            : 0}
        </strong>

        {" to "}

        <strong
          className="
            text-[#082e5a]
          "
        >
          {endIndex}
        </strong>

        {" of "}

        <strong
          className="
            text-[#082e5a]
          "
        >
          {totalItems}
        </strong>

        {" entries"}
      </p>

      <div
        className="
          flex
          flex-wrap
          items-center
          gap-1
        "
      >
        <button
          type="button"
          disabled={
            currentPage <= 1
          }
          onClick={() =>
            onPageChange(
              currentPage -
                1
            )
          }
          className="
            inline-flex
            h-9
            items-center
            gap-1
            rounded-[9px]
            border
            border-slate-200
            bg-white
            px-3
            text-[10px]
            font-bold
            text-slate-600
            disabled:opacity-40
          "
        >
          <ChevronLeft
            size={13}
          />

          Previous
        </button>

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
                  key={
                    `dots-${index}`
                  }
                  className="
                    flex
                    h-9
                    w-8
                    items-center
                    justify-center
                    text-xs
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
                  h-9
                  min-w-9
                  rounded-[9px]
                  px-2
                  text-[10px]
                  font-bold

                  ${
                    active
                      ? `
                          bg-[#164fa5]
                          text-white
                        `
                      : `
                          border
                          border-slate-200
                          bg-white
                          text-slate-600
                        `
                  }
                `}
              >
                {page}
              </button>
            );
          }
        )}

        <button
          type="button"
          disabled={
            currentPage >=
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
            h-9
            items-center
            gap-1
            rounded-[9px]
            border
            border-slate-200
            bg-white
            px-3
            text-[10px]
            font-bold
            text-slate-600
            disabled:opacity-40
          "
        >
          Next

          <ChevronRight
            size={13}
          />
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
  if (
    totalPages <= 7
  ) {
    return Array.from(
      {
        length:
          totalPages,
      },
      (
        _,
        index
      ) =>
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