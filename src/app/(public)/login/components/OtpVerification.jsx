
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ShieldCheck,
  LockKeyhole,
  MailCheck,
} from "lucide-react";

import Swal from "sweetalert2";

import LoginButton from "./LoginButton";

import CourseChoiceModal from "@/app/(public)/profile-setup/components/CourseChoiceModal";

export default function OtpVerification({
  authData,
  onBack,
  redirectTo = "",
}) {
  const router = useRouter();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCourseModal, setShowCourseModal] =
    useState(false);

  const busy = useRef(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (busy.current) return;

    const cleanOtp = otp.trim();

    if (!/^\d{4,6}$/.test(cleanOtp)) {
      await Swal.fire({
        icon: "warning",
        title: "Invalid OTP",
        text:
          "Enter the verification code sent to your email.",
        confirmButtonColor: "#2468f2",
      });

      return;
    }

    busy.current = true;
    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/verify-otp",
        {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: authData?.email,
            otp: cleanOtp,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || result?.status !== true) {
        throw new Error(
          result?.message ||
          result?.msg ||
          "OTP verification failed."
        );
      }

      // The OTP API has already checked
      // getStudentProfile against the backend.

      const profileCompleted =
        result?.profileCompleted === true;

      console.log("LOGIN PROFILE STATUS:", {
        uid: result?.uid,
        stage: result?.stage,
        profileCompleted,
      });

      if (profileCompleted) {
        // Existing mobile or web user.

        if (redirectTo) {
          router.replace(redirectTo);
          router.refresh();
          return;
        }

        setShowCourseModal(true);
        router.refresh();
        return;
      }

      // Only incomplete profiles go to setup.

      const setupPath = redirectTo
        ? `/profile-setup?redirect=${encodeURIComponent(
            redirectTo
          )}`
        : "/profile-setup";

      router.replace(setupPath);
      router.refresh();
    } catch (error) {
      console.error("OTP LOGIN ERROR:", error);

      await Swal.fire({
        icon: "error",
        title: "Unable to continue",
        text:
          error?.message ||
          "Please try again.",
        confirmButtonColor: "#2468f2",
      });
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }

  function handleOtpChange(event) {
    setOtp(
      event.target.value
        .replace(/\D/g, "")
        .slice(0, 6)
    );
  }

  return (
    <>
      <section className="relative max-h-[calc(100svh-2rem)] overflow-x-hidden overflow-y-auto overscroll-contain rounded-[24px] border border-white/70 bg-white px-5 py-5 shadow-[0_24px_64px_rgba(0,0,0,0.3)] sm:max-h-none sm:overflow-hidden sm:rounded-[30px] sm:px-9 sm:py-10 sm:shadow-[0_30px_90px_rgba(0,0,0,0.3)]">
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-blue-100/60 blur-3xl" />

        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="relative inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-blue-600 disabled:opacity-50"
        >
          <ArrowLeft size={16} />
          Change email
        </button>

        <div className="relative mt-4 text-center sm:mt-7">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-br from-blue-50 to-violet-100 text-blue-600 shadow-inner sm:h-[70px] sm:w-[70px] sm:rounded-[22px]">
            <ShieldCheck
              size={27}
              strokeWidth={1.8}
            />
          </div>

          <p className="mt-4 text-[9px] font-extrabold uppercase tracking-[0.2em] text-blue-600 sm:mt-6 sm:text-[10px] sm:tracking-[0.25em]">
            Secure Student Login
          </p>

          <h1 className="mt-1.5 text-[26px] font-black tracking-tight text-[#071b59] sm:mt-2 sm:text-[36px]">
            Verify your{" "}
            <span className="bg-gradient-to-r from-[#246fff] to-[#7c3cff] bg-clip-text text-transparent">
              identity
            </span>
          </h1>

          <p className="mx-auto mt-2 max-w-[330px] text-[12px] leading-5 text-slate-500 sm:mt-3 sm:text-[13px] sm:leading-6">
            Enter the verification code sent to your
            registered email.
          </p>

          <div className="mx-auto mt-3 flex w-fit max-w-full items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-2 sm:mt-5 sm:px-4 sm:py-2.5">
            <MailCheck
              size={15}
              className="shrink-0 text-blue-600"
            />

            <span className="break-all text-[11px] font-bold text-[#071b59] sm:text-xs">
              {authData?.email || "Your email"}
            </span>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative mt-5 sm:mt-8"
        >
          <label
            htmlFor="login-otp"
            className="mb-1.5 block text-[11px] font-bold text-[#071b59] sm:mb-2 sm:text-xs"
          >
            Verification code
          </label>

          <input
            id="login-otp"
            name="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            required
            maxLength={6}
            value={otp}
            onChange={handleOtpChange}
            disabled={loading}
            placeholder="Enter OTP"
            className="h-[54px] w-full rounded-xl border border-slate-200 bg-[#f8faff] px-4 text-center text-[22px] font-extrabold tracking-[0.3em] text-[#071b59] outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 placeholder:text-sm placeholder:font-medium placeholder:tracking-normal placeholder:text-slate-400 disabled:opacity-60 sm:h-[62px] sm:rounded-2xl sm:text-[24px] sm:tracking-[0.35em]"
          />

          <div className="mt-4 sm:mt-5">
            <LoginButton
              loading={loading}
              label="Verify & Continue"
              loadingLabel="Checking your account..."
            />
          </div>
        </form>

        <div className="relative mt-5 flex items-center justify-center gap-2 border-t border-slate-100 pt-4 text-[10px] font-medium text-slate-400 sm:mt-7 sm:pt-5 sm:text-[11px]">
          <LockKeyhole
            size={14}
            className="text-blue-500"
          />
          Secure account verification
        </div>
      </section>

      <CourseChoiceModal
        open={showCourseModal}
        onClose={() => {
          setShowCourseModal(false);
          router.replace("/");
          router.refresh();
        }}
      />
    </>
  );
}
