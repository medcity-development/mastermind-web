"use client";

import {
  useState,
} from "react";

import {
  Mail,
} from "lucide-react";

import Link from "next/link";

import Swal from "sweetalert2";

import LoginInput from "./LoginInput";
import LoginButton from "./LoginButton";
import OtpVerification from "./OtpVerification";

export default function LoginCard() {
  const [
    email,
    setEmail,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    step,
    setStep,
  ] = useState("login");

  const [
    authData,
    setAuthData,
  ] = useState(null);

  /* =========================================================
     SEND OTP
  ========================================================= */

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    const cleanEmail =
      email
        .trim()
        .toLowerCase();

    /* =======================================================
       VALIDATION
    ======================================================= */

    if (!cleanEmail) {
      await Swal.fire({
        icon: "warning",

        title:
          "Enter your email",

        text:
          "Please enter your email address to continue.",

        confirmButtonColor:
          "#2468f2",
      });

      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(
        cleanEmail
      )
    ) {
      await Swal.fire({
        icon: "warning",

        title:
          "Invalid email",

        text:
          "Please enter a valid email address.",

        confirmButtonColor:
          "#2468f2",
      });

      return;
    }

    try {
      setLoading(true);

      /* =====================================================
         EMAIL LOGIN PAYLOAD
      ===================================================== */

      const payload = {
        type: "email",
        email: cleanEmail,
        mobile: "",
        code: "+91",
      };

      /* =====================================================
         SEND OTP API
      ===================================================== */

      const response =
        await fetch(
          "/api/auth/send-otp",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        result?.status !==
          true
      ) {
        throw new Error(
          result?.message ||
            result?.msg ||
            "Unable to send OTP."
        );
      }

      /* =====================================================
         SAVE DATA FOR OTP STEP
      ===================================================== */

      setAuthData({
        type: "email",

        email:
          result?.email ||
          cleanEmail,

        stage:
          result?.stage ||
          "",
      });

      /* =====================================================
         SUCCESS ALERT
      ===================================================== */

      await Swal.fire({
        icon:
          "success",

        title:
          "OTP Sent",

        text:
          "Please check your email for the verification code.",

        timer:
          1600,

        showConfirmButton:
          false,

        timerProgressBar:
          true,
      });

      setStep(
        "otp"
      );
    } catch (error) {
      console.error(
        "Send OTP:",
        error
      );

      await Swal.fire({
        icon:
          "error",

        title:
          "Unable to continue",

        text:
          error?.message ||
          "Unable to send OTP. Please try again.",

        confirmButtonColor:
          "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     OTP STEP
  ========================================================= */

  if (
    step === "otp" &&
    authData
  ) {
    return (
      <OtpVerification
        authData={
          authData
        }
        onBack={() => {
          setStep(
            "login"
          );

          setAuthData(
            null
          );
        }}
      />
    );
  }

  /* =========================================================
     LOGIN CARD
  ========================================================= */

  return (
    <div
      className="
        w-full
        rounded-[30px]
        border
        border-white/10
        bg-white
        px-6
        py-8
        shadow-[0_30px_90px_rgba(0,0,0,0.30)]

        sm:px-8
        sm:py-10

        xl:px-10
      "
    >
      {/* HEADER */}

      <div className="text-center">
        <p
          className="
            text-[10px]
            font-bold
            uppercase
            tracking-[0.25em]
            text-[#172554]
          "
        >
          MasterMind PSC
        </p>

        <h2
          className="
            mt-2
            text-[32px]
            font-extrabold
            tracking-[-0.04em]
            text-[#071b59]

            sm:text-[38px]
          "
        >
          Welcome{" "}

          <span
            className="
              bg-gradient-to-r
              from-[#246fff]
              to-[#7c3cff]
              bg-clip-text
              text-transparent
            "
          >
            Back!
          </span>
        </h2>

        <p
          className="
            mx-auto
            mt-2
            max-w-[340px]
            text-[13px]
            leading-5
            text-slate-500
          "
        >
          Enter your email address
          and we will send you a
          verification code.
        </p>
      </div>

      {/* FORM */}

      <form
        onSubmit={
          handleSubmit
        }
        className="
          mt-7
          space-y-5
        "
      >
        <LoginInput
          label="Email Address"
          type="email"
          value={
            email
          }
          onChange={(
            event
          ) =>
            setEmail(
              event.target
                .value
            )
          }
          placeholder="Enter your email address"
          icon={
            Mail
          }
        />

        <LoginButton
          loading={
            loading
          }
          label="Send OTP"
          loadingLabel="Sending OTP..."
        />
      </form>

      {/* REGISTER */}

      {/* <div
        className="
          mt-7
          text-center
          text-[12px]
          text-slate-500
        "
      >
        New to MasterMind PSC?{" "}

        <Link
          href="/register"
          className="
            font-bold
            text-[#3854e8]
            transition
            hover:text-[#7139f4]
          "
        >
          Create an account
        </Link>
      </div> */}
    </div>
  );
}