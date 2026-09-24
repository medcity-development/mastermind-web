"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    question:
      "How does Medcity help students prepare for competitive exams?",
    answer:
      "Medcity provides structured classroom training, experienced faculty support, updated study materials, regular mock tests, revision sessions, and exam-focused guidance to help students prepare confidently for competitive exams.",
  },
  {
    question:
      "Are the student testimonials on this page from real learners?",
    answer:
      "Yes. The testimonials highlight the learning experiences, preparation journeys, and feedback shared by students who have attended Medcity's training programs and coaching sessions.",
  },
  {
    question:
      "Which competitive exams does Medcity provide coaching for?",
    answer:
      "Medcity offers coaching and preparation support for Kerala PSC, SSC, RRB, banking, and other major competitive examinations, depending on the courses available at each centre.",
  },
  {
    question:
      "Can I contact Medcity before joining a course?",
    answer:
      "Yes. You can contact the Medcity team or visit your nearest centre to learn more about available courses, batches, schedules, study materials, and the preparation approach before enrolling.",
  },
];

export default function TestimonialFAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenIndex((current) => (current === index ? -1 : index));
  };

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-[#f7fbff]
        py-12
        sm:py-14
        lg:py-16
      "  data-aos="fade-up"
    >
      {/* Decorative background */}
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
          bg-[#0466AF]/[0.07]
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
          bg-[#c01f53]/[0.07]
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
        "
      >
        {/* Heading */}
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
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
            Frequently Asked Questions
          </p>

          <h2
            className="
              text-2xl
              font-black
              leading-tight
              text-[#081f3d]
              sm:text-3xl
              lg:text-4xl
            "
          >
            Questions About Our
            <span className="text-[#0466AF]"> Student Experiences</span>
          </h2>

          <p
            className="
              mx-auto
              mt-3
              max-w-xl
              text-sm
              leading-6
              text-slate-600
              sm:text-base
              sm:leading-7
            "
          >
            Find answers to common questions about Medcity's coaching,
            student testimonials and competitive exam preparation.
          </p>
        </div>

        {/* FAQ */}
        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
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
                      ? "border-[#0466AF]/25 shadow-[0_14px_40px_rgba(15,23,42,0.08)]"
                      : "border-slate-200/80 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
                  }
                `}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
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
                    lg:px-6
                  "
                >
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
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
                        transition-colors
                        duration-300
                        sm:h-10
                        sm:w-10
                        sm:text-sm
                        ${
                          isOpen
                            ? "bg-[#0466AF] text-white"
                            : "bg-[#eef7ff] text-[#0466AF]"
                        }
                      `}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <h3
                      className="
                        text-sm
                        font-bold
                        leading-5
                        text-[#081f3d]
                        sm:text-base
                        sm:leading-6
                        lg:text-[17px]
                      "
                    >
                      {faq.question}
                    </h3>
                  </div>

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
                          : "bg-slate-100 text-slate-600"
                      }
                    `}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

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
                        border-slate-100
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
                          text-slate-600
                          sm:text-[15px]
                          sm:leading-7
                        "
                      >
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}