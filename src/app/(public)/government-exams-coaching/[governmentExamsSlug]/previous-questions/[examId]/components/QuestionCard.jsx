import {
    Check,
    CircleCheck,
    CircleX,
    Lightbulb,
  } from "lucide-react";
  
  export default function QuestionCard({
    question,
    selectedAnswer,
    onAnswer,
    submitted = false,
    imagePath = "",
  }) {
    if (!question) {
      return null;
    }
  
    const options = [
      {
        key: "A",
        value:
          question.option1,
      },
      {
        key: "B",
        value:
          question.option2,
      },
      {
        key: "C",
        value:
          question.option3,
      },
      {
        key: "D",
        value:
          question.option4,
      },
    ].filter(
      (option) =>
        option.value != null &&
        option.value !== ""
    );
  
    return (
      <article
        className="
          overflow-hidden
          rounded-[22px]
          border
          border-slate-200
          bg-white
        "
      >
        {/* QUESTION */}
        <div
          className="
            border-b
            border-slate-100
            p-5
            sm:p-7
          "
        >
          <div
            className="
              flex
              items-start
              gap-4
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-[11px]
                bg-blue-50
                text-[11px]
                font-extrabold
                text-[#164fa5]
              "
            >
              Q
            </div>
  
            <p
              className="
                flex-1
                text-[15px]
                font-bold
                leading-8
                text-[#0b1f44]
                sm:text-[17px]
              "
            >
              {question.question}
            </p>
          </div>
  
          {question.attached && (
            <div className="mt-5">
              <img
                src={`${imagePath}${question.attached}`}
                alt="Question attachment"
                className="
                  max-h-[350px]
                  w-auto
                  rounded-[14px]
                  border
                  border-slate-200
                "
              />
            </div>
          )}
        </div>
  
        {/* OPTIONS */}
        <div
          className="
            space-y-3
            p-5
            sm:p-7
          "
        >
          {options.map(
            (option) => {
              const selected =
                selectedAnswer ===
                option.key;
  
              const isCorrect =
                submitted &&
                question.answerkey ===
                  option.key;
  
              const isWrong =
                submitted &&
                selected &&
                question.answerkey !==
                  option.key;
  
              return (
                <button
                  key={option.key}
                  type="button"
                  disabled={
                    submitted
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
                      isCorrect
                        ? `
                            border-emerald-300
                            bg-emerald-50
                          `
                        : isWrong
                          ? `
                              border-red-300
                              bg-red-50
                            `
                          : selected
                            ? `
                                border-[#164fa5]
                                bg-blue-50
                              `
                            : `
                                border-slate-200
                                bg-white
                                hover:border-blue-200
                                hover:bg-blue-50/40
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
                      font-extrabold
  
                      ${
                        isCorrect
                          ? "bg-emerald-600 text-white"
                          : isWrong
                            ? "bg-red-500 text-white"
                            : selected
                              ? "bg-[#164fa5] text-white"
                              : "bg-slate-100 text-slate-600"
                      }
                    `}
                  >
                    {isCorrect ? (
                      <Check size={15} />
                    ) : (
                      option.key
                    )}
                  </span>
  
                  <span
                    className="
                      flex-1
                      pt-1
                      text-[13px]
                      font-medium
                      leading-6
                      text-slate-700
                    "
                  >
                    {option.value}
                  </span>
  
                  {isCorrect && (
                    <CircleCheck
                      size={18}
                      className="
                        mt-1
                        text-emerald-600
                      "
                    />
                  )}
  
                  {isWrong && (
                    <CircleX
                      size={18}
                      className="
                        mt-1
                        text-red-500
                      "
                    />
                  )}
                </button>
              );
            }
          )}
        </div>
  
        {/* ANSWER AFTER SUBMIT */}
        {submitted && (
          <div
            className="
              border-t
              border-slate-100
              bg-slate-50
              p-5
              sm:p-7
            "
          >
            <div
              className="
                flex
                items-start
                gap-3
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-[10px]
                  bg-amber-100
                  text-amber-700
                "
              >
                <Lightbulb
                  size={17}
                />
              </div>
  
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
                  Correct Answer
                </p>
  
                <p
                  className="
                    mt-1
                    text-[13px]
                    font-bold
                    text-[#0b1f44]
                  "
                >
                  {question.answerkey}
                  {" — "}
                  {question.answer}
                </p>
  
                {question.comment && (
                  <p
                    className="
                      mt-3
                      text-[13px]
                      leading-6
                      text-slate-600
                    "
                  >
                    {question.comment}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </article>
    );
  }