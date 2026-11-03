import {
  notFound,
  redirect,
} from "next/navigation";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import {
  getScertTestBySlug,
  getScertExamDetails,
  getScertQuestions,
} from "@/lib/scertHelper";
import { createScertSlug } from "@/lib/scertSlug";
import ScertExamClient from "../../../start/components/ScertExamClient";



export const metadata = {
  title:
    "SCERT Exam | MasterMind Academy",

  robots: {
    index: false,
    follow: false,
  },
};

export default async function ScertStartPage({
  params,
  searchParams,
}) {
  const {
    testSlug,
    governmentExamsSlug,
  } = await params;
  const config =
    getGovernmentExamConfig(governmentExamsSlug);

  if (!config) {
    notFound();
  }

  const query =
    await searchParams;
  const session =
    await getStudentSession();
  const uid =
    session?.uid || 0;

  const mode =
    query?.mode ===
    "resume"
      ? "resume"
      : "new";

  const initialPauseId =
    query?.pauseId ||
    null;

  const selected = await getScertTestBySlug({
    uid: 0,
    cid: config.cid,
    slug: testSlug,
    classId: query?.classId,
    examId: query?.examId,
  });

  if (!selected) {
    notFound();
  }

  const {
    classId,
    examId,
  } = selected;
  const canonicalSlug = createScertSlug(selected.test?.exam_name);
  const retainedQuery = new URLSearchParams();
  for (const key of ["mode", "pauseId", "guestAction"]) {
    const value = query?.[key];
    if (value != null && value !== "") {
      retainedQuery.set(key, String(value));
    }
  }

  if (
    canonicalSlug !== testSlug ||
    query?.classId ||
    query?.examId
  ) {
    const suffix = retainedQuery.toString();
    redirect(
      `/government-exams-coaching/${encodeURIComponent(governmentExamsSlug)}/scert-tests/tests/${canonicalSlug}/start${suffix ? `?${suffix}` : ""}`
    );
  }

  const [
    detailsResult,
    questionsResult,
  ] = await Promise.all([
    getScertExamDetails({
      uid,
      cid: config.cid,
      examId,
    }),

    getScertQuestions({
      uid,
      cid: config.cid,
      examId,
    }),
  ]);

  const exam =
    detailsResult?.exam;

  const questions =
    Array.isArray(
      questionsResult?.data
    )
      ? questionsResult.data
      : [];

  if (
    !exam ||
    !questions.length
  ) {
    notFound();
  }

  return (
    <ScertExamClient
      key={`${examId}-${uid}-${mode}-${query?.guestAction || "new"}`}
      examId={examId}
      exam={exam}
      questions={
        questions
      }
      imagePath={
        questionsResult?.imagePath ||
        ""
      }
      uid={uid}
      cid={
        config.cid
      }
      classId={
        classId
      }
      testSlug={
        testSlug
      }
      governmentExamsSlug={
        governmentExamsSlug
      }
      guestAction={
        query?.guestAction || ""
      }
      examType="scert"
      lastPosition="scert"
      durationMinutes={
        Number(
          exam?.total_minutes
        ) || 90
      }
      questionsPerPage={
        10
      }
      mode={
        mode
      }
      initialPauseId={
        initialPauseId
      }
    />
  );
}
