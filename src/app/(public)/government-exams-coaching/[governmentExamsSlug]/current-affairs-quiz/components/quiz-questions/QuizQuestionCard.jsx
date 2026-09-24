import {
    ArrowRight,
    Check,
    X,
  } from "lucide-react";
  
  export default function QuizQuestionCard({
    question,
    number,
    selectedOption,
    onSelect,
  }) {
    const answer =
      String(
        question?.answer ||
          ""
      );
  
    const options = [
      {
        value: "1",
        label: "A",
        text:
          question?.option1,
      },
      {
        value: "2",
        label: "B",
        text:
          question?.option2,
      },
      {
        value: "3",
        label: "C",
        text:
          question?.option3,
      },
      {
        value: "4",
        label: "D",
        text:
          question?.option4,
      },
    ].filter(
      (option) =>
        option?.text
    );
  
    const answered =
      selectedOption !== null;
  
    const selectedIsCorrect =
      answered &&
      String(
        selectedOption
      ) ===
        answer;
  
    const correctOption =
      options.find(
        (option) =>
          option.value ===
          answer
      );
  
    return (
      <article
        className="
          group
          overflow-hidden
          rounded-[24px]
          border
          border-[#dce8f7]
          bg-white
          shadow-[0_10px_30px_rgba(11,33,108,0.05)]
          transition-all
          duration-300
          hover:-translate-y-0.5
          hover:shadow-[0_18px_42px_rgba(11,33,108,0.09)]
        "
      >
        {/* QUESTION */}
  
        <div
          className="
            relative
            flex
            items-start
            gap-4
            overflow-hidden
            border-b
            border-[#edf2f7]
            bg-gradient-to-r
            from-[#eef7ff]
            via-[#f7f4ff]
            to-[#fff2f7]
            p-5
            sm:p-6
          "
        >
          <div
            aria-hidden="true"
            className="
              absolute
              -right-10
              -top-10
              h-28
              w-28
              rounded-full
              bg-[#f472b6]/10
              blur-2xl
            "
          />
  
          <div
            className="
              relative
              z-10
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-[13px]
              bg-gradient-to-br
              from-[#7c3aed]
              via-[#2563eb]
              to-[#06b6d4]
              text-[11px]
              font-black
              text-white
              shadow-[0_8px_20px_rgba(37,99,235,0.22)]
            "
          >
            {number}
          </div>
  
          <div
            className="
              relative
              z-10
              min-w-0
              flex-1
            "
          >
            <p
              className="
                text-[9px]
                font-black
                uppercase
                tracking-[0.14em]
                text-[#7c3aed]
              "
            >
              Question {number}
            </p>
  
            <p
              className="
                mt-2
                text-[14px]
                font-bold
                leading-7
                text-[#102c5c]
                sm:text-[15px]
              "
            >
              {
                question?.question
              }
            </p>
          </div>
        </div>
  
        {/* OPTIONS */}
  
        <div
          className="
            grid
            grid-cols-1
            gap-3
            p-5
            sm:p-6
            lg:grid-cols-2
          "
        >
          {options.map(
            (option) => {
              const isSelected =
                String(
                  selectedOption
                ) ===
                option.value;
  
              const isCorrect =
                answered &&
                option.value ===
                  answer;
  
              const isWrong =
                answered &&
                isSelected &&
                option.value !==
                  answer;
  
              return (
                <button
                  key={
                    option.value
                  }
                  type="button"
                  disabled={
                    answered
                  }
                  onClick={() =>
                    onSelect(
                      option.value
                    )
                  }
                  className={`
                    flex
                    min-h-[62px]
                    items-start
                    gap-3
                    rounded-[17px]
                    border
                    px-4
                    py-4
                    text-left
                    transition-all
                    duration-200 cursor-pointer
  
                    ${
                      isCorrect
                        ? `
                          border-emerald-300
                          bg-gradient-to-r
                          from-emerald-50
                          to-teal-50
                          text-emerald-700
                        `
                        : isWrong
                          ? `
                            border-rose-300
                            bg-gradient-to-r
                            from-rose-50
                            to-pink-50
                            text-rose-600
                          `
                          : `
                            border-[#e1eaf5]
                            bg-gradient-to-r
                            from-[#fbfdff]
                            to-[#f7f9ff]
                            text-slate-600
                            hover:-translate-y-0.5
                            hover:border-[#7c3aed]/25
                            hover:from-[#f5f3ff]
                            hover:to-[#eef7ff]
                            hover:shadow-sm
                          `
                    }
  
                    ${
                      answered
                        ? "cursor-default"
                        : "cursor-pointer"
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
                      text-[10px]
                      font-black
  
                      ${
                        isCorrect
                          ? `
                            bg-emerald-500
                            text-white
                          `
                          : isWrong
                            ? `
                              bg-rose-500
                              text-white
                            `
                            : `
                              bg-gradient-to-br
                              from-[#eef2ff]
                              to-[#e0f2fe]
                              text-[#4f46e5]
                            `
                      }
                    `}
                  >
                    {isCorrect ? (
                      <Check
                        size={14}
                      />
                    ) : isWrong ? (
                      <X
                        size={14}
                      />
                    ) : (
                      option.label
                    )}
                  </span>
  
                  <span
                    className="
                      flex-1
                      pt-1
                      text-[12px]
                      font-semibold
                      leading-5
                    "
                  >
                    {
                      option.text
                    }
                  </span>
                </button>
              );
            }
          )}
        </div>
  
        {/* RESULT */}
  
        {answered && (
          <div
            className={`
              mx-5
              mb-5
              rounded-[18px]
              border
              px-4
              py-4
              sm:mx-6
              sm:mb-6
  
              ${
                selectedIsCorrect
                  ? `
                    border-emerald-200
                    bg-gradient-to-r
                    from-emerald-50
                    via-white
                    to-teal-50
                  `
                  : `
                    border-orange-200
                    bg-gradient-to-r
                    from-orange-50
                    via-white
                    to-amber-50
                  `
              }
            `}
          >
            <div
              className="
                flex
                items-start
                gap-3
              "
            >
              <div
                className={`
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  text-white
  
                  ${
                    selectedIsCorrect
                      ? "bg-emerald-500"
                      : "bg-orange-500"
                  }
                `}
              >
                {selectedIsCorrect ? (
                  <Check
                    size={15}
                  />
                ) : (
                  <ArrowRight
                    size={15}
                  />
                )}
              </div>
  
              <div>
                <p
                  className={`
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.1em]
  
                    ${
                      selectedIsCorrect
                        ? "text-emerald-700"
                        : "text-orange-700"
                    }
                  `}
                >
                  {selectedIsCorrect
                    ? "Correct Answer"
                    : "Correct Answer Is"}
                </p>
  
                <p
                  className={`
                    mt-1
                    text-[12px]
                    font-bold
                    leading-5
  
                    ${
                      selectedIsCorrect
                        ? "text-emerald-700"
                        : "text-orange-700"
                    }
                  `}
                >
                  {
                    correctOption?.label
                  }
                  .{" "}
                  {
                    correctOption?.text
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </article>
    );
  }