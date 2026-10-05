import {
  notFound,
  redirect,
} from "next/navigation";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import ExamAnalysisClient from "./ExamAnalysisClient";

export const dynamic =
  "force-dynamic";

export const metadata = {
  title:
    "Exam Analysis | Student Dashboard | MasterMind Academy",

  robots: {
    index: false,
    follow: false,
  },
};

export default async function ExamAnalysisPage({
  params,
  searchParams,
}) {
  const {
    governmentExamsSlug,
  } = await params;

  const query =
    await searchParams;

  const config =
    getGovernmentExamConfig(
      governmentExamsSlug
    );

  if (!config) {
    notFound();
  }

  const cid =
    Number(
      config?.cid
    );

  if (
    !Number.isFinite(cid) ||
    cid <= 0
  ) {
    notFound();
  }

  const session =
    await getStudentSession();

  const uid =
    Number(
      session?.uid
    );

  if (
    !Number.isFinite(uid) ||
    uid <= 0
  ) {
    const redirectPath =
      `/dashboard/${governmentExamsSlug}/exam-analysis`;

    redirect(
      `/login?redirect=${encodeURIComponent(
        redirectPath
      )}`
    );
  }

  const attemptId =
    String(
      query?.attemptId ??
      ""
    ).trim();

  const examType =
    String(
      query?.examType ??
      ""
    )
      .trim()
      .toLowerCase();

  const examTitle =
    String(
      query?.title ??
      ""
    ).trim();

  const examName =
    examTitle ||
    config?.shortName ||
    config?.name ||
    "";

  return (
    <main
      className="
        min-h-screen
        bg-[#f4f7fc]
        px-4
        py-6
        sm:px-6
        lg:px-8
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-[1450px]
        "
      >
        <ExamAnalysisClient
          cid={
            cid
          }
          attemptId={
            attemptId
          }
          examType={
            examType
          }
          examName={
            examName
          }
        />
      </div>
    </main>
  );
}