import {
    cleanText,
  } from "../utils/examUtils";
  
  export default function QuestionCard({
    question,
    questionNumber,
    selected,
    onAnswer,
    disabled,
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
    ].filter(
      (item) =>
        item.value !==
          undefined &&
        item.value !== null &&
        item.value !== ""
    );
  
    return (
      <article
        className="
          rounded-[22px]
          border
          border-[#dce8f7]
          bg-white
          p-5
          shadow-[0_8px_25px_rgba(22,79,165,0.04)]
          sm:p-6
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
          <p
            className="
              text-[10px]
              font-black
              uppercase
              tracking-[0.14em]
              text-[#017dc0]
            "
          >
            Question {questionNumber}
          </p>
  
          {selected ? (
            <span
              className="
                rounded-full
                border
                border-emerald-100
                bg-emerald-50
                px-3
                py-1
                text-[9px]
                font-black
                uppercase
                text-emerald-600
              "
            >
              Answered
            </span>
          ) : null}
        </div>
  
        <p
          className="
            mt-3
            whitespace-pre-line
            text-[15px]
            font-bold
            leading-7
            text-[#071f55]
          "
        >
          {cleanText(
            question?.question
          )}
        </p>
  
        <div className="mt-5 space-y-3">
          {options.map(
            (option) => {
              const isSelected =
                selected ===
                option.key;
  
              return (
                <button
                  key={option.key}
                  type="button"
                  disabled={
                    disabled
                  }
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
  
                    ${
                      isSelected
                        ? `
                          border-[#075fc8]
                          bg-[#eef7ff]
                        `
                        : `
                          border-[#dce8f7]
                          bg-white
                          hover:border-[#075fc8]/40
                          hover:bg-[#f9fcff]
                        `
                    }
  
                    disabled:cursor-not-allowed
                    disabled:opacity-60
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
                      rounded-full
                      text-xs
                      font-black
  
                      ${
                        isSelected
                          ? `
                            bg-[#075fc8]
                            text-white
                          `
                          : `
                            bg-[#edf5ff]
                            text-[#075fc8]
                          `
                      }
                    `}
                  >
                    {option.key}
                  </span>
  
                  <span
                    className="
                      whitespace-pre-line
                      pt-1
                      text-sm
                      leading-6
                      text-slate-700
                    "
                  >
                    {cleanText(
                      option.value
                    )}
                  </span>
                </button>
              );
            }
          )}
        </div>
      </article>
    );
  }