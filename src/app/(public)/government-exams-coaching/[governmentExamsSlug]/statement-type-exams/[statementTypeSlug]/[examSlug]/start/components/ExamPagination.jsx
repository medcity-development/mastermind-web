import {
    ChevronLeft,
    ChevronRight,
  } from "lucide-react";
  
  export default function ExamPagination({
    currentPage,
    totalPages,
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
          mt-7
          flex
          flex-wrap
          items-center
          justify-center
          gap-2
        "
      >
        <button
          type="button"
          disabled={
            currentPage === 1
          }
          onClick={() =>
            onPageChange(
              currentPage -
                1
            )
          }
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-[12px]
            border
            border-slate-200
            bg-white
            disabled:opacity-40
          "
        >
          <ChevronLeft
            size={17}
          />
        </button>
  
        {Array.from(
          {
            length:
              totalPages,
          },
          (_, index) =>
            index + 1
        ).map(
          (page) => (
            <button
              type="button"
              key={page}
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
                text-xs
                font-black
  
                ${
                  currentPage ===
                  page
                    ? `
                      bg-[#075fc8]
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
          )
        )}
  
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
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-[12px]
            border
            border-slate-200
            bg-white
            disabled:opacity-40
          "
        >
          <ChevronRight
            size={17}
          />
        </button>
      </div>
    );
  }