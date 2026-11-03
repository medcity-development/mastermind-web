import {
  notFound,
  redirect,
} from "next/navigation";

import {
  getPyqExamDetails,
  getPyqExamBySlug,
  getPyqQuestions,
} from "@/lib/pyqDetailsHelper";
import { createSlug } from "@/lib/pscSlug";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";
import {
  checkPremiumExamAccess,
} from "@/lib/premiumExamAccess";

import ExamClient from "../components/ExamClient";
import ExamLoadError from "../components/ExamLoadError";

export const dynamic = "force-dynamic";

export default async function StartExamPage({
  params,
  searchParams,
}) {
  const {
    examId,
    governmentExamsSlug,
  } = await params;

  const config = getGovernmentExamConfig(
    governmentExamsSlug
  );

  if (!config) {
    notFound();
  }

  const query = await searchParams;
  const session = await getStudentSession();

  const uid = Number(session?.uid) || 0;
  const cid = Number(config.cid);
  const examType = "pqp";
  let examRecord = null;
  if (!/^\d+$/.test(examId)) {
    try {
      examRecord = await getPyqExamBySlug({
        uid,
        cid,
        slug: examId,
        type: examType,
      });
    } catch (error) {
      console.error(
        "Unable to resolve dashboard previous question paper slug:",
        error
      );
      return <ExamLoadError retryAfter={error?.retryAfter} />;
    }
  }

  const resolvedExamId =
    /^\d+$/.test(examId) &&
    Number.isSafeInteger(Number(examId)) &&
    Number(examId) > 0
      ? String(Number(examId))
      : String(examRecord?.id ?? "");

  if (!resolvedExamId) {
    notFound();
  }

  if (examRecord?.exam_name) {
    const canonicalSlug = createSlug(examRecord.exam_name);
    if (canonicalSlug !== examId) {
      const queryString = new URLSearchParams();
      if (query?.guestAction) {
        queryString.set("guestAction", String(query.guestAction));
      }
      if (query?.pauseId) {
        queryString.set("pauseId", String(query.pauseId));
      }

      const suffix = queryString.toString();
      redirect(
        `/dashboard/${encodeURIComponent(governmentExamsSlug)}/previous-questions/${canonicalSlug}/start${suffix ? `?${suffix}` : ""}`
      );
    }
  }

  const initialPauseId = Number(query?.pauseId);

  const detailsResult = await getPyqExamDetails({
    uid,
    cid,
    examId: resolvedExamId,
    type: examType,
  });

  const exam =
    detailsResult?.exam ?? examRecord;

  if (!exam) {
    if (detailsResult?.httpStatus === 404) notFound();
    return <ExamLoadError retryAfter={detailsResult?.retryAfter} />;
  }

  {
    let access;
    try {
      access = await checkPremiumExamAccess({
        uid,
        cid,
        examId: resolvedExamId,
        type: examType,
        exam,
      });
    } catch (error) {
      return <ExamLoadError retryAfter={error?.retryAfter} />;
    }

    if (!access.hasAccess) {
      redirect(
        `/dashboard/${governmentExamsSlug}?showPackages=1`
      );
    }
  }

  const questionsResult = await getPyqQuestions({
    uid,
    cid,
    examId: resolvedExamId,
    examType,
  });

  const questions = Array.isArray(
    questionsResult?.data
  )
    ? questionsResult.data
    : [];

  if (!questions.length) {
    return <ExamLoadError retryAfter={questionsResult?.retryAfter} />;
  }

  const guestAction = [
    "pause",
    "submit",
  ].includes(query?.guestAction)
    ? query.guestAction
    : "";

  return (
    <main className="min-h-screen bg-[#f5f9ff]">
      <div className="mx-auto w-full max-w-[1450px] px-4 py-6 sm:px-6 lg:px-8">
        <ExamClient
          key={`${examId}-${uid}-${initialPauseId || "new"}-${guestAction || "new"}`}
          exam={{
            ...exam,
            id: resolvedExamId,
          }}
          examId={resolvedExamId}
          questions={questions}
          imagePath={
            questionsResult.imagePath ?? ""
          }
          uid={uid}
          cid={cid}
          examType={examType}
          lastPosition={examType}
          initialPauseId={
            Number.isSafeInteger(initialPauseId) &&
            initialPauseId > 0
              ? initialPauseId
              : null
          }
          governmentExamsSlug={
            governmentExamsSlug
          }
          guestAction={guestAction}
        />
      </div>
    </main>
  );
}
