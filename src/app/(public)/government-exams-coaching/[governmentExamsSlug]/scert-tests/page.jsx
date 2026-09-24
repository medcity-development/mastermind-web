import {
  notFound,
} from "next/navigation";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import {
  getScertFolders,
} from "@/lib/scertHelper";

import ScertHero from "./components/ScertHero";
import ScertFolders from "./components/ScertFolders";

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
      `${config.name} SCERT Tests | MasterMind Academy`,

    description:
      `Practice class-wise SCERT tests for ${config.name} preparation.`,

    alternates: {
      canonical:
        `/government-exams-coaching/${governmentExamsSlug}/scert-tests`,
    },
  };
}

export default async function ScertTestsPage({
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

  const result =
    await getScertFolders({
      uid: 0,
      cid,
      offset: 0,
    });

  const folders =
    Array.isArray(
      result?.data
    )
      ? result.data
      : [];

  return (
    <main className="min-h-screen bg-[#f5f9ff]">
      <div
        className="
          mx-auto
          w-full
          max-w-[1450px]
          px-4
          py-6
          sm:px-6
          lg:px-8
          lg:py-8
        "
      >
        <ScertHero
          examName={name}
          shortName={
            shortName
          }
        />

        <ScertFolders
          folders={
            folders
          }
          cid={cid}
          examName={name}
          governmentExamsSlug={
            governmentExamsSlug
          }
        />
      </div>
    </main>
  );
}