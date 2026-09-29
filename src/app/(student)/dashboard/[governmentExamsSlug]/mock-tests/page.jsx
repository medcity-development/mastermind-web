import {
  notFound,
} from "next/navigation";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import {
  getMockExamSubCategories,
} from "@/lib/pscApi";

import MockTestHero from "./components/MockTestHero";
import MockTestContent from "./components/MockTestContent";

/* =========================================================
   METADATA
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

  return {
    title:
      `${config.name} Mock Tests | Student Dashboard | MasterMind Academy`,

    description:
      `Practice ${config.name} mock tests from your MasterMind student dashboard.`,

    robots: {
      index: false,
      follow: false,
    },
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function MockTestsPage({
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
    cid,
    name,
    shortName,
  } = config;

  /*
   * TEMPORARY.
   *
   * Replace this later with the logged-in
   * student's uid from your auth/session.
   */
  const uid = 37515;

  /* =======================================================
     CATEGORIES
  ======================================================= */

  let categoryResult = null;

  try {
    categoryResult =
      await getMockExamSubCategories({
        cid,
        uid,
        subId: 2,
      });
  } catch (error) {
    console.error(
      `Unable to load ${name} mock categories:`,
      error
    );
  }

  const categories =
    Array.isArray(
      categoryResult?.categories
    )
      ? categoryResult.categories
      : [];

  /* =======================================================
     HERO
  ======================================================= */

  const isKeralaPsc =
    Number(cid) === 1;

  const heroContent =
    isKeralaPsc
      ? {
          eyebrow:
            `${name} Practice Zone`,

          headingPrefix:
            "Practice Smarter With",

          headingHighlight:
            `${name} Mock Tests`,

          description:
            `Practice exam-focused ${name} mock tests, improve speed and accuracy, and prepare confidently for upcoming exams.`,

          panelEyebrow:
            "Ready to Practice?",

          panelTitle:
            "Choose Your Level",

          panelDescription:
            `Select your ${name} exam level and start practicing.`,

          featureText:
            `Practice consistently and track your performance across ${name} mock exams.`,
        }
      : {
          eyebrow:
            `${name} Practice Zone`,

          headingPrefix:
            "Practice Smarter With",

          headingHighlight:
            `${name} Mock Tests`,

          description:
            `Practice exam-focused ${name} mock tests, improve your speed and accuracy, and prepare confidently for competitive exams.`,

          panelEyebrow:
            "Ready to Practice?",

          panelTitle:
            "Choose Your Exam",

          panelDescription:
            `Choose an available ${name} category and start practicing.`,

          featureText:
            `Practice consistently and track your performance across ${name} mock exams.`,
        };

  return (
    <main
      className="
        min-h-screen
        bg-[#f4f7fc]
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
        <MockTestHero
          examName={name}
          shortName={shortName}
          heroContent={heroContent}
        />

        <MockTestContent
          cid={cid}
          uid={uid}
          examName={name}
          shortName={shortName}
          governmentExamsSlug={
            governmentExamsSlug
          }
          categories={categories}
        />
      </div>
    </main>
  );
}