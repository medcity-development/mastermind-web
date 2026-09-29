import Link from "next/link";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function StatementTypePagination({
  currentPage,
  totalPages,
}) {
  if (
    totalPages <= 1
  ) {
    return null;
  }

  const pages =
    Array.from(
      {
        length:
          totalPages,
      },
      (_, index) =>
        index + 1
    );

  return (
    <div
      className="
        mt-8
        flex
        flex-wrap
        items-center
        justify-center
        gap-2
      "
    >
      {/* PREVIOUS */}

      {currentPage > 1 ? (
        <Link
          href={
            `?page=${currentPage - 1}`
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
            text-slate-600
          "
        >
          <ChevronLeft
            size={17}
          />
        </Link>
      ) : (
        <span
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-[12px]
            border
            border-slate-100
            bg-slate-50
            text-slate-300
          "
        >
          <ChevronLeft
            size={17}
          />
        </span>
      )}

      {/* NUMBERS */}

      {pages.map(
        (page) => (
          <Link
            key={page}
            href={
              `?page=${page}`
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
          </Link>
        )
      )}

      {/* NEXT */}

      {currentPage <
      totalPages ? (
        <Link
          href={
            `?page=${currentPage + 1}`
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
            text-slate-600
          "
        >
          <ChevronRight
            size={17}
          />
        </Link>
      ) : (
        <span
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-[12px]
            border
            border-slate-100
            bg-slate-50
            text-slate-300
          "
        >
          <ChevronRight
            size={17}
          />
        </span>
      )}
    </div>
  );
}