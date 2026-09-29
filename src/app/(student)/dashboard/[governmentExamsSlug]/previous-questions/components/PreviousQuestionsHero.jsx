import Link from "next/link";

import {
  ArrowRight,
  BookOpenCheck,
  FileQuestion,
  GraduationCap,
  Sparkles,
  Target,
} from "lucide-react";

export default function PreviousQuestionsHero({
  examName = "Government Exam",
  shortName = "Exam",
}) {
  return (
    <section
      className="
        relative
        mt-20
        mb-5
        overflow-hidden
        rounded-[28px]
        border
        border-[#dce8f7]
        bg-gradient-to-br
        from-[#f8fbff]
        via-white
        to-[#eef7ff]
        px-5
        py-7
        shadow-[0_18px_50px_rgba(22,79,165,0.07)]
        sm:px-7
        sm:py-9
        lg:px-10
        lg:py-10
      "
    >
      {/* GRID PATTERN */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.045]
          [background-image:linear-gradient(to_right,#164fa5_1px,transparent_1px),linear-gradient(to_bottom,#164fa5_1px,transparent_1px)]
          [background-size:34px_34px]
        "
      />

      {/* DECORATIVE SHAPES */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-16
          -top-20
          h-[260px]
          w-[260px]
          rounded-full
          bg-[#dff2ff]
          blur-3xl
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -bottom-20
          left-[32%]
          h-[220px]
          w-[220px]
          rounded-full
          bg-[#eafcf1]
          blur-3xl
        "
      />

      <div
        className="
          relative
          z-10
          grid
          items-center
          gap-8
          lg:grid-cols-[1.15fr_0.85fr]
        "
      >
        {/* LEFT */}
        <div>
          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-[#cae7ff]
              bg-white/85
              px-3.5
              py-2
              text-[11px]
              font-extrabold
              uppercase
              tracking-[0.14em]
              text-[#017cc0]
              shadow-sm
              backdrop-blur
            "
          >
            <Sparkles size={14} />

            {shortName} Practice
          </div>

          <h1
            className="
              mt-5
              max-w-[720px]
              text-[32px]
              font-black
              leading-[1.12]
              tracking-[-0.03em]
              text-[#0b1f44]
              sm:text-[40px]
              lg:text-[48px]
            "
          >
            Practice{" "}
            <span className="text-[#017cc0]">
              {examName}
            </span>{" "}
            Previous Questions Smarter
          </h1>

          <p
            className="
              mt-4
              max-w-[650px]
              text-[14px]
              font-medium
              leading-7
              text-slate-600
              sm:text-[15px]
            "
          >
            Strengthen your{" "}
            <span className="font-bold text-[#0b1f44]">
              {examName}
            </span>{" "}
            preparation by practicing previous examination
            questions, understanding real exam patterns, and
            improving speed and accuracy.
          </p>

          {/* FEATURE PILLS */}
          <div
            className="
              mt-6
              flex
              flex-wrap
              gap-3
            "
          >
            <FeaturePill
              icon={FileQuestion}
              label="Previous Exams"
              iconClass="text-[#017cc0]"
            />

            <FeaturePill
              icon={Target}
              label="Smart Practice"
              iconClass="text-emerald-600"
            />

            <FeaturePill
              icon={BookOpenCheck}
              label={`${shortName} Focused`}
              iconClass="text-amber-600"
            />
          </div>

          <div className="mt-7">
            <Link
              href="#previous-question-list"
              className="
                inline-flex
                items-center
                gap-3
                rounded-[15px]
                bg-gradient-to-r
                from-[#164fa5]
                to-[#017cc0]
                px-5
                py-3.5
                text-[13px]
                font-extrabold
                text-white
                shadow-[0_12px_28px_rgba(22,79,165,0.24)]
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:shadow-[0_18px_34px_rgba(22,79,165,0.32)]
              "
            >
              Browse Questions

              <ArrowRight size={17} />
            </Link>
          </div>
        </div>

        {/* RIGHT VISUAL */}
        <div
          className="
            relative
            mx-auto
            w-full
            max-w-[500px]
          "
        >
          <div
            className="
              relative
              overflow-hidden
              rounded-[26px]
              border
              border-white/80
              bg-gradient-to-br
              from-[#0b216c]
              via-[#164fa5]
              to-[#017cc0]
              p-5
              shadow-[0_24px_60px_rgba(22,79,165,0.20)]
              sm:p-6
            "
          >
            <div
              aria-hidden="true"
              className="
                absolute
                inset-0
                opacity-[0.09]
                [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
                [background-size:28px_28px]
              "
            />

            <div className="relative z-10">
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                "
              >
                <div>
                  <p
                    className="
                      text-[11px]
                      font-bold
                      uppercase
                      tracking-[0.13em]
                      text-white/70
                    "
                  >
                    {shortName} Practice Zone
                  </p>

                  <h2
                    className="
                      mt-2
                      text-[24px]
                      font-black
                      leading-tight
                      text-white
                    "
                  >
                    Prepare with real exam patterns
                  </h2>
                </div>

                <div
                  className="
                    flex
                    h-14
                    w-14
                    shrink-0
                    items-center
                    justify-center
                    rounded-[18px]
                    bg-white/10
                    text-white
                    backdrop-blur
                  "
                >
                  <GraduationCap size={28} />
                </div>
              </div>

              <div
                className="
                  mt-6
                  grid
                  grid-cols-2
                  gap-3
                "
              >
                <PracticeCard
                  icon={FileQuestion}
                  title="PYQ"
                  text="Previous questions"
                />

                <PracticeCard
                  icon={Target}
                  title="Focus"
                  text="Improve accuracy"
                />
              </div>

              <div
                className="
                  mt-4
                  rounded-[18px]
                  border
                  border-amber-300/20
                  bg-gradient-to-r
                  from-amber-400/15
                  to-orange-400/10
                  p-4
                "
              >
                <p
                  className="
                    text-[12px]
                    font-bold
                    text-amber-100
                  "
                >
                  Practice • Review • Improve
                </p>

                <p
                  className="
                    mt-1
                    text-[11px]
                    leading-5
                    text-white/65
                  "
                >
                  Build familiarity with{" "}
                  {examName}{" "}
                  question patterns before your next exam.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   FEATURE PILL
========================================================= */

function FeaturePill({
  icon: Icon,
  label,
  iconClass,
}) {
  return (
    <div
      className="
        inline-flex
        items-center
        gap-2
        rounded-[14px]
        border
        border-[#d9e9f8]
        bg-white/90
        px-3.5
        py-2.5
        text-[12px]
        font-bold
        text-[#0b1f44]
        shadow-sm
      "
    >
      <Icon
        size={16}
        className={iconClass}
      />

      {label}
    </div>
  );
}

/* =========================================================
   PRACTICE CARD
========================================================= */

function PracticeCard({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div
      className="
        rounded-[18px]
        border
        border-white/10
        bg-white/10
        p-4
        backdrop-blur
      "
    >
      <Icon
        size={20}
        className="text-[#bde8ff]"
      />

      <p
        className="
          mt-3
          text-[20px]
          font-black
          text-white
        "
      >
        {title}
      </p>

      <p
        className="
          mt-1
          text-[11px]
          font-medium
          text-white/65
        "
      >
        {text}
      </p>
    </div>
  );
}