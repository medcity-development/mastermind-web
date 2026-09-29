import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function ScertPagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
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
          disabled ||
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
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          border
          border-slate-200
          bg-white
          disabled:cursor-not-allowed
          disabled:opacity-40
        "
      >
        <ChevronLeft
          size={18}
        />
      </button>

      {Array.from({
        length:
          totalPages,
      }).map(
        (
          _,
          index
        ) => {
          const page =
            index + 1;

          return (
            <button
              key={
                page
              }
              type="button"
              disabled={
                disabled
              }
              onClick={() =>
                onPageChange(
                  page
                )
              }
              className={`
                h-10
                min-w-10
                rounded-xl
                px-3
                text-sm
                font-bold
                ${
                  currentPage ===
                  page
                    ? "bg-[#075fc8] text-white"
                    : "border border-slate-200 bg-white text-slate-600"
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
          disabled ||
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
          rounded-xl
          border
          border-slate-200
          bg-white
          disabled:cursor-not-allowed
          disabled:opacity-40
        "
      >
        <ChevronRight
          size={18}
        />
      </button>
    </div>
  );
}