import {
  notFound,
  redirect,
} from "next/navigation";

import {
  getAllTopicWiseTests,
  getTopicWiseExamDetails,
  getTopicWiseExamQuestions,
  getTopicWiseExams,
} from "@/lib/topicWiseExamHelper";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import { createSlug } from "@/lib/pscSlug";

import ExamClient from "./components/ExamClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Topic Wise Exam | MasterMind Academy",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function TopicWiseExamStartPage({
  params,
  searchParams,
}) {
  const {
    slug,
    examSlug,
    governmentExamsSlug,
  } = await params;

  const query = await searchParams;

  const config = getGovernmentExamConfig(
    governmentExamsSlug
  );

  if (!config) notFound();

  const session = await getStudentSession();

  const uid = Number(session?.uid) || 0;
  const cid = Number(config.cid);
  const examType = "twe";

  const mode =
    query?.mode === "resume"
      ? "resume"
      : "new";

  const pauseId = Number(query?.pauseId);

  const initialPauseId =
    Number.isSafeInteger(pauseId) && pauseId > 0
      ? pauseId
      : null;

  const guestAction = [
    "pause",
    "submit",
  ].includes(query?.guestAction)
    ? query.guestAction
    : "";

  if (mode === "resume" && !uid) {
    const search = new URLSearchParams({
      mode,

      ...(initialPauseId
        ? { pauseId: String(initialPauseId) }
        : {}),

      ...(guestAction
        ? { guestAction }
        : {}),
    });

    const target =
      `/government-exams-coaching/${governmentExamsSlug}` +
      `/topic-wise-exams/test/${slug}/${examSlug}/start?${search}`;

    redirect(
      `/login?redirect=${encodeURIComponent(target)}`
    );
  }

  const topicsResult = await getTopicWiseExams({
    uid,
    cid,
    type: examType,
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

  const examId = selected.id;

  const [details, paper] = await Promise.all([
    getTopicWiseExamDetails({
      uid,
      cid,
      examId,
      type: examType,
      offset: 0,
    }),

    getTopicWiseExamQuestions({
      uid,
      cid,
      examId,
      examType,
    }),
  ]);

  const questions = Array.isArray(paper?.data)
    ? paper.data
    : [];

  if (!details?.exam || !questions.length) {
    return (
      <p role="alert" className="p-6 text-red-700">
        Unable to load the exam. Refresh and try again.
      </p>
    );
  }

  return (
    <ExamClient
      key={`${examId}-${uid}-${mode}-${guestAction}`}
      exam={{
        ...details.exam,
        id: examId,
        total_minutes:
          Number(details.exam.total_minutes) || 0,
      }}
      examId={examId}
      questions={questions}
      imagePath={paper.imagePath || ""}
      uid={uid}
      cid={cid}
      examType={examType}
      slug={slug}
      examSlug={examSlug}
      governmentExamsSlug={governmentExamsSlug}
      mode={mode}
      initialPauseId={initialPauseId}
      guestAction={guestAction}
    />
  );
}