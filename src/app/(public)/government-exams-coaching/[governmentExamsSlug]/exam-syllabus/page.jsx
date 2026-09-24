import {
  notFound,
} from "next/navigation";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import ExamSyllabusHero from "./components/ExamSyllabusHero";
import ExamSyllabusList from "./components/ExamSyllabusList";

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
    `/government-exams-coaching/${governmentExamsSlug}/exam-syllabus`;

  return {
    title:
      `${config.name} Exam Syllabus | MasterMind Academy`,

    description:
      `Explore ${config.name} exam syllabuses and access official syllabus PDFs for available examinations.`,

    alternates: {
      canonical:
        pageUrl,
    },

    openGraph: {
      title:
        `${config.name} Exam Syllabus | MasterMind Academy`,

      description:
        `Explore ${config.name} exam syllabuses and syllabus PDFs.`,

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

export default async function ExamSyllabusPage({
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
    <main
      className="
        min-h-screen
        bg-[#f4f9ff]
        pb-12
        pt-[100px]
        lg:pt-[115px]
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
       <ExamSyllabusHero
  examName={name}
  shortName={shortName}
/>

      <ExamSyllabusList
  cid={cid}
  examName={name}
  shortName={shortName}
/>
      </div>
    </main>
  );
}