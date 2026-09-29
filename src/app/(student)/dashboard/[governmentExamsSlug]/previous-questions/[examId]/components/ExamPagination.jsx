import {
    ChevronLeft,
    ChevronRight,
  } from "lucide-react";
  
  export default function ExamPagination({
    currentPage,
    totalPages,
    onPrevious,
    onNext,
    onPageChange,
  }) {
    return (
      <div
        className="
          rounded-[22px]
          border
          border-slate-200
          bg-white
          p-4
          shadow-[0_14px_40px_rgba(15,23,42,0.05)]
          sm:p-5
        "
      >
        <div
          className="
            flex
            flex-col
            gap-4
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          <div>
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.08em]
                text-slate-400
              "
            >
              Navigate Questions
            </p>
  
            <p
              className="
                mt-1
                text-[12px]
                font-bold
                text-[#0b1f44]
              "
            >
              Page {currentPage} of {totalPages}
            </p>
          </div>
  
          <div
            className="
              flex
              flex-col
              gap-3
              sm:flex-row
              sm:items-center
              sm:justify-center
            "
          >
            <button
              type="button"
              onClick={onPrevious}
              disabled={currentPage === 1}
              className="
                inline-flex
                min-h-[42px]
                items-center
                justify-center
                gap-2
                rounded-[12px]
                border
                border-slate-200
                bg-white
                px-4
                text-[11px]
                font-bold
                text-slate-700
                transition-all
                hover:border-blue-200
                hover:bg-blue-50
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <ChevronLeft size={15} />
              Previous
            </button>
  
            <div
              className="
                flex
                flex-wrap
                items-center
                justify-center
                gap-2
              "
            >
              {Array.from(
                {
                  length: totalPages,
                },
                (_, index) => index + 1
              ).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() =>
                    onPageChange(page)
                  }
                  className={`
                    flex
                    h-10
                    min-w-10
                    items-center
                    justify-center
                    rounded-[11px]
                    border
                    px-3
                    text-[11px]
                    font-extrabold
                    transition-all
  
                    ${
                      currentPage === page
                        ? `
                            border-[#0b216c]
                            bg-gradient-to-br
                            from-[#0b216c]
                            to-[#164fa5]
                            text-white
                            shadow-[0_8px_20px_rgba(22,79,165,0.25)]
                          `
                        : `
                            border-slate-200
                            bg-white
                            text-slate-600
                            hover:border-blue-200
                            hover:bg-blue-50
                            hover:text-[#164fa5]
                          `
                    }
                  `}
                >
                  {page}
                </button>
              ))}
            </div>
  
            <button
              type="button"
              onClick={onNext}
              disabled={
                currentPage === totalPages
              }
              className="
                inline-flex
                min-h-[42px]
                items-center
                justify-center
                gap-2
                rounded-[12px]
                bg-gradient-to-r
                from-[#0b216c]
                to-[#164fa5]
                px-4
                text-[11px]
                font-bold
                text-white
                shadow-[0_10px_24px_rgba(22,79,165,0.22)]
                transition-all
                hover:-translate-y-0.5
                disabled:cursor-not-allowed
                disabled:opacity-40
                disabled:hover:translate-y-0
              "
            >
              Next
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    );
  }