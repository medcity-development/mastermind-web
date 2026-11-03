import {
  notFound,
  redirect,
} from "next/navigation";

import {
  getPyqExamDetails,
  getPyqExamBySlug,
  getPyqQuestions,
} from "@/lib/pyqDetailsHelper";
import { createSlug } from "@/lib/pscSlug";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import ExamClient from "../components/ExamClient";

export const dynamic = "force-dynamic";

export default async function StartExamPage({
  params,
  searchParams,
}) {
  const {
    examId,
    governmentExamsSlug,
  } = await params;

  const config = getGovernmentExamConfig(
    governmentExamsSlug
  );

  if (!config) {
    notFound();
  }

  const query = await searchParams;
  const session = await getStudentSession();

  const uid = Number(session?.uid) || 0;
  const cid = Number(config.cid);
  const examType = "pqp";
  const startPath =
    `/government-exams-coaching/${governmentExamsSlug}/previous-questions/${examId}/start`;

  const guestAction = [
    "pause",
    "submit",
  ].includes(query?.guestAction)
    ? query.guestAction
    : "";

  if (/^\d+$/.test(examId)) {
    const legacyDetails = await getPyqExamDetails({
      uid,
      cid,
      examId,
      type: examType,
    });

    if (!legacyDetails?.exam) {
      notFound();
    }

    const canonicalStartPath =
      `/government-exams-coaching/${governmentExamsSlug}/previous-questions/${createSlug(legacyDetails.exam.exam_name)}/start`;
    const queryString = guestAction
      ? `?guestAction=${encodeURIComponent(guestAction)}`
      : "";
    redirect(`${canonicalStartPath}${queryString}`);
  }

  let examRecord;
  try {
    examRecord = await getPyqExamBySlug({
      uid,
      cid,
      slug: examId,
      type: examType,
    });
  } catch (error) {
    console.error(
      "Unable to resolve previous question paper for exam start:",
      error
    );
    return (
      <main className="min-h-screen bg-[#f5f9ff] p-6">
        <section className="mx-auto max-w-xl rounded-2xl bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-bold text-[#082e5a]">
            Unable to load the exam right now
          </h1>
          <p role="status" className="my-4 text-slate-600">
            The exam service is temporarily unavailable. Please try again.
          </p>
          <a
            href={`/government-exams-coaching/${encodeURIComponent(governmentExamsSlug)}/previous-questions/${encodeURIComponent(examId)}/start`}
            className="inline-flex rounded-lg bg-[#017dc0] px-4 py-2 font-semibold text-white"
          >
            Try again
          </a>
        </section>
      </main>
    );
  }

  if (!examRecord?.id) {
    notFound();
  }

  if (
    Object.keys(query ?? {}).some(
      (key) => key !== "guestAction"
    )
  ) {
    const queryString = guestAction
      ? `?guestAction=${encodeURIComponent(guestAction)}`
      : "";
    redirect(`${startPath}${queryString}`);
  }

  const resolvedExamId = String(examRecord.id);
  const [
    detailsResult,
    questionsResult,
  ] = await Promise.all([
    getPyqExamDetails({
      uid,
      cid,
      examId: resolvedExamId,
      type: examType,
    }),

    getPyqQuestions({
      uid,
      cid,
      examId: resolvedExamId,
      examType,
    }),
  ]);

  if (!detailsResult?.exam) {
    console.error(
      "Previous question paper details unavailable; using list metadata.",
      detailsResult?.message || `Exam ID: ${resolvedExamId}`
    );
  }

  const questions = Array.isArray(
    questionsResult?.data
  )
    ? questionsResult.data
    : [];

  if (!questions.length) {
    return (
      <p
        role="alert"
        className="p-6 text-red-700"
      >
        Unable to load the question paper.
        Please refresh and try again.
      </p>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f9ff]">
      <div className="mx-auto w-full max-w-[1450px] px-4 py-6 sm:px-6 lg:px-8">
        <ExamClient
          key={`${resolvedExamId}-${uid}-${guestAction || "new"}`}
          exam={{
            ...(detailsResult?.exam ?? examRecord),
            id: resolvedExamId,
          }}
          examId={resolvedExamId}
          questions={questions}
          imagePath={
            questionsResult.imagePath ?? ""
          }
          uid={uid}
          cid={cid}
          examType={examType}
          lastPosition={examType}
          governmentExamsSlug={
            governmentExamsSlug
          }
          guestAction={guestAction}
        />
      </div>
    </main>
  );
}