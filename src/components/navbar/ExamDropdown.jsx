import {
  ChevronDown,
} from "lucide-react";

import Link from "next/link";

export default function ExamDropdown({
  open,
  setOpen,
  dropdownRef,
  pathname,
  exams,
}) {
  const examActive =
    pathname.startsWith(
      "/government-exams-coaching/"
    );

  function isActive(href) {
    return pathname.startsWith(
      href
    );
  }

  return (
    <div
      ref={dropdownRef}
      className="
        relative
        z-[99999]
      "
    >
      <button
        type="button"
        onClick={() =>
          setOpen(
            (value) => !value
          )
        }
        aria-expanded={open}
        aria-haspopup="menu"
        className={`
          inline-flex
          items-center
          gap-2
          rounded-[12px]
          px-4
          py-2.5
          text-[14px]
          font-extrabold
          transition-all
          duration-200

          ${
            examActive || open
              ? `
                  bg-[#edf7ff]
                  text-[#075fc8]
                `
              : `
                  text-[#0b2554]
                  hover:bg-[#f4f9ff]
                  hover:text-[#075fc8]
                `
          }
        `}
      >
        Explore

        <ChevronDown
          size={16}
          strokeWidth={2.4}
          className={`
            transition-transform
            duration-300

            ${
              open
                ? "rotate-180"
                : ""
            }
          `}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="
            absolute
            left-1/2
            top-full
            z-[999999]
            mt-4
            w-[560px]
            -translate-x-1/2
            rounded-[24px]
            bg-white
            p-4
            shadow-[0_28px_80px_rgba(15,58,110,0.22)]
          "
        >
          <span
            aria-hidden="true"
            className="
              absolute
              -top-[7px]
              left-1/2
              h-4
              w-4
              -translate-x-1/2
              rotate-45
              bg-white
            "
          />

          <div
            className="
              rounded-[18px]
              bg-gradient-to-r
              from-blue-50
              via-purple-50
              to-blue-100
              px-5
              py-4
            "
          >
            <p
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[0.16em]
                text-[#087bea]
              "
            >
              Government Exams
            </p>

            <h3
              className="
                mt-1
                text-[16px]
                font-black
                text-[#102c5c]
              "
            >
              Choose your preparation path
            </h3>

            <p
              className="
                mt-1
                text-[11px]
                text-slate-500
              "
            >
              Select an exam category to explore courses,
              tests and study resources.
            </p>
          </div>

          <div
            className="
              mt-3
              flex
              flex-col
              gap-2.5
            "
          >
            {exams.map((exam) => {
              const active =
                isActive(
                  exam.href
                );

              return (
                <Link
                  key={exam.href}
                  href={exam.href}
                  role="menuitem"
                  onClick={() =>
                    setOpen(false)
                  }
                  className={`
                    group
                    flex
                    items-center
                    justify-between
                    rounded-[16px]
                    px-5
                    py-4
                    transition-all
                    duration-300

                    ${
                      active
                        ? `
                            bg-gradient-to-r
                            from-[#071f55]
                            via-[#075fc8]
                            to-[#087bea]
                            text-white
                            shadow-[0_10px_25px_rgba(7,95,200,0.22)]
                          `
                        : `
                            bg-[#f7faff]
                            text-[#102c5c]
                            hover:-translate-y-0.5
                            hover:bg-[#eef7ff]
                            hover:shadow-[0_12px_28px_rgba(15,58,110,0.08)]
                          `
                    }
                  `}
                >
                  <div
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-4
                    "
                  >
                    <div
                      className={`
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-[12px]
                        text-[13px]
                        font-black

                        ${
                          active
                            ? "bg-white/15"
                            : "bg-white text-[#087bea] shadow-sm"
                        }
                      `}
                    >
                      {exam.label ===
                      "Kerala PSC"
                        ? "K"
                        : "R"}
                    </div>

                    <div className="min-w-0">
                      <p
                        className="
                          whitespace-nowrap
                          text-[14px]
                          font-black
                        "
                      >
                        {exam.label}
                      </p>

                      <p
                        className={`
                          mt-1
                          whitespace-nowrap
                          text-[10px]

                          ${
                            active
                              ? "text-white/70"
                              : "text-slate-500"
                          }
                        `}
                      >
                        {exam.description}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      text-[15px]
                      transition-transform
                      duration-300
                      group-hover:translate-x-1

                      ${
                        active
                          ? "bg-white/15"
                          : "bg-white text-[#087bea] shadow-sm"
                      }
                    `}
                  >
                    →
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}