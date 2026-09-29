// src/app/(student)/dashboard/layout.js

import {
  redirect,
} from "next/navigation";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

export default async function DashboardLayout({
  children,
}) {
  const session =
    await getStudentSession();

  /* =========================================================
     NOT LOGGED IN
  ========================================================= */

  if (!session) {
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