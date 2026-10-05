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

import PerformanceAnalysisClient from "./PerformanceAnalysisClient";

/* =========================================================
   FORCE DYNAMIC

   Session-dependent dashboard page.
========================================================= */

export const dynamic =
  "force-dynamic";

/* =========================================================
   METADATA
========================================================= */

export const metadata = {
  title:
    "Performance Analysis | Student Dashboard",

  robots: {
    index: false,
    follow: false,
  },
};

/* =========================================================
   PAGE
========================================================= */

export default async function PerformanceAnalysisPage({
  params,
}) {
  /* =======================================================
     ROUTE PARAMS
  ======================================================= */

  const {
    governmentExamsSlug,
  } = await params;

  /* =======================================================
     EXAM CONFIG
  ======================================================= */

  const config =
    getGovernmentExamConfig(
      governmentExamsSlug
    );

  if (!config) {
    notFound();
  }

  /* =======================================================
     STUDENT SESSION
  ======================================================= */

  const session =
    await getStudentSession();

  const uid =
    Number(
      session?.uid
    );

  /* =======================================================
     AUTH CHECK
  ======================================================= */

  if (
    !Number.isFinite(uid) ||
    uid <= 0
  ) {
    redirect(
      "/login"
    );
  }

  /* =======================================================
     COURSE ID
  ======================================================= */

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
     EXAM NAME
  ======================================================= */

  const examName =
    config?.name ||
    config?.shortName ||
    "Government Exams";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main
      className="
        min-h-screen
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
        <PerformanceAnalysisClient
          cid={cid}
          uid={uid}
          examName={
            examName
          }
        />
      </div>
    </main>
  );
}