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

import MockTestDetails from "./components/MockTestDetails";

export const dynamic =
  "force-dynamic";

/* =========================================================
   METADATA
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
      `${config.name} Mock Test | Student Dashboard | MasterMind Academy`,

    robots: {
      index: false,
      follow: false,
    },
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function MockTestDetailsPage({
  params,
  searchParams,
}) {
  const {
    governmentExamsSlug,
    examId,
  } = await params;

  const query =
    await searchParams;

  /* =======================================================
     CONFIG
  ======================================================= */

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

  /* =======================================================
     SESSION
  ======================================================= */

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
    const redirectUrl =
      `/dashboard/${governmentExamsSlug}/mock-tests/${examId}`;

    redirect(
      `/login?redirect=${encodeURIComponent(
        redirectUrl
      )}`
    );
  }

  /* =======================================================
     TITLE FROM SELECTED MOCK CARD
  ======================================================= */

  const examTitle =
    String(
      query?.title ??
      ""
    ).trim();

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main
      className="
        min-h-screen
        bg-[#f4f7fc]
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
        <MockTestDetails
          examId={
            examId
          }
          uid={
            uid
          }
          cid={
            cid
          }
          examTitle={
            examTitle
          }
          examName={
            config?.name ||
            "Government Exams"
          }
          shortName={
            config?.shortName ||
            config?.name ||
            ""
          }
          governmentExamsSlug={
            governmentExamsSlug
          }
        />
      </div>
    </main>
  );
}