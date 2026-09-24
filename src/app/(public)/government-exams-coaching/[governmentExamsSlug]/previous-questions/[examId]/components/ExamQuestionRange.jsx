export default function ExamQuestionRange({
    startIndex,
    endIndex,
    totalQuestions,
    currentPage,
    unansweredCount,
  }) {
    return (
      <div
        className="
          flex
          flex-col
          gap-3
          rounded-[18px]
          border
          border-blue-100
          bg-gradient-to-r
          from-blue-50
          via-white
          to-cyan-50
          px-4
          py-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <p
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.09em]
              text-[#017cc0]
            "
          >
            Current Set
          </p>
  
          <p
            className="
              mt-1
              text-[13px]
              font-bold
              text-[#0b1f44]
            "
          >
            Questions{" "}
            <span className="text-[#164fa5]">
              {startIndex + 1}
            </span>
  
            {" – "}
  
            <span className="text-[#164fa5]">
              {Math.min(
                endIndex,
                totalQuestions
              )}
            </span>
  
            {" "}of {totalQuestions}
          </p>
        </div>
  
        <div className="flex items-center gap-2">
          <span
            className="
              rounded-full
              bg-blue-100
              px-3
              py-1.5
              text-[10px]
              font-bold
              text-[#164fa5]
            "
          >
            Page {currentPage}
          </span>
  
          <span
            className="
              rounded-full
              bg-slate-100
              px-3
              py-1.5
              text-[10px]
              font-bold
              text-slate-500
            "
          >
            {unansweredCount} remaining
          </span>
        </div>
      </div>
    );
  }