// src/app/(public)/profile-setup/page.jsx

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import ProfileSetup from "./components/ProfileSetup";

export const metadata = {
  title:
    "Complete Profile | MasterMind Academy",

  description:
    "Complete your MasterMind Academy profile.",
};

export default async function ProfileSetupPage() {
  const cookieStore =
    await cookies();

  const uid =
    cookieStore.get(
      "mastermind_uid"
    )?.value || "";

  const email =
    cookieStore.get(
      "mastermind_email"
    )?.value || "";

  const mobile =
    cookieStore.get(
      "mastermind_mobile"
    )?.value || "";

  const stage =
    cookieStore.get(
      "mastermind_stage"
    )?.value || "";

  console.log(
    "PROFILE SETUP PAGE COOKIE DATA:",
    {
      uid,
      email,
      mobile,
      stage,
    }
  );

  /* =========================================================
     OTP MUST BE VERIFIED
  ========================================================= */

  if (!uid) {
    redirect("/login");
  }

  /* =========================================================
     PROFILE SETUP

     Do NOT redirect stage === completed here.

     Existing completed users are already handled
     from OTP page using the course selection modal.
  ========================================================= */

  return (
    <section
      className="
        min-h-[calc(100vh-76px)]
        bg-[#eef5ff]
        px-4
        py-10
        sm:px-6
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-[540px]
        "
      >
        <ProfileSetup
          authData={{
            uid,
            email,
            mobile,
            stage,
          }}
        />
      </div>
    </section>
  );
}