import { notFound, redirect } from "next/navigation";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import {
  getPyqExamDetails,
  getPyqExamBySlug,
} from "@/lib/pyqDetailsHelper";
import { createSlug } from "@/lib/pscSlug";

import ExamHero from "./components/ExamHero";
import ExamInstructions from "./components/ExamInstructions";

/* =========================================================
   PARAM HELPERS
========================================================= */

function getQueryValues(query, cid) {
  return {
    uid: 0,
    cid,
    type:
      query?.type ??
      "pqp",
  };
}

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  params,
}) {
  const { examId, governmentExamsSlug } = await params;

  const config = getGovernmentExamConfig(governmentExamsSlug);
  if (!config) return {};

  const title = /^\d+$/.test(examId)
    ? `${config.name} Previous Question Paper`
    : examId
        .split("-")
        .filter(Boolean)
        .map((word) => `${word[0].toUpperCase()}${word.slice(1)}`)
        .join(" ");

  return {
    title:
      `${title} | MasterMind Academy`,

    description:
      `${config.name} previous question paper exam details and instructions.`,

    alternates: {
      canonical:
        `/government-exams-coaching/${governmentExamsSlug}/previous-questions/${examId}`,
    },
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function PyqDetailsPage({
  params,
  searchParams,
}) {
  const {
    examId,
    governmentExamsSlug,
  } =
    await params;

  const config = getGovernmentExamConfig(governmentExamsSlug);
  if (!config) notFound();

  const query =
    await searchParams;

  if (Object.keys(query ?? {}).length > 0) {
    redirect(
      `/government-exams-coaching/${governmentExamsSlug}/previous-questions/${examId}`
    );
  }

  const {
    uid,
    cid,
    type,
  } = getQueryValues(
    query,
    config.cid
  );

  let examRecord = null;
  if (!/^\d+$/.test(examId)) {
    try {
      examRecord = await getPyqExamBySlug({
        uid,
        cid,
        slug: examId,
        type,
      });
    } catch (error) {
      console.error(
        "Unable to resolve previous question paper slug:",
        error
      );
      return (
        <main className="min-h-screen bg-[#f5f9ff] px-4 py-16">
          <section className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm">
            <h1 className="text-xl font-bold text-[#082e5a]">
              Previous questions are temporarily unavailable
            </h1>
            <p className="mt-3 text-slate-600">
              Please try again in a little while.
            </p>
            <a
              href={`/government-exams-coaching/${encodeURIComponent(governmentExamsSlug)}/previous-questions/${encodeURIComponent(examId)}`}
              className="mt-5 inline-flex rounded-lg bg-[#017dc0] px-5 py-3 font-semibold text-white"
            >
              Try again
            </a>
          </section>
        </main>
      );
    }
  }

  if (!/^\d+$/.test(examId) && !examRecord?.id) {
    notFound();
  }

  const detailsResult =
    await getPyqExamDetails({
      uid,
      cid,
      examId: examRecord?.id ?? examId,
      type,
    });

  const exam =
    detailsResult?.exam ?? examRecord;

  if (!exam) {
    notFound();
  }

  const examSlug = createSlug(exam.exam_name);
  if (examId !== examSlug) {
    redirect(
      `/government-exams-coaching/${governmentExamsSlug}/previous-questions/${examSlug}`
    );
  }

  return (
    <main
      className="
        min-h-screen
        bg-[#f5f9ff]
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
        <ExamHero
          exam={
            exam
          }
          examName={
            config.name
          }
          governmentExamsSlug={
            governmentExamsSlug
          }
        />

        <div className="mt-6">
          <ExamInstructions
            exam={
              exam
            }
            instructions={
              detailsResult?.instructions ?? []
            }
            examSlug={examSlug}
            view={
              detailsResult?.view ?? ""
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