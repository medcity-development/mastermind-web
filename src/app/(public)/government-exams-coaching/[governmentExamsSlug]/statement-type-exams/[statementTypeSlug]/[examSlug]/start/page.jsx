import {
  notFound,
  redirect,
} from "next/navigation";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import {
  getStatementTypeTopics,
  getStatementTypeExamsByTopic,
  getStatementTypeExamDetails,
  getStatementTypeExamQuestions,
} from "@/lib/statementTypeExamHelper";

import {
  createSlug,
} from "@/lib/slugHelper";

import ExamClient from "./components/ExamClient";

/* =========================================================
   PAGE
========================================================= */

export default async function StatementTypeExamStartPage({
  params,
  searchParams,
}) {
  const {
    governmentExamsSlug,
    statementTypeSlug,
    examSlug,
  } = await params;

  const query =
    await searchParams;

  /* =======================================================
     MAIN COURSE

     kerala-psc -> cid 1
     rrb-ssc    -> cid 2
  ======================================================= */

  const config =
    getGovernmentExamConfig(
      governmentExamsSlug
    );

  if (!config) {
    notFound();
  }

  const {
    cid,
  } = config;

  /* =======================================================
     USER

     TEMPORARY TEST:

     /start?uid=21

     Later replace this with authenticated user/session.
  ======================================================= */

  const uid =
    Number(
      query?.uid ?? 0
    ) || 0;

  const examType =
    "tst";

  /* =======================================================
     FIND TOPIC
  ======================================================= */

  const topicsResult =
    await getStatementTypeTopics({
      uid,
      cid,
      type:
        examType,
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
        ) ===
        statementTypeSlug
    );

  if (!selectedTopic) {
    notFound();
  }

  const topicId =
    selectedTopic?.id;

  if (!topicId) {
    notFound();
  }

  /* =======================================================
     FIND EXAM
  ======================================================= */

  const examsResult =
    await getStatementTypeExamsByTopic({
      uid,
      cid,
      topicId,
      type:
        examType,
    });

  const exams =
    Array.isArray(
      examsResult?.data
    )
      ? examsResult.data
      : [];

  const selectedExam =
    exams.find(
      (item) =>
        createSlug(
          item?.exam_name
        ) ===
        examSlug
    );

  if (!selectedExam) {
    notFound();
  }

  /* =======================================================
     EXAM ID
  ======================================================= */

  const examId =
    selectedExam?.id;

  if (!examId) {
    notFound();
  }

  /* =======================================================
     PREMIUM CHECK
  ======================================================= */

  const isPaid =
    String(
      selectedExam?.access ??
        ""
    ).toLowerCase() ===
    "paid";

  if (
    isPaid &&
    !uid
  ) {
    const currentPath =
      `/government-exams-coaching/${governmentExamsSlug}/statement-type-exams/${statementTypeSlug}/${examSlug}/start`;

    redirect(
      `/login?redirect=${encodeURIComponent(
        currentPath
      )}`
    );
  }

  /* =======================================================
     DETAILS + QUESTIONS
  ======================================================= */

  const [
    detailsResult,
    questionsResult,
  ] =
    await Promise.all([
      getStatementTypeExamDetails({
        uid,
        cid,
        examId,
        type:
          examType,
        offset: 0,
      }),

      getStatementTypeExamQuestions({
        uid,
        cid,
        examId,
        examType,
      }),
    ]);

  /* =======================================================
     EXAM DETAILS
  ======================================================= */

  const exam =
    detailsResult?.exam ??
    null;

  /* =======================================================
     QUESTIONS
  ======================================================= */

  const questions =
    Array.isArray(
      questionsResult?.data
    )
      ? questionsResult.data
      : [];

  /* =======================================================
     VALIDATE API RESULT

     Don't rely only on questionsResult.status because
     some backend responses may not return status.
  ======================================================= */

  if (!exam) {
    notFound();
  }

  /* =======================================================
     NORMALIZE EXAM
  ======================================================= */

  const normalizedExam = {
    ...selectedExam,

    ...exam,

    id:
      exam?.id ??
      selectedExam?.id,

    total_minutes:
      Number(
        exam?.total_minutes ??
          selectedExam?.total_minutes ??
          0
      ) || 0,

    total_questions:
      Number(
        exam?.total_questions ??
          selectedExam?.total_questions ??
          questions.length
      ) ||
      questions.length,

    total_mark:
      Number(
        exam?.total_mark ??
          selectedExam?.total_mark ??
          0
      ) || 0,
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <ExamClient
      exam={
        normalizedExam
      }
      questions={
        questions
      }
      imagePath={
        questionsResult?.imagePath ??
        questionsResult?.image_path ??
        ""
      }
      statementTypeSlug={
        statementTypeSlug
      }
      examSlug={
        examSlug
      }
      governmentExamsSlug={
        governmentExamsSlug
      }
      uid={
        uid
      }
      cid={
        cid
      }
      examType={
        examType
      }
    />
  );
}