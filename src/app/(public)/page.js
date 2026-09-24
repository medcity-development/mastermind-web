// src/app/(public)/government-exams-coaching/[governmentExamsSlug]/page.jsx

import {
  notFound,
} from "next/navigation";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import {
  getMainCourses,
} from "@/lib/pscApi";

import {
  createSlug,
} from "@/lib/pscSlug";

import Hero1 from "./db-hero/Hero1";
import LearningToolsGrid from "./learning-tools-grid/LearningToolsGrid";
import ExamCategorySection from "./exam-category-section/ExamCategorySection";
import SubExamSection from "./recommeded-courses/[recommendedCoursesSlug]/components/SubExamSection";
import AiShortVideos from "./ai-short-videos/components/AIShortVideos";
import CompetitiveExamPacks from "./competitive-exam-packs/CompetitiveExamPacks";
import LatestUpdatesSection from "./latest-updates/components/LatestUpdatesSection";
import KPSCFAQ from "./faq/KPSCFAQ";
import Navbar from "@/components/navbar/Navbar";

/* =========================================================
   SEO
========================================================= */

export async function generateMetadata({
  params,
}) {
  const {
    governmentExamsSlug,
  } = await params;

  const config =
    getGovernmentExamConfig(
      governmentExamsSlug
    );

  if (!config) {
    return {};
  }

  const pageUrl =
    `/government-exams-coaching/${governmentExamsSlug}`;

  return {
    title:
      `${config.name} Coaching | MasterMind Academy`,

    description:
      `Prepare for ${config.name} exams with mock tests, current affairs, previous questions, study materials and expert preparation resources.`,

    alternates: {
      canonical:
        pageUrl,
    },

    openGraph: {
      title:
        `${config.name} Coaching | MasterMind Academy`,

      description:
        `Prepare for ${config.name} exams with practice tests, current affairs and learning resources.`,

      url:
        pageUrl,

      type:
        "website",
    },
  };
}

/* =========================================================
   RESOLVE COURSE
========================================================= */

async function resolveCourse(
  governmentExamsSlug
) {
  try {
    const {
      courses,
      filePath,
    } =
      await getMainCourses();

    const course =
      courses.find(
        (item) =>
          createSlug(
            item?.exam ??
              ""
          ) ===
          governmentExamsSlug
      ) ?? null;

    return {
      course,
      filePath,
    };
  } catch (error) {
    console.error(
      "Unable to resolve government exam:",
      error
    );

    return {
      course: null,
      filePath: "",
    };
  }
}

/* =========================================================
   PAGE
========================================================= */

export default async function GovernmentExamPage({
  params,
}) {
  const {
    governmentExamsSlug,
  } = await params;

  const config =
    getGovernmentExamConfig(
      governmentExamsSlug
    );

  if (!config) {
    notFound();
  }

  const {
    course,
    filePath,
  } =
    await resolveCourse(
      governmentExamsSlug
    );

  if (!course) {
    notFound();
  }

  return (
    <main
      className="
        min-h-screen
        bg-[#f6f9fd]
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-[1500px]
          px-4
          py-6
          sm:px-6
          lg:px-8
        "
      >
        
        <Hero1
          course={course}
          filePath={
            filePath
          }
          examName={
            config.name
          }
          shortName={
            config.shortName
          }
        />

        <div className="mt-5">
          <LearningToolsGrid
            governmentExamsSlug={
              governmentExamsSlug
            }
            examName={
              config.name
            }
          />
        </div>

        <div className="mt-5">
          <ExamCategorySection
            course={
              course
            }
            governmentExamsSlug={
              governmentExamsSlug
            }
            examName={
              config.name
            }
          />

          <SubExamSection
            course={
              course
            }
            governmentExamsSlug={
              governmentExamsSlug
            }
            examName={
              config.name
            }
          />

          <AiShortVideos
            cid={
              course?.id
            }
            examName={
              config.name
            }
          />

          <CompetitiveExamPacks
            cid={
              course?.id
            }
            examName={
              config.name
            }
          />

          <LatestUpdatesSection
            cid={
              course?.id
            }
            examName={
              config.name
            }
          />

          <KPSCFAQ
            examName={
              config.name
            }
          />
        </div>
      </div>
    </main>
  );
}