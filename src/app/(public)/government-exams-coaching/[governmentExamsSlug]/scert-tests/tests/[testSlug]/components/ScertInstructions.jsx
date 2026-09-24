import Link from "next/link";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileQuestion,
  ShieldCheck,
  Trophy,
} from "lucide-react";

export default function ScertInstructions({
  exam,
  instructions = [],
  testSlug,
  classId,
  examId,
}) {
  const totalQuestions =
    Number(
      exam?.total_questions
    ) || 0;

  const totalMarks =
    Number(
      exam?.total_mark
    ) || 0;

  const durationMinutes =
    Number(
      exam?.total_minutes
    ) || 90;

  const examName =
    exam?.exam_name ||
    "SCERT Practice Test";

  /* =========================================================
     ROUTES
  ========================================================= */

  const backHref =
    classId
      ? `/government-exams-coaching/kerala-psc/scert-tests/classes/${classId}`
      : "/government-exams-coaching/kerala-psc/scert-tests";

  const startHref = {
    pathname:
      `/government-exams-coaching/kerala-psc/scert-tests/tests/${testSlug}/start`,

    query: {
      classId:
        String(classId),

      examId:
        String(examId),
    },
  };

  return (
    <>
      {/* =====================================================
          BACK BUTTON
      ====================================================== */}

      <Link
        href={backHref}
        className="
          inline-flex
          items-center
          gap-2
          text-sm
          font-bold
          text-[#075fc8]
          transition-colors
          hover:text-[#071f55]
        "
      >
        <ArrowLeft
          size={17}
        />

        Back to Tests
      </Link>

      {/* =====================================================
          MAIN CARD
      ====================================================== */}

      <section
        className="
          mt-6
          overflow-hidden
          rounded-[28px]
          border
          border-[#dce8f7]
          bg-white
          shadow-[0_18px_50px_rgba(22,79,165,0.08)]
        "
      >
        {/* =================================================
            HERO
        ================================================= */}

        <div
          className="
            relative
            overflow-hidden
            bg-gradient-to-r
            from-[#071f55]
            via-[#075fc8]
            to-[#00a8df]
            px-6
            py-8
            text-white
            sm:px-9
            sm:py-10
          "
        >
          {/* GRID */}

          <div
            aria-hidden="true"
            className="
              absolute
              inset-0
              opacity-[0.07]
              [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
              [background-size:32px_32px]
            "
          />

          {/* GLOW */}

          <div
            aria-hidden="true"
            className="
              absolute
              -right-24
              -top-24
              h-72
              w-72
              rounded-full
              bg-white/10
              blur-3xl
            "
          />

          <div
            className="
              relative
              z-10
            "
          >
            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.16em]
                text-blue-100
              "
            >
              SCERT Practice Test
            </p>

            <h1
              className="
                mt-2
                max-w-3xl
                text-2xl
                font-black
                leading-tight
                sm:text-3xl
              "
            >
              {examName}
            </h1>

            {/* =============================================
                STATS
            ============================================= */}

            <div
              className="
                mt-6
                flex
                flex-wrap
                gap-3
              "
            >
              <Stat
                icon={
                  FileQuestion
                }
                value={
                  totalQuestions
                }
                label="Questions"
              />

              <Stat
                icon={
                  Trophy
                }
                value={
                  totalMarks
                }
                label="Marks"
              />

              <Stat
                icon={
                  Clock3
                }
                value={
                  durationMinutes
                }
                label="Minutes"
              />
            </div>
          </div>
        </div>

        {/* =================================================
            BODY
        ================================================= */}

        <div
          className="
            p-6
            sm:p-9
          "
        >
          {/* =============================================
              TITLE
          ============================================= */}

          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-[#eaf5ff]
                text-[#075fc8]
              "
            >
              <ShieldCheck
                size={21}
              />
            </div>

            <div>
              <h2
                className="
                  text-xl
                  font-black
                  text-[#071f55]
                "
              >
                Exam Instructions
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Please read the
                instructions carefully
                before starting.
              </p>
            </div>
          </div>

          {/* =============================================
              API INSTRUCTIONS
          ============================================= */}

          <div
            className="
              mt-6
              space-y-3
            "
          >
            {instructions.length >
            0 ? (
              instructions.map(
                (
                  item,
                  index
                ) => {
                  const text =
                    item?.instructions ||
                    item?.instruction ||
                    item?.title ||
                    "";

                  if (!text) {
                    return null;
                  }

                  return (
                    <Instruction
                      key={
                        item?.id ||
                        `${index}-${text}`
                      }
                    >
                      {text}
                    </Instruction>
                  );
                }
              )
            ) : (
              <>
                <Instruction>
                  The exam contains{" "}
                  {
                    totalQuestions
                  }{" "}
                  questions.
                </Instruction>

                <Instruction>
                  You will have{" "}
                  {
                    durationMinutes
                  }{" "}
                  minutes to complete
                  the exam.
                </Instruction>

                <Instruction>
                  Ten questions are
                  displayed on each
                  page.
                </Instruction>

                <Instruction>
                  You can move between
                  pages using the
                  pagination controls.
                </Instruction>

                <Instruction>
                  You can pause the exam
                  or finish it using the
                  controls provided.
                </Instruction>
              </>
            )}
          </div>

          {/* =============================================
              TIMER NOTICE
          ============================================= */}

          <div
            className="
              mt-6
              flex
              items-start
              gap-3
              rounded-xl
              border
              border-amber-200
              bg-amber-50
              p-4
            "
          >
            <AlertCircle
              size={19}
              className="
                mt-0.5
                shrink-0
                text-amber-600
              "
            />

            <p
              className="
                text-sm
                leading-6
                text-amber-800
              "
            >
              The{" "}
              {
                durationMinutes
              }
              -minute timer starts
              immediately after
              clicking Start Exam.
            </p>
          </div>

          {/* =============================================
              START EXAM
          ============================================= */}

          <div
            className="
              mt-7
              flex
              justify-end
            "
          >
            <Link
              href={
                startHref
              }
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-gradient-to-r
                from-[#071f55]
                via-[#075fc8]
                to-[#017dc0]
                px-7
                py-4
                text-sm
                font-bold
                text-white
                shadow-[0_12px_30px_rgba(7,95,200,0.24)]
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:shadow-[0_16px_36px_rgba(7,95,200,0.32)]
              "
            >
              Start Exam

              <ArrowRight
                size={18}
              />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* =========================================================
   INSTRUCTION ITEM
========================================================= */

function Instruction({
  children,
}) {
  return (
    <div
      className="
        flex
        items-start
        gap-3
        rounded-xl
        border
        border-slate-100
        bg-[#f7faff]
        p-4
      "
    >
      <CheckCircle2
        size={18}
        className="
          mt-0.5
          shrink-0
          text-[#017dc0]
        "
      />

      <p
        className="
          text-sm
          leading-7
          text-slate-600
        "
      >
        {children}
      </p>
    </div>
  );
}

/* =========================================================
   STAT
========================================================= */

function Stat({
  icon: Icon,
  value,
  label,
}) {
  return (
    <div
      className="
        flex
        min-w-[130px]
        items-center
        gap-3
        rounded-xl
        border
        border-white/10
        bg-white/10
        px-4
        py-3
        backdrop-blur
      "
    >
      <Icon
        size={18}
      />

      <div>
        <p className="font-black">
          {value}
        </p>

        <p
          className="
            text-[11px]
            text-blue-100
          "
        >
          {label}
        </p>
      </div>
    </div>
  );
}