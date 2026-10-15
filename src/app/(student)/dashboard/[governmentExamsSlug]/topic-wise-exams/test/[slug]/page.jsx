
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

import {
  ArrowRight,
  BookOpen,
  LockKeyhole,
  Play,
  RotateCcw,
} from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;

  return {
    title: `${formatSlug(slug)} Topic Wise Exams | MasterMind Academy`,
  };
}

function getAccess(test) {
  return String(test?.access ?? "")
    .trim()
    .toLowerCase();
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
    uid > 0
      ? getPausedAttemptIds(attemptsResult)
      : {};

  return (
    <main className="min-h-screen bg-[#f5f8ff] py-7">
      <div className="mx-auto max-w-[1450px] px-4 sm:px-6 lg:px-8">
        <Link
          href={root}
          className="inline-flex items-center gap-2 text-sm font-bold text-[#017dc0] hover:underline"
        >
          ← Back to Topics
        </Link>

        <section className="relative mt-5 overflow-hidden rounded-[30px] bg-gradient-to-br from-[#05176a] via-[#164fa5] to-[#017dc0] p-7 text-white shadow-xl sm:p-9">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

          <div className="relative">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-100">
              {config.name}
            </p>

            <h1 className="mt-3 text-2xl font-black sm:text-3xl">
              {selectedTopic.subject || formatSlug(slug)}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100">
              Select an exam to begin or resume your
              topic-wise practice.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold">
              <BookOpen size={17} />
              {tests.length} Available Exams
            </div>
          </div>
        </section>

        <div className="mb-6 mt-9 flex items-center justify-between">
          <h2 className="text-xl font-black text-[#071f55]">
            Available Exams
          </h2>
        </div>

        {!tests.length ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            No exams are currently available.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tests.map((test) => {
              const access = getAccess(test);
              const isFree = access === "free";

              const examSlug = createSlug(
                test.exam_name || String(test.id)
              );

              const pauseId = Number(
                pausedAttempts[String(test.id)]
              );

              const hasPausedAttempt =
                uid > 0 &&
                Number.isSafeInteger(pauseId) &&
                pauseId > 0;

              const detailsHref =
                `${root}/test/${slug}/${examSlug}`;

              const resumeHref =
                `${detailsHref}/start?` +
                new URLSearchParams({
                  mode: "resume",
                  pauseId: String(pauseId),
                }).toString();

              return (
                <article
                  key={test.id}
                  className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-[#dce8f5] bg-white p-5 shadow-[0_8px_30px_rgba(15,42,90,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isFree
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"
                        }`}
                    >
                      {isFree ? (
                        <BookOpen size={21} />
                      ) : (
                        <LockKeyhole size={21} />
                      )}
                    </div>

                    <span
                      className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${isFree
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                        }`}
                    >
                      {isFree
                        ? "Free"
                        : access === "paid"
                          ? "Premium"
                          : "Access Unavailable"}
                    </span>
                  </div>

                  <h3 className="mt-5 min-h-[56px] text-base font-black leading-7 text-[#071f55]">
                    {test.exam_name || "Topic Exam"}
                  </h3>

                  <div className="my-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-[#f4f8fd] p-4">
                      <p className="text-xs font-semibold text-slate-500">
                        Questions
                      </p>
                      <p className="mt-2 text-xl font-black text-[#071f55]">
                        {test.total_questions ?? 0}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#f4f8fd] p-4">
                      <p className="text-xs font-semibold text-slate-500">
                        Marks
                      </p>
                      <p className="mt-2 text-xl font-black text-[#071f55]">
                        {test.total_mark ?? 0}
                      </p>
                    </div>
                  </div>

                  {isFree ? (
                    <Link
                      href={
                        hasPausedAttempt
                          ? resumeHref
                          : detailsHref
                      }
                      className="mt-auto flex items-center justify-center gap-2 rounded-2xl bg-[#017dc0] px-5 py-3.5 text-sm font-black text-white transition hover:bg-[#164fa5]"
                    >
                      {hasPausedAttempt ? (
                        <>
                          <RotateCcw size={16} />
                          Resume Exam
                        </>
                      ) : (
                        <>
                          <Play size={16} />
                          View Exam
                          <ArrowRight size={16} />
                        </>
                      )}
                    </Link>
                  ) : (
                    <div className="mt-auto flex items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3.5 text-sm font-black text-amber-700">
                      <LockKeyhole size={16} />
                      {access === "paid"
                        ? "Premium Access Required"
                        : "Access Unavailable"}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
