import {
  notFound,
} from "next/navigation";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import {
  getStudyMaterials,
} from "@/lib/studyMaterialsHelper";

import StudyMaterialsHero from "./components/StudyMaterialsHero";

import StudyMaterialsList from "./components/StudyMaterialsList";

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
      `${config.name} Study Materials | MasterMind Academy`,

    description:
      `Download ${config.name} study materials, PDFs and preparation resources.`,

    alternates: {
      canonical:
        `/government-exams-coaching/${governmentExamsSlug}/study-materials`,
    },
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function StudyMaterialsPage({
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

  const cid =
    Number(
      config.cid
    );

  const result =
    await getStudyMaterials({
      uid: 0,
      cid,
    });

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
        <StudyMaterialsHero
          examName={
            config.name
          }
          shortName={
            config.shortName
          }
          total={
            result?.total ??
            0
          }
        />

        <StudyMaterialsList
          materials={
            result?.data ??
            []
          }
          examName={
            config.name
          }
          error={
            result?.status
              ? ""
              : result?.message
          }
        />
      </div>
    </main>
  );
}