"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function QuizPagination({
  currentPage,
  totalPages,
  onChange,
}) {
  if (
    totalPages <= 1
  ) {
    return null;
  }

  const pages =
    getPageNumbers(
      currentPage,
      totalPages
    );

  return (
    <div
      className="
        mt-8
        flex
        flex-col
        items-center
        justify-between
        gap-4
        rounded-[24px]
        border
        border-[#d8e5ff]
        bg-gradient-to-r
        from-[#f5f7ff]
        via-[#fbf9ff]
        to-[#f0fbff]
        p-4
        shadow-[0_10px_28px_rgba(99,102,241,0.06)]
        sm:flex-row
      "
    >
      {/* PREVIOUS */}

      <button
        type="button"
        disabled={
          currentPage === 1
        }
        onClick={() =>
          onChange(
            currentPage - 1
          )
        }
        className="
          inline-flex
          min-h-[42px]
          items-center
          gap-2
          rounded-full
          border
          border-[#dce8f7]
          bg-white
          px-5
          py-2.5
          text-[10px]
          font-black
          text-[#164fa5]
          shadow-sm
          transition
          hover:border-[#7c3aed]/30
          hover:bg-[#f5f3ff]
          disabled:cursor-not-allowed
          disabled:opacity-40 cursor-pointer
        "
      >
        <ChevronLeft
          size={15}
        />

        Previous
      </button>

      {/* NUMBERS */}

      <div
        className="
          flex
          flex-wrap
          items-center
          justify-center
          gap-2
        "
      >
        {pages.map(
          (page) => {
            const active =
              page ===
              currentPage;

            return (
              <button
                key={page}
                type="button"
                onClick={() =>
                  onChange(
                    page
                  )
                }
                className={`
                  flex
                  h-10
                  min-w-10
                  items-center
                  justify-center
                  rounded-full
                  px-3
                  text-[10px]
                  font-black
                  transition-all cursor-pointer

                  ${
                    active
                      ? `
                        bg-gradient-to-br
                        from-[#7c3aed]
                        via-[#4f46e5]
                        to-[#0ea5e9]
                        text-white
                        shadow-[0_8px_20px_rgba(79,70,229,0.24)]
                      `
                      : `
                        border
                        border-[#dce8f7]
                        bg-white
                        text-[#164fa5]
                        hover:border-[#7c3aed]/30
                      `
                  }
                `}
              >
                {page}
              </button>
            );
          }
        )}
      </div>

      {/* NEXT */}

      <button
        type="button"
        disabled={
          currentPage ===
          totalPages
        }
        onClick={() =>
          onChange(
            currentPage + 1
          )
        }
        className="
          inline-flex
          min-h-[42px]
          items-center
          gap-2
          rounded-full
          bg-gradient-to-r
          from-[#7c3aed]
          via-[#4f46e5]
          to-[#0ea5e9]
          px-5
          py-2.5
          text-[10px]
          font-black
          text-white
          shadow-[0_10px_24px_rgba(79,70,229,0.22)]
          transition
          hover:-translate-y-0.5
          disabled:cursor-not-allowed
          disabled:opacity-40 cursor-pointer
        "
      >
        Next

        <ChevronRight
          size={15}
        />
      </button>
    </div>
  );
}

function getPageNumbers(
  currentPage,
  totalPages
) {
  if (
    totalPages <= 5
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

  let start =
    Math.max(
      1,
      currentPage - 2
    );

  let end =
    Math.min(
      totalPages,
      start + 4
    );

  if (
    end - start < 4
  ) {
    start =
      Math.max(
        1,
        end - 4
      );
  }

  return Array.from(
    {
      length:
        end -
        start +
        1,
    },
    (_, index) =>
      start +
      index
  );
}