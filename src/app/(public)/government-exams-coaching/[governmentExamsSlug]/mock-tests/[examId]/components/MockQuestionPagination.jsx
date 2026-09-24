"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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

  return (
    <div
      className="
        flex
        flex-wrap
        items-center
        justify-center
        gap-2
        border-t
        border-slate-100
        px-5
        py-5
      "
    >
      <button
        type="button"
        disabled={
          currentPage <= 1
        }
        onClick={() =>
          onPageChange?.(
            currentPage - 1
          )
        }
        className="
          inline-flex
          h-10
          items-center
          justify-center
          gap-1.5
          rounded-xl
          border
          border-slate-200
          bg-white
          px-4
          text-[11px]
          font-bold
          text-slate-600
          transition
          hover:border-blue-200
          hover:bg-blue-50
          disabled:cursor-not-allowed
          disabled:opacity-40
        "
      >
        <ChevronLeft
          size={14}
        />

        Previous
      </button>

      {pages.map(
        (page) => (
          <button
            key={
              page
            }
            type="button"
            onClick={() =>
              onPageChange?.(
                page
              )
            }
            className={`
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              text-[11px]
              font-black
              transition

              ${
                page ===
                currentPage
                  ? `
                      border-[#164fa5]
                      bg-[#164fa5]
                      text-white
                      shadow-[0_8px_20px_rgba(22,79,165,0.20)]
                    `
                  : `
                      border-slate-200
                      bg-white
                      text-slate-600
                      hover:border-blue-200
                      hover:bg-blue-50
                    `
              }
            `}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        disabled={
          currentPage >=
          totalPages
        }
        onClick={() =>
          onPageChange?.(
            currentPage + 1
          )
        }
        className="
          inline-flex
          h-10
          items-center
          justify-center
          gap-1.5
          rounded-xl
          bg-gradient-to-r
          from-[#164fa5]
          to-[#017dc0]
          px-4
          text-[11px]
          font-bold
          text-white
          transition
          hover:-translate-y-0.5
          disabled:cursor-not-allowed
          disabled:opacity-40
        "
      >
        Next

        <ChevronRight
          size={14}
        />
      </button>
    </div>
  );
}