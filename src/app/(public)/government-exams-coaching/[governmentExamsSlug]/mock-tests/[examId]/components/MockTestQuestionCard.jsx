"use client";

export default function MockTestQuestionCard({
  question,
  selectedAnswer,
  onAnswer,
}) {
  const options = [
    {
      key: "A",
      value:
        question?.option1,
    },
    {
      key: "B",
      value:
        question?.option2,
    },
    {
      key: "C",
      value:
        question?.option3,
    },
    {
      key: "D",
      value:
        question?.option4,
    },
  ];

  return (
    <article
      className="
        rounded-[22px]
        border
        border-[#dce8f7]
        bg-white
        p-5
        shadow-[0_10px_30px_rgba(49,84,238,0.05)]
      "
    >
      <h3
        className="
          text-[15px]
          font-bold
          leading-7
          text-[#172554]
        "
      >
        {question?.question}
      </h3>

      <div
        className="
          mt-5
          grid
          gap-3
        "
      >
        {options.map(
          (option) => {
            if (
              option.value ===
                undefined ||
              option.value ===
                null ||
              option.value ===
                ""
            ) {
              return null;
            }

            const isSelected =
              selectedAnswer ===
              option.key;

            return (
              <button
                key={
                  option.key
                }
                type="button"
                onClick={() =>
                  onAnswer(
                    question.id,
                    option.key
                  )
                }
                className={`
                  flex
                  w-full
                  items-start
                  gap-3
                  rounded-[14px]
                  border
                  p-4
                  text-left
                  transition-all
                  duration-200

                  ${
                    isSelected
                      ? `
                          border-[#3154ee]
                          bg-[#eef3ff]
                          shadow-[0_7px_20px_rgba(49,84,238,0.10)]
                        `
                      : `
                          border-slate-200
                          bg-white
                          hover:border-[#3154ee]/30
                          hover:bg-[#f8faff]
                        `
                  }
                `}
              >
                <span
                  className={`
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-[9px]
                    text-[11px]
                    font-black

                    ${
                      isSelected
                        ? `
                            bg-[#3154ee]
                            text-white
                          `
                        : `
                            bg-slate-100
                            text-slate-600
                          `
                    }
                  `}
                >
                  {option.key}
                </span>

                <span
                  className="
                    pt-1
                    text-[13px]
                    font-medium
                    leading-6
                    text-slate-700
                  "
                >
                  {option.value}
                </span>
              </button>
            );
          }
        )}
      </div>
    </article>
  );
}