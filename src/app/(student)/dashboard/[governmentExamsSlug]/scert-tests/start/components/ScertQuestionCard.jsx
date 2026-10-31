
"use client";

export default function ScertQuestionCard({
  question,
  questionNumber,
  selectedAnswer,
  onAnswer,
  disabled = false,
}) {
  /*
   * Dynamically support:
   * 4 options: A, B, C, D
   * 5 options: A, B, C, D, E
   *
   * Backend fields:
   * option1 -> A
   * option2 -> B
   * option3 -> C
   * option4 -> D
   * option5 -> E
   */

  const options = [
    {
      key: "A",
      value: question?.option1,
    },
    {
      key: "B",
      value: question?.option2,
    },
    {
      key: "C",
      value: question?.option3,
    },
    {
      key: "D",
      value: question?.option4,
    },
    {
      key: "E",
      value: question?.option5,
    },
  ].filter((option) => {
    const value = option.value;

    if (value === null || value === undefined) {
      return false;
    }

    const text = String(value).trim();

    return (
      text !== "" &&
      text !== "0" &&
      text.toLowerCase() !== "null"
    );
  });

  const normalizedSelectedAnswer = String(
    selectedAnswer ?? ""
  )
    .trim()
    .toUpperCase();

  const handleAnswer = (optionKey) => {
    if (disabled || typeof onAnswer !== "function") {
      return;
    }

    // Prevent selecting an option that does not exist.
    const optionExists = options.some(
      (option) => option.key === optionKey
    );

    if (!optionExists) {
      return;
    }

    onAnswer(question.id, optionKey);
  };

  return (
    <article
      className="
        rounded-[20px]
        border
        border-slate-200
        bg-white
        p-5
        sm:p-6
      "
    >
      <div className="flex items-start gap-4">
        {/* Question Number */}
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-[#eaf5ff]
            text-sm
            font-black
            text-[#075fc8]
          "
        >
          {questionNumber}
        </div>

        <div className="min-w-0 flex-1">
          {/* Question */}
          <p
            className="
              text-base
              font-bold
              leading-7
              text-[#071f55]
            "
          >
            {question?.question}
          </p>

          {/* Dynamic Options */}
          <div
            className="
              mt-5
              grid
              gap-3
              sm:grid-cols-2
            "
          >
            {options.map((option) => {
              const active =
                normalizedSelectedAnswer === option.key;

              return (
                <button
                  key={option.key}
                  type="button"
                  disabled={disabled}
                  aria-pressed={active}
                  onClick={() => handleAnswer(option.key)}
                  className={`
                    flex
                    min-h-[58px]
                    items-start
                    gap-3
                    rounded-xl
                    border
                    px-4
                    py-3
                    text-left
                    transition
                    ${
                      active
                        ? "border-[#075fc8] bg-blue-50"
                        : "border-slate-200 bg-white hover:border-[#075fc8]/30 hover:bg-slate-50"
                    }
                    ${
                      disabled
                        ? "cursor-not-allowed opacity-70"
                        : ""
                    }
                  `}
                >
                  {/* Option Letter */}
                  <span
                    className={`
                      flex
                      h-7
                      w-7
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      text-xs
                      font-black
                      ${
                        active
                          ? "bg-[#075fc8] text-white"
                          : "bg-slate-100 text-slate-600"
                      }
                    `}
                  >
                    {option.key}
                  </span>

                  {/* Option Text */}
                  <span
                    className="
                      min-w-0
                      break-words
                      pt-1
                      text-sm
                      leading-5
                      text-slate-700
                    "
                  >
                    {option.value}
                  </span>
                </button>
              );
            })}
          </div>

          {options.length === 0 && (
            <p className="mt-4 text-sm text-slate-500">
              No answer options available for this question.
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
