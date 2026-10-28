
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

import ExamAnalysisClient from "./ExamAnalysisClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title:
    "Exam Analysis | Student Dashboard | MasterMind Academy",

  robots: {
    index: false,
    follow: false,
  },
};

const ALLOWED_EXAM_TYPES = new Set([
  "mock",
  "studyplan",
  "pqp",
  "scert",
  "topicwise",
  "twe",
]);

export default async function ExamAnalysisPage({
  params,
  searchParams,
}) {
  const { governmentExamsSlug } = await params;

  const query = await searchParams;

  /* =========================================
     GOVERNMENT EXAM CONFIG
  ========================================= */

  const config = getGovernmentExamConfig(
    governmentExamsSlug
  );

  if (!config) {
    notFound();
  }

  const cid = Number(config.cid);

  if (!Number.isInteger(cid) || cid <= 0) {
    notFound();
  }

  /* =========================================
     STUDENT AUTHENTICATION
  ========================================= */

  const session = await getStudentSession();

  const uid = Number(session?.uid);

  if (!Number.isInteger(uid) || uid <= 0) {
    const redirectPath =
      `/dashboard/${governmentExamsSlug}/exam-analysis`;

    redirect(
      `/login?redirect=${encodeURIComponent(
        redirectPath
      )}`
    );
  }

  /* =========================================
     QUERY PARAMETERS
  ========================================= */

  const attemptId = String(
    query?.attemptId ?? ""
  ).trim();

  const examType = String(
    query?.examType ?? "mock"
  )
    .trim()
    .toLowerCase();

  const examTitle = String(
    query?.title ??
      config.shortName ??
      config.name ??
      "Exam Analysis"
  ).trim();

  /* =========================================
     VALIDATION
  ========================================= */

  if (
    !/^\d+$/.test(attemptId) ||
    Number(attemptId) <= 0
  ) {
    redirect(
      `/dashboard/${governmentExamsSlug}/exam-attempted`
    );
  }

  if (!ALLOWED_EXAM_TYPES.has(examType)) {
    redirect(
      `/dashboard/${governmentExamsSlug}/exam-attempted`
    );
  }

  /* =========================================
     RENDER ANALYSIS
  ========================================= */

  return (
    <ExamAnalysisClient
      cid={cid}
      uid={uid}
      attemptId={attemptId}
      examType={examType}
      title={examTitle}
      governmentExamsSlug={governmentExamsSlug}
    />
  );
}
