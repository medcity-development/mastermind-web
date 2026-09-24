import Link from "next/link";

import {
  notFound,
  redirect,
} from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  FileQuestion,
  Trophy,
} from "lucide-react";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import {
  getStatementTypeTopics,
  getStatementTypeExamsByTopic,
  getStatementTypeExamDetails,
} from "@/lib/statementTypeExamHelper";

import {
  createSlug,
} from "@/lib/slugHelper";

/* =========================================================
   FORMAT SLUG
========================================================= */

function formatSlug(
  value = ""
) {
  return String(value)
    .split("-")
    .filter(Boolean)
    .map(
      (word) =>
        word
          .charAt(0)
          .toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  params,
}) {
  const {
    governmentExamsSlug,
    statementTypeSlug,
    examSlug,
  } = await params;

  const config =
    getGovernmentExamConfig(
      governmentExamsSlug
    );

  if (!config) {
    return {};
  }

  const examName =
    formatSlug(
      examSlug
    );

  const topicName =
    formatSlug(
      statementTypeSlug
    );

  const canonical =
    `/government-exams-coaching/${governmentExamsSlug}/statement-type-exams/${statementTypeSlug}/${examSlug}`;

  return {
    title:
      `${examName} | ${config.name} Statement Type Exam | MasterMind Academy`,

    description:
      `Practice ${examName} from ${topicName} for ${config.name}.`,

    alternates: {
      canonical,
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function StatementTypeExamDetailsPage({
  params,
}) {
  const {
    governmentExamsSlug,
    statementTypeSlug,
    examSlug,
  } = await params;

  /* =======================================================
     MAIN COURSE CONFIG
  ======================================================= */

  const config =
    getGovernmentExamConfig(
      governmentExamsSlug
    );

  if (!config) {
    notFound();
  }

  const {
    cid,
    name,
    shortName,
  } = config;

  const uid = 0;

  const type =
    "tst";

  /* =======================================================
     BASE PATHS
  ======================================================= */

  const statementBasePath =
    `/government-exams-coaching/${governmentExamsSlug}/statement-type-exams`;

  const topicPath =
    `${statementBasePath}/${statementTypeSlug}`;

  const examPath =
    `${topicPath}/${examSlug}`;

  /* =======================================================
     RESOLVE TOPIC
  ======================================================= */

  const topicsResult =
    await getStatementTypeTopics({
      uid,
      cid,
      type,
    });

  const topics =
    Array.isArray(
      topicsResult?.data
    )
      ? topicsResult.data
      : [];

  const selectedTopic =
    topics.find(
      (item) =>
        createSlug(
          item?.subject
        ) ===
        statementTypeSlug
    );

  if (!selectedTopic) {
    console.error(
      "Statement topic not found:",
      {
        cid,
        statementTypeSlug,
      }
    );

    notFound();
  }

  const topicId =
    selectedTopic.id;

  /* =======================================================
     RESOLVE EXAM

     IMPORTANT:
     cid MUST be passed here.
  ======================================================= */

  const examsResult =
    await getStatementTypeExamsByTopic({
      uid,
      cid,
      topicId,
      type,
    });

  const exams =
    Array.isArray(
      examsResult?.data
    )
      ? examsResult.data
      : [];

  const selectedExam =
    exams.find(
      (item) =>
        createSlug(
          item?.exam_name
        ) ===
        examSlug
    );

  if (!selectedExam) {
    console.error(
      "Statement exam not found:",
      {
        cid,
        topicId,
        examSlug,
        examCount:
          exams.length,
      }
    );

    notFound();
  }

  /* =======================================================
     PREMIUM
  ======================================================= */

  const isPaid =
    String(
      selectedExam?.access ??
        ""
    ).toLowerCase() ===
    "paid";

  if (isPaid) {
    redirect("/login");
  }

  const examId =
    selectedExam.id;

  /* =======================================================
     EXAM DETAILS
  ======================================================= */

  const detailsResult =
    await getStatementTypeExamDetails({
      uid,
      cid,
      examId,
      type,
      offset: 0,
    });

  const exam =
    detailsResult?.exam ??
    null;

  const instructions =
    Array.isArray(
      detailsResult?.instructions
    )
      ? detailsResult.instructions
      : [];

  if (
    !detailsResult?.status ||
    !exam
  ) {
    console.error(
      "Statement exam details failed:",
      {
        cid,
        topicId,
        examId,
        type,
        detailsResult,
      }
    );

    notFound();
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main
      className="
        min-h-screen
        bg-[#f5f9ff]
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-[1200px]
          px-4
          py-8
          sm:px-6
          lg:px-8
        "
      >
        {/* ===============================================
            BACK
        ================================================ */}

        <Link
          href={topicPath}
          className="
            mb-5
            mt-20
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
            size={16}
          />

          Back to Exams
        </Link>

        {/* ===============================================
            HERO
        ================================================ */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[28px]
            bg-gradient-to-r
            from-[#071f55]
            via-[#075fc8]
            to-[#7c3aed]
            p-6
            text-white
            sm:p-8
          "
        >
          {/* GRID */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-0
              opacity-[0.06]
              [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
              [background-size:34px_34px]
            "
          />

          {/* GLOW */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -right-20
              -top-20
              h-60
              w-60
              rounded-full
              bg-violet-400/20
              blur-[90px]
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
                text-[10px]
                font-black
                uppercase
                tracking-[0.16em]
                text-blue-100
              "
            >
              {name} Statement Type
            </p>

            <h1
              className="
                mt-2
                text-2xl
                font-black
                sm:text-3xl
              "
            >
              {
                exam?.exam_name ||
                selectedExam?.exam_name
              }
            </h1>

            {selectedTopic?.subject && (
              <p
                className="
                  mt-2
                  text-sm
                  font-semibold
                  text-blue-100
                "
              >
                {
                  selectedTopic.subject
                }
              </p>
            )}

            <div
              className="
                mt-6
                grid
                grid-cols-1
                gap-3
                sm:grid-cols-3
              "
            >
              <ExamStat
                icon={
                  FileQuestion
                }
                label="Questions"
                value={
                  exam?.total_questions ??
                  selectedExam?.total_questions ??
                  0
                }
              />

              <ExamStat
                icon={Trophy}
                label="Marks"
                value={
                  exam?.total_mark ??
                  selectedExam?.total_mark ??
                  0
                }
              />

              <ExamStat
                icon={Clock3}
                label="Duration"
                value={`${
                  exam?.total_minutes ??
                  selectedExam?.total_minutes ??
                  0
                } Minutes`}
              />
            </div>
          </div>
        </section>

        {/* ===============================================
            INSTRUCTIONS
        ================================================ */}

        <section
          className="
            mt-6
            rounded-[24px]
            border
            border-slate-200
            bg-white
            p-6
            shadow-[0_10px_30px_rgba(15,23,42,0.04)]
            sm:p-8
          "
        >
          <p
            className="
              text-[10px]
              font-black
              uppercase
              tracking-[0.14em]
              text-pink-500
            "
          >
            Before You Begin
          </p>

          <h2
            className="
              mt-2
              text-xl
              font-black
              text-[#071f55]
            "
          >
            Exam Instructions
          </h2>

          {instructions.length >
          0 ? (
            <div
              className="
                mt-6
                space-y-4
              "
            >
              {instructions.map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={
                      item?.id ??
                      index
                    }
                    className="
                      flex
                      items-start
                      gap-4
                      rounded-[16px]
                      bg-[#f5f9ff]
                      p-4
                    "
                  >
                    <span
                      className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-[#075fc8]
                        text-xs
                        font-black
                        text-white
                      "
                    >
                      {
                        index +
                        1
                      }
                    </span>

                    <p
                      className="
                        text-sm
                        leading-7
                        text-slate-600
                      "
                    >
                      {
                        item?.instructions ??
                        item?.instruction ??
                        ""
                      }
                    </p>
                  </div>
                )
              )}
            </div>
          ) : (
            <div
              className="
                mt-6
                rounded-[16px]
                bg-[#f5f9ff]
                p-5
              "
            >
              <p
                className="
                  text-sm
                  leading-7
                  text-slate-500
                "
              >
                Read each question
                carefully and complete
                the exam within the
                allotted time.
              </p>
            </div>
          )}

          {/* =============================================
              START
          ============================================== */}

          <div
            className="
              mt-8
              flex
              justify-end
            "
          >
            <Link
              href={`${examPath}/start`}
              className="
                inline-flex
                items-center
                gap-2
                rounded-[14px]
                bg-gradient-to-r
                from-[#075fc8]
                via-[#6366f1]
                to-[#7c3aed]
                px-7
                py-4
                text-sm
                font-bold
                text-white
                shadow-[0_10px_25px_rgba(99,102,241,0.22)]
                transition-all
                duration-300
                hover:-translate-y-0.5
              "
            >
              Start Exam

              <ArrowRight
                size={17}
              />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   STAT
========================================================= */

function ExamStat({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div
      className="
        rounded-[16px]
        border
        border-white/10
        bg-white/10
        p-4
        backdrop-blur-sm
      "
    >
      <Icon
        size={18}
      />

      <p
        className="
          mt-2
          text-xs
          text-blue-100
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          text-lg
          font-black
        "
      >
        {value}
      </p>
    </div>
  );
}