"use client";

import { useState } from "react";
import Link from "next/link";

import {
  ArrowRight,
  ChevronDown,
  CircleHelp,
} from "lucide-react";

const faqs = [
  {
    question: "Which exams does MasterMind Academy provide coaching for?",
    answer:
      "MasterMind Academy provides coaching support for Kerala PSC, SSC and RRB competitive examinations through structured classes, study materials, practice tests and exam-focused guidance.",
  },
  {
    question: "Does MasterMind Academy provide online classes?",
    answer:
      "Yes. MasterMind Academy supports flexible learning with online preparation options so aspirants can learn, revise and practice from anywhere.",
  },
  {
    question: "Are study materials included with the courses?",
    answer:
      "Our courses include structured learning resources designed to support syllabus coverage, revision and exam-oriented preparation. Available materials may vary depending on the course.",
  },
  {
    question: "Does MasterMind Academy provide mock tests?",
    answer:
      "Yes. Mock tests and practice assessments help students understand exam patterns, improve speed and accuracy, identify weak areas and track preparation progress.",
  },
  {
    question: "Is current affairs preparation available?",
    answer:
      "Yes. Current affairs support is included as part of competitive exam preparation to help aspirants stay updated with important topics and exam-relevant developments.",
  },
  {
    question: "How can I join a MasterMind Academy course?",
    answer:
      "You can explore our available courses online or contact the MasterMind Academy team for course details, admission guidance and help choosing the right preparation program.",
  },
];

