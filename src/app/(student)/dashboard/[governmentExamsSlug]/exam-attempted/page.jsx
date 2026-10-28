
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

import ExamHistoryClient from "./ExamHistoryClient";

/* =========================================================
   PAGE CONFIGURATION
========================================================= */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SUPPORTED_EXAM_TYPES = [
  "mock",
  "pqp",
  "scert",
  "topicwise",
  "tst",
  "studyplan",
];

/* =========================================================
   HELPERS
========================================================= */

function getValidId(value) {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return null;
  }

  const parsed = Number(value);

  return Number.isSafeInteger(parsed) &&
    parsed > 0
    ? parsed
    : null;
}

function getCourseName(config) {
  return (
    config?.shortName ||
    config?.name ||
    "Government Exams"
  );
}

function getDashboardPath(slug) {
  return `/dashboard/${encodeURIComponent(slug)}/exam-attempted`;
}

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  params,
}) {
  const { governmentExamsSlug } = await params;

  const config = getGovernmentExamConfig(
    governmentExamsSlug
  );

  if (!config) {
    return {
      title: "Exam History | MasterMind Academy",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const courseName = getCourseName(config);

  return {
    title: `Exam History | ${courseName} | MasterMind Academy`,

    description:
      `Review attempted exams, results and performance analytics for ${courseName}.`,

    robots: {
      index: false,
      follow: false,
    },
  };
}

/* =========================================================
   EXAM HISTORY PAGE

   Shared page for:
   - Kerala PSC
   - RRB & SSC

   History categories:
   - Mock Tests
   - Previous Questions
   - SCERT
   - Topic Wise
   - Study Plan
========================================================= */

export default async function ExamHistoryPage({
  params,
}) {
  /* -------------------------------------------------------
     ROUTE PARAMETERS
  ------------------------------------------------------- */

  const { governmentExamsSlug } = await params;

  if (
    typeof governmentExamsSlug !== "string" ||
    !governmentExamsSlug.trim()
  ) {
    notFound();
  }

  /* -------------------------------------------------------
     GOVERNMENT EXAM CONFIGURATION
  ------------------------------------------------------- */

  const config = getGovernmentExamConfig(
    governmentExamsSlug
  );

  if (!config) {
    notFound();
  }

  const cid = getValidId(config.cid);

  if (!cid) {
    notFound();
  }

  /* -------------------------------------------------------
     STUDENT AUTHENTICATION
  ------------------------------------------------------- */

  const session = await getStudentSession();

  const uid = getValidId(session?.uid);

  if (!uid) {
    const redirectPath = getDashboardPath(
      governmentExamsSlug
    );

    redirect(
      `/login?redirect=${encodeURIComponent(
        redirectPath
      )}`
    );
  }

  /* -------------------------------------------------------
     DISPLAY CONFIGURATION
  ------------------------------------------------------- */

  const examName = getCourseName(config);

  const examTypes = [...SUPPORTED_EXAM_TYPES];

  /* -------------------------------------------------------
     PAGE RENDER
  ------------------------------------------------------- */

  return (
    <main
      className="
        min-h-screen
        w-full
        bg-[#f4f7fc]
        px-3
        py-5
        sm:px-5
        sm:py-6
        lg:px-8
        lg:py-8
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-[1450px]
        "
      >
        <ExamHistoryClient
          key={`${governmentExamsSlug}-${cid}`}
          cid={cid}
          examTypes={examTypes}
          examName={examName}
          governmentExamsSlug={
            governmentExamsSlug
          }
        />
      </div>
    </main>
  );
}
