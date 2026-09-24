"use client";

import { useState } from "react";
import Link from "next/link";

import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  CircleHelp,
  Headphones,
  MessageCircleQuestion,
  Sparkles,
} from "lucide-react";

const faqs = [
  {
    question: "What is MasterMind Academy?",
    answer:
      "MasterMind Academy is a competitive exam coaching platform focused on Kerala PSC, SSC and RRB preparation. We support aspirants with structured classes, expert guidance, quality study materials, mock tests and current affairs preparation.",
  },
  {
    question: "Which competitive exams does MasterMind Academy cover?",
    answer:
      "Our major programs focus on Kerala PSC, SSC and RRB examinations. Available courses may vary based on current notifications, exam schedules and preparation requirements.",
  },
  {
    question: "Does MasterMind Academy provide study materials?",
    answer:
      "Yes. Our courses include structured learning resources, topic-based materials, revision support, current affairs content and exam-oriented preparation resources.",
  },
  {
    question: "Are mock tests available for students?",
    answer:
      "Yes. Mock tests and regular assessments help aspirants understand exam patterns, improve speed and accuracy, identify weak areas and monitor their overall progress.",
  },
  {
    question: "Does MasterMind Academy provide current affairs preparation?",
    answer:
      "Yes. Current affairs support is integrated into our preparation system to help students stay updated with relevant events, topics and exam-focused information.",
  },

  {
    question: "How can I contact MasterMind Academy?",
    answer:
      "You can contact our support team through the Contact page for course details, admission assistance, preparation guidance or general enquiries.",
  },
];

