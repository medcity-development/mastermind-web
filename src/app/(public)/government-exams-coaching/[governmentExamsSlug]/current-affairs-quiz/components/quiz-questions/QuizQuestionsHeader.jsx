export default function QuizQuestionsHeader({
    startIndex,
    endIndex,
    totalQuestions,
    currentPage,
    totalPages,
  }) {
    return (
      <div
        className="
          mb-4
          flex
          flex-wrap
          items-center
          justify-between
          gap-3
        "
      >
        <div>
          <p
            className="
              text-[10px]
              font-black
              uppercase
              tracking-[0.14em]
              text-[#7c3aed]
            "
          >
            Questions
          </p>
  
          <p
            className="
              mt-1
              text-[12px]
              font-semibold
              text-slate-500
            "
          >
            Showing{" "}
            {startIndex + 1}–
            {Math.min(
              endIndex,
              totalQuestions
            )}{" "}
            of{" "}
            {totalQuestions}
          </p>
        </div>
  
        <span
          className="
            rounded-full
            border
            border-[#ddd6fe]
            bg-[#f5f3ff]
            px-4
            py-2
            text-[10px]
            font-black
            text-[#6d28d9]
          "
        >
          Page {currentPage}{" "}
          of {totalPages}
        </span>
      </div>
    );
  }