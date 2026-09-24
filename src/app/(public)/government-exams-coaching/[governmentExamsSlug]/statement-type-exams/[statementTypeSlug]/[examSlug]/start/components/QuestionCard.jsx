import {
    cleanText,
  } from "../utils/examUtils";
  
  export default function QuestionCard({
    question,
    number,
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
      (option) =>
        option.value !==
          undefined &&
        option.value !==
          null &&
        option.value !== ""
    );
  
    return (
      <article
        className="
          rounded-[22px]
          border
          border-slate-200
          bg-white
          p-5
          sm:p-6
        "
      >
        <p
          className="
            text-[10px]
            font-black
            uppercase
            tracking-[0.14em]
            text-pink-500
          "
        >
          Question {number}
        </p>
  
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
              const active =
                selected ===
                option.key;
  
              return (
                <button
                  key={
                    option.key
                  }
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
                      active
                        ? `
                          border-violet-300
                          bg-violet-50
                        `
                        : `
                          border-slate-200
                          bg-white
                          hover:bg-slate-50
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
                      rounded-full
                      text-xs
                      font-black
  
                      ${
                        active
                          ? `
                            bg-violet-500
                            text-white
                          `
                          : `
                            bg-slate-100
                            text-[#071f55]
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