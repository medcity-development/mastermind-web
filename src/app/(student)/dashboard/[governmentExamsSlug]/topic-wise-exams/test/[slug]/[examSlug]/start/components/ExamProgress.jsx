export default function ExamProgress({
    answeredCount,
    totalQuestions,
    currentPage,
    totalPages,
  }) {
    const progress =
      totalQuestions > 0
        ? (answeredCount /
            totalQuestions) *
          100
        : 0;
  
    return (
      <section
        className="
          mt-5
          rounded-[20px]
          border
          border-[#dce8f7]
          bg-white
          p-5
          shadow-[0_8px_25px_rgba(22,79,165,0.04)]
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
          <div>
            <p
              className="
                text-xs
                font-bold
                text-slate-500
              "
            >
              Exam Progress
            </p>
  
            <p
              className="
                mt-1
                font-black
                text-[#071f55]
              "
            >
              {answeredCount}
              {" / "}
              {totalQuestions} answered
            </p>
          </div>
  
          <div className="text-right">
            <p
              className="
                text-[9px]
                font-black
                uppercase
                tracking-[0.1em]
                text-slate-400
              "
            >
              Page
            </p>
  
            <p
              className="
                mt-1
                text-sm
                font-black
                text-[#075fc8]
              "
            >
              {currentPage}
              {" / "}
              {totalPages}
            </p>
          </div>
        </div>
  
        <div
          className="
            mt-4
            h-2
            overflow-hidden
            rounded-full
            bg-[#e8f0fa]
          "
        >
          <div
            className="
              h-full
              rounded-full
              bg-gradient-to-r
              from-[#075fc8]
              to-[#00b5e8]
              transition-all
              duration-300
            "
            style={{
              width:
                `${progress}%`,
            }}
          />
        </div>
      </section>
    );
  }