export default function AboutFAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index) => {
    setOpenIndex((current) => (current === index ? -1 : index));
  };

  return (
    <section
      id="faq"
      className="
        relative
        isolate
        overflow-hidden
        bg-[#f6fbff]
        py-16
        sm:py-20
        lg:py-24
      "  data-aos="fade-up"
    >
      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          -z-20
          bg-[radial-gradient(circle_at_12%_25%,rgba(212,239,255,0.9),transparent_30%),radial-gradient(circle_at_90%_75%,rgba(255,228,240,0.7),transparent_30%)]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-0
          -z-10
          h-[400px]
          w-[900px]
          max-w-[92vw]
          -translate-x-1/2
          rounded-full
          bg-white/80
          blur-[100px]
        "
      />

      <div
        className="
          mx-auto
          w-full
          max-w-[1380px]
          px-4
          sm:px-6
          lg:px-8
          xl:px-10
        "
      >
        {/* ======================================================
            HEADER
        ====================================================== */}

        <div
          className="
            mx-auto
            max-w-[820px]
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
              shadow-[0_8px_24px_rgba(8,31,92,0.05)]
              backdrop-blur-md
            "
          >
            <CircleHelp
              size={14}
              strokeWidth={2}
              className="text-[#1475e5]"
            />

            <span
              className="
                text-[8px]
                font-black
                uppercase
                tracking-[0.25em]
                text-[#164fa5]
              "
            >
              Questions & Answers
            </span>
          </div>

          <h2
            className="
              mx-auto
              mt-5
              text-[32px]
              font-black
              leading-[1.04]
              tracking-[-0.04em]
              text-[#081f5c]
              sm:text-[40px]
              lg:text-[48px]
            "
          >
            Have Questions?

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
              We Have the Answers.
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-4
              max-w-[650px]
              text-[12px]
              leading-6
              text-[#62708a]
              sm:text-[13px]
              sm:leading-7
            "
          >
            Learn more about MasterMind Academy, our Kerala PSC,
            SSC and RRB programs, study support and preparation
            approach.
          </p>
        </div>

        {/* ======================================================
            FAQ + SUPPORT
        ====================================================== */}

        <div
          className="
            mt-12
            grid
            items-start
            gap-7
            lg:grid-cols-[minmax(0,1fr)_340px]
            lg:gap-8
          "
        >
          {/* ==================================================
              FAQ LIST
          ================================================== */}

          <div className="space-y-3">
          {faqs.map((faq, index) => {
  const isOpen = openIndex === index;

  return (
    <div
      key={faq.question}
      className={`
        overflow-hidden
        rounded-[20px]
        border
        transition-all
        duration-300

        ${
          isOpen
            ? "border-[#1475e5]/15 bg-white shadow-[0_16px_36px_rgba(8,31,92,0.08)]"
            : "border-white/90 bg-white/75 shadow-[0_8px_22px_rgba(8,31,92,0.04)] hover:bg-white"
        }
      `}
    >
      <button
        type="button"
        onClick={() => toggleFAQ(index)}
        aria-expanded={isOpen}
        className="
          flex
          w-full
          items-center
          gap-4
          px-5
          py-4
          text-left
        "
      >
        <span
          className={`
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-[10px]
            text-[8px]
            font-black
            transition-all
            duration-300

            ${
              isOpen
                ? "bg-gradient-to-br from-[#1667d9] to-[#00aee7] text-white"
                : "bg-[#edf6ff] text-[#1475e5]"
            }
          `}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <span
          className="
            min-w-0
            flex-1
            text-[12px]
            font-bold
            leading-5
            text-[#10275c]
            sm:text-[13px]
          "
        >
          {faq.question}
        </span>

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
            border-[#164fa5]/10
            bg-[#f8fbff]
            text-[#164fa5]
            transition-transform
            duration-300
            ${isOpen ? "rotate-180" : ""}
          `}
        >
          <ChevronDown
            size={14}
            strokeWidth={2.2}
          />
        </span>
      </button>

      {/* Answer only exists when open */}
      {isOpen && (
        <div
          className="
            ml-[64px]
            mr-5
            border-t
            border-[#164fa5]/8
            pb-5
            pt-3
          "
        >
          <p
            className="
              text-[11px]
              leading-6
              text-[#637089]
              sm:text-[12px]
            "
          >
            {faq.answer}
          </p>
        </div>
      )}
    </div>
  );
})}
          </div>

          {/* ==================================================
              SUPPORT PANEL
          ================================================== */}

          <aside
            className="
              relative
              overflow-hidden
              rounded-[28px]
              bg-gradient-to-br
              from-[#071f5c]
              via-[#0a4396]
              to-[#078bcc]
              p-7
              text-white
              shadow-[0_24px_55px_rgba(7,48,112,0.18)]

              lg:sticky
              lg:top-28
            "
          >
            {/* background decorations */}
            <div
              aria-hidden="true"
              className="
                absolute
                -right-20
                -top-16
                h-52
                w-52
                rounded-full
                bg-[#40cbff]/20
                blur-[50px]
              "
            />

            <div
              aria-hidden="true"
              className="
                absolute
                -bottom-20
                -left-16
                h-48
                w-48
                rounded-full
                bg-[#e81262]/15
                blur-[55px]
              "
            />

            <div
              aria-hidden="true"
              className="
                absolute
                right-5
                top-5
                opacity-10
              "
            >
              <MessageCircleQuestion
                size={120}
                strokeWidth={1}
              />
            </div>

            {/* icon */}
            <div
              className="
                relative
                z-10
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-[15px]
                border
                border-white/10
                bg-white/10
                backdrop-blur-md
              "
            >
              <Headphones
                size={21}
                strokeWidth={2}
              />
            </div>

            <div className="relative z-10">
              <p
                className="
                  mt-6
                  text-[8px]
                  font-black
                  uppercase
                  tracking-[0.25em]
                  text-[#9ce6ff]
                "
              >
                Need More Help?
              </p>

              <h3
                className="
                  mt-2
                  text-[25px]
                  font-black
                  leading-[1.05]
                  tracking-[-0.035em]
                "
              >
                Talk to Our
                <span className="block text-[#8ce8ff]">
                  Support Team.
                </span>
              </h3>

              <p
                className="
                  mt-4
                  text-[11px]
                  leading-6
                  text-white/75
                "
              >
                Get help with courses, exam preparation, admissions
                and choosing the right learning path.
              </p>

              {/* trust points */}
              <div
                className="
                  mt-6
                  space-y-3
                  border-y
                  border-white/10
                  py-5
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    text-[10px]
                    font-medium
                    text-white/85
                  "
                >
                  <BadgeCheck
                    size={15}
                    className="text-[#7ce4ff]"
                  />

                  Course guidance
                </div>

                <div
                  className="
                    flex
                    items-center
                    gap-3
                    text-[10px]
                    font-medium
                    text-white/85
                  "
                >
                  <BadgeCheck
                    size={15}
                    className="text-[#7ce4ff]"
                  />

                  Admission support
                </div>

                <div
                  className="
                    flex
                    items-center
                    gap-3
                    text-[10px]
                    font-medium
                    text-white/85
                  "
                >
                  <BadgeCheck
                    size={15}
                    className="text-[#7ce4ff]"
                  />

                  Preparation assistance
                </div>
              </div>

              <Link
                href="/contact"
                className="
                  group
                  mt-6
                  flex
                  h-[46px]
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-white
                  px-5
                  text-[10px]
                  font-bold
                  text-[#0d5db8]
                  shadow-[0_10px_28px_rgba(0,0,0,0.15)]
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:shadow-[0_14px_32px_rgba(0,0,0,0.2)]
                "
              >
                Contact Our Team

                <ArrowRight
                  size={13}
                  className="
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />
              </Link>

              <div
                className="
                  mt-5
                  flex
                  items-center
                  justify-center
                  gap-2
                  text-[8px]
                  font-medium
                  text-white/55
                "
              >
                <Sparkles
                  size={11}
                  className="text-[#7ce4ff]"
                />

                We're here to help you prepare better.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}