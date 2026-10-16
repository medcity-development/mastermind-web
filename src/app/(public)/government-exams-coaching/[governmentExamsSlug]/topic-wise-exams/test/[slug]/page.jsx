
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getAllTopicWiseTests,
  getTopicWiseExams,
} from "@/lib/topicWiseExamHelper";
import { getGovernmentExamConfig } from "@/lib/governmentExamConfig";
import { getStudentSession } from "@/lib/auth/getStudentSession";
import { getUserExamsList } from "@/lib/examAttemptHelper";
import { getPausedAttemptIds } from "@/lib/pausedExamAttempts";
import { createSlug, formatSlug } from "@/lib/pscSlug";

import PremiumExamButton from "./components/PremiumExamButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return {
    title: `${formatSlug(slug)} Topic Wise Exams | MasterMind Academy`,
  };
}

function getAccess(test) {
  return String(test?.access ?? "").trim().toLowerCase();
}

export default async function TopicWiseTestListPage({ params }) {
  const { slug, governmentExamsSlug } = await params;

  const config = getGovernmentExamConfig(governmentExamsSlug);
  if (!config) notFound();

  const session = await getStudentSession();
  const uid = Number(session?.uid) || 0;
  const cid = Number(config.cid);

  const root =
    `/government-exams-coaching/${governmentExamsSlug}/topic-wise-exams`;

  const topicsResult = await getTopicWiseExams({
    uid,
    cid,
    type: "twe",
  });

  const topics = Array.isArray(topicsResult?.data)
    ? topicsResult.data
    : [];

  const selectedTopic = topics.find(
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

  const pausedAttempts =
    uid > 0 && attemptsResult?.status !== false
      ? getPausedAttemptIds(attemptsResult)
      : {};

  return (
    <main className="min-h-screen bg-[#f8fafc] py-6">
      <div className="mx-auto max-w-[1450px] px-4 sm:px-6 lg:px-8">
        <Link href={root} className="font-bold text-blue-700">
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
            const access = getAccess(test);
            const isFree = access === "free";
            const isPaid = access === "paid";

            const examId = Number(test.id);
            const validId =
              Number.isSafeInteger(examId) && examId > 0;

            const pauseId = Number(
              pausedAttempts[String(test.id)]
            );
            const hasPausedAttempt =
              uid > 0 &&
              Number.isSafeInteger(pauseId) &&
              pauseId > 0;

            // Use the backend exam ID, not the exam-name slug.
            const detailsHref =
              `${root}/test/${slug}/${test.id}`;

            const resumeHref =
              `${detailsHref}/start?` +
              new URLSearchParams({
                mode: "resume",
                pauseId: String(pauseId),
              }).toString();

            return (
              <article
                key={test.id}
                className={`flex flex-col rounded-3xl border p-5 ${isFree
                    ? "border-green-200 bg-green-50"
                    : "border-amber-200 bg-amber-50"
                  }`}
              >
                <p className="text-xs font-black uppercase text-slate-500">
                  {isFree
                    ? "Free"
                    : isPaid
                      ? "Premium"
                      : "Access Unavailable"}
                </p>

                <h3 className="mt-3 text-lg font-black text-[#071f55]">
                  {test.exam_name || "Topic Exam"}
                </h3>

                <div className="my-5 grid grid-cols-2 gap-3">
                  <p className="rounded-xl bg-white p-3 text-sm">
                    Questions
                    <br />
                    <strong>{test.total_questions ?? 0}</strong>
                  </p>
                  <p className="rounded-xl bg-white p-3 text-sm">
                    Marks
                    <br />
                    <strong>{test.total_mark ?? 0}</strong>
                  </p>
                </div>

                {validId && (isFree || hasPausedAttempt) ? (
                  <Link
                    href={hasPausedAttempt ? resumeHref : detailsHref}
                    className="mt-auto rounded-xl bg-[#017dc0] px-5 py-3 text-center text-sm font-bold text-white"
                  >
                    {hasPausedAttempt ? "Resume Exam" : "View Exam"}
                  </Link>
                ) : isPaid ? (
                  <PremiumExamButton
                    governmentExamsSlug={governmentExamsSlug}
                  />
                ) : (
                  <p className="mt-auto rounded-xl bg-slate-100 px-5 py-3 text-center text-sm font-bold text-slate-500">
                    Access Unavailable
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
