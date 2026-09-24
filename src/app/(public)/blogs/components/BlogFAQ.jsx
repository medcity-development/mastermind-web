"use client";

import { useState } from "react";

import {
  ChevronDown,
  CircleHelp,
} from "lucide-react";

const faqs = [
  {
    question:
      "What topics can I find on the MasterMind blog?",
    answer:
      "Our blog covers Kerala PSC preparation, current affairs, exam strategies, study tips, previous year question guidance, motivation, and other useful resources for competitive exam aspirants.",
  },
  {
    question:
      "How often are new blog articles published?",
    answer:
      "New articles are added regularly with useful exam updates, study guidance, current affairs, preparation strategies, and important information for PSC aspirants.",
  },
  {
    question:
      "Are the blog articles useful for Kerala PSC preparation?",
    answer:
      "Yes. Many of our articles are created specifically to support Kerala PSC aspirants with current affairs, revision tips, exam strategies, syllabus guidance, and preparation resources.",
  },
  {
    question:
      "Can I access the blog resources for free?",
    answer:
      "Yes. The articles and learning resources available on the MasterMind blog can be accessed freely to support your exam preparation and revision.",
  },
];

export default function BlogsFAQ() {
  const [openIndex, setOpenIndex] =
    useState(0);

  const handleToggle = (index) => {
    setOpenIndex((current) =>
      current === index ? -1 : index
    );
  };

  return (
    <section
      className="
        relative
        isolate
        w-full
        overflow-hidden
        bg-gradient-to-br
        from-[#f8fcff]
        via-[#eef8ff]
        to-[#f7f2ff]
        py-12
        sm:py-14
        lg:py-16
      "
    >
      {/* ================================================
          SUBTLE GRID BACKGROUND
      ================================================= */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          -z-10
          opacity-60
          [background-image:linear-gradient(to_right,rgba(8,126,233,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(8,126,233,0.055)_1px,transparent_1px)]
          [background-size:34px_34px]
        "
      />

      {/* ================================================
          LEFT BLUE GLOW
      ================================================= */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-32
          top-8
          -z-10
          h-[350px]
          w-[350px]
          rounded-full
          bg-[#38bdf8]/20
          blur-[105px]
        "
      />

      {/* ================================================
          TOP CENTER VIOLET GLOW
      ================================================= */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -top-48
          left-1/2
          -z-10
          h-[380px]
          w-[580px]
          -translate-x-1/2
          rounded-full
          bg-[#8b5cf6]/15
          blur-[120px]
        "
      />

      {/* ================================================
          RIGHT VIOLET GLOW
      ================================================= */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-36
          top-[25%]
          -z-10
          h-[380px]
          w-[380px]
          rounded-full
          bg-[#a855f7]/15
          blur-[115px]
        "
      />

      {/* ================================================
          CENTER CYAN GLOW
      ================================================= */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[45%]
          -z-10
          h-[300px]
          w-[700px]
          -translate-x-1/2
          rounded-full
          bg-[#0ea5e9]/[0.07]
          blur-[120px]
        "
      />

      {/* ================================================
          BOTTOM LEFT BLUE GLOW
      ================================================= */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -bottom-44
          left-[12%]
          -z-10
          h-[360px]
          w-[500px]
          rounded-full
          bg-[#2563eb]/10
          blur-[120px]
        "
      />

      {/* ================================================
          BOTTOM RIGHT PINK GLOW
      ================================================= */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -bottom-48
          right-[5%]
          -z-10
          h-[350px]
          w-[450px]
          rounded-full
          bg-[#ec4899]/10
          blur-[120px]
        "
      />

      {/* ================================================
          TOP BORDER HIGHLIGHT
      ================================================= */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-[#087ee9]/25
          to-transparent
        "
      />

      {/* ================================================
          BOTTOM BORDER HIGHLIGHT
      ================================================= */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-[#8b5cf6]/20
          to-transparent
        "
      />

      {/* ================================================
          CENTERED CONTENT
      ================================================= */}
      <div
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-4xl
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* ================================================
            HEADING
        ================================================= */}
        <div
          className="
            mx-auto
            mb-8
            max-w-2xl
            text-center
            sm:mb-10
          "
        >
          {/* Icon */}
          <div
            className="
              relative
              mx-auto
              mb-4
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-[16px]
              border
              border-white/80
              bg-white/80
              text-[#087ee9]
              shadow-[0_8px_25px_rgba(8,126,233,0.12)]
              backdrop-blur-sm
              sm:h-13
              sm:w-13
            "
          >
            <div
              aria-hidden="true"
              className="
                absolute
                inset-1
                rounded-xl
                bg-gradient-to-br
                from-[#dff3ff]
                to-[#eee8ff]
              "
            />

            <CircleHelp
              className="
                relative
                z-10
                h-6
                w-6
              "
            />
          </div>

          {/* Small label */}
          <p
            className="
              text-xs
              font-extrabold
              uppercase
              tracking-[0.2em]
              text-[#087ee9]
              sm:text-sm
            "
          >
            Blog FAQs
          </p>

          {/* Main heading */}
          <h2
            className="
              mt-2
              text-2xl
              font-black
              tracking-[-0.03em]
              text-[#082b7a]
              sm:text-3xl
              lg:text-4xl
            "
          >
            Frequently Asked{" "}
            <span
              className="
                bg-gradient-to-r
                from-[#087ee9]
                via-[#2563eb]
                to-[#7c3aed]
                bg-clip-text
                text-transparent
              "
            >
              Questions
            </span>
          </h2>

          {/* Supporting text */}
          <p
            className="
              mx-auto
              mt-3
              max-w-xl
              text-sm
              leading-6
              text-[#667ca8]
              sm:text-base
              sm:leading-7
            "
          >
            Quick answers about our blog,
            articles and PSC preparation
            resources.
          </p>
        </div>

        {/* ================================================
            FAQ LIST
        ================================================= */}
        <div
          className="
            mx-auto
            w-full
            space-y-3
          "
        >
          {faqs.map((faq, index) => {
            const isOpen =
              openIndex === index;

            return (
              <article
                key={faq.question}
                className={`
                  relative
                  w-full
                  overflow-hidden
                  rounded-[18px]
                  border
                  bg-white/90
                  backdrop-blur-sm
                  transition-all
                  duration-300

                  ${
                    isOpen
                      ? `
                          border-[#087ee9]/25
                          shadow-[0_16px_40px_rgba(8,80,160,0.10)]
                        `
                      : `
                          border-white
                          shadow-[0_7px_24px_rgba(30,70,120,0.06)]
                          hover:border-[#087ee9]/15
                          hover:shadow-[0_12px_30px_rgba(30,70,120,0.09)]
                        `
                  }
                `}
              >
                {/* Active top highlight */}
                {isOpen && (
                  <div
                    aria-hidden="true"
                    className="
                      absolute
                      inset-x-0
                      top-0
                      h-[2px]
                      bg-gradient-to-r
                      from-[#38bdf8]
                      via-[#2563eb]
                      to-[#8b5cf6]
                    "
                  />
                )}

                {/* ========================================
                    QUESTION
                ========================================= */}
                <button
                  type="button"
                  onClick={() =>
                    handleToggle(index)
                  }
                  aria-expanded={isOpen}
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    gap-3
                    px-4
                    py-4
                    text-left
                    sm:gap-4
                    sm:px-5
                    sm:py-5
                    lg:px-6
                  "
                >
                  <div
                    className="
                      flex
                      min-w-0
                      flex-1
                      items-center
                      gap-3
                      sm:gap-4
                    "
                  >
                    {/* Number */}
                    <span
                      className={`
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        text-xs
                        font-black
                        transition-all
                        duration-300
                        sm:h-10
                        sm:w-10

                        ${
                          isOpen
                            ? `
                                bg-gradient-to-br
                                from-[#0ea5e9]
                                via-[#087ee9]
                                to-[#6d28d9]
                                text-white
                                shadow-[0_7px_18px_rgba(8,126,233,0.25)]
                              `
                            : `
                                bg-gradient-to-br
                                from-[#edf8ff]
                                to-[#eeeaff]
                                text-[#087ee9]
                              `
                        }
                      `}
                    >
                      {String(
                        index + 1
                      ).padStart(2, "0")}
                    </span>

                    {/* Question */}
                    <h3
                      className="
                        min-w-0
                        text-sm
                        font-bold
                        leading-5
                        text-[#0b2f70]
                        sm:text-base
                        sm:leading-6
                      "
                    >
                      {faq.question}
                    </h3>
                  </div>

                  {/* Arrow */}
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
                              bg-gradient-to-br
                              from-[#087ee9]
                              to-[#5b42e8]
                              text-white
                              shadow-[0_6px_15px_rgba(8,126,233,0.20)]
                            `
                          : `
                              border
                              border-[#e3edf7]
                              bg-[#f7fbff]
                              text-[#637b9e]
                            `
                      }
                    `}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </button>

                {/* ========================================
                    ANSWER
                ========================================= */}
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
                  <div className="overflow-hidden">
                    <div
                      className="
                        border-t
                        border-[#eaf1f8]
                        px-4
                        pb-5
                        pt-4
                        sm:ml-[56px]
                        sm:px-5
                        lg:ml-[64px]
                        lg:px-6
                      "
                    >
                      <p
                        className="
                          text-sm
                          leading-6
                          text-[#667ca8]
                          sm:text-[15px]
                          sm:leading-7
                        "
                      >
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}