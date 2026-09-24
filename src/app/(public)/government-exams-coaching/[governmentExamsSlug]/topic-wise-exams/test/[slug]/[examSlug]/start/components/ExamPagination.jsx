import {
    ArrowLeft,
    ArrowRight,
  } from "lucide-react";
  
  export default function ExamPagination({
    currentPage,
    totalPages,
    onPrevious,
    onNext,
    onPageChange,
  }) {
    return (
      <section
        className="
          mt-7
          rounded-[20px]
          border
          border-[#dce8f7]
          bg-white
          p-4
        "
      >
        <div
          className="
            flex
            flex-wrap
            items-center
            justify-between
            gap-4
          "
        >
          <button
            type="button"
            disabled={
              currentPage === 1
            }
            onClick={
              onPrevious
            }
            className="
              inline-flex
              items-center
              gap-2
              rounded-[12px]
              border
              border-[#dce8f7]
              bg-white
              px-4
              py-2.5
              text-sm
              font-bold
              text-[#071f55]
              transition-all
              hover:bg-[#f5f9ff]
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <ArrowLeft size={15} />
  
            Previous
          </button>
  
          <div
            className="
              flex
              flex-wrap
              justify-center
              gap-2
            "
          >
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
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-[10px]
                    text-xs
                    font-black
                    transition-all
  
                    ${
                      currentPage ===
                      page
                        ? `
                          bg-[#075fc8]
                          text-white
                          shadow-[0_5px_15px_rgba(7,95,200,0.20)]
                        `
                        : `
                          bg-[#f5f9ff]
                          text-[#071f55]
                          hover:bg-[#eaf5ff]
                        `
                    }
                  `}
                >
                  {page}
                </button>
              )
            )}
          </div>
  
          <button
            type="button"
            disabled={
              currentPage ===
              totalPages
            }
            onClick={onNext}
            className="
              inline-flex
              items-center
              gap-2
              rounded-[12px]
              bg-[#075fc8]
              px-4
              py-2.5
              text-sm
              font-bold
              text-white
              transition-all
              hover:bg-[#064fa7]
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            Next
  
            <ArrowRight size={15} />
          </button>
        </div>
      </section>
    );
  }