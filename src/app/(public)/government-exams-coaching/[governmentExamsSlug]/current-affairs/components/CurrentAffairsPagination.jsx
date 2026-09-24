import {
    ChevronLeft,
    ChevronRight,
  } from "lucide-react";
  
  export default function CurrentAffairsPagination({
    currentPage,
    totalPages,
    onPrevious,
    onNext,
  }) {
    if (totalPages <= 1) {
      return null;
    }
  
    return (
      <div
        className="
          mt-5
          flex
          items-center
          justify-center
          gap-3
        "
      >
        <button
          type="button"
          onClick={onPrevious}
          disabled={
            currentPage === 1
          }
          className="
            flex
            h-11
            items-center
            gap-2
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            text-xs
            font-semibold
            text-[#164fa5]
            transition
            hover:border-[#087bea]/30
            hover:bg-[#f4f9ff]
            disabled:cursor-not-allowed
            disabled:opacity-40 cursor-pointer
          "
        >
          <ChevronLeft
            size={16}
          />
  
          Previous
        </button>
  
        <span
          className="
            rounded-xl
            bg-[#edf7ff]
            px-4
            py-3
            text-xs
            font-semibold
            text-[#164fa5]
          "
        >
          {currentPage} /{" "}
          {totalPages}
        </span>
  
        <button
          type="button"
          onClick={onNext}
          disabled={
            currentPage ===
            totalPages
          }
          className="
            flex
            h-11
            items-center
            gap-2
            rounded-xl
            bg-[#087bea]
            px-4
            text-xs
            font-semibold
            text-white
            transition
            hover:bg-[#0566c7]
            disabled:cursor-not-allowed
            disabled:opacity-40 cursor-pointer
          "
        >
          Next
  
          <ChevronRight
            size={16}
          />
        </button>
      </div>
    );
  }