"use client";

import { useState } from "react";
import {
  ChevronDown,
  HelpCircle,
} from "lucide-react";

const faqs = [
  {
    question: "How do I log in to my Mastermind PSC account?",
    answer:
      "Enter your registered email address or mobile number along with your password, then click the Login button to access your account.",
  },
  {
    question: "What should I do if I forget my password?",
    answer:
      "Click the Forgot Password link on the login page and follow the instructions to reset your password securely.",
  },
  {
    question: "Can I access my courses from multiple devices?",
    answer:
      "Yes. You can log in to your Mastermind PSC account from supported devices and continue your learning wherever you are.",
  },
  {
    question: "Who can I contact if I am unable to log in?",
    answer:
      "If you continue to have trouble accessing your account, contact the Mastermind PSC support team for assistance.",
  },
];

export default function LoginFAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index) => {
    setOpenIndex((current) =>
      current === index ? null : index
    );
  };

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-[#f8fbff]
        py-10
        sm:py-12
        lg:py-14
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-6xl
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* HEADER */}
        <div className="text-center">
          <div
            className="
              mx-auto
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-[14px]
              bg-gradient-to-br
              from-[#164fa5]
              via-[#017cc0]
              to-[#00b5e8]
              text-white
              shadow-[0_10px_24px_rgba(22,79,165,0.18)]
            "
          >
            <HelpCircle size={21} />
          </div>

          <h2
            className="
              mt-4
              text-2xl
              font-black
              tracking-[-0.035em]
              text-[#0b216c]
              sm:text-3xl
            "
          >
            Login FAQs
          </h2>

          <p
            className="
              mx-auto
              mt-2
              max-w-xl
              text-sm
              leading-6
              text-slate-500
            "
          >
            Quick answers to common questions about accessing
            your Mastermind PSC account.
          </p>
        </div>

        {/* FAQ GRID */}
        <div
          className="
            mt-8
            grid
            grid-cols-1
            items-start
            gap-4
            md:grid-cols-2
          "
        >
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <article
                key={faq.question}
                className="
                  overflow-hidden
                  rounded-[20px]
                  border
                  border-[#164fa5]/10
                  bg-white
                  shadow-[0_8px_24px_rgba(11,33,108,0.045)]
                  transition
                  duration-300
                  hover:-translate-y-0.5
                  hover:border-[#164fa5]/15
                  hover:shadow-[0_12px_30px_rgba(11,33,108,0.07)]
                "
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggleFAQ(index)}
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    gap-4
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
                      leading-5
                      text-[#0b216c]
                      sm:text-[15px]
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
                      rounded-[10px]
                      transition
                      duration-300
                      ${
                        isOpen
                          ? "bg-gradient-to-br from-[#164fa5] to-[#017cc0] text-white"
                          : "bg-[#eef8ff] text-[#164fa5]"
                      }
                    `}
                  >
                    <ChevronDown
                      size={17}
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
                        ? "grid-rows-[1fr]"
                        : "grid-rows-[0fr]"
                    }
                  `}
                >
                  <div className="overflow-hidden">
                    <div
                      className="
                        border-t
                        border-slate-100
                        px-5
                        pb-5
                        pt-4
                        sm:px-6
                      "
                    >
                      <p
                        className="
                          text-[13px]
                          leading-6
                          text-slate-500
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