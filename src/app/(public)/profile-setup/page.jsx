
import { redirect } from "next/navigation";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import {
  getPostLoginRedirectPath,
} from "@/lib/auth/postLoginRedirect";

import {
  getStudentProfile,
} from "@/lib/studentProfileHelper";

import ProfileSetup from "./components/ProfileSetup";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Complete Profile | MasterMind Academy",
  description: "Complete your student profile.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProfileSetupPage({
  searchParams,
}) {
  const query = await searchParams;
  const session = await getStudentSession();

  const redirectTo = getPostLoginRedirectPath(
    query?.redirect
  );

  if (!session?.uid) {
    const loginPath = redirectTo
      ? `/login?redirect=${encodeURIComponent(redirectTo)}`
      : "/login";

    redirect(loginPath);
  }

  let result;

  try {
    result = await getStudentProfile({
      uid: session.uid,
      cid: 1,
    });
  } catch (error) {
    console.error(
      "PROFILE SETUP LOOKUP ERROR:",
      error
    );
  }

  if (!result?.status) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#071b59] px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
          <h1 className="text-xl font-bold text-[#071b59]">
            Unable to verify your profile
          </h1>

          <p className="mt-3 text-sm text-slate-600">
            We could not retrieve your account details.
            Please try again.
          </p>

          <a
            href={
              redirectTo
                ? `/profile-setup?redirect=${encodeURIComponent(redirectTo)}`
                : "/profile-setup"
            }
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white"
          >
            Try again
          </a>
        </div>
      </main>
    );
  }

  const profile = result.profile;

  if (
    profile?.id != null &&
    String(profile.id) !== String(session.uid)
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#071b59] px-4">
        <div className="rounded-3xl bg-white p-8 text-center">
          <h1 className="text-xl font-bold">
            Account verification failed
          </h1>
          <p className="mt-3 text-sm">
            Please sign in again.
          </p>
          <a
            href="/login"
            className="mt-5 inline-block text-blue-600"
          >
            Return to login
          </a>
        </div>
      </main>
    );
  }

  // The backend is authoritative, including
  // profiles completed through the Android app.

  if (result.profileCompleted === true) {
    redirect(redirectTo || "/");
  }

  return (
    <main className="relative isolate flex min-h-[calc(100dvh-64px)] items-center justify-center overflow-y-auto bg-gradient-to-br from-[#071b59] via-[#102b78] to-[#10144b] px-3 py-3 sm:px-5 sm:py-4">
      <div className="pointer-events-none absolute -left-32 -top-32 -z-10 h-[420px] w-[420px] rounded-full bg-blue-500/20 blur-[110px]" />

      <div className="pointer-events-none absolute -bottom-32 -right-32 -z-10 h-[420px] w-[420px] rounded-full bg-violet-500/20 blur-[110px]" />

      <div className="relative mx-auto w-full max-w-[760px]">
        <ProfileSetup
          redirectTo={redirectTo}
          authData={{
            uid: session.uid,
            email: session.email,
            name:
              profile?.name ||
              session.name ||
              "",
            mobile: profile?.mobile || "",
            dob: profile?.dob || "",
            place: profile?.place || "",
            avatar: profile?.avatar || "",
            promocode: profile?.promocode || "",
            stage:
              profile?.stage ||
              session.stage ||
              "",
          }}
        />
      </div>
    </main>
  );
}
