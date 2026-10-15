
import Link from "next/link";
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

import {
  createSlug,
} from "@/lib/pscSlug";

import ExamClient from "./components/ExamClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Topic Wise Exam | MasterMind Academy",
  robots: {
    index: false,
    follow: false,
  },
};

function positiveId(value) {
  const number = Number(value);

  return Number.isSafeInteger(number) && number > 0
    ? number
    : null;
}

function ErrorPage({ message, href }) {
  return (
    <main className="min-h-screen bg-[#f5f9ff] p-6">
      <div
        role="alert"
        className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-white p-8"
      >
        <h1 className="text-xl font-black text-red-600">
          Unable to Open Exam
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

  if (!config) {
    notFound();
  }

  const session = await getStudentSession();

  const uid = positiveId(session?.uid) || 0;
  const cid = positiveId(config.cid);

  if (!cid) {
    notFound();
  }

  const examType = "twe";

  const mode =
    query?.mode === "resume"
      ? "resume"
      : "new";

  const initialPauseId = positiveId(
    query?.pauseId
  );

  const guestAction = [
    "pause",
    "submit",
  ].includes(query?.guestAction)
    ? query.guestAction
    : "";

  const root =
    `/dashboard/${governmentExamsSlug}/topic-wise-exams`;

  const listHref = `${root}/test/${slug}`;

  if (!uid) {
    const target =
      `${root}/test/${slug}/${examSlug}/start` +
      (mode === "resume" && initialPauseId
        ? `?mode=resume&pauseId=${initialPauseId}`
        : "");

    redirect(
      `/login?redirect=${encodeURIComponent(target)}`
    );
  }

  if (mode === "resume" && !initialPauseId) {
    return (
      <ErrorPage
        message="The resume link does not contain a valid saved attempt ID."
        href={listHref}
      />
    );
  }

  // Load topic.
  const topicsResult = await getTopicWiseExams({
    uid,
    cid,
    type: examType,
  });

  const topics = Array.isArray(topicsResult?.data)
    ? topicsResult.data
    : [];

  const topic = topics.find(
    (item) => createSlug(item.subject) === slug
  );

  if (!topic) {
    notFound();
  }

  // Load exams belonging to this topic.
  const testsResult = await getAllTopicWiseTests({
    uid,
    topicId: topic.id,
  });

  const tests = Array.isArray(testsResult?.data)
    ? testsResult.data
    : [];

  // IMPORTANT:
  // Numeric ID and exam-name slug are both supported.
  //
  // /world-history/1/start
  // /world-history/world-history-exam-1/start

  const selected = tests.find((item) => {
    const id = String(item.id ?? "");
    const nameSlug = createSlug(
      item.exam_name || ""
    );

    return (
      id === String(examSlug) ||
      nameSlug === examSlug
    );
  });

  if (!selected) {
    return (
      <ErrorPage
        message="The requested exam was not found in this topic."
        href={listHref}
      />
    );
  }

  const examId = positiveId(selected.id);

  if (!examId) {
    notFound();
  }

  const access = String(
    selected.access ?? ""
  ).trim().toLowerCase();

  // Preserve the existing free-exam restriction.
  // Premium entitlement needs separate backend validation.
  if (access !== "free") {
    return (
      <ErrorPage
        message="This exam requires premium access."
        href={listHref}
      />
    );
  }

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

  if (!details?.exam) {
    return (
      <ErrorPage
        message="The exam details could not be loaded."
        href={listHref}
      />
    );
  }

  if (!questions.length) {
    return (
      <ErrorPage
        message="The exam question API returned no questions. Please refresh and try again."
        href={listHref}
      />
    );
  }

  const exam = {
    ...details.exam,
    id: examId,
    total_minutes:
      Number(details.exam.total_minutes) || 0,
  };

  return (
    <ExamClient
      key={`${examId}-${uid}-${mode}-${initialPauseId || "new"}`}
      exam={exam}
      examId={examId}
      questions={questions}
      imagePath={
        paper?.imagePath ||
        paper?.img_path ||
        paper?.image_path ||
        ""
      }
      uid={uid}
      cid={cid}
      examType={examType}
      slug={slug}
      examSlug={String(examId)}
      governmentExamsSlug={governmentExamsSlug}
      mode={mode}
      initialPauseId={initialPauseId}
      guestAction={guestAction}
    />
  );
}
