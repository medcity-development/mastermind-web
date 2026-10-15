import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getAllTopicWiseTests,
  getTopicWiseExams,
} from "@/lib/topicWiseExamHelper";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import {
  getUserExamsList,
} from "@/lib/examAttemptHelper";

import {
  getPausedAttemptIds,
} from "@/lib/pausedExamAttempts";

import {
  createSlug,
  formatSlug,
} from "@/lib/pscSlug";

import PremiumExamButton from "./components/PremiumExamButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;

  return {
    title:
      `${formatSlug(slug)} Topic Wise Exams | MasterMind Academy`,
  };
}

export default async function TopicWiseTestListPage({
  params,
}) {
  const {
    slug,
    governmentExamsSlug,
  } = await params;

  const config = getGovernmentExamConfig(
    governmentExamsSlug
  );

  if (!config) notFound();

  const session = await getStudentSession();

  const uid = Number(session?.uid) || 0;
  const cid = Number(config.cid);

  const root =
    `${uid > 0 ? "/dashboard" : "/government-exams-coaching"}` +
    `/${governmentExamsSlug}/topic-wise-exams`;

  const topicsResult = await getTopicWiseExams({
    uid,
    cid,
    type: "twe",
  });

  const selectedTopic = (
    topicsResult?.data || []
  ).find(
    (item) => createSlug(item.subject) === slug
  );

  if (!selectedTopic) notFound();

  const [result, attemptsResult] = await Promise.all([
    getAllTopicWiseTests({
      uid,
      topicId: selectedTopic.id,
    }),

    uid > 0
      ? getUserExamsList({
        uid,
        exam_type: "twe",
      })
      : Promise.resolve({
        status: true,
        details: [],
        data: [],
      }),
  ]);

  const tests = Array.isArray(result?.data)
    ? result.data
    : [];

  const pausedAttempts = uid > 0
    ? getPausedAttemptIds(attemptsResult)
    : {};

  return (
    <main className="min-h-screen bg-[#f8fafc] py-6">
      <div className="mx-auto max-w-[1450px] px-4 sm:px-6 lg:px-8">
        <Link
          href={root}
          className="font-bold text-blue-700"
        >
          ← Back to Topics
        </Link>

        <section className="mt-5 rounded-3xl bg-gradient-to-r from-[#071f55] to-[#017dc0] p-7 text-white">
          <p className="text-xs font-bold uppercase tracking-widest">
            {config.name}
          </p>

          <h1 className="mt-2 text-3xl font-black">
            {selectedTopic.subject || formatSlug(slug)}
          </h1>

          <p className="mt-3 text-sm text-blue-100">
            Select an exam to begin your topic-wise practice.
          </p>
        </section>

        <h2 className="my-6 text-xl font-black text-[#071f55]">
          Available Exams · {tests.length}
        </h2>

        {!tests.length && (
          <p className="rounded-2xl border bg-white p-10 text-center">
            No exams available.
          </p>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tests.map((test) => {
            const paid =
              String(test.access || "").toLowerCase() ===
              "paid";

            const examSlug = createSlug(test.exam_name);

            const pauseId =
              pausedAttempts[String(test.id)];

            const detailsHref =
              `${root}/test/${slug}/${examSlug}`;

            const resumeHref =
              `${detailsHref}/start?` +
              new URLSearchParams({
                mode: "resume",
                pauseId: String(pauseId),
              });

            return (
              <article
                key={test.id}
                className={`flex flex-col rounded-3xl border p-5 ${paid
                    ? "border-amber-200 bg-amber-50"
                    : "border-green-200 bg-green-50"
                  }`}
              >
                <p className="text-xs font-black uppercase text-slate-500">
                  {paid ? "Premium" : "Free"}
                </p>

                <h3 className="mt-3 text-lg font-black text-[#071f55]">
                  {test.exam_name || "Topic Exam"}
                </h3>

                <div className="my-5 grid grid-cols-2 gap-3">
                  <p className="rounded-xl bg-white p-3 text-sm">
                    Questions
                    <br />
                    <strong>
                      {test.total_questions ?? 0}
                    </strong>
                  </p>

                  <p className="rounded-xl bg-white p-3 text-sm">
                    Marks
                    <br />
                    <strong>
                      {test.total_mark ?? 0}
                    </strong>
                  </p>
                </div>

                {paid && !pauseId ? (
                  <PremiumExamButton
                    governmentExamsSlug={governmentExamsSlug}
                  />
                ) : (
                  <Link
                    href={
                      pauseId
                        ? resumeHref
                        : detailsHref
                    }
                    className="mt-auto rounded-xl bg-[#017dc0] px-5 py-3 text-center text-sm font-bold text-white"
                  >
                    {pauseId
                      ? "Resume Exam"
                      : "View Exam"}
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}