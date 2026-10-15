"use client";

import {
  useRef,
  useState,
} from "react";

import OtpVerification from "./OtpVerification";

export default function LoginCard({
  redirectTo = "",
}) {
  const [email, setEmail] = useState("");
  const [authData, setAuthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const busy = useRef(false);

  async function sendOtp(event) {
    event.preventDefault();

    if (busy.current) return;

    const cleanEmail =
      email.trim().toLowerCase();

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      setError("Enter a valid email address.");
      return;
    }

    busy.current = true;
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/auth/send-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: cleanEmail,
          }),
        }
      );

      const result = await response.json();

      if (
        !response.ok ||
        result?.status !== true
      ) {
        throw new Error(
          result?.message ||
          result?.msg ||
          "Unable to send OTP."
        );
      }

      setAuthData({
        ...result,
        email: cleanEmail,
      });
    } catch (failure) {
      setError(
        failure.message ||
        "Unable to send OTP. Please retry."
      );
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }

  if (authData) {
    return (
      <OtpVerification
        authData={authData}
        redirectTo={redirectTo}
        onBack={() => {
          setAuthData(null);
          setError("");
        }}
      />
    );
  }

  return (
    <section
      className="
        rounded-[30px] border border-white/10
        bg-white px-6 py-8 shadow-2xl
        sm:px-8 sm:py-10
      "
    >
      <p className="text-xs font-bold uppercase tracking-widest text-[#017dc0]">
        MasterMind Academy
      </p>

      <h1 className="mt-3 text-3xl font-black text-[#071b59]">
        Login to continue
      </h1>

      <p className="mt-3 text-sm leading-6 text-slate-500">
        {redirectTo
          ? "Verify your email to continue. Your exam answers are preserved."
          : "Enter your email to receive a verification code."}
      </p>

      <form
        onSubmit={sendOtp}
        className="mt-6 space-y-4"
      >
        <div>
          <label
            htmlFor="login-email"
            className="mb-2 block text-sm font-bold text-[#071b59]"
          >
            Email address
          </label>

          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            disabled={loading}
            placeholder="Enter your email"
            className="
              w-full rounded-xl
              border border-slate-200
              bg-slate-50 px-4 py-3
              text-slate-900 outline-none
              focus:border-blue-500
            "
          />
        </div>

        {error && (
          <p
            role="alert"
            className="text-sm text-red-600"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="
            w-full rounded-xl
            bg-gradient-to-r
            from-[#164fa5] to-[#017dc0]
            py-3 font-bold text-white
            disabled:opacity-60
          "
        >
          {loading
            ? "Sending OTP…"
            : "Send OTP"}
        </button>
      </form>
    </section>
  );
}