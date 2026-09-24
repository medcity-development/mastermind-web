export default function MockQuestionCard({
  question,
  questionNumber,
  selectedAnswer,
  imagePath = "",
  onAnswer,
}) {
  if (!question) {
    return null;
  }

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
      String(
        option.value
      ).trim() !== ""
  );

  const attached =
    question?.attached ||
    question?.image ||
    "";

  const imageUrl =
    attached &&
    imagePath
      ? `${imagePath.replace(
          /\/+$/,
          ""
        )}/${String(
          attached
        ).replace(
          /^\/+/,
          ""
        )}`
      : "";

  return (
    <article
      className="
        rounded-[20px]
        border
        border-[#dce8f7]
        bg-white
        p-5
        shadow-[0_8px_24px_rgba(15,23,42,0.04)]
        sm:p-6
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
            rounded-xl
            bg-gradient-to-br
            from-[#164fa5]
            to-[#017dc0]
            text-xs
            font-black
            text-white
          "
        >
          {questionNumber}
        </div>

        <div
          className="
            min-w-0
            flex-1
          "
        >
          <p
            className="
              whitespace-pre-wrap
              text-[14px]
              font-bold
              leading-7
              text-[#0b1f44]
              sm:text-[15px]
            "
          >
            {question?.question}
          </p>

          {imageUrl ? (
            <img
              src={
                imageUrl
              }
              alt=""
              className="
                mt-4
                max-h-[320px]
                max-w-full
                rounded-xl
                border
                border-slate-200
                object-contain
              "
            />
          ) : null}

          <div
            className="
              mt-5
              grid
              grid-cols-1
              gap-3
              md:grid-cols-2
            "
          >
            {options.map(
              (
                option
              ) => {
                const selected =
                  selectedAnswer ===
                  option.key;

                return (
                  <button
                    key={
                      option.key
                    }
                    type="button"
                    onClick={() =>
                      onAnswer?.(
                        option.key
                      )
                    }
                    className={`
                      flex
                      min-h-[58px]
                      w-full
                      items-start
                      gap-3
                      rounded-[14px]
                      border
                      p-3.5
                      text-left
                      transition-all
                      duration-200

                      ${
                        selected
                          ? `
                              border-[#164fa5]
                              bg-blue-50
                              shadow-[0_5px_18px_rgba(22,79,165,0.08)]
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
                        rounded-lg
                        text-[11px]
                        font-black

                        ${
                          selected
                            ? `
                                bg-[#164fa5]
                                text-white
                              `
                            : `
                                bg-slate-100
                                text-slate-500
                              `
                        }
                      `}
                    >
                      {
                        option.key
                      }
                    </span>

                    <span
                      className="
                        pt-1
                        text-[13px]
                        leading-6
                        text-slate-700
                      "
                    >
                      {
                        option.value
                      }
                    </span>
                  </button>
                );
              }
            )}
          </div>
        </div>
      </div>
    </article>
  );
}