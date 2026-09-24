import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  FileQuestion,
  Trophy,
} from "lucide-react";

import {
  getAllTopicWiseTests,
  getTopicWiseExams,
} from "@/lib/topicWiseExamHelper";

import {
  createSlug,
  formatSlug,
} from "@/lib/slugHelper";

import PremiumExamButton from "./components/PremiumExamButton";

export async function generateMetadata({
  params,
}) {
  const { slug } =
    await params;

  const title =
    formatSlug(slug);

  return {
    title:
      `${title} Topic Wise Exams | MasterMind Academy`,

    description:
      `Practice ${title} Kerala PSC topic-wise exams.`,
  };
}

export default async function TopicWiseTestListPage({
  params,
}) {
  const { slug } =
    await params;

  const uid = 0;
  const cid = 1;

  /* =======================================================
     RESOLVE TOPIC FROM SEO SLUG
  ======================================================= */

  const topicsResult =
    await getTopicWiseExams({
      uid,
      cid,
      type: "twe",
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

  const topicName =
    selectedTopic?.subject ||
    formatSlug(slug);

  /* =======================================================
     FETCH TESTS USING INTERNAL TOPIC ID
  ======================================================= */

  const result =
    await getAllTopicWiseTests({
      uid,
      topicId,
    });

  const tests =
    Array.isArray(
      result?.data
    )
      ? result.data
      : [];

  return (
    <main
      className="
        min-h-screen
        bg-[#f8fafc] mt-20
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-[1450px]
          px-4
          py-6
          sm:px-6
          lg:px-8
          lg:py-8
        "
      >
        <Link
          href="/government-exams-coaching/kerala-psc/topic-wise-exams"
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

          Back to Topics
        </Link>

        {/* HERO */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[28px]
            bg-gradient-to-r
            from-[#071f55]
            via-[#075fc8]
            to-[#017dc0]
            px-6
            py-8
            text-white
            sm:px-8
          "
        >
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

          <div className="relative z-10">
            <p
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[0.16em]
                text-blue-100
              "
            >
              Kerala PSC
            </p>

            <h1
              className="
                mt-2
                text-2xl
                font-black
                sm:text-3xl
              "
            >
              {topicName}
            </h1>

            <p
              className="
                mt-3
                text-sm
                text-blue-100
              "
            >
              Select an exam and start
              your topic-wise practice.
            </p>
          </div>
        </section>

        {/* HEADER */}

        <section className="mt-7">
          <div
            className="
              mb-5
              flex
              items-end
              justify-between
              gap-4
            "
          >
            <div>
              <p
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.14em]
                  text-[#017dc0]
                "
              >
                Practice Tests
              </p>

              <h2
                className="
                  mt-1
                  text-xl
                  font-black
                  text-[#071f55]
                "
              >
                Available Exams
              </h2>
            </div>

            <div
              className="
                rounded-full
                border
                border-slate-200
                bg-white
                px-4
                py-2
              "
            >
              <p className="text-xs font-bold text-slate-500">
                {tests.length} Exams
              </p>
            </div>
          </div>

          {!tests.length ? (
            <div
              className="
                rounded-[22px]
                border
                border-slate-200
                bg-white
                p-10
                text-center
              "
            >
              No exams available.
            </div>
          ) : (
            <div
              className="
                grid
                grid-cols-1
                gap-5
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
              "
            >
              {tests.map(
                (test) => {
                  const isPaid =
                    String(
                      test?.access ||
                        ""
                    ).toLowerCase() ===
                    "paid";

                  const examSlug =
                    createSlug(
                      test?.exam_name ||
                        `exam-${test.id}`
                    );

                  return (
                    <article
                      key={test.id}
                      className={`
                        group
                        flex
                        h-full
                        flex-col
                        rounded-[24px]
                        border
                        p-5

                        ${
                          isPaid
                            ? `
                              border-amber-200
                              bg-amber-50/60
                            `
                            : `
                              border-green-200
                              bg-green-50/60
                            `
                        }
                      `}
                    >
                      <div
                        className="
                          flex
                          items-start
                          justify-between
                        "
                      >
                        <div
                          className={`
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-[14px]
                            border

                            ${
                              isPaid
                                ? `
                                  border-amber-200
                                  bg-amber-100
                                  text-amber-600
                                `
                                : `
                                  border-green-200
                                  bg-green-100
                                  text-green-600
                                `
                            }
                          `}
                        >
                          <FileQuestion
                            size={21}
                          />
                        </div>

                        <span
                          className={`
                            rounded-full
                            border
                            px-3
                            py-1.5
                            text-[9px]
                            font-black
                            uppercase

                            ${
                              isPaid
                                ? `
                                  border-amber-200
                                  bg-amber-50
                                  text-amber-600
                                `
                                : `
                                  border-green-200
                                  bg-green-50
                                  text-green-600
                                `
                            }
                          `}
                        >
                          {isPaid
                            ? "Premium"
                            : "Free"}
                        </span>
                      </div>

                      <p
                        className={`
                          mt-5
                          text-[9px]
                          font-black
                          uppercase
                          tracking-[0.14em]

                          ${
                            isPaid
                              ? "text-amber-600"
                              : "text-green-600"
                          }
                        `}
                      >
                        {test?.subject ||
                          topicName}
                      </p>

                      <h3
                        className="
                          mt-2
                          text-[16px]
                          font-black
                          leading-6
                          text-[#071f55]
                        "
                      >
                        {test?.exam_name ||
                          "Topic Exam"}
                      </h3>

                      <div
                        className="
                          mt-5
                          grid
                          grid-cols-2
                          gap-3
                        "
                      >
                        <div
                          className="
                            rounded-[14px]
                            border
                            border-white
                            bg-white/70
                            p-3
                          "
                        >
                          <FileQuestion
                            size={15}
                          />

                          <p className="mt-2 text-[10px] text-slate-500">
                            Questions
                          </p>

                          <p className="text-sm font-black text-[#071f55]">
                            {test?.total_questions ??
                              0}
                          </p>
                        </div>

                        <div
                          className="
                            rounded-[14px]
                            border
                            border-white
                            bg-white/70
                            p-3
                          "
                        >
                          <Trophy size={15} />

                          <p className="mt-2 text-[10px] text-slate-500">
                            Marks
                          </p>

                          <p className="text-sm font-black text-[#071f55]">
                            {test?.total_mark ??
                              0}
                          </p>
                        </div>
                      </div>

                      {/* PREMIUM = MODAL */}

                      {isPaid ? (
                        <PremiumExamButton />
                      ) : (
                        /* FREE = SEO URL */

                        <Link
                          href={
                            `/government-exams-coaching/kerala-psc/topic-wise-exams/test/${slug}/${examSlug}`
                          }
                          className="
                            mt-auto
                            pt-6
                          "
                        >
                          <span
                            className="
                              inline-flex
                              w-full
                              items-center
                              justify-between
                              rounded-[13px]
                              border
                              border-green-200
                              bg-green-100
                              px-5
                              py-3.5
                              text-[11px]
                              font-bold
                              text-green-700
                            "
                          >
                            View Exam

                            <span
                              className="
                                flex
                                h-7
                                w-7
                                items-center
                                justify-center
                                rounded-full
                                bg-green-200/60
                              "
                            >
                              <ArrowRight
                                size={14}
                              />
                            </span>
                          </span>
                        </Link>
                      )}
                    </article>
                  );
                }
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}