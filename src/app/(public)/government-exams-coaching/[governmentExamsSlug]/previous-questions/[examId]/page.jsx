import { notFound } from "next/navigation";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import {
  getPyqExamDetails,
} from "@/lib/pyqDetailsHelper";

import ExamHero from "./components/ExamHero";
import ExamInstructions from "./components/ExamInstructions";

/* =========================================================
   PARAM HELPERS
========================================================= */

function getQueryValues(query, cid) {
  return {
    uid: 0,
    cid,
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
  const {
    examId,
    governmentExamsSlug,
  } =
    await params;

  const config = getGovernmentExamConfig(governmentExamsSlug);
  if (!config) return {};

  const query =
    await searchParams;

  const {
    uid,
    cid,
    type,
  } = getQueryValues(
    query,
    config.cid
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
      `${config.name} previous question paper exam details and instructions.`,
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function PyqDetailsPage({
  params,
  searchParams,
}) {
  const {
    examId,
    governmentExamsSlug,
  } =
    await params;

  const config = getGovernmentExamConfig(governmentExamsSlug);
  if (!config) notFound();

  const query =
    await searchParams;

  const {
    uid,
    cid,
    type,
  } = getQueryValues(
    query,
    config.cid
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
          examName={
            config.name
          }
          governmentExamsSlug={
            governmentExamsSlug
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
            governmentExamsSlug={
              governmentExamsSlug
            }
          />
        </div>
      </div>
    </main>
  );
}