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
    !Number.isFinite(uid) ||
    uid <= 0
  ) {
    redirect(
      `/login?redirect=/dashboard/${governmentExamsSlug}`
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

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <DashboardShell
      config={config}
      user={user}
    >
      {children}
    </DashboardShell>
  );
}