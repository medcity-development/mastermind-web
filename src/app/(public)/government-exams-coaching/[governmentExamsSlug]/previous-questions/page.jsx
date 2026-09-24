import {
  notFound,
} from "next/navigation";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import {
  getPreviousQuestions,
} from "@/lib/pyqHelper";

import {
  getSubCategories,
} from "@/lib/subCategoriesHelper";

import PreviousQuestionsHero from "./components/PreviousQuestionsHero";
import PreviousQuestionsList from "./components/PreviousQuestionsList";


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

  return {
    title:
      `${config.name} Previous Questions | MasterMind Academy`,

    description:
      `Practice previous year questions for ${config.name} examinations.`,

    alternates: {
      canonical:
        `/government-exams-coaching/${governmentExamsSlug}/previous-questions`,
    },
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function PreviousQuestionsPage({
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
   * Both requests depend only on cid,
   * so fetch them together.
   */

  const [
    categoriesResult,
    pyqResult,
  ] = await Promise.all([
    getSubCategories({
      cid,
      uid: 0,
    }),

    getPreviousQuestions({
      uid: 0,
      cid,
      offset: 0,
      type: "pqp",
      filter: 0,
    }),
  ]);

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
        "
      >
       
        <PreviousQuestionsHero
          examName={name}
          shortName={
            shortName
          }
        />

        <div
          id="previous-question-list"
          className="mt-6"
        >
          <PreviousQuestionsList
            initialExams={
              pyqResult?.data ??
              []
            }
            initialNextOffset={
              pyqResult?.nextOffset ??
              null
            }
            categories={
              categoriesResult?.data ??
              []
            }
            uid={0}
            cid={cid}
            type="pqp"
            examName={name}
            shortName={
              shortName
            }
            governmentExamsSlug={
              governmentExamsSlug
            }
          />
        </div>
      </div>
    </main>
  );
}