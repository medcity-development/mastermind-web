import Link from "next/link";

import {
  ArrowLeft,
  BookOpen,
  Clock3,
  FileQuestion,
  Target,
} from "lucide-react";

export default function ExamHero({
  exam,
}) {
  if (!exam) {
    return null;
  }

  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[24px]
        bg-gradient-to-r
        from-[#071936]
        via-[#0b4ca8]
        to-[#017cc0]
        px-5
        py-6
        text-white
        sm:px-7
        lg:px-8
        lg:py-7 mt-20
      "
    >
      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          opacity-[0.07]
          [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
          [background-size:34px_34px]
        "
      />

      <div
        aria-hidden="true"
        className="
          absolute
          -right-20
          -top-20
          h-64
          w-64
          rounded-full
          bg-white/10
          blur-2xl
        "
      />

      <div className="relative z-10">
        <Link
          href="/government-exams-coaching/kerala-psc/previous-questions"
          className="
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-white/15
            bg-white/10
            px-3
            py-2
            text-[11px]
            font-bold
            text-white
            backdrop-blur-sm
            transition
            hover:bg-white/15
          "
        >
          <ArrowLeft
            size={14}
          />

          Previous Questions
        </Link>

        <div
          className="
            mt-5
            flex
            items-start
            gap-4
          "
        >
          <div
            className="
              hidden
              h-14
              w-14
              shrink-0
              items-center
              justify-center
              rounded-[16px]
              border
              border-white/15
              bg-white/10
              sm:flex
            "
          >
            <FileQuestion
              size={25}
            />
          </div>

          <div>
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-blue-100
              "
            >
              Kerala PSC Previous
              Question Paper
            </p>

            <h1
              className="
                mt-2
                max-w-[1000px]
                text-[21px]
                font-extrabold
                leading-[1.45]
                sm:text-[25px]
                lg:text-[28px]
              "
            >
              {exam.exam_name}
            </h1>

            {exam.qpcode && (
              <p
                className="
                  mt-2
                  text-[12px]
                  font-medium
                  text-blue-100
                "
              >
                Question Paper
                Code:{" "}
                {exam.qpcode}
              </p>
            )}
          </div>
        </div>

        <div
          className="
            mt-6
            grid
            grid-cols-2
            gap-3
            sm:flex
            sm:flex-wrap
          "
        >
          <StatItem
            icon={BookOpen}
            label="Questions"
            value={
              exam.total_questions
            }
          />

          <StatItem
            icon={Target}
            label="Marks"
            value={
              exam.total_mark
            }
          />

          <StatItem
            icon={Clock3}
            label="Duration"
            value={
              exam.total_minutes
                ? `${exam.total_minutes} min`
                : null
            }
          />

          <StatItem
            icon={FileQuestion}
            label="Type"
            value={
              exam.type
                ? String(
                    exam.type
                  ).toUpperCase()
                : "PQP"
            }
          />
        </div>
      </div>
    </section>
  );
}

function StatItem({
  icon: Icon,
  label,
  value,
}) {
  if (
    value == null ||
    value === ""
  ) {
    return null;
  }

  return (
    <div
      className="
        flex
        items-center
        gap-3
        rounded-[14px]
        border
        border-white/15
        bg-white/10
        px-3.5
        py-3
        backdrop-blur-sm
        sm:min-w-[145px]
      "
    >
      <div
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-[10px]
          bg-white/10
        "
      >
        <Icon size={16} />
      </div>

      <div>
        <p
          className="
            text-[9px]
            font-semibold
            uppercase
            tracking-[0.08em]
            text-blue-100
          "
        >
          {label}
        </p>

        <p
          className="
            mt-0.5
            text-[14px]
            font-extrabold
            text-white
          "
        >
          {value}
        </p>
      </div>
    </div>
  );
}