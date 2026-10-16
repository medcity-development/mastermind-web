
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  getAllTopicWiseTests,
  getTopicWiseExamDetails,
  getTopicWiseExams,
} from "@/lib/topicWiseExamHelper";

import { getGovernmentExamConfig } from "@/lib/governmentExamConfig";
import { getStudentSession } from "@/lib/auth/getStudentSession";
import { createSlug, formatSlug } from "@/lib/pscSlug";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { examSlug } = await params;

  return {
    title: `${formatSlug(examSlug)} | MasterMind Academy`,
  };
}

function positiveId(value) {
  if (value == null || String(value).trim() === "") {
    return null;
  }

  const number = Number(value);

  return Number.isSafeInteger(number) && number > 0
    ? number
    : null;
}

function MessagePage({ title, message, href }) {
  return (
    <main className="min-h-screen bg-[#f5f9ff] p-6">
      <div className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-white p-8">
        <h1 className="text-xl font-black text-[#071f55]">
          {title}
        </h1>

        <p className="mt-3 text-slate-600">
          {message}
        </p>

        <Link
          href={href}
          className="mt-6 inline-block rounded-xl bg-[#017dc0] px-6 py-3 font-bold text-white"
        >
          Back to Exams
        </Link>
      </div>
    </main>
  );
}

export default async function TopicWiseExamDetailsPage({
  params,
}) {
  const {
    slug,
    examSlug,
    governmentExamsSlug,
  } = await params;

  const config = getGovernmentExamConfig(
    governmentExamsSlug
  );

  if (!config) notFound();

  const session = await getStudentSession();

  const uid = positiveId(session?.uid) || 0;
  const cid = positiveId(config.cid);

  if (!cid) notFound();

  const root =
    `/dashboard/${governmentExamsSlug}/topic-wise-exams`;

  const listHref = `${root}/test/${slug}`;

  const topicsResult = await getTopicWiseExams({
    uid,
    cid,
    type: "twe",
  });

  const topics = Array.isArray(topicsResult?.data)
    ? topicsResult.data
    : [];

  const topic = topics.find(
    (item) => createSlug(item.subject) === slug
  );

  if (!topic) notFound();

  const testsResult = await getAllTopicWiseTests({
    uid,
    topicId: topic.id,
  });

  const tests = Array.isArray(testsResult?.data)
    ? testsResult.data
    : [];

  const requestedId = positiveId(examSlug);

  const selected = requestedId
    ? tests.find(
      (item) => positiveId(item.id) === requestedId
    )
    : tests.find(
      (item) =>
        createSlug(item.exam_name || "") === examSlug
    );

  if (!selected) notFound();

  const examId = positiveId(selected.id);

  if (!examId) notFound();

  const canonicalHref =
    `${root}/test/${slug}/${examId}`;

  if (String(examSlug) !== String(examId)) {
    redirect(canonicalHref);
  }

  const access = String(selected.access ?? "")
    .trim()
    .toLowerCase();

  console.log("TOPIC WISE SELECTED EXAM:", {
    requestedSlug: examSlug,
    examId,
    examName: selected.exam_name,
    access,
  });

  if (access !== "free") {
    return (
      <MessagePage
        title={
          access === "paid"
            ? "Premium Exam"
            : "Exam Access Unavailable"
        }
        message={
          access === "paid"
            ? "This exam requires premium access."
            : "Unable to verify access to this exam."
        }
        href={listHref}
      />
    );
  }

  const result = await getTopicWiseExamDetails({
    uid,
    cid,
    examId,
    type: "twe",
    offset: 0,
  });

  if (!result?.exam) {
    return (
      <MessagePage
        title="Exam Unavailable"
        message="Unable to load exam details. Please try again."
        href={listHref}
      />
    );
  }

  const exam = result.exam;

  const instructions = Array.isArray(result.instructions)
    ? result.instructions
    : [];

  const startHref = `${canonicalHref}/start`;

  return (
    <main className="min-h-screen bg-[#f5f9ff] py-6">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <Link
          href={listHref}
          className="font-bold text-blue-700"
        >
          ← Back to Exams
        </Link>

        <section className="mt-5 rounded-3xl bg-gradient-to-r from-[#071f55] to-[#017dc0] p-7 text-white">
          <p className="text-xs font-black uppercase tracking-widest">
            {config.name} Topic Wise Exam
          </p>

          <h1 className="mt-3 text-3xl font-black">
            {exam.exam_name || selected.exam_name}
          </h1>

          <span className="mt-4 inline-flex rounded-full bg-emerald-500/20 px-4 py-2 text-xs font-black text-emerald-100">
            Free Exam
          </span>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ["Questions", exam.total_questions],
              ["Marks", exam.total_mark],
              [
                "Duration",
                `${exam.total_minutes || 0} minutes`,
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl bg-white/10 p-4"
              >
                <p className="text-xs text-blue-100">
                  {label}
                </p>

                <p className="mt-2 text-xl font-black">
                  {value ?? 0}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-7">
          <h2 className="text-xl font-black text-[#071f55]">
            Exam Instructions
          </h2>

          <div className="mt-5 space-y-3">
            {instructions.length ? (
              instructions.map((item, index) => (
                <p
                  key={index}
                  className="rounded-xl bg-blue-50 p-4 text-sm leading-7 text-slate-600"
                >
                  {index + 1}.{" "}
                  {typeof item === "string"
                    ? item
                    : item?.instructions ?? ""}
                </p>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                Read each question carefully before submitting your answers.
              </p>
            )}
          </div>

          <div className="mt-7 flex justify-end">
            <Link
              href={startHref}
              className="rounded-xl bg-[#017dc0] px-7 py-3 font-bold text-white hover:bg-[#164fa5]"
            >
              Start Exam
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
