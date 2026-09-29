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

export default async function TopicWiseExamStartPage({
  params,
}) {
  const {
    slug,
    examSlug,
    governmentExamsSlug,
  } = await params;

  const config =
    getGovernmentExamConfig(
      governmentExamsSlug
    );

  if (!config) {
    notFound();
  }

  const session =
    await getStudentSession();

  const uid =
    session?.uid;

  const cid =
    config.cid;
  const examType =
    "twe";

  /* =======================================================
     RESOLVE TOPIC
  ======================================================= */

  const topicsResult =
    await getTopicWiseExams({
      uid,
      cid,
      type: examType,
    });

  const topics =
    Array.isArray(
      topicsResult?.data
    )
      ? topicsResult.data
      : [];

  const selectedTopic =
    topics.find(
      (item) =>
        createSlug(
          item?.subject
        ) === slug
    );

  if (!selectedTopic) {
    notFound();
  }

  const topicId =
    selectedTopic.id;

  /* =======================================================
     RESOLVE EXAM
  ======================================================= */

  const testsResult =
    await getAllTopicWiseTests({
      uid,
      topicId,
    });

  const tests =
    Array.isArray(
      testsResult?.data
    )
      ? testsResult.data
      : [];

  const selectedExam =
    tests.find(
      (item) =>
        createSlug(
          item?.exam_name
        ) === examSlug
    );

  if (!selectedExam) {
    notFound();
  }

  const isPaid =
    String(
      selectedExam?.access ||
        ""
    ).toLowerCase() ===
    "paid";

  if (isPaid) {
    redirect(
      `/dashboard/${governmentExamsSlug}/premium-packages`
    );
  }

  const examId =
    selectedExam.id;

  /* =======================================================
     FETCH DETAILS + QUESTIONS
  ======================================================= */

  const [
    detailsResult,
    questionsResult,
  ] =
    await Promise.all([
      getTopicWiseExamDetails({
        uid,
        cid,
        examId,
        type:
          examType,
        offset: 0,
      }),

      getTopicWiseExamQuestions({
        uid,
        cid,
        examId,
        examType,
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

  const imagePath =
    questionsResult?.imagePath ||
    "";

  if (
    !exam ||
    !questionsResult?.status
  ) {
    notFound();
  }

  const normalizedExam = {
    ...exam,

    total_minutes:
      Number(
        exam?.total_minutes ??
          0
      ) || 0,
  };

  return (
    <ExamClient
      exam={
        normalizedExam
      }
      questions={
        questions
      }
      imagePath={
        imagePath
      }
      uid={uid}
      cid={cid}
      examType={
        examType
      }
      slug={slug}
      examSlug={
        examSlug
      }
      governmentExamsSlug={
        governmentExamsSlug
      }
    />
  );
}
