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

import Hero1 from "./db-hero/Hero1";

import LearningToolsGrid from "./learning-tools-grid/LearningToolsGrid";

import ExamCategorySection from "./exam-category-section/ExamCategorySection";



import AiShortVideos from "./ai-short-videos/components/AIShortVideos";

import CompetitiveExamPacks from "./competitive-exam-packs/CompetitiveExamPacks";

import LatestUpdatesSection from "./latest-updates/components/LatestUpdatesSection";

import KPSCFAQ from "./faq/KPSCFAQ";
import RecommendedCoursesSection from "./recommeded-courses/components/RecommendedCoursesSection";

/* =========================================================
   RESOLVE API COURSE

   API data is optional enhancement.

   ROUTE CONFIG remains the source of truth:

   kerala-psc -> cid 1
   rrb-ssc    -> cid 2
========================================================= */

async function resolveCourse(
  config
) {
  try {
    if (
      config?.cid ===
        undefined ||
      config?.cid ===
        null ||
      config?.cid ===
        ""
    ) {
      return null;
    }

    const result =
      await getMainCourses();

    const courses =
      Array.isArray(
        result?.courses
      )
        ? result.courses
        : [];

    const course =
      courses.find(
        (item) =>
          Number(
            item?.id
          ) ===
          Number(
            config.cid
          )
      ) ?? null;

    return course;
  } catch (error) {
    console.error(
      "Unable to resolve API course:",
      error
    );

    return null;
  }
}

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
    return {
      robots: {
        index: false,
        follow: false,
      },
    };
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
        `Prepare for ${config.name} exams with mock tests, current affairs, previous questions and learning resources.`,

      url:
        pageUrl,

      type:
        "website",
    },
  };
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

  /* =====================================================
     ROUTE CONFIG

     THIS decides the current exam.

     /kerala-psc
       -> cid 1

     /rrb-ssc
       -> cid 2
  ===================================================== */

  const config =
    getGovernmentExamConfig(
      governmentExamsSlug
    );

  if (!config) {
    notFound();
  }

  /* =====================================================
     DYNAMIC VALUES FROM CONFIG

     Do not derive these from API.
  ===================================================== */

  const cid =
    Number(
      config.cid
    );

  const examName =
    config.name;

  const shortName =
    config.shortName;

  const hero =
    config.hero ??
    null;

  const basePath =
    `/government-exams-coaching/${governmentExamsSlug}`;

  /* =====================================================
     OPTIONAL COURSE FROM API

     Used only when child components need
     extra course information.

     It must NOT control route identity.
  ===================================================== */

  const apiCourse =
    await resolveCourse(
      config
    );

  const course =
    apiCourse ?? {
      id:
        cid,

      cid:
        cid,

      exam:
        examName,

      name:
        examName,

      slug:
        config.slug,

      shortName:
        shortName,
    };

  /* =====================================================
     DEBUG

     Temporarily enable if required:

     console.log({
       governmentExamsSlug,
       cid,
       examName,
       apiCourse,
     });
  ===================================================== */

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
        {/* =================================================
            HERO

            hero content comes from:
            governmentExamConfig.js
        ================================================= */}

        {hero && (
          <Hero1
            hero={
              hero
            }
            basePath={
              basePath
            }
            cid={
              cid
            }
            examName={
              examName
            }
            shortName={
              shortName
            }
            governmentExamsSlug={
              governmentExamsSlug
            }
          />
        )}

        {/* =================================================
            LEARNING TOOLS
        ================================================= */}

        <div className="mt-5">
          <LearningToolsGrid
            cid={
              cid
            }
            course={
              course
            }
            governmentExamsSlug={
              governmentExamsSlug
            }
            examName={
              examName
            }
            shortName={
              shortName
            }
          />
        </div>

        {/* =================================================
            EXAM CATEGORIES

            KPSC:
            cid = 1

            RRB / SSC:
            cid = 2
        ================================================= */}

        <div className="mt-5">
          <ExamCategorySection
            cid={
              cid
            }
            uid={
              0
            }
            course={
              course
            }
            governmentExamsSlug={
              governmentExamsSlug
            }
            examName={
              examName
            }
            shortName={
              shortName
            }
          />
        </div>

        {/* =================================================
            RECOMMENDED COURSES

            IMPORTANT:

            Do NOT use the old SubExamSection here.

            This section should use:
            getHomeResponses({
              cid
            })

            and result.subexams.
        ================================================= */}

        <RecommendedCoursesSection
          cid={
            cid
          }
          examName={
            examName
          }
          shortName={
            shortName
          }
          governmentExamsSlug={
            governmentExamsSlug
          }
        />

        {/* =================================================
            AI SHORT VIDEOS
        ================================================= */}

        <div className="mt-5">
          <AiShortVideos
            cid={
              cid
            }
            uid={
              0
            }
            course={
              course
            }
            governmentExamsSlug={
              governmentExamsSlug
            }
            examName={
              examName
            }
            shortName={
              shortName
            }
          />
        </div>

        {/* =================================================
            COMPETITIVE EXAM PACKS
        ================================================= */}

        <div className="mt-5">
         <CompetitiveExamPacks
  cid={cid}
  uid={0}
  course={course}
  governmentExamsSlug={
    governmentExamsSlug
  }
  examName={
    examName
  }
/>
        </div>

        {/* =================================================
            LATEST UPDATES
        ================================================= */}

        <div className="mt-5">
          <LatestUpdatesSection
  cid={cid}
  uid={0}
  course={course}
  governmentExamsSlug={
    governmentExamsSlug
  }
  examName={
    examName
  }
  shortName={
    shortName
  }
/>
        </div>

        {/* =================================================
            FAQ
        ================================================= */}

        <div className="mt-5">
          <KPSCFAQ
            cid={
              cid
            }
            governmentExamsSlug={
              governmentExamsSlug
            }
            examName={
              examName
            }
            shortName={
              shortName
            }
          />
        </div>
      </div>
    </main>
  );
}