// src/app/(public)/login/components/OtpVerification.jsx

"use client";

import {
  useState,
} from "react";

import {
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import Swal from "sweetalert2";

import LoginButton from "./LoginButton";

import CourseChoiceModal from "@/app/(public)/profile-setup/components/CourseChoiceModal";

export default function OtpVerification({
  authData,
  onBack,
}) {
  const router =
    useRouter();

  const [
    otp,
    setOtp,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    showCourseModal,
    setShowCourseModal,
  ] = useState(false);

  /* =========================================================
     VERIFY OTP
  ========================================================= */

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    const cleanOtp =
      otp.trim();

    /* =======================================================
       VALIDATION
    ======================================================= */

    if (!cleanOtp) {
      await Swal.fire({
        icon:
          "warning",

        title:
          "Enter OTP",

        text:
          "Please enter the verification code sent to your email.",

        confirmButtonColor:
          "#2468f2",
      });

      return;
    }

    if (
      cleanOtp.length < 4
    ) {
      await Swal.fire({
        icon:
          "warning",

        title:
          "Invalid OTP",

        text:
          "Please enter a valid OTP.",

        confirmButtonColor:
          "#2468f2",
      });

      return;
    }

    try {
      setLoading(true);

      /* =====================================================
         VERIFY OTP API
      ===================================================== */

      const response =
        await fetch(
          "/api/auth/verify-otp",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                email:
                  authData?.email,

                otp:
                  cleanOtp,
              }),
          }
        );

      const result =
        await response.json();

      console.log(
        "VERIFY OTP CLIENT RESULT:",
        result
      );

      /* =====================================================
         API ERROR
      ===================================================== */

      if (
        !response.ok ||
        result?.status !==
          true
      ) {
        throw new Error(
          result?.message ||
            result?.msg ||
            "OTP verification failed."
        );
      }

      /* =====================================================
         SUCCESS MESSAGE
      ===================================================== */

      await Swal.fire({
        icon:
          "success",

        title:
          "OTP Verified",

        text:
          "Your email has been verified successfully.",

        timer:
          900,

        showConfirmButton:
          false,

        timerProgressBar:
          true,
      });

      /* =====================================================
         EXISTING REGISTERED USER

         stage === "completed"

         OTP
          ↓
         course modal
          ↓
         corresponding dashboard
      ===================================================== */

      if (
        result?.stage ===
        "completed"
      ) {
        setShowCourseModal(
          true
        );

        return;
      }

      /* =====================================================
         NEW USER

         OTP
          ↓
         profile setup
          ↓
         course modal
          ↓
         corresponding dashboard
      ===================================================== */

      router.replace(
        "/profile-setup"
      );

      router.refresh();
    } catch (error) {
      console.error(
        "VERIFY OTP ERROR:",
        error
      );

      await Swal.fire({
        icon:
          "error",

        title:
          "Verification Failed",

        text:
          error?.message ||
          "The OTP is incorrect or expired. Please try again.",

        confirmButtonText:
          "Try Again",

        confirmButtonColor:
          "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     OTP INPUT
  ========================================================= */

  function handleOtpChange(
    event
  ) {
    const value =
      event.target.value
        .replace(
          /\D/g,
          ""
        )
        .slice(
          0,
          6
        );

    setOtp(value);
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <>
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
        {/* BACK */}

        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="
            inline-flex
            items-center
            gap-2
            text-[12px]
            font-semibold
            text-slate-500
            transition

            hover:text-[#2468f2]

            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <ArrowLeft
            size={15}
          />

          Change Email
        </button>

        {/* HEADER */}

        <div
          className="
            mt-5
            text-center
          "
        >
          <div
            className="
              mx-auto
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-br
              from-[#eaf2ff]
              to-[#f1ebff]
              text-[#2468f2]
            "
          >
            <ShieldCheck
              size={27}
              strokeWidth={1.9}
            />
          </div>

          <p
            className="
              mt-4
              text-[10px]
              font-bold
              uppercase
              tracking-[0.22em]
              text-[#3854e8]
            "
          >
            Secure Verification
          </p>

          <h2
            className="
              mt-2
              text-[30px]
              font-extrabold
              tracking-[-0.04em]
              text-[#071b59]

              sm:text-[34px]
            "
          >
            Verify{" "}

            <span
              className="
                bg-gradient-to-r
                from-[#246fff]
                to-[#7c3cff]
                bg-clip-text
                text-transparent
              "
            >
              OTP
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-2
              max-w-[330px]
              text-[13px]
              leading-5
              text-slate-500
            "
          >
            We sent a
            verification code to
          </p>

          <p
            className="
              mt-1
              break-all
              text-[13px]
              font-bold
              text-[#071b59]
            "
          >
            {authData?.email ||
              "your email"}
          </p>
        </div>

        {/* OTP FORM */}

        <form
          onSubmit={
            handleSubmit
          }
          className="mt-7"
        >
          <label
            htmlFor="otp"
            className="
              mb-2
              block
              text-[12px]
              font-bold
              text-[#071b59]
            "
          >
            Verification Code
          </label>

          <input
            id="otp"
            name="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            value={otp}
            onChange={
              handleOtpChange
            }
            placeholder="Enter OTP"
            disabled={loading}
            className="
              h-[58px]
              w-full
              rounded-[14px]
              border
              border-slate-200
              bg-[#f8faff]
              px-4
              text-center
              text-[22px]
              font-extrabold
              tracking-[0.35em]
              text-[#071b59]
              outline-none
              transition-all
              duration-200

              placeholder:text-[13px]
              placeholder:font-medium
              placeholder:tracking-normal
              placeholder:text-slate-400

              focus:border-[#4f6cf7]
              focus:bg-white
              focus:shadow-[0_0_0_4px_rgba(79,108,247,0.08)]

              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          />

          <div className="mt-5">
            <LoginButton
              loading={
                loading
              }
              label="Verify OTP"
              loadingLabel="Verifying..."
            />
          </div>
        </form>

        <p
          className="
            mt-5
            text-center
            text-[11px]
            leading-5
            text-slate-400
          "
        >
          Enter the OTP sent
          to your registered
          email address.
        </p>
      </div>

      {/* ================================================
          EXISTING USER COURSE SELECTION
      ================================================= */}

      <CourseChoiceModal
        open={
          showCourseModal
        }
        onClose={() =>
          setShowCourseModal(
            false
          )
        }
      />
    </>
  );
}