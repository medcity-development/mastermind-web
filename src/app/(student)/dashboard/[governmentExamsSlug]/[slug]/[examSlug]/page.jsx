
import { cache } from "react";
import { notFound } from "next/navigation";

import { createSlug } from "@/lib/pscSlug";
import { getGovernmentExamConfig } from "@/lib/governmentExamConfig";
import { resolveSubCategory } from "@/lib/subCategoriesHelper";
import { getSubExams } from "@/lib/pscApi";
import { getSubExamDetails } from "@/lib/subExamDetailsHelper";
import { getStudentSession } from "@/lib/auth/getStudentSession";

import ExamDetailsHero from "./components/ExamDetailsHero";
import ExamDetailsTabs from "./components/ExamDetailsTabs";

function getExamName(exam) {
  return (
    exam?.exam_name ||
    exam?.exam ||
    exam?.name ||
    exam?.title ||
    ""
  );
}

function normalizeSlug(value) {
  return createSlug(String(value || "").trim());
}

function removeAbbreviation(value) {
  return String(value || "")
    .replace(/\([^)]*\)/g, "")
    .trim();
}

function matchesExam(exam, requestedSlug) {
  const name = getExamName(exam);

  const candidates = [
    name,
    removeAbbreviation(name),
    exam?.slug,
    exam?.exam_slug,
    exam?.seo_slug,
  ];

  return candidates.some(
    (candidate) =>
      candidate &&
      normalizeSlug(candidate) === requestedSlug
  );
}

const resolveExam = cache(
  async (
    governmentExamsSlug,
    levelSlug,
    examSlug,
    uid = 0
  ) => {
    const governmentConfig =
      getGovernmentExamConfig(governmentExamsSlug);

    if (!governmentConfig) {
      console.error(
        "Invalid government exam:",
        governmentExamsSlug
      );
      return null;
    }

    const cid = String(governmentConfig.cid);

    const level = await resolveSubCategory({
      cid,
      uid: uid || 0,
      levelSlug,
    });

    if (!level) {
      console.error("Unable to resolve level:", {
        cid,
        levelSlug,
      });
      return null;
    }

    const subId = String(level.subId);

    const result = await getSubExams({
      cid,
      uid: uid || 0,
      subId,
    });

    if (!result?.status) {
      throw new Error(
        result?.message || "Unable to load exams."
      );
    }

    const exams = Array.isArray(result?.exams)
      ? result.exams
      : [];

    const requestedSlug = normalizeSlug(examSlug);

    console.log("EXAM RESOLUTION:", {
      uid,
      cid,
      subId,
      requestedSlug,
      availableExams: exams.map((exam) => ({
        id: exam.id,
        name: getExamName(exam),
        slug: normalizeSlug(getExamName(exam)),
      })),
    });

    const selectedExam =
      exams.find((exam) =>
        matchesExam(exam, requestedSlug)
      ) || null;

    if (!selectedExam) {
      console.error("Exam slug not found:", {
        requestedSlug,
        cid,
        subId,
      });

      return null;
    }

    const examId = String(
      selectedExam?.id ?? ""
    );

    if (!examId) return null;

    return {
      governmentConfig,
      level,
      selectedExam,
      cid,
      subId,
      examId,
    };
  }
);

export async function generateMetadata({ params }) {
  const {
    governmentExamsSlug,
    slug,
    examSlug,
  } = await params;

  const session = await getStudentSession();

  const resolved = await resolveExam(
    governmentExamsSlug,
    slug,
    examSlug,
    session?.uid || 0
  );

  if (!resolved) {
    return {
      title: "Exam | MasterMind Academy",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const {
    governmentConfig,
    level,
    selectedExam,
  } = resolved;

  const examName = getExamName(selectedExam);

  return {
    title: `${examName} | ${governmentConfig.name} | MasterMind Academy`,
    description: `Prepare for ${examName} under ${level.name}. Access mock tests, video classes, previous questions and preparation resources.`,
    alternates: {
      canonical: `/dashboard/${governmentExamsSlug}/${slug}/${examSlug}`,
    },
  };
}

export default async function SubExamDetailsPage({
  params,
}) {
  const {
    governmentExamsSlug,
    slug,
    examSlug,
  } = await params;

  if (!governmentExamsSlug || !slug || !examSlug) {
    notFound();
  }

  const session = await getStudentSession();
  const uid = session?.uid || 0;

  const resolved = await resolveExam(
    governmentExamsSlug,
    slug,
    examSlug,
    uid
  );

  if (!resolved) {
    notFound();
  }

  const {
    selectedExam,
    cid,
    subId,
    examId,
  } = resolved;

  const type = selectedExam?.type || "mock";

  const result = await getSubExamDetails({
    uid,
    cid,
    subExamId: examId,
    type,
    offset: 0,
  });

  const details = result?.data;

  const exam =
    details &&
    !Array.isArray(details) &&
    typeof details === "object"
      ? { ...selectedExam, ...details }
      : selectedExam;

  return (
    <main className="min-h-screen bg-[#f4f9ff] pb-5 pt-5">
      <div className="mx-auto w-full max-w-[1450px] px-4 sm:px-6 lg:px-8">
        <ExamDetailsHero
          exam={exam}
          levelSlug={slug}
          governmentExamsSlug={governmentExamsSlug}
        />

        <ExamDetailsTabs
          cid={cid}
          uid={uid}
          examId={examId}
          subId={subId}
          exam={exam}
          governmentExamsSlug={governmentExamsSlug}
        />
      </div>
    </main>
  );
}
