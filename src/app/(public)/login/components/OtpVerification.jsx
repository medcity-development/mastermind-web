
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
      <section className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white px-6 py-8 shadow-[0_30px_90px_rgba(0,0,0,0.3)] sm:px-9 sm:py-10">
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

        <div className="relative mt-7 text-center">
          <div className="mx-auto flex h-[70px] w-[70px] items-center justify-center rounded-[22px] bg-gradient-to-br from-blue-50 to-violet-100 text-blue-600 shadow-inner">
            <ShieldCheck
              size={32}
              strokeWidth={1.8}
            />
          </div>

          <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.25em] text-blue-600">
            Secure Student Login
          </p>

          <h1 className="mt-2 text-[32px] font-black tracking-tight text-[#071b59] sm:text-[36px]">
            Verify your{" "}
            <span className="bg-gradient-to-r from-[#246fff] to-[#7c3cff] bg-clip-text text-transparent">
              identity
            </span>
          </h1>

          <p className="mx-auto mt-3 max-w-[330px] text-[13px] leading-6 text-slate-500">
            Enter the verification code sent to your
            registered email.
          </p>

          <div className="mx-auto mt-5 flex w-fit max-w-full items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2.5">
            <MailCheck
              size={16}
              className="shrink-0 text-blue-600"
            />

            <span className="break-all text-xs font-bold text-[#071b59]">
              {authData?.email || "Your email"}
            </span>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative mt-8"
        >
          <label
            htmlFor="login-otp"
            className="mb-2 block text-xs font-bold text-[#071b59]"
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
            className="h-[62px] w-full rounded-2xl border border-slate-200 bg-[#f8faff] px-4 text-center text-[24px] font-extrabold tracking-[0.35em] text-[#071b59] outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 placeholder:text-sm placeholder:font-medium placeholder:tracking-normal placeholder:text-slate-400 disabled:opacity-60"
          />

          <div className="mt-5">
            <LoginButton
              loading={loading}
              label="Verify & Continue"
              loadingLabel="Checking your account..."
            />
          </div>
        </form>

        <div className="relative mt-7 flex items-center justify-center gap-2 border-t border-slate-100 pt-5 text-[11px] font-medium text-slate-400">
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
