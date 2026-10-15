// src/app/(public)/profile-setup/page.jsx

import { redirect } from "next/navigation";

import { getStudentSession } from "@/lib/auth/getStudentSession";
import { getPostLoginRedirectPath } from "@/lib/auth/postLoginRedirect";

import ProfileSetup from "./components/ProfileSetup";

export const metadata = {
  title:
    "Complete Profile | MasterMind Academy",

  description:
    "Complete your MasterMind Academy profile.",
};

export default async function ProfileSetupPage({ searchParams }) {
  const query = await searchParams;
  const session =
    await getStudentSession();

  /* =========================================================
     OTP MUST BE VERIFIED
  ========================================================= */

  if (!session?.uid) {
    const loginPath = query?.redirect
      ? `/login?redirect=${encodeURIComponent(
          getPostLoginRedirectPath(query.redirect)
        )}`
      : "/login";

    redirect(loginPath);
  }

  /* =========================================================
     PROFILE SETUP

     Do NOT redirect stage === completed here.

     Existing completed users are already handled
     from OTP page using the course selection modal.
  ========================================================= */

  return (
    <div
      className="
        fixed
        inset-0
        z-[10000]
        flex
        items-center
        justify-center
        overflow-y-auto
        isolate
        bg-[#071b59]
        px-4
        py-5
      "
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-32
          -top-36
          -z-10
          h-[420px]
          w-[420px]
          rounded-full
          bg-blue-500/20
          blur-[120px]
        "
      />
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -bottom-40
          -right-32
          -z-10
          h-[460px]
          w-[460px]
          rounded-full
          bg-violet-500/15
          blur-[140px]
        "
      />
      <div
        className="
          mx-auto
          w-full
          max-w-[800px]
          lg:max-w-[940px]
          2xl:max-w-[1080px]
        "
      >
        <ProfileSetup
          redirectTo={getPostLoginRedirectPath(query?.redirect)}
          authData={{
            uid: session.uid,
            email: session.email,
            mobile: "",
            stage: session.stage,
          }}
        />
      </div>
    </div>
  );
}