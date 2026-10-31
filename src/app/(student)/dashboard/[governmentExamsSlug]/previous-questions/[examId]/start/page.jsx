import {
  notFound,
  redirect,
} from "next/navigation";

import {
  getPyqExamDetails,
  getPyqQuestions,
} from "@/lib/pyqDetailsHelper";

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

  if (
    !config ||
    !Number.isSafeInteger(Number(examId)) ||
    Number(examId) <= 0
  ) {
    notFound();
  }

  const query = await searchParams;
  const session = await getStudentSession();

  const uid = Number(session?.uid) || 0;
  const cid = Number(config.cid);
  const examType = "pqp";
  const initialPauseId = Number(query?.pauseId);

  const detailsResult = await getPyqExamDetails({
    uid,
    cid,
    examId,
    type: examType,
  });

  if (!detailsResult?.exam) {
    if (detailsResult?.httpStatus === 404) notFound();
    return <ExamLoadError retryAfter={detailsResult?.retryAfter} />;
  }

  {
    let access;
    try {
      access = await checkPremiumExamAccess({
        uid,
        cid,
        examId,
        type: examType,
        exam: detailsResult.exam,
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
    examId,
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
            ...detailsResult.exam,
            id: examId,
          }}
          examId={examId}
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
