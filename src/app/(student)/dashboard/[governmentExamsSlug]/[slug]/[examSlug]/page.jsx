import {
  notFound,
} from "next/navigation";

import {
  createSlug,
} from "@/lib/pscSlug";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import {
  resolveSubCategory,
} from "@/lib/subCategoriesHelper";

import {
  getSubExams,
} from "@/lib/pscApi";

import {
  getSubExamDetails,
} from "@/lib/subExamDetailsHelper";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import ExamDetailsHero from "./components/ExamDetailsHero";
import ExamDetailsTabs from "./components/ExamDetailsTabs";

/* =========================================================
   GET EXAM NAME
========================================================= */

function getExamName(
  exam
) {
  return (
    exam?.exam_name ||
    exam?.exam ||
    exam?.name ||
    exam?.title ||
    ""
  );
}

/* =========================================================
   RESOLVE EXAM FROM SEO SLUG
========================================================= */

async function resolveExam({
  governmentExamsSlug,
  levelSlug,
  examSlug,
  uid = 0,
}) {
  /* =======================================================
     GOVERNMENT EXAM CONFIG

     kerala-psc → cid 1
     rrb-ssc    → cid 2
  ======================================================= */

  const governmentConfig =
    getGovernmentExamConfig(
      governmentExamsSlug
    );

  if (!governmentConfig) {
    return null;
  }

  const cid =
    String(
      governmentConfig.cid
    );

  /* =======================================================
     LEVEL SLUG → SUB CATEGORY ID
  ======================================================= */

  const level =
    await resolveSubCategory({
      cid,
      uid:
        uid || 0,
      levelSlug,
    });

  if (!level) {
    return null;
  }

  const subId =
    String(
      level.subId
    );

  /* =======================================================
     LOAD SUB EXAMS
  ======================================================= */

  const result =
    await getSubExams({
      cid,
      uid:
        uid || 0,
      subId,
    });

  const exams =
    Array.isArray(
      result?.exams
    )
      ? result.exams
      : [];

  /* =======================================================
     FIND EXAM BY SEO SLUG
  ======================================================= */

  const selectedExam =
    exams.find(
      (exam) => {
        const name =
          getExamName(
            exam
          );

        if (!name) {
          return false;
        }

        return (
          createSlug(name) ===
          String(
            examSlug
          ).toLowerCase()
        );
      }
    ) || null;

  if (!selectedExam) {
    return null;
  }

  const examId =
    selectedExam?.id
      ? String(
          selectedExam.id
        )
      : "";

  if (!examId) {
    return null;
  }

  return {
    governmentConfig,
    level,
    selectedExam,
    cid,
    subId,
    examId,
  };
}

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  params,
}) {
  const {
    governmentExamsSlug,
    slug,
    examSlug,
  } = await params;

  const resolved =
    await resolveExam({
      governmentExamsSlug,

      levelSlug:
        slug,

      examSlug,
    });

  if (!resolved) {
    return {
      title:
        "Exam | MasterMind Academy",

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

  const examName =
    getExamName(
      selectedExam
    );

  const canonical =
    `/dashboard/` +
    `${governmentExamsSlug}/` +
    `${slug}/` +
    `${examSlug}`;

  return {
    title:
      `${examName} | ${governmentConfig.name} | MasterMind Academy`,

    description:
      `Prepare for ${examName} under ${level.name}. Access mock tests, video classes, previous questions and exam preparation resources.`,

    alternates: {
      canonical,
    },
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function SubExamDetailsPage({
  params,
}) {
  const {
    governmentExamsSlug,
    slug,
    examSlug,
  } = await params;

  if (
    !governmentExamsSlug ||
    !slug ||
    !examSlug
  ) {
    notFound();
  }

  /* =======================================================
     SEO SLUG → API IDS
  ======================================================= */

  const session =
    await getStudentSession();

  const uid =
    session?.uid || "";

  const resolved =
    await resolveExam({
      governmentExamsSlug,

      levelSlug:
        slug,

      examSlug,
    });

  if (!resolved) {
    notFound();
  }

  const {
    selectedExam,
    cid,
    subId,
    examId,
  } = resolved;

  /* =======================================================
     EXAM TYPE

     Keep API value when available.
  ======================================================= */

  const type =
    selectedExam?.type ||
    "mock";

  /* =======================================================
     GET DETAILS
  ======================================================= */

  const result =
    await getSubExamDetails({
      uid,

      cid,

      subExamId:
        examId,

      type,

      offset: 0,
    });

  /*
   Prefer the detailed API object.

   If data is unavailable but the exam was
   already resolved from getSubExams(),
   keep the resolved exam available.
  */

  const exam =
    result?.data ||
    selectedExam;

  if (!exam) {
    notFound();
  }

  return (
    <main
      className="
        min-h-screen
        bg-[#f4f9ff]
        pb-5
        pt-5
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-[1450px]
          px-4
          sm:px-6
          lg:px-8
        "
      >
        <ExamDetailsHero
          exam={
            exam
          }
          levelSlug={
            slug
          }
          governmentExamsSlug={
            governmentExamsSlug
          }
        />

        <ExamDetailsTabs
          cid={
            cid
          }
          uid={
            uid
          }
          examId={
            examId
          }
          subId={
            subId
          }
          exam={
            exam
          }
          governmentExamsSlug={
            governmentExamsSlug
          }
        />
      </div>
    </main>
  );
}

