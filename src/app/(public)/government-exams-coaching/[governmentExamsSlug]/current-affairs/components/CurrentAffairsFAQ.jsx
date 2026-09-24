"use client";

import {
  useState,
} from "react";

import {
  ChevronDown,
  HelpCircle,
} from "lucide-react";

const faqs = [
  {
    question:
      "Why are current affairs important for Kerala PSC exams?",
    answer:
      "Current affairs are an important part of Kerala PSC preparation because many exams include questions related to recent national, international, Kerala-specific, economic, scientific and social developments.",
  },
  {
    question:
      "How often should I study current affairs for Kerala PSC?",
    answer:
      "It is better to follow current affairs regularly rather than studying everything at once. Daily reading combined with monthly revision helps you remember important events more effectively.",
  },
  {
    question:
      "Can I access previous months' current affairs?",
    answer:
      "Yes. You can browse the month-wise current affairs folders on this page and select the month and year you want to revise.",
  },
  {
    question:
      "Are these current affairs useful for all Kerala PSC exam levels?",
    answer:
      "Yes. The current affairs materials can support preparation for different Kerala PSC exam levels, though the depth and type of questions may vary depending on the specific examination.",
  },
];

export default function CurrentAffairsFAQ() {
  const [
    openIndex,
    setOpenIndex,
  ] = useState(0);

  function handleToggle(index) {
    setOpenIndex(
      openIndex === index
        ? null
        : index
    );
  }

  return (
    <section
      className="
        mt-6
        overflow-hidden
        rounded-[26px]
        border
        border-[#dce8f7]
        bg-gradient-to-br
        from-white
        via-[#fbfdff]
        to-[#f4f9ff]
        px-4
        py-6
        shadow-[0_16px_40px_rgba(22,79,165,0.07)]
        sm:px-6
        lg:px-8
        lg:py-8
      "
    >
      {/* HEADER */}
      <div
        className="
          mx-auto
          max-w-[700px]
          text-center
        "
      >
        <span
          className="
            mx-auto
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-[15px]
            bg-mediumBlue
            shadow-[0_10px_24px_rgba(124,58,237,0.20)] text-white
          "
        >
          <HelpCircle
            size={22}
          />
        </span>

        <p
          className="
            mt-4
            text-[10px]
            font-bold
            uppercase
            tracking-[0.15em]
            text-[#e83e8c]
          "
        >
          Frequently Asked Questions
        </p>

        <h2
          className="
            mt-2
            text-2xl
            font-bold
            tracking-[-0.03em]
            text-[#102c5c]
            sm:text-3xl
          "
        >
          Kerala PSC Current Affairs FAQ
        </h2>

        <p
          className="
            mx-auto
            mt-3
            max-w-[580px]
            text-xs
            leading-6
            text-slate-500
          "
        >
          Quick answers to common questions about
          preparing current affairs for Kerala PSC exams.
        </p>
      </div>

      {/* FAQ LIST */}
      <div
        className="
          mx-auto
          mt-7
          max-w-[900px]
          space-y-3
        "
      >
        {faqs.map(
          (item, index) => {
            const isOpen =
              openIndex === index;

            return (
              <div
                key={
                  item.question
                }
                className={`
                  overflow-hidden
                  rounded-[18px]
                  border
                  transition-all
                  duration-300
                  ${
                    isOpen
                      ? `
                          border-[#087bea]/20
                          bg-white
                          shadow-[0_10px_26px_rgba(22,79,165,0.08)]
                        `
                      : `
                          border-[#e4ecf6]
                          bg-white/80
                        `
                  }
                `}
              >
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
                    sm:px-5 cursor-pointer
                  "
                >
                  <span
                    className="
                      text-[13px]
                      font-bold
                      leading-5
                      text-[#153a72]
                      sm:text-sm
                    "
                  >
                    {item.question}
                  </span>

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
                              bg-gradient-to-br
                              from-[#087bea]
                              to-mediumBlue
                              text-white
                            `
                          : `
                              bg-[#edf6ff]
                              text-[#087bea]
                            `
                      }
                    `}
                  >
                    <ChevronDown
                      size={16}
                      className={`
                        transition-transform
                        duration-300
                        ${
                          isOpen
                            ? "rotate-180"
                            : ""
                        }
                      `}
                    />
                  </span>
                </button>

                <div
                  className={`
                    grid
                    transition-all
                    duration-300
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
                  <div className="overflow-hidden">
                    <p
                      className="
                        border-t
                        border-[#edf2f7]
                        px-4
                        pb-5
                        pt-4
                        text-[12px]
                        leading-6
                        text-slate-500
                        sm:px-5
                      "
                    >
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>
    </section>
  );
}