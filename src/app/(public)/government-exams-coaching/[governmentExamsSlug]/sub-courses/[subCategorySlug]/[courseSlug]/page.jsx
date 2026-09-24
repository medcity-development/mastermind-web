// src/app/(public)/government-exams-coaching/[governmentExamsSlug]/sub-courses/[subCategorySlug]/[courseSlug]/page.jsx

import {
  notFound,
} from "next/navigation";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import {
  getSubExamDetails,
} from "@/lib/subExamDetailsHelper";

import ExamDetailsHero from "../../../(exam-level)/[slug]/[examSlug]/components/ExamDetailsHero";

import ExamDetailsTabs from "../../../(exam-level)/[slug]/[examSlug]/components/ExamDetailsTabs";

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  params,
  searchParams,
}) {
  const {
    governmentExamsSlug,
    courseSlug,
  } = await params;

  const query =
    await searchParams;

  const config =
    getGovernmentExamConfig(
      governmentExamsSlug
    );

  if (!config) {
    return {};
  }

  const examId =
    query?.examId ??
    query?.examid ??
    null;

  if (!examId) {
    return {
      title:
        `${config.name} Exam | MasterMind Academy`,
    };
  }

  const result =
    await getSubExamDetails({
      uid: 0,

      cid:
        config.cid,

      subExamId:
        examId,

      type:
        query?.type ??
        "mock",

      offset: 0,
    });

  const exam =
    result?.data ??
    null;

  const title =
    exam?.exam ??
    exam?.exam_name ??
    exam?.name ??
    String(
      courseSlug
    )
      .replace(
        /-/g,
        " "
      );

  return {
    title:
      `${title} | ${config.name} | MasterMind Academy`,

    description:
      `Explore ${title} preparation resources, mock tests, previous questions and study materials for ${config.name}.`,
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function SubCourseDetailsPage({
  params,
  searchParams,
}) {
  const {
    governmentExamsSlug,
    subCategorySlug,
    courseSlug,
  } = await params;

  const query =
    await searchParams;

  /* =====================================================
     GOVERNMENT EXAM CONFIG
  ===================================================== */

  const config =
    getGovernmentExamConfig(
      governmentExamsSlug
    );

  if (!config) {
    notFound();
  }

  const cid =
    Number(
      config.cid
    );

  /* =====================================================
     QUERY VALUES
  ===================================================== */

  const subId =
    query?.subId ??
    query?.subid ??
    null;

  const examId =
    query?.examId ??
    query?.examid ??
    null;

  const type =
    query?.type ??
    "mock";

  if (!examId) {
    console.error(
      "Missing examId:",
      {
        governmentExamsSlug,
        subCategorySlug,
        courseSlug,
      }
    );

    notFound();
  }

  /* =====================================================
     EXAM DETAILS
  ===================================================== */

  const result =
    await getSubExamDetails({
      uid: 0,

      cid,

      subExamId:
        examId,

      type,

      offset: 0,
    });

  if (
    !result?.status ||
    !result?.data
  ) {
    console.error(
      "Unable to load exam details:",
      {
        cid,
        examId,
        type,
        message:
          result?.message,
      }
    );

    notFound();
  }

  const exam =
    result.data;

  /* =====================================================
     DYNAMIC BACK ROUTE
  ===================================================== */

  const levelSlug =
    subCategorySlug;

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <main
      className="
        min-h-screen
        bg-[#f4f9ff]
        pb-12
        pt-[95px]
        lg:pt-[110px]
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
        {/* =================================================
            HERO
        ================================================= */}

        <ExamDetailsHero
          exam={
            exam
          }
          levelSlug={
            levelSlug
          }
          governmentExamsSlug={
            governmentExamsSlug
          }
          examName={
            config.name
          }
          shortName={
            config.shortName
          }
        />

        {/* =================================================
            EXAM TABS
        ================================================= */}

        <div className="mt-5">
          <ExamDetailsTabs
            cid={
              cid
            }
            uid={
              0
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
            examName={
              config.name
            }
            shortName={
              config.shortName
            }
          />
        </div>
      </div>
    </main>
  );
}