"use client";

import {
  useState,
} from "react";

import {
  ChevronDown,
  CircleHelp,
} from "lucide-react";

export default function GovernmentExamFAQ({
  config,
  faq: faqOverride,
}) {
  const [
    openIndex,
    setOpenIndex,
  ] = useState(0);

  /* =========================================================
     FAQ CONFIG

     Priority:
     1. faq prop override
     2. config.faq
  ========================================================= */

  const faqConfig =
    faqOverride ||
    config?.faq ||
    null;

  const faqs =
    Array.isArray(
      faqConfig?.items
    )
      ? faqConfig.items
      : [];

  /* =========================================================
     EMPTY
  ========================================================= */

  if (!faqs.length) {
    return null;
  }

  /* =========================================================
     TEXT CONTENT
  ========================================================= */

  const examName =
    config?.name ||
    "Government Exam";

  const eyebrow =
    faqConfig?.eyebrow ||
    `${examName} FAQs`;

  const titlePrefix =
    faqConfig?.titlePrefix ||
    "Frequently Asked";

  const titleHighlight =
    faqConfig?.titleHighlight ||
    "Questions";

  const description =
    faqConfig?.description ||
    `Find quick answers about ${examName} preparation, exams and learning resources.`;

  /* =========================================================
     TOGGLE
  ========================================================= */

  const handleToggle = (
    index
  ) => {
    setOpenIndex(
      (current) =>
        current === index
          ? -1
          : index
    );
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <section
      className="
        relative
        w-full
        overflow-hidden
        bg-[#f7fbff]
        py-12
        sm:py-14
        lg:py-16
      "
    >
      {/* DECORATIVE GLOW - LEFT */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-24
          top-10
          h-64
          w-64
          rounded-full
          bg-[#087ee9]/10
          blur-[90px]
        "
      />

      {/* DECORATIVE GLOW - RIGHT */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-24
          bottom-0
          h-64
          w-64
          rounded-full
          bg-[#8b5cf6]/10
          blur-[90px]
        "
      />

      <div
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-5xl
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* =================================================
            HEADING
        ================================================== */}

        <div
          data-aos="fade-up"
          className="
            mx-auto
            mb-8
            max-w-2xl
            text-center
            sm:mb-10
          "
        >
          <div
            className="
              mx-auto
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-2xl
              bg-[#e8f4ff]
              text-[#087ee9]
              shadow-[0_8px_20px_rgba(8,126,233,0.08)]
            "
          >
            <CircleHelp
              className="
                h-5
                w-5
              "
            />
          </div>

          <p
            className="
              mt-4
              text-[10px]
              font-extrabold
              uppercase
              tracking-[0.2em]
              text-[#087ee9]
            "
          >
            {eyebrow}
          </p>

          <h2
            className="
              mt-2
              text-2xl
              font-black
              tracking-[-0.035em]
              text-[#0b216c]
              sm:text-3xl
              lg:text-4xl
            "
          >
            {titlePrefix}{" "}

            <span
              className="
                bg-gradient-to-r
                from-[#087ee9]
                to-[#6d28d9]
                bg-clip-text
                text-transparent
              "
            >
              {titleHighlight}
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-3
              max-w-xl
              text-sm
              leading-6
              text-[#6d7f9e]
              sm:text-[15px]
            "
          >
            {description}
          </p>
        </div>

        {/* =================================================
            FAQ LIST
        ================================================== */}

        <div
          className="
            space-y-3
          "
        >
          {faqs.map(
            (
              faq,
              index
            ) => {
              const isOpen =
                openIndex ===
                index;

              const question =
                faq?.question ||
                "";

              const answer =
                faq?.answer ||
                "";

              if (!question) {
                return null;
              }

              return (
                <article
                  key={
                    `${question}-${index}`
                  }
                  data-aos="fade-up"
                  data-aos-delay={
                    index * 50
                  }
                  className={`
                    overflow-hidden
                    rounded-[18px]
                    border
                    bg-white
                    transition-all
                    duration-300

                    ${
                      isOpen
                        ? `
                            border-[#087ee9]/20
                            shadow-[0_14px_35px_rgba(8,126,233,0.08)]
                          `
                        : `
                            border-[#e1ebf5]
                            shadow-[0_6px_18px_rgba(15,58,110,0.04)]
                          `
                    }
                  `}
                >
                  {/* QUESTION */}

                  <button
                    type="button"
                    onClick={() =>
                      handleToggle(
                        index
                      )
                    }
                    aria-expanded={
                      isOpen
                    }
                    className="
                      flex
                      w-full
                      items-center
                      justify-between
                      gap-4
                      px-4
                      py-4
                      text-left
                      sm:px-5
                      sm:py-5
                    "
                  >
                    <div
                      className="
                        flex
                        min-w-0
                        items-center
                        gap-3
                        sm:gap-4
                      "
                    >
                      {/* NUMBER */}

                      <span
                        className={`
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          text-[11px]
                          font-black
                          transition-all
                          duration-300

                          ${
                            isOpen
                              ? `
                                  bg-gradient-to-br
                                  from-[#087ee9]
                                  to-[#5b42e8]
                                  text-white
                                  shadow-[0_6px_15px_rgba(8,126,233,0.22)]
                                `
                              : `
                                  bg-[#edf6ff]
                                  text-[#087ee9]
                                `
                          }
                        `}
                      >
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      {/* QUESTION TEXT */}

                      <h3
                        className="
                          text-[13px]
                          font-extrabold
                          leading-5
                          text-[#0b216c]
                          sm:text-[15px]
                          sm:leading-6
                        "
                      >
                        {question}
                      </h3>
                    </div>

                    {/* ARROW */}

                    <span
                      className={`
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        transition-all
                        duration-300

                        ${
                          isOpen
                            ? `
                                rotate-180
                                bg-[#087ee9]
                                text-white
                              `
                            : `
                                bg-[#f1f6fb]
                                text-[#637797]
                              `
                        }
                      `}
                    >
                      <ChevronDown
                        className="
                          h-4
                          w-4
                        "
                      />
                    </span>
                  </button>

                  {/* ANSWER */}

                  <div
                    className={`
                      grid
                      transition-all
                      duration-300
                      ease-in-out

                      ${
                        isOpen
                          ? `
                              grid-rows-[1fr]
                              opacity-100
                            `
                          : `
                              grid-rows-[0fr]
                              opacity-0
                            `
                      }
                    `}
                  >
                    <div
                      className="
                        overflow-hidden
                      "
                    >
                      <div
                        className="
                          border-t
                          border-[#edf2f8]
                          px-4
                          pb-5
                          pt-4
                          sm:ml-[52px]
                          sm:px-5
                        "
                      >
                        <p
                          className="
                            text-[12px]
                            leading-6
                            text-[#667ca0]
                            sm:text-[14px]
                            sm:leading-7
                          "
                        >
                          {answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}