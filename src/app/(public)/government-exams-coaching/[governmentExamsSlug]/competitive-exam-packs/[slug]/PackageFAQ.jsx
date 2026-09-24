"use client";

import {
  ChevronDown,
  CircleHelp,
} from "lucide-react";

import { useState } from "react";

export default function PackageFAQ({
  packageData,
}) {
  const [openIndex, setOpenIndex] =
    useState(0);

  if (!packageData) {
    return null;
  }

  const packageName =
    packageData.package ||
    "this competitive exam package";

  const validity =
    packageData.prices?.[0]?.validity ||
    packageData.price?.[0]?.validity ||
    null;

  const courses =
    packageData.courses || [];

  const contains =
    packageData.contains || [];

  const faqs = [
    {
      question: `What is included in ${packageName}?`,

      answer: contains.length
        ? `${packageName} includes ${contains
            .map((item) => item.text)
            .filter(Boolean)
            .join(", ")}.`
        : `${packageName} provides structured learning resources and exam preparation support.`,
    },

    {
      question: `Which courses are included in ${packageName}?`,

      answer: courses.length
        ? `The package includes ${courses
            .map((course) => course.exam)
            .filter(Boolean)
            .join(", ")}.`
        : `The courses available with ${packageName} depend on the current package configuration.`,
    },

    {
      question: `How long is ${packageName} valid?`,

      answer: validity
        ? `${packageName} is currently offered with a validity period of ${validity}.`
        : `The validity period for ${packageName} is shown in the package pricing details.`,
    },

    {
      question: `Who is ${packageName} suitable for?`,

      answer: packageData.description
        ? packageData.description
        : `${packageName} is designed for students preparing for the relevant Kerala PSC competitive examinations.`,
    },
  ];

  return (
    <section
      className="
        relative
        mt-8
        overflow-hidden
        rounded-[28px]
        border
        border-[#dfe9f4]
        bg-gradient-to-br
        from-white
        via-[#f9fbff]
        to-[#f2f7ff]
        p-6
        shadow-[0_15px_40px_rgba(15,58,110,0.06)]
        sm:p-8
      "
    >
      {/* Grid pattern */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.035]
          [background-image:linear-gradient(#164fa5_1px,transparent_1px),linear-gradient(90deg,#164fa5_1px,transparent_1px)]
          [background-size:32px_32px]
        "
      />

      {/* Blue glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-20
          -top-20
          h-64
          w-64
          rounded-full
          bg-[#00b5e8]/10
          blur-[90px]
        "
      />

      {/* Pink glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -bottom-24
          left-10
          h-60
          w-60
          rounded-full
          bg-[#f13873]/10
          blur-[90px]
        "
      />

      <div className="relative z-10">
        {/* Header */}
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-[15px]
              bg-[#eef6ff]
              text-[#164fa5]
            "
          >
            <CircleHelp className="h-6 w-6" />
          </div>

          <div>
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.14em]
                text-[#f13873]
              "
            >
              Need Help?
            </p>

            <h2
              className="
                mt-1
                text-2xl
                font-black
                tracking-[-0.03em]
                text-[#0b216c]
              "
            >
              Frequently Asked Questions
            </h2>
          </div>
        </div>

        {/* FAQ */}
        <div
          className="
            mt-7
            space-y-3
          "
        >
          {faqs.map((faq, index) => {
            const isOpen =
              openIndex === index;

            return (
              <article
                key={faq.question}
                className="
                  overflow-hidden
                  rounded-[18px]
                  border
                  border-[#dfe8f3]
                  bg-white
                  transition-all
                  duration-300
                  hover:border-[#c9ddef]
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenIndex(
                      isOpen ? -1 : index
                    )
                  }
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    gap-5
                    px-5
                    py-4
                    text-left
                    sm:px-6
                  "
                >
                  <span
                    className="
                      text-[14px]
                      font-bold
                      leading-6
                      text-[#172b4d]
                      sm:text-[15px]
                    "
                  >
                    {faq.question}
                  </span>

                  <div
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
                          ? "bg-[#164fa5] text-white"
                          : "bg-[#eef6ff] text-[#164fa5]"
                      }
                    `}
                  >
                    <ChevronDown
                      className={`
                        h-4
                        w-4
                        transition-transform
                        duration-300

                        ${
                          isOpen
                            ? "rotate-180"
                            : ""
                        }
                      `}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div
                    className="
                      border-t
                      border-[#edf2f7]
                      px-5
                      py-4
                      sm:px-6
                    "
                  >
                    <p
                      className="
                        max-w-5xl
                        text-[13px]
                        leading-6
                        text-[#65738b]
                        sm:text-sm
                      "
                    >
                      {faq.answer}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}