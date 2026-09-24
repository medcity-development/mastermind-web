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
  getAllTopicWiseTests,
  getTopicWiseExamDetails,
  getTopicWiseExams,
} from "@/lib/topicWiseExamHelper";

import {
  createSlug,
  formatSlug,
} from "@/lib/slugHelper";

export async function generateMetadata({
  params,
}) {
  const {
    examSlug,
  } = await params;

  const title =
    formatSlug(
      examSlug
    );

  return {
    title:
      `${title} | MasterMind Academy`,

    description:
      `Practice ${title} for Kerala PSC preparation.`,
  };
}

export default async function TopicWiseExamDetailsPage({
  params,
}) {
  const {
    slug,
    examSlug,
  } = await params;

  const uid = 0;
  const cid = 1;
  const type = "twe";

  /* =======================================================
     RESOLVE TOPIC
  ======================================================= */

  const topicsResult =
    await getTopicWiseExams({
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
        ) === slug
    );

  if (!selectedTopic) {
    notFound();
  }

  const topicId =
    selectedTopic.id;

  /* =======================================================
     RESOLVE EXAM
  ======================================================= */

  const testsResult =
    await getAllTopicWiseTests({
      uid,
      topicId,
    });

  const tests =
    Array.isArray(
      testsResult?.data
    )
      ? testsResult.data
      : [];

  const selectedExam =
    tests.find(
      (item) =>
        createSlug(
          item?.exam_name
        ) === examSlug
    );

  if (!selectedExam) {
    notFound();
  }

  /*
    Prevent direct URL access
    to premium exams for guest users.
  */

  const isPaid =
    String(
      selectedExam?.access ||
        ""
    ).toLowerCase() ===
    "paid";

  if (isPaid) {
    redirect("/login");
  }

  const examId =
    selectedExam.id;

  /* =======================================================
     DETAILS
  ======================================================= */

  const result =
    await getTopicWiseExamDetails({
      uid,
      cid,
      examId,
      type,
      offset: 0,
    });

  const exam =
    result?.exam;

  const instructions =
    Array.isArray(
      result?.instructions
    )
      ? result.instructions
      : [];

  if (
    !result?.status ||
    !exam
  ) {
    notFound();
  }

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
          py-6
          sm:px-6
          lg:px-8
          lg:py-10
        "
      >
        <Link
          href={
            `/government-exams-coaching/kerala-psc/topic-wise-exams/test/${slug}`
          }
          className="
            mb-5
            inline-flex
            items-center
            gap-2
            text-sm
            font-bold
            text-[#075fc8]
          "
        >
          <ArrowLeft size={16} />

          Back to Exams
        </Link>

        {/* HERO */}

        <section
          className="
            rounded-[28px]
            bg-gradient-to-r
            from-[#071f55]
            via-[#075fc8]
            to-[#017dc0]
            p-6
            text-white
            sm:p-8 mt-15
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
            Kerala PSC Topic Wise Exam
          </p>

          <h1
            className="
              mt-2
              text-2xl
              font-black
              sm:text-3xl
            "
          >
            {exam.exam_name}
          </h1>

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
              icon={FileQuestion}
              label="Questions"
              value={
                exam.total_questions
              }
            />

            <ExamStat
              icon={Trophy}
              label="Marks"
              value={
                exam.total_mark
              }
            />

            <ExamStat
              icon={Clock3}
              label="Duration"
              value={
                `${exam.total_minutes || 0} Minutes`
              }
            />
          </div>
        </section>

        {/* INSTRUCTIONS */}

        <section
          className="
            mt-6
            rounded-[24px]
            border
            border-[#dce8f7]
            bg-white
            p-6
            sm:p-8
          "
        >
          <p
            className="
              text-[10px]
              font-black
              uppercase
              tracking-[0.14em]
              text-[#017dc0]
            "
          >
            Before you begin
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

          <div className="mt-6 space-y-4">
            {instructions.map(
              (
                item,
                index
              ) => (
                <div
                  key={index}
                  className="
                    flex
                    gap-4
                    rounded-[16px]
                    bg-[#f5f9ff]
                    p-4
                  "
                >
                  <div
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
                    {index + 1}
                  </div>

                  <p
                    className="
                      text-sm
                      leading-7
                      text-slate-600
                    "
                  >
                    {item?.instructions}
                  </p>
                </div>
              )
            )}
          </div>

          <div
            className="
              mt-8
              flex
              justify-end
            "
          >
            <Link
              href={
                `/government-exams-coaching/kerala-psc/topic-wise-exams/test/${slug}/${examSlug}/start`
              }
              className="
                inline-flex
                items-center
                gap-2
                rounded-[14px]
                bg-gradient-to-r
                from-[#071f55]
                via-[#075fc8]
                to-[#017dc0]
                px-7
                py-4
                text-sm
                font-bold
                text-white
              "
            >
              Start Exam

              <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function ExamStat({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div
      className="
        rounded-[16px]
        bg-white/10
        p-4
      "
    >
      <Icon size={18} />

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