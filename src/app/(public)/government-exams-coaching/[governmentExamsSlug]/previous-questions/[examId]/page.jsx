import { notFound } from "next/navigation";

import {
  getPyqExamDetails,
} from "@/lib/pyqDetailsHelper";

import ExamHero from "./components/ExamHero";
import ExamInstructions from "./components/ExamInstructions";

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

  const number =
    Number(value);

  return Number.isNaN(
    number
  )
    ? fallback
    : number;
}

function getQueryValues(
  query
) {
  return {
    uid:
      getNumberParam(
        query?.uid,
        0
      ),

    cid:
      getNumberParam(
        query?.cid,
        1
      ),

    type:
      query?.type ??
      "pqp",
  };
}

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  params,
  searchParams,
}) {
  const { examId } =
    await params;

  const query =
    await searchParams;

  const {
    uid,
    cid,
    type,
  } = getQueryValues(
    query
  );

  const result =
    await getPyqExamDetails({
      uid,
      cid,
      examId,
      type,
    });

  if (!result?.exam) {
    return {
      title:
        "Previous Question Paper | MasterMind Academy",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title:
      `${result.exam.exam_name} | MasterMind Academy`,

    description:
      "Kerala PSC previous question paper exam details and instructions.",
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function PyqDetailsPage({
  params,
  searchParams,
}) {
  const { examId } =
    await params;

  const query =
    await searchParams;

  const {
    uid,
    cid,
    type,
  } = getQueryValues(
    query
  );

  const result =
    await getPyqExamDetails({
      uid,
      cid,
      examId,
      type,
    });

  if (!result?.exam) {
    notFound();
  }

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
        <ExamHero
          exam={
            result.exam
          }
        />

        <div className="mt-6">
          <ExamInstructions
            exam={
              result.exam
            }
            instructions={
              result.instructions
            }
            examId={
              examId
            }
            uid={
              uid
            }
            cid={
              cid
            }
            type={
              type
            }
            view={
              result.view
            }
          />
        </div>
      </div>
    </main>
  );
}