
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

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({ params }) {
  const { slug } = await params;

  return {
    title: `${formatSlug(slug)} Topic Wise Exams | MasterMind Academy`,
  };
}

/* =========================================================
   HELPERS
========================================================= */

function positiveId(value) {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isSafeInteger(number) && number > 0
    ? number
    : null;
}

function getAccess(test) {
  return String(test?.access ?? "")
    .trim()
    .toLowerCase();
}

/* =========================================================
   PAGE
========================================================= */

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

  if (!config) {
    notFound();
  }

  const session = await getStudentSession();

  const uid = positiveId(session?.uid) || 0;
  const cid = positiveId(config.cid);

  if (!cid) {
    notFound();
  }

  const root =
    `${uid > 0 ? "/dashboard" : "/government-exams-coaching"}` +
    `/${governmentExamsSlug}/topic-wise-exams`;

  /* =======================================================
     LOAD TOPICS
  ======================================================= */

  const topicsResult = await getTopicWiseExams({
    uid,
    cid,
    type: "twe",
  });

  const topics = Array.isArray(topicsResult?.data)
    ? topicsResult.data
    : [];

  const selectedTopic = topics.find(
    (item) =>
      createSlug(item.subject || "") === slug
  );

  if (!selectedTopic) {
    notFound();
  }

  /* =======================================================
     LOAD EXAMS AND SAVED ATTEMPTS
  ======================================================= */

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
    <main className="min-h-screen bg-[#f5f8ff] py-7">
      <div className="mx-auto max-w-[1450px] px-4 sm:px-6 lg:px-8">

        {/* BACK LINK */}

        <Link
          href={root}
          className="inline-flex items-center gap-2 text-sm font-bold text-[#017dc0] hover:underline"
        >
          ← Back to Topics
        </Link>

        {/* HERO */}

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

        {/* SECTION TITLE */}

        <div className="mb-6 mt-9 flex items-center justify-between">
          <h2 className="text-xl font-black text-[#071f55]">
            Available Exams
          </h2>
        </div>

        {/* EMPTY STATE */}

        {!tests.length ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            No exams are currently available.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tests.map((test, index) => {
              const examId = positiveId(test.id);

              const access = getAccess(test);

              const isFree = access === "free";

              const isPaid = access === "paid";

              /* ===========================================
                 USE ACTUAL BACKEND EXAM ID
              =========================================== */

              const examSlug = examId
                ? String(examId)
                : null;

              /* ===========================================
                 SAVED ATTEMPT
              =========================================== */

              const pauseId = examId
                ? positiveId(
                  pausedAttempts[String(examId)]
                )
                : null;

              const hasPausedAttempt =
                uid > 0 &&
                isFree &&
                Boolean(pauseId);

              /* ===========================================
                 NAVIGATION
              =========================================== */

              const detailsHref = examSlug
                ? `${root}/test/${slug}/${examSlug}`
                : null;

              const resumeHref =
                detailsHref && hasPausedAttempt
                  ? `${detailsHref}/start?${new URLSearchParams({
                    mode: "resume",
                    pauseId: String(pauseId),
                  }).toString()}`
                  : null;

              const destination =
                hasPausedAttempt
                  ? resumeHref
                  : detailsHref;

              return (
                <article
                  key={examId ?? `exam-${index}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-[#dce8f5] bg-white p-5 shadow-[0_8px_30px_rgba(15,42,90,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >

                  {/* ACCESS BADGE */}

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
                        : isPaid
                          ? "Premium"
                          : "Access Unavailable"}
                    </span>
                  </div>

                  {/* EXAM NAME */}

                  <h3 className="mt-5 min-h-[56px] text-base font-black leading-7 text-[#071f55]">
                    {test.exam_name || "Topic Exam"}
                  </h3>

                  {/* EXAM STATS */}

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

                  {/* ACTION */}

                  {isFree && destination ? (
                    <Link
                      href={destination}
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

                      {isPaid
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
