"use client";

import Image from "next/image";

import {
  Bell,
  Menu,
  Search,
} from "lucide-react";
import Link from "next/link";

export default function DashboardHeader({
  user,
  onMenuClick,
}) {
  const name =
    user?.name ||
    "Student";

  const initial =
    name
      .trim()
      .charAt(0)
      .toUpperCase() ||
    "S";

  return (
    <header
      className="
        sticky
        top-0
        z-30

        border-b
        border-slate-200/60

        bg-white/90
        backdrop-blur-xl
      "
    >
      <div
        className="
          flex
          h-[85px]
          items-center
          gap-4

          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* =========================================
            LEFT
        ========================================= */}

        <div
          className="
            flex
            shrink-0
            items-center
            gap-3
          "
        >
          {/* Menu - hidden on XL */}
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open dashboard menu"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center

              rounded-[12px]

              border
              border-slate-200

              bg-white

              text-[#111827]

              shadow-[0_5px_15px_rgba(15,23,42,0.05)]

              transition-all
              duration-200

              hover:border-violet-200
              hover:bg-violet-50

              xl:hidden
            "
          >
            <Menu
              size={20}
              strokeWidth={2}
            />
          </button>

          {/* MasterMind logo */}
          <Link
            href="/"
            className="
              group
              flex
              items-center
            "
          >
           <Image
  src="/assets/logo-128.png"
  alt="Master Mind"
  width={160}
  height={160}
  priority
  className="
    h-[64px]
    w-auto
    object-contain

    transition-transform
    duration-300

    group-hover:scale-[1.03]

    sm:h-[72px]
    lg:h-[76px]
  "
/>
          </Link>
        </div>

        {/* =========================================
            SEARCH
        ========================================= */}

        <div
          className="
            relative
            ml-3
            hidden
            w-full
            max-w-[430px]

            md:block
          "
        >
          <Search
            size={16}
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2

              text-slate-400
            "
          />

          <input
            type="search"
            placeholder="Search courses, tests, topics..."
            className="
              h-[44px]
              w-full

              rounded-[14px]

              border
              border-slate-200

              bg-[#f8faff]

              pl-11
              pr-4

              text-[12px]
              font-medium
              text-slate-700

              outline-none

              transition-all
              duration-200

              placeholder:text-slate-400

              focus:border-violet-300
              focus:bg-white
              focus:shadow-[0_0_0_4px_rgba(139,92,246,0.07)]
            "
          />
        </div>

        {/* =========================================
            RIGHT
        ========================================= */}

        <div
          className="
            ml-auto
            flex
            items-center
            gap-3
          "
        >
          {/* Notification */}
          <button
            type="button"
            className="
              relative

              flex
              h-10
              w-10
              items-center
              justify-center

              rounded-full

              border
              border-slate-200

              bg-white

              text-[#111827]

              shadow-sm

              transition-all

              hover:border-violet-200
              hover:bg-violet-50
            "
          >
            <Bell
              size={18}
              strokeWidth={1.9}
            />

            <span
              className="
                absolute
                right-[8px]
                top-[7px]

                h-[7px]
                w-[7px]

                rounded-full

                border-2
                border-white

                bg-[#ff3f74]
              "
            />
          </button>

          {/* Avatar */}
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center

              rounded-full

              bg-gradient-to-br
              from-[#7c3aed]
              via-[#4f46e5]
              to-[#2563eb]

              text-[12px]
              font-extrabold
              text-white

              shadow-[0_8px_20px_rgba(79,70,229,0.24)]
            "
          >
            {initial}
          </div>

          {/* User */}
          <div
            className="
              hidden
              sm:block
            "
          >
            <p
              className="
                text-[11px]
                font-bold
                text-[#071b59]
              "
            >
              Hi, {name} 👋
            </p>

            <p
              className="
                mt-0.5
                text-[9px]
                text-slate-400
              "
            >
              Welcome back!
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}