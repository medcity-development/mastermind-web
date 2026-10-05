"use client";

export default function MockQuestionCard({
  question,
  questionNumber,
  selectedAnswer,
  imagePath = "",
  onAnswer,
  disabled = false,
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

  /* =========================================================
     QUESTION IMAGE
  ========================================================= */

  const attached =
    question?.attached ||
    question?.image ||
    "";

  const imageUrl =
    attached &&
    imagePath
      ? `${String(
          imagePath
        ).replace(
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
        relative

        overflow-hidden

        rounded-[22px]

        border
        border-[#dce8f7]

        bg-white

        p-5

        shadow-[0_10px_30px_rgba(15,23,42,0.04)]

        sm:p-6
      "
    >
      {/* =====================================================
          SOFT BACKGROUND
      ===================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-20
          -top-20

          h-40
          w-40

          rounded-full

          bg-blue-400/[0.04]

          blur-3xl
        "
      />

      {/* =====================================================
          QUESTION
      ===================================================== */}

      <div
        className="
          relative
          z-10

          flex
          items-start
          gap-4
        "
      >
        {/* NUMBER */}

        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center

            rounded-[12px]

            bg-gradient-to-br
            from-[#164fa5]
            via-[#1268c7]
            to-[#017dc0]

            text-[12px]
            font-black

            text-white

            shadow-[0_8px_20px_rgba(22,79,165,0.18)]
          "
        >
          {questionNumber}
        </div>

        {/* CONTENT */}

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

          {/* IMAGE */}

          {imageUrl ? (
            <div
              className="
                mt-4
                overflow-hidden
                rounded-[14px]
                border
                border-slate-200
                bg-slate-50
                p-2
              "
            >
              <img
                src={imageUrl}
                alt="Question"
                className="
                  mx-auto
                  max-h-[320px]
                  max-w-full
                  rounded-[10px]
                  object-contain
                "
              />
            </div>
          ) : null}

          {/* =================================================
              OPTIONS
          ================================================= */}

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
              (option) => {
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
                      !disabled &&
                      onAnswer?.(
                          option.key
                        )
                    }
                    disabled={disabled}
                    className={`
                      group

                      flex
                      min-h-[62px]
                      w-full

                      items-start
                      gap-3

                      rounded-[15px]

                      border

                      p-3.5

                      text-left

                      transition-all
                      duration-200
                      disabled:cursor-not-allowed
                      disabled:opacity-70

                      ${
                        selected
                          ? `
                              border-[#3154ee]
                              bg-gradient-to-br
                              from-[#eef3ff]
                              to-[#f6f8ff]

                              shadow-[0_7px_22px_rgba(49,84,238,0.09)]
                            `
                          : `
                              border-slate-200
                              bg-white

                              hover:border-[#3154ee]/30
                              hover:bg-[#f8faff]
                              hover:shadow-[0_6px_18px_rgba(15,23,42,0.04)]
                            `
                      }
                    `}
                  >
                    {/* OPTION KEY */}

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

                        transition-all

                        ${
                          selected
                            ? `
                                bg-[#3154ee]
                                text-white

                                shadow-[0_5px_12px_rgba(49,84,238,0.20)]
                              `
                            : `
                                bg-slate-100
                                text-slate-600

                                group-hover:bg-blue-100
                                group-hover:text-[#164fa5]
                              `
                        }
                      `}
                    >
                      {option.key}
                    </span>

                    {/* OPTION TEXT */}

                    <span
                      className={`
                        pt-1

                        text-[13px]
                        font-medium
                        leading-6

                        ${
                          selected
                            ? "text-[#172554]"
                            : "text-slate-700"
                        }
                      `}
                    >
                      {option.value}
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