function FAQItem({
    faq,
    index,
    isOpen,
    onToggle,
  }) {
    return (
      <article
        className={`
          overflow-hidden
          rounded-[18px]
          border
          transition-[border-color,background-color,box-shadow]
          duration-300
          ease-out
  
          ${
            isOpen
              ? `
                border-[#1475e5]/15
                bg-white
                shadow-[0_14px_34px_rgba(8,31,92,0.08)]
              `
              : `
                border-white/90
                bg-white/75
                shadow-[0_6px_18px_rgba(8,31,92,0.035)]
                hover:bg-white
                hover:shadow-[0_10px_24px_rgba(8,31,92,0.055)]
              `
          }
        `}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          className="
            flex
            w-full
            items-center
            gap-3
            px-4
            py-3.5
            text-left
            sm:px-5
            sm:py-4
          "
        >
          {/* Number */}
          <span
            className={`
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-[9px]
              text-[7px]
              font-black
              transition-all
              duration-300
              ease-out
  
              ${
                isOpen
                  ? `
                    scale-105
                    bg-gradient-to-br
                    from-[#1667d9]
                    to-[#00aee7]
                    text-white
                    shadow-[0_6px_14px_rgba(20,117,229,0.18)]
                  `
                  : `
                    scale-100
                    bg-[#edf6ff]
                    text-[#1475e5]
                  `
              }
            `}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
  
          {/* Question */}
          <span
            className="
              min-w-0
              flex-1
              text-[11px]
              font-bold
              leading-5
              text-[#10275c]
              sm:text-[12px]
              lg:text-[13px]
            "
          >
            {faq.question}
          </span>
  
          {/* Arrow */}
          <span
            className={`
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              transition-all
              duration-500
              ease-[cubic-bezier(0.4,0,0.2,1)]
  
              ${
                isOpen
                  ? `
                    rotate-180
                    border-[#1475e5]
                    bg-[#1475e5]
                    text-white
                  `
                  : `
                    rotate-0
                    border-[#164fa5]/10
                    bg-[#f8fbff]
                    text-[#164fa5]
                  `
              }
            `}
          >
            <ChevronDown
              size={13}
              strokeWidth={2.2}
            />
          </span>
        </button>
  
        {/* =====================================================
            SMOOTH OPEN / CLOSE
        ===================================================== */}
        <div
          className={`
            grid
            transition-[grid-template-rows]
            duration-500
            ease-[cubic-bezier(0.4,0,0.2,1)]
  
            ${
              isOpen
                ? "grid-rows-[1fr]"
                : "grid-rows-[0fr]"
            }
          `}
        >
          {/* Required for 0fr animation */}
          <div className="overflow-hidden">
            <div
              className={`
                ml-[60px]
                mr-4
                border-t
                border-[#164fa5]/8
  
                transition-all
                duration-500
                ease-[cubic-bezier(0.4,0,0.2,1)]
  
                sm:ml-[68px]
                sm:mr-5
  
                ${
                  isOpen
                    ? `
                      translate-y-0
                      pb-4
                      pt-3
                      opacity-100
                    `
                    : `
                      -translate-y-2
                      pb-0
                      pt-0
                      opacity-0
                    `
                }
              `}
            >
              <p
                className="
                  text-[10px]
                  leading-5
                  text-[#64718a]
                  sm:text-[11px]
                  sm:leading-6
                "
              >
                {faq.answer}
              </p>
            </div>
          </div>
        </div>
      </article>
    );
  }

export default function HomeFAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index) => {
    setOpenIndex((current) =>
      current === index ? -1 : index
    );
  };

  const leftFaqs = [
    { faq: faqs[0], index: 0 },
    { faq: faqs[2], index: 2 },
    { faq: faqs[4], index: 4 },
  ];

  const rightFaqs = [
    { faq: faqs[1], index: 1 },
    { faq: faqs[3], index: 3 },
    { faq: faqs[5], index: 5 },
  ];

  return (
    <section
      id="faq"
      className="
        relative
        isolate
        overflow-hidden
        bg-[#f7fbff]
        py-14
        sm:py-16
        lg:py-20
      "
    >
      {/* Background accents */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-32
          top-10
          -z-10
          h-[320px]
          w-[320px]
          rounded-full
          bg-[#dff3ff]/70
          blur-[95px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-32
          bottom-0
          -z-10
          h-[320px]
          w-[320px]
          rounded-full
          bg-[#fde7f1]/50
          blur-[95px]
        "
      />

      <div
        className="
          mx-auto
          w-full
          max-w-[1200px]
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* Header */}
        <div
          className="
            mx-auto
            max-w-[720px]
            text-center
          "
        >
          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-[#164fa5]/10
              bg-white/80
              px-4
              py-2
              shadow-[0_6px_18px_rgba(8,31,92,0.04)]
              backdrop-blur
            "
          >
            <CircleHelp
              size={13}
              className="text-[#1475e5]"
            />

            <span
              className="
                text-[7px]
                font-black
                uppercase
                tracking-[0.24em]
                text-[#164fa5]
              "
            >
              Frequently Asked Questions
            </span>
          </div>

          <h2
            className="
              mt-5
              text-[30px]
              font-black
              leading-[1.04]
              tracking-[-0.04em]
              text-[#081f5c]
              sm:text-[38px]
              lg:text-[44px]
            "
          >
            Questions About Your

            <span
              className="
                mt-1
                block
                bg-gradient-to-r
                from-[#165fd1]
                via-[#078bcc]
                to-[#00b5e8]
                bg-clip-text
                text-transparent
              "
            >
              Exam Preparation?
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-4
              max-w-[600px]
              text-[11px]
              leading-6
              text-[#62708a]
              sm:text-[12px]
            "
          >
            Find quick answers about MasterMind Academy
            courses, study resources, mock tests and
            competitive exam preparation.
          </p>
        </div>

        {/* =====================================================
            MOBILE — ONE STACK
        ===================================================== */}
        <div
          className="
            mx-auto
            mt-10
            max-w-[1000px]
            space-y-3
            lg:hidden
          "
        >
          {faqs.map((faq, index) => (
            <FAQItem
              key={faq.question}
              faq={faq}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => toggleFAQ(index)}
            />
          ))}
        </div>

        {/* =====================================================
            DESKTOP — TWO INDEPENDENT COLUMNS
        ===================================================== */}
        <div
          className="
            mx-auto
            mt-10
            hidden
            max-w-[1000px]
            grid-cols-2
            items-start
            gap-4
            lg:grid
          "
        >
          {/* LEFT COLUMN */}
          <div className="space-y-3">
            {leftFaqs.map(({ faq, index }) => (
              <FAQItem
                key={faq.question}
                faq={faq}
                index={index}
                isOpen={openIndex === index}
                onToggle={() => toggleFAQ(index)}
              />
            ))}
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-3">
            {rightFaqs.map(({ faq, index }) => (
              <FAQItem
                key={faq.question}
                faq={faq}
                index={index}
                isOpen={openIndex === index}
                onToggle={() => toggleFAQ(index)}
              />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          className="
            mt-8
            flex
            flex-wrap
            items-center
            justify-center
            gap-2
            text-center
          "
        >
          <span
            className="
              text-[10px]
              text-[#68758c]
            "
          >
            Still have a question?
          </span>

          <Link
            href="/contact"
            className="
              group
              inline-flex
              items-center
              gap-1.5
              text-[10px]
              font-bold
              text-[#1475e5]
            "
          >
            Contact Our Team

            <ArrowRight
              size={12}
              className="
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            />
          </Link>
        </div>
      </div>
    </section>
  );
}