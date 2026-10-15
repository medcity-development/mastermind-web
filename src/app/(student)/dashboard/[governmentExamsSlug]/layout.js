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

import {
  getStudentProfile,
} from "@/lib/studentProfileHelper";

import {
  getHomeResponses,
} from "@/lib/pscApi";

import {
  GOVERNMENT_EXAM_CONFIG,
} from "@/lib/governmentExamConfig";

import DashboardShell from "../common-components/DashboardShell";

export const dynamic =
  "force-dynamic";

export default async function GovernmentExamDashboardLayout({
  children,
  params,
}) {
  const {
    governmentExamsSlug,
  } = await params;

  /* =========================================================
     GOVERNMENT EXAM CONFIG
  ========================================================= */

  const config =
    getGovernmentExamConfig(
      governmentExamsSlug
    );

  if (!config) {
    notFound();
  }

  /* =========================================================
     STUDENT SESSION
  ========================================================= */

  const session =
    await getStudentSession();

  const uid =
    Number(
      session?.uid
    );

  if (
    session?.authenticated !== true ||
    !Number.isFinite(uid) ||
    uid <= 0
  ) {
    redirect(
      `/login?redirect=${encodeURIComponent(
        `/dashboard/${governmentExamsSlug}`
      )}`
    );
  }

  if (session.stage !== "completed") {
    redirect(
      `/profile-setup?redirect=${encodeURIComponent(
        `/dashboard/${governmentExamsSlug}`
      )}`
    );
  }

  /* =========================================================
     STUDENT PROFILE
  ========================================================= */

  let profile =
    {};

  try {
    const result =
      await getStudentProfile({
        uid,

        cid:
          config.cid,
      });

    profile =
      result?.profile ||
      result?.data?.profile ||
      result?.data ||
      {};
  } catch (error) {
    console.error(
      "Dashboard profile load error:",
      error
    );
  }

  /* =========================================================
     HEADER / DASHBOARD USER
  ========================================================= */

  const user = {
    uid,

    name:
      profile?.name ||
      session?.name ||
      "Student",

    email:
      profile?.emailId ||
      profile?.email ||
      session?.email ||
      "",

    mobile:
      profile?.mobile ||
      "",

    profile,
  };

  let learningToolGrid = [];

  try {
    const homeResponse = await getHomeResponses({
      uid,
      cid: config.cid,
    });
    learningToolGrid = Array.isArray(homeResponse?.grid)
      ? homeResponse.grid
      : [];
  } catch (error) {
    console.error("Dashboard sidebar tools load error:", error);
  }

  const dashboardOptions = Object.values(GOVERNMENT_EXAM_CONFIG).map(
    ({ slug, name, shortName }) => ({ slug, name, shortName })
  );

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <DashboardShell
      config={config}
      user={user}
      learningToolGrid={learningToolGrid}
      dashboardOptions={dashboardOptions}
    >
      {children}
    </DashboardShell>
  );
}