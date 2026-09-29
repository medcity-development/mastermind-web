import { notFound } from "next/navigation";

import {
  getPyqExamDetails,
} from "@/lib/pyqDetailsHelper";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

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
  query,
  {
    uid,
    cid,
  }
) {
  return {
    uid,

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

  const config =
    getGovernmentExamConfig(
      governmentExamsSlug
    );

  if (!config) {
    return {};
  }

  const session =
    await getStudentSession();

  const query =
    await searchParams;

  const {
    uid,
    cid,
    type,
  } = getQueryValues(
    query,
    {
      uid:
        session?.uid,
      cid:
        config.cid,
    }
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
  const {
    examId,
    governmentExamsSlug,
  } =
    await params;

  const config =
    getGovernmentExamConfig(
      governmentExamsSlug
    );

  if (!config) {
    notFound();
  }

  const session =
    await getStudentSession();

  const query =
    await searchParams;

  const {
    uid,
    cid,
    type,
  } = getQueryValues(
    query,
    {
      uid:
        session?.uid,
      cid:
        config.cid,
    }
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
          governmentExamsSlug={
            governmentExamsSlug
          }
          examName={
            config.name
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
