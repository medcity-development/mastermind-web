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
    notFound();
  }

  if (
    String(detailsResult.exam.access ?? "")
      .trim()
      .toLowerCase() === "paid"
  ) {
    const access = await checkPremiumExamAccess({
      uid,
      cid,
      examId,
      type: examType,
      exam: detailsResult.exam,
    });

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
    return (
      <p
        role="alert"
        className="p-6 text-red-700"
      >
        Unable to load the question paper.
        Please refresh and try again.
      </p>
    );
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