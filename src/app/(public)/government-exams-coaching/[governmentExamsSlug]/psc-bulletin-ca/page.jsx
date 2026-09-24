import {
  notFound,
} from "next/navigation";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import BulletinHero from "./components/BulletinHero";
import BulletinMonths from "./components/BulletinMonths";

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
      `${config.name} Bulletin | MasterMind Academy`,

    description:
      `Browse monthly ${config.name} bulletin content and exam preparation materials.`,

    alternates: {
      canonical:
        `/government-exams-coaching/${governmentExamsSlug}/psc-bulletin-ca`,
    },
  };
}

export default async function BulletinPage({
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
        <BulletinHero
          examName={name}
          shortName={
            shortName
          }
        />

        <BulletinMonths
          cid={cid}
          uid={0}
          examName={name}
          governmentExamsSlug={
            governmentExamsSlug
          }
        />
      </div>
    </main>
  );
}