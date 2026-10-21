
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  X,
} from "lucide-react";

const INITIAL_EMAIL = "";
const DASHBOARD = "/dashboard/kerala-psc";

export default function LoginModal({
  open = false,
  onClose,
  redirectTo = DASHBOARD,
}) {
  const router = useRouter();
  const busy = useRef(false);

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState(INITIAL_EMAIL);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event) => {
      if (event.key === "Escape" && !busy.current) {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setStep("email");
      setEmail("");
      setOtp("");
      setError("");
      setLoading(false);
    }
  }, [open]);

  async function readResponse(response) {
    const result = await response.json().catch(() => ({}));

    if (!response.ok || result?.status !== true) {
      throw new Error(
        result?.message ||
          result?.msg ||
          "Unable to continue. Please try again."
      );
    }

    return result;
  }

  async function handleSendOtp(event) {
    event.preventDefault();

    if (busy.current) return;

    const cleanEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    busy.current = true;
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          email: cleanEmail,
        }),
      });

      await readResponse(response);

      setEmail(cleanEmail);
      setOtp("");
      setStep("otp");
    } catch (err) {
      setError(err.message);
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();

    if (busy.current) return;

    if (!/^\d{4,6}$/.test(otp.trim())) {
      setError("Enter a valid verification code.");
      return;
    }

    busy.current = true;
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          email,
          otp: otp.trim(),
        }),
      });

      const result = await readResponse(response);

      // The backend profile is authoritative.
      // Do not rely only on the send-OTP stage.
      let completed = result?.profileCompleted === true;

      if (!completed) {
        const profileResponse = await fetch(
          "/api/student/profile?cid=1",
          {
            cache: "no-store",
            credentials: "same-origin",
          }
        );

        const profileResult = await readResponse(profileResponse);

        completed =
          profileResult?.profileCompleted === true ||
          String(
            profileResult?.profile?.stage || ""
          ).toLowerCase() === "completed";
      }

      if (completed) {
        const destination =
          typeof redirectTo === "string" &&
          redirectTo.startsWith("/") &&
          !redirectTo.startsWith("//") &&
          !/^\/(login|profile-setup)(\/|$|\?)/.test(redirectTo)
            ? redirectTo
            : DASHBOARD;

        onClose?.();
        router.replace(destination);
        router.refresh();
        return;
      }

      const setupPath =
        "/profile-setup?redirect=" +
        encodeURIComponent(redirectTo || DASHBOARD);

      onClose?.();
      router.replace(setupPath);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020b27]/75 p-4 backdrop-blur-md"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose?.();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-login-title"
        className="relative w-full max-w-[440px] overflow-hidden rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:p-9"
      >
        <button
          type="button"
          aria-label="Close login"
          onClick={() => onClose?.()}
          disabled={loading}
          className="absolute right-5 top-5 rounded-xl bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 disabled:opacity-50"
        >
          <X size={18} />
        </button>

        {step === "otp" && (
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setOtp("");
              setError("");
            }}
            disabled={loading}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600"
          >
            <ArrowLeft size={15} />
            Change email
          </button>
        )}

        <div className="mt-5 text-center">
          <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-[22px] bg-gradient-to-br from-blue-50 to-violet-100 text-blue-600">
            {step === "email" ? (
              <LockKeyhole size={30} />
            ) : (
              <ShieldCheck size={32} />
            )}
          </div>

          <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.25em] text-blue-600">
            MasterMind Academy
          </p>

          <h2
            id="student-login-title"
            className="mt-2 text-[28px] font-black tracking-tight text-[#071b59]"
          >
            {step === "email" ? "Student Login" : "Verify your identity"}
          </h2>

          <p className="mx-auto mt-3 max-w-[310px] text-[13px] leading-6 text-slate-500">
            {step === "email"
              ? "Sign in securely to continue your learning journey."
              : `Enter the verification code sent to ${email}.`}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700"
          >
            {error}
          </div>
        )}

        {step === "email" ? (
          <form onSubmit={handleSendOtp} className="mt-8">
            <label
              htmlFor="modal-login-email"
              className="mb-2 block text-xs font-bold text-[#071b59]"
            >
              Email Address
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500"
              />

              <input
                id="modal-login-email"
                type="email"
                required
                autoFocus
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={loading}
                placeholder="Enter your email"
                className="h-[58px] w-full rounded-2xl border border-slate-200 bg-[#f8faff] pl-12 pr-4 text-sm font-semibold text-[#071b59] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex h-[55px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#075fc8] to-[#7c3aed] text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <ArrowRight size={18} />
              )}
              {loading ? "Sending OTP..." : "Send Verification Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="mt-8">
            <label
              htmlFor="modal-login-otp"
              className="mb-2 block text-xs font-bold text-[#071b59]"
            >
              Verification Code
            </label>

            <input
              id="modal-login-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              autoFocus
              maxLength={6}
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              disabled={loading}
              placeholder="Enter OTP"
              className="h-[62px] w-full rounded-2xl border border-slate-200 bg-[#f8faff] px-4 text-center text-[24px] font-extrabold tracking-[0.3em] text-[#071b59] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 placeholder:text-sm placeholder:font-medium placeholder:tracking-normal"
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex h-[55px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#075fc8] to-[#7c3aed] text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <ShieldCheck size={18} />
              )}
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
          </form>
        )}

        <div className="mt-7 flex items-center justify-center gap-2 border-t border-slate-100 pt-5 text-[11px] font-medium text-slate-400">
          <LockKeyhole size={14} className="text-blue-500" />
          Secure student authentication
        </div>
      </div>
    </div>
  );
}
