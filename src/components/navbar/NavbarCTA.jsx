"use client";

import {
  ArrowRight,
  LogIn,
  UserPlus,
} from "lucide-react";

import Link from "next/link";

export default function NavbarCTA({
  mobile = false,
  onNavigate,
}) {
  /* =========================================================
     MOBILE
  ========================================================= */

  if (mobile) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {/* LOGIN */}

        <Link
          href="/login"
          onClick={onNavigate}
          className="
            group
            inline-flex
            min-h-[44px]
            items-center
            justify-center
            gap-2
            rounded-[12px]

            bg-gradient-to-r
            from-[#071f55]
            via-[#075fc8]
            to-[#087bea]

            px-5
            py-2.5

            text-[12px]
            font-extrabold
            text-white

            shadow-[0_8px_20px_rgba(7,95,200,0.22)]

            transition-all
            duration-300

            active:scale-[0.98]
          "
        >
          <LogIn
            size={15}
            strokeWidth={2.4}
          />

          Login
        </Link>

        {/* REGISTER */}

        <Link
  href="/register"
  className="
    group
    inline-flex
    min-w-[118px]
    items-center
    justify-center
    gap-2

    rounded-[12px]

    bg-gradient-to-r
    from-blue-200
    via-purple-200
    to-blue-300

    px-5
    py-2.5

    text-[12px]
    font-extrabold
    text-[#102c5c]

    shadow-[0_6px_18px_rgba(99,102,241,0.18)]

    transition-all
    duration-300

    hover:-translate-y-[1px]

    hover:from-blue-300
    hover:via-purple-300
    hover:to-blue-400

    hover:shadow-[0_10px_24px_rgba(99,102,241,0.25)]

    active:translate-y-0
    active:scale-[0.98]

    xl:px-6
    xl:text-[13px]
  "
>
  <UserPlus
    size={15}
    strokeWidth={2.4}
    className="
      shrink-0
      text-[#4338ca]
    "
  />

  <span>
    Register
  </span>
</Link>
      </div>
    );
  }

  /* =========================================================
     DESKTOP
  ========================================================= */

  return (
    <div
      className="
        hidden
        shrink-0
        items-center
        gap-3
        lg:flex
      "
    >
      {/* LOGIN */}

      <Link
        href="/login"
        className="
          group
          inline-flex
          min-w-[104px]
          items-center
          justify-center
          gap-2
          rounded-[12px]

          bg-gradient-to-r
          from-[#071f55]
          via-[#075fc8]
          to-[#087bea]

          px-5
          py-2.5

          text-[12px]
          font-extrabold
          text-white

          shadow-[0_7px_20px_rgba(7,95,200,0.23)]

          transition-all
          duration-300

          hover:-translate-y-[1px]
          hover:shadow-[0_11px_26px_rgba(7,95,200,0.30)]

          active:translate-y-0
          active:scale-[0.98]

          xl:px-6
          xl:text-[13px]
        "
      >
        <LogIn
          size={15}
          strokeWidth={2.4}
        />

        Login
      </Link>

      {/* REGISTER */}

      <Link
        href="/register"
        className="
          group
          relative
          inline-flex
          min-w-[130px]
          items-center
          justify-center
          gap-2
          overflow-hidden
          rounded-[12px]

          bg-gradient-to-r
          from-[#e7efff]
          via-[#eee8ff]
          to-[#dcecff]

          px-3
          py-2

          text-[12px]
          font-extrabold
          text-[#172554]

          shadow-[0_7px_20px_rgba(99,102,241,0.14)]

          transition-all
          duration-300

          hover:-translate-y-[1px]

          hover:from-[#dce8ff]
          hover:via-[#e4dcff]
          hover:to-[#cfe5ff]

          hover:shadow-[0_11px_26px_rgba(99,102,241,0.22)]

          active:translate-y-0
          active:scale-[0.98]

          xl:px-4
          xl:text-[13px]
        "
      >
        {/* SOFT GLOW */}

        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-4
            -top-7
            h-16
            w-16
            rounded-full
            bg-[#8b5cf6]/20
            blur-xl

            transition-transform
            duration-500

            group-hover:scale-150
          "
        />

        {/* SUBTLE SHINE */}

        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-y-0
            -left-[50%]
            w-[35%]
            -skew-x-12

            bg-gradient-to-r
            from-transparent
            via-white/60
            to-transparent

            transition-all
            duration-700

            group-hover:left-[120%]
          "
        />

        {/* ICON CAPSULE */}

        <span
          className="
            relative
            z-10

            flex
            h-7
            w-7
            shrink-0
            items-center
            justify-center

            rounded-[9px]

            bg-white/80

            text-[#5b4ee8]

            shadow-[0_3px_10px_rgba(91,78,232,0.12)]

            transition-all
            duration-300

            group-hover:scale-105
          "
        >
          <UserPlus
            size={14}
            strokeWidth={2.4}
          />
        </span>

        <span
          className="
            relative
            z-10
          "
        >
          Register
        </span>

        <ArrowRight
          size={13}
          strokeWidth={2.5}
          className="
            relative
            z-10
            text-[#5b4ee8]

            transition-transform
            duration-300

            group-hover:translate-x-1
          "
        />
      </Link>
    </div>
  );
}