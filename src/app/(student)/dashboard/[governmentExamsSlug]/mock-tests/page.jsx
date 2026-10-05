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

import {
  getMockExamSubCategories,
} from "@/lib/pscApi";

import MockTestHero from "./components/MockTestHero";
import MockTestContent from "./components/MockTestContent";

export const dynamic =
  "force-dynamic";

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

  /* =======================================================
     CONFIG
  ======================================================= */

  const config =
    getGovernmentExamConfig(
      governmentExamsSlug
    );

  if (!config) {
    notFound();
  }

  const cid =
    Number(
      config?.cid
    );

  if (
    !Number.isFinite(cid) ||
    cid <= 0
  ) {
    notFound();
  }

  const name =
    config?.name || "";

  const shortName =
    config?.shortName ||
    name;

  /* =======================================================
     SESSION
  ======================================================= */

  const session =
    await getStudentSession();

  const uid =
    Number(
      session?.uid
    );

  if (
    !Number.isFinite(uid) ||
    uid <= 0
  ) {
    const redirectPath =
      `/dashboard/${governmentExamsSlug}/mock-tests`;

    redirect(
      `/login?redirect=${encodeURIComponent(
        redirectPath
      )}`
    );
  }

  /* =======================================================
     CATEGORIES
  ======================================================= */

  let categoryResult = {
    status: false,
    categories: [],
    message: "",
  };

  try {
    categoryResult =
      await getMockExamSubCategories({
        cid,
        uid,

        /*
         * Your existing backend request
         * uses subid=2 for this category API.
         */
        subId: 2,
      });
  } catch (error) {
    console.error(
      "MOCK CATEGORY PAGE ERROR:",
      error
    );

    categoryResult = {
      status: false,
      categories: [],

      message:
        error?.message ||
        "Unable to load mock tests.",
    };
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

  const heroContent = {
    eyebrow:
      `${name} Practice Zone`,

    headingPrefix:
      "Practice Smarter With",

    headingHighlight:
      `${name} Mock Tests`,

    description:
      `Practice exam-focused ${name} mock tests, improve speed and accuracy, and prepare confidently for upcoming competitive exams.`,

    panelEyebrow:
      "Ready to Practice?",

    panelTitle:
      "Choose Your Exam",

    panelDescription:
      `Choose an available ${name} exam category and start practicing.`,

    featureText:
      `Practice consistently and track your performance across ${name} mock exams.`,
  };

  /* =======================================================
     UI
  ======================================================= */

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
          examName={
            name
          }
          shortName={
            shortName
          }
          heroContent={
            heroContent
          }
        />

        <MockTestContent
          cid={
            cid
          }
          uid={
            uid
          }
          examName={
            name
          }
          shortName={
            shortName
          }
          governmentExamsSlug={
            governmentExamsSlug
          }
          categories={
            categories
          }
          initialError={
            categoryResult?.status ===
            false
              ? categoryResult?.message ||
                ""
              : ""
          }
        />
      </div>
    </main>
  );
}