"use client";

import {
  useState,
} from "react";

import {
  LogOut,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import Swal from "sweetalert2";

export default function SidebarLogout() {
  const router =
    useRouter();

  const [
    loading,
    setLoading,
  ] = useState(false);

  async function handleLogout() {
    if (loading) {
      return;
    }

    const confirmation =
      await Swal.fire({
        icon: "question",

        title:
          "Logout?",

        text:
          "Are you sure you want to end your session?",

        showCancelButton:
          true,

        confirmButtonText:
          "Yes, Logout",

        cancelButtonText:
          "Cancel",

        confirmButtonColor:
          "#ef4444",

        cancelButtonColor:
          "#64748b",
      });

    if (
      !confirmation.isConfirmed
    ) {
      return;
    }

    try {
      setLoading(true);

      const response =
        await fetch(
          "/api/auth/logout",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            cache:
              "no-store",
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        result?.status !== true
      ) {
        throw new Error(
          result?.message ||
          "Unable to logout."
        );
      }

      /* =========================================================
         REDIRECT TO LOGIN
      ========================================================= */

      router.replace(
        "/login"
      );

      router.refresh();
    } catch (error) {
      console.error(
        "LOGOUT ERROR:",
        error
      );

      await Swal.fire({
        icon:
          "error",

        title:
          "Logout Failed",

        text:
          error?.message ||
          "Unable to logout. Please try again.",

        confirmButtonColor:
          "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="
        relative
        z-10

        shrink-0

        border-t
        border-white/[0.08]

        p-2

        xl:p-4 cursor-pointer
      "
    >
      {/* GLOW */}

      <div
        className="
          pointer-events-none
          absolute
          inset-x-2
          bottom-2

          h-[70px]

          rounded-[22px]

          bg-gradient-to-r
          from-violet-600/30
          via-blue-500/25
          to-pink-500/30

          blur-[22px]

          xl:inset-x-3
        "
      />

      <button
        type="button"
        title="Logout"
        onClick={
          handleLogout
        }
        disabled={
          loading
        }
        className="
          group
          relative

          flex
          w-full
          items-center
          justify-center
          gap-3 cursor-pointer

          overflow-hidden

          rounded-[18px]

          border
          border-white/[0.14]

          bg-gradient-to-br
          from-[#7c3aed]
          via-[#4f46e5]
          to-[#ec4899]

          px-2
          py-3

          text-white

          shadow-[0_12px_35px_rgba(99,102,241,0.28)]

          transition-all
          duration-300

          hover:-translate-y-[1px]

          disabled:cursor-not-allowed
          disabled:opacity-60

          xl:justify-start
          xl:px-3
        "
      >
        <span
          className="
            pointer-events-none
            absolute
            -right-6
            -top-10

            h-24
            w-24

            rounded-full

            bg-white/20

            blur-[30px]
          "
        />

        <span
          className="
            pointer-events-none
            absolute
            -bottom-12
            -left-8

            h-24
            w-24

            rounded-full

            bg-pink-300/20

            blur-[28px]
          "
        />

        <span
          className="
            relative
            z-10

            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center

            rounded-[13px]

            border
            border-white/20

            bg-white/[0.14]

            text-white
          "
        >
          <LogOut
            size={18}
            strokeWidth={
              2.2
            }
          />
        </span>

        <div
          className="
            relative
            z-10

            hidden
            min-w-0
            flex-1

            text-left

            xl:block
          "
        >
          <p
            className="
              text-[11px]
              font-bold
              text-white
            "
          >
            {loading
              ? "Logging out..."
              : "Logout"}
          </p>

          <p
            className="
              mt-0.5

              text-[8px]
              font-medium

              text-white/65
            "
          >
            {loading
              ? "Please wait"
              : "End your session"}
          </p>
        </div>

        <span
          className="
            relative
            z-10

            hidden

            h-7
            w-7
            items-center
            justify-center

            rounded-full

            bg-white/[0.12]

            text-[13px]
            text-white/80

            xl:flex
          "
        >
          →
        </span>
      </button>
    </div>
  );
}