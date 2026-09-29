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
          border-slate-200
          bg-white
          p-5
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            gap-4
          "
        >
          <div>
            <p className="text-xs font-bold text-slate-500">
              Exam Progress
            </p>
  
            <p
              className="
                mt-1
                font-black
                text-[#071f55]
              "
            >
              {answeredCount} /{" "}
              {totalQuestions} answered
            </p>
          </div>
  
          <p
            className="
              text-sm
              font-black
              text-[#075fc8]
            "
          >
            Page {currentPage} /{" "}
            {totalPages}
          </p>
        </div>
  
        <div
          className="
            mt-4
            h-2
            overflow-hidden
            rounded-full
            bg-slate-100
          "
        >
          <div
            className="
              h-full
              rounded-full
              bg-gradient-to-r
              from-pink-400
              via-violet-500
              to-blue-500
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