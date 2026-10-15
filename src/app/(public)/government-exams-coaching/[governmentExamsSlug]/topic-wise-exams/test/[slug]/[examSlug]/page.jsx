import Link from "next/link";

import {
  notFound,
  redirect,
} from "next/navigation";

import {
  getAllTopicWiseTests,
  getTopicWiseExamDetails,
  getTopicWiseExams,
} from "@/lib/topicWiseExamHelper";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import {
  createSlug,
  formatSlug,
} from "@/lib/pscSlug";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { examSlug } = await params;

  return {
    title:
      `${formatSlug(examSlug)} | MasterMind Academy`,
  };
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

  const topic = (
    topicsResult?.data || []
  ).find(
    (item) => createSlug(item.subject) === slug
  );

  if (!topic) notFound();

  const testsResult = await getAllTopicWiseTests({
    uid,
    topicId: topic.id,
  });

  const selected = (
    testsResult?.data || []
  ).find(
    (item) => createSlug(item.exam_name) === examSlug
  );

  if (!selected) notFound();

  if (
    String(selected.access || "").toLowerCase() ===
    "paid"
  ) {
    redirect(
      `/dashboard/${governmentExamsSlug}/premium-packages`
    );
  }

  const result = await getTopicWiseExamDetails({
    uid,
    cid,
    examId: selected.id,
    type: "twe",
    offset: 0,
  });

  if (!result?.exam) notFound();

  const exam = result.exam;

  const instructions = Array.isArray(
    result.instructions
  )
    ? result.instructions
    : [];

  return (
    <main className="min-h-screen bg-[#f5f9ff] py-6">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <Link
          href={`${root}/test/${slug}`}
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
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border bg-white p-7">
          <h2 className="text-xl font-black text-[#071f55]">
            Exam Instructions
          </h2>

          <div className="mt-5 space-y-3">
            {instructions.map((item, index) => (
              <p
                key={index}
                className="rounded-xl bg-blue-50 p-4 text-sm leading-7 text-slate-600"
              >
                {index + 1}. {item.instructions}
              </p>
            ))}
          </div>

          <div className="mt-7 flex justify-end">
            <Link
              href={`${root}/test/${slug}/${examSlug}/start`}
              className="rounded-xl bg-[#017dc0] px-7 py-3 font-bold text-white"
            >
              Start Exam
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}