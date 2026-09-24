"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    question:
      "What topics are covered in the Medcity blog?",
    answer:
      "Our blog covers PSC exam preparation, study strategies, Kerala current affairs, exam updates, previous year question analysis, motivation, time management, and other useful resources for competitive exam aspirants.",
  },
  {
    question:
      "How often are new articles added to the blog?",
    answer:
      "New articles are added regularly to help students stay updated with exam-related information, preparation tips, current affairs, and useful study resources.",
  },
  {
    question:
      "Are the blog articles useful for Kerala PSC preparation?",
    answer:
      "Yes. Many of our articles are designed specifically for Kerala PSC aspirants and include preparation guidance, current affairs, exam tips, revision strategies, and important topics that can support your study plan.",
  },
  {
    question:
      "Can I use the blog resources for free?",
    answer:
      "Yes. The articles and study resources available on the Medcity blog can be accessed freely, helping aspirants learn, revise, and improve their exam preparation.",
  },
];

export default function BlogsFAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const handleToggle = (index) => {
    setOpenIndex((current) =>
      current === index ? -1 : index
    );
  };

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-[#f8fbff]
        py-12
        sm:py-14
        lg:py-16
      " data-aos="fade-up"
    >
      {/* Background decorations */}
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
          bg-[#0466AF]/[0.06]
          blur-3xl
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-24
          bottom-0
          h-72
          w-72
          rounded-full
          bg-[#c01f53]/[0.06]
          blur-3xl
        "
      />

      <div
        className="
          relative
          mx-auto
          w-full
          max-w-5xl
          px-4
          sm:px-6
          lg:px-8
        " data-aos="fade-up"
      >
        {/* Heading */}
        <div
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
              mb-4
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-2xl
              bg-[#0466AF]/10
              text-[#0466AF]
              sm:h-12
              sm:w-12
            "
          >
            <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>

          <p
            className="
              mb-2
              text-xs
              font-bold
              uppercase
              tracking-[0.2em]
              text-[#c01f53]
              sm:text-sm
            "
          >
            Blog FAQs
          </p>

          <h2
            className="
              text-2xl
              font-black
              leading-tight
              tracking-[-0.02em]
              text-[#082b7a]
              sm:text-3xl
              lg:text-4xl
            "
          >
            Frequently Asked{" "}
            <span className="text-[#05a9f4]">
              Questions
            </span>
          </h2>

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
            Find quick answers about our blog,
            study resources and PSC exam
            preparation articles.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => {
            const isOpen =
              openIndex === index;

            return (
              <article
                key={faq.question}
                className={`
                  overflow-hidden
                  rounded-[18px]
                  border
                  bg-white
                  transition-all
                  duration-300
                  sm:rounded-[20px]
                  ${
                    isOpen
                      ? "border-[#0466AF]/25 shadow-[0_14px_40px_rgba(15,58,110,0.08)]"
                      : "border-[#dce8f7] shadow-[0_7px_22px_rgba(15,58,110,0.04)]"
                  }
                `}
              >
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
                      items-center
                      gap-3
                      sm:gap-4
                    "
                  >
                    {/* Number */}
                    <div
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
                        sm:text-sm
                        ${
                          isOpen
                            ? "bg-[#0466AF] text-white shadow-[0_7px_16px_rgba(4,102,175,0.22)]"
                            : "bg-[#edf7ff] text-[#0466AF]"
                        }
                      `}
                    >
                      {String(
                        index + 1
                      ).padStart(2, "0")}
                    </div>

                    <h3
                      className="
                        text-sm
                        font-extrabold
                        leading-5
                        text-[#082b7a]
                        sm:text-base
                        sm:leading-6
                        lg:text-[17px]
                      "
                    >
                      {faq.question}
                    </h3>
                  </div>

                  {/* Arrow */}
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
                          ? "rotate-180 bg-[#0466AF] text-white"
                          : "bg-[#f1f6fb] text-[#48658f]"
                      }
                    `}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                {/* Answer */}
                <div
                  className={`
                    grid
                    transition-all
                    duration-300
                    ease-in-out
                    ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }
                  `}
                >
                  <div className="overflow-hidden">
                    <div
                      className="
                        border-t
                        border-[#edf2f8]
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