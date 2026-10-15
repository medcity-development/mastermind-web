// src/app/(student)/dashboard/layout.js

import {
  redirect,
} from "next/navigation";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

export const dynamic =
  "force-dynamic";

export default async function DashboardLayout({
  children,
}) {
  const session =
    await getStudentSession();

  /* =========================================================
     NOT LOGGED IN
  ========================================================= */

  const uid = Number(session?.uid);
  if (
    session?.authenticated !== true ||
    !Number.isFinite(uid) ||
    uid <= 0
  ) {
    redirect(
      "/login?redirect=/dashboard"
    );
  }

  /* =========================================================
     PROFILE NOT COMPLETED
  ========================================================= */

  if (
    session.stage !==
    "completed"
  ) {
    redirect(
      "/profile-setup"
    );
  }

  /* =========================================================
     AUTHENTICATED USER
  ========================================================= */

  return (
    <>
      {children}
    </>
  );
}
