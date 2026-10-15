import {
  notFound,
  redirect,
} from "next/navigation";

import {
  getScertExamDetails,
  getScertQuestions,
} from "@/lib/scertHelper";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import ScertExamClient from "./components/ScertExamClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "SCERT Exam | MasterMind Academy",
  robots: {
    index: false,
    follow: false,
  },
};

function id(value) {
  const number = Number(value);

  return Number.isSafeInteger(number) && number > 0
    ? number
    : null;
}

export default async function ScertStartPage({
  params,
  searchParams,
}) {
  const {
    governmentExamsSlug,
    testSlug,
  } = await params;

  const query = await searchParams;

  const config = getGovernmentExamConfig(
    governmentExamsSlug
  );

  const examId = id(query?.examId);
  const classId = id(query?.classId);

  if (!config || !examId || !classId) {
    notFound();
  }

  const session = await getStudentSession();

  const uid = id(session?.uid) || 0;

  // Course ID and SCERT class ID stay separate.
  const cid = Number(config.cid);

  const mode =
    query?.mode === "resume"
      ? "resume"
      : "new";

  const pauseId = id(query?.pauseId);

  if (mode === "resume" && !uid) {
    const target = new URLSearchParams({
      examId: String(examId),
      classId: String(classId),
      mode,
      ...(pauseId
        ? { pauseId: String(pauseId) }
        : {}),
    });

    const returnPath =
      `/government-exams-coaching/${governmentExamsSlug}` +
      `/scert-tests/start?${target}`;

    redirect(
      `/login?redirect=${encodeURIComponent(returnPath)}`
    );
  }

  const [details, paper] = await Promise.all([
    getScertExamDetails({
      uid,
      cid,
      examId,
    }),

    getScertQuestions({
      uid,
      cid,
      examId,
    }),
  ]);

  const questions = Array.isArray(paper?.data)
    ? paper.data
    : [];

  if (!details?.exam || !questions.length) {
    return (
      <p
        role="alert"
        className="p-6 text-red-700"
      >
        Unable to load this SCERT exam.
        Refresh and try again.
      </p>
    );
  }

  const guestAction = [
    "pause",
    "submit",
  ].includes(query?.guestAction)
    ? query.guestAction
    : "";

  return (
    <ScertExamClient
      key={`${examId}-${uid}-${mode}-${guestAction}`}
      exam={{
        ...details.exam,
        id: examId,
      }}
      examId={examId}
      questions={questions}
      imagePath={paper.imagePath || ""}
      uid={uid}
      cid={cid}
      classId={classId}
      testSlug={
        testSlug ??
        query?.testSlug ??
        ""
      }
      examType="scert"
      lastPosition="scert"
      durationMinutes={
        Number(details.exam.total_minutes) || 90
      }
      questionsPerPage={10}
      mode={mode}
      initialPauseId={pauseId}
      governmentExamsSlug={governmentExamsSlug}
      guestAction={guestAction}
    />
  );
}