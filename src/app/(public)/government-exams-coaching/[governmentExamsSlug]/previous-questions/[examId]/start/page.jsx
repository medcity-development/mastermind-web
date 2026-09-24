import { notFound } from "next/navigation";

import {
  getPyqExamDetails,
  getPyqQuestions,
} from "@/lib/pyqDetailsHelper";

import ExamClient from "../components/ExamClient";

/* =========================================================
   PARAM HELPERS
========================================================= */

function getNumberParam(
  value,
  fallback
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return fallback;
  }

  const parsedValue =
    Number(value);

  return Number.isNaN(
    parsedValue
  )
    ? fallback
    : parsedValue;
}

/* =========================================================
   PAGE
========================================================= */

export default async function StartExamPage({
  params,
  searchParams,
}) {
  const { examId } =
    await params;

  const query =
    await searchParams;

  const uid =
    getNumberParam(
      query?.uid,
      0
    );

  const cid =
    getNumberParam(
      query?.cid,
      1
    );

  const examType =
    query?.type ??
    "pqp";

  const [
    detailsResult,
    questionsResult,
  ] = await Promise.all([
    getPyqExamDetails({
      uid,
      cid,
      examId,
      type:
        examType,
    }),

    getPyqQuestions({
      uid,
      cid,
      examId,
      type:
        examType,
    }),
  ]);

  if (!detailsResult?.exam) {
    notFound();
  }

  const questions =
    Array.isArray(
      questionsResult?.data
    )
      ? questionsResult.data
      : [];

  const imagePath =
    questionsResult?.imagePath ??
    "";

  return (
    <main
      className="
        min-h-screen
        bg-[#f5f9ff]
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-[1450px]
          px-4
          py-6
          sm:px-6
          lg:px-8
        "
      >
        <ExamClient
          exam={
            detailsResult.exam
          }
          questions={
            questions
          }
          imagePath={
            imagePath
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
          lastPosition={
            examType
          }
        />
      </div>
    </main>
  );
}