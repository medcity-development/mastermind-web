import {
  notFound,
} from "next/navigation";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import CurrentAffairsQuizHero from "./components/CurrentAffairsQuizHero";
import CurrentAffairsQuizContent from "./components/CurrentAffairsQuizContent";

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
    `/government-exams-coaching/${governmentExamsSlug}/current-affairs-quiz`;

  return {
    title:
      `${config.name} Current Affairs Quiz | MasterMind Academy`,

    description:
      `Practice ${config.name} current affairs quizzes and improve your exam preparation.`,

    alternates: {
      canonical:
        pageUrl,
    },
  };
}

export default async function CurrentAffairsQuizPage({
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
        <CurrentAffairsQuizHero
          examName={name}
          shortName={
            shortName
          }
        />

        <CurrentAffairsQuizContent
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