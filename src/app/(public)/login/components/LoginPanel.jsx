"use client";

import { useState } from "react";
import Link from "next/link";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Users,
} from "lucide-react";

export default function LoginPanel() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      className="
        grid
        w-full
        min-h-0
        grid-cols-1
        gap-3

        lg:h-full
        lg:grid-rows-[minmax(0,1fr)_82px_82px]
      "
    >
      {/* =====================================================
          MAIN LOGIN CARD
      ====================================================== */}

      <div
        className="
          relative
          flex
          min-h-0
          w-full
          flex-col
          overflow-hidden
          rounded-[26px]
          border
          border-[#d8e6f3]
          bg-gradient-to-br
          from-white
          via-[#f9fcff]
          to-[#edf7ff]
          px-6
          py-6
          shadow-[0_18px_45px_rgba(11,33,108,0.08)]

          sm:px-7

          lg:h-full
        "
      >
        {/* =================================================
            BACKGROUND DECORATION
        ================================================== */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            opacity-[0.035]
            [background-image:linear-gradient(#017cc0_1px,transparent_1px),linear-gradient(90deg,#017cc0_1px,transparent_1px)]
            [background-size:30px_30px]
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-24
            -top-24
            h-64
            w-64
            rounded-full
            bg-[#00b5e8]/10
            blur-[80px]
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -bottom-24
            -left-20
            h-60
            w-60
            rounded-full
            bg-[#164fa5]/7
            blur-[80px]
          "
        />

        {/* DOTS */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            right-6
            top-6
            grid
            grid-cols-4
            gap-[7px]
            opacity-50
          "
        >
          {Array.from({ length: 16 }).map((_, index) => (
            <span
              key={index}
              className={`
                h-1
                w-1
                rounded-full
                ${
                  [3, 6, 11].includes(index)
                    ? "bg-[#df1768]"
                    : "bg-[#00b5e8]"
                }
              `}
            />
          ))}
        </div>

        {/* =================================================
            CONTENT
        ================================================== */}

        <div
          className="
            relative
            z-10
            flex
            h-full
            min-h-0
            flex-col
          "
        >
          {/* BADGE */}

          <div
            className="
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-full
              border
              border-[#d6e9f7]
              bg-white
              px-3
              py-1.5
              shadow-[0_5px_15px_rgba(22,79,165,0.05)]
            "
          >
            <span
              className="
                h-2
                w-2
                rounded-full
                bg-[#00b5e8]
                shadow-[0_0_0_4px_rgba(0,181,232,0.10)]
              "
            />

            <span
              className="
                text-[9px]
                font-black
                uppercase
                tracking-[0.16em]
                text-[#017cc0]
              "
            >
              MasterMind PSC
            </span>
          </div>

          {/* =================================================
              HEADER
          ================================================== */}

          <div className="mt-5">
            <p
              className="
                text-[9px]
                font-black
                uppercase
                tracking-[0.18em]
                text-[#017cc0]
              "
            >
              Welcome to your account
            </p>

            <h1
              className="
                mt-2
                text-[28px]
                font-black
                leading-tight
                tracking-[-0.04em]
                text-[#071b5d]

                xl:text-[30px]
              "
            >
              Welcome Back
              <span className="ml-2">👋</span>
            </h1>

            <p
              className="
                mt-2
                max-w-[350px]
                text-[11px]
                leading-[1.6]
                text-slate-500

                xl:text-[12px]
              "
            >
              Login to your MasterMind PSC account and continue your
              learning journey.
            </p>
          </div>

          {/* =================================================
              FORM
          ================================================== */}

          <form className="mt-5 space-y-3">
            {/* EMAIL */}

            <div>
              <label
                htmlFor="login-email"
                className="
                  mb-1.5
                  block
                  text-[10px]
                  font-bold
                  text-[#071b5d]
                "
              >
                Email or Mobile Number
              </label>

              <div
                className="
                  group
                  flex
                  min-h-[49px]
                  items-center
                  gap-3
                  rounded-[13px]
                  border
                  border-[#d8e5f1]
                  bg-white
                  px-3
                  shadow-[0_4px_14px_rgba(11,33,108,0.03)]
                  transition-all
                  duration-300

                  hover:border-[#017cc0]/30

                  focus-within:border-[#017cc0]
                  focus-within:ring-4
                  focus-within:ring-[#017cc0]/8
                "
              >
                <span
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-[9px]
                    bg-[#eaf7ff]
                    text-[#017cc0]
                    transition

                    group-focus-within:bg-[#017cc0]
                    group-focus-within:text-white
                  "
                >
                  <Mail size={15} />
                </span>

                <input
                  id="login-email"
                  type="text"
                  placeholder="Enter email or mobile number"
                  autoComplete="username"
                  className="
                    w-full
                    bg-transparent
                    text-[12px]
                    font-semibold
                    text-[#071b5d]
                    outline-none

                    placeholder:font-normal
                    placeholder:text-slate-400
                  "
                />
              </div>
            </div>

            {/* PASSWORD */}

            <div>
              <label
                htmlFor="login-password"
                className="
                  mb-1.5
                  block
                  text-[10px]
                  font-bold
                  text-[#071b5d]
                "
              >
                Password
              </label>

              <div
                className="
                  group
                  flex
                  min-h-[49px]
                  items-center
                  gap-3
                  rounded-[13px]
                  border
                  border-[#d8e5f1]
                  bg-white
                  px-3
                  shadow-[0_4px_14px_rgba(11,33,108,0.03)]
                  transition-all
                  duration-300

                  hover:border-[#017cc0]/30

                  focus-within:border-[#017cc0]
                  focus-within:ring-4
                  focus-within:ring-[#017cc0]/8
                "
              >
                <span
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-[9px]
                    bg-[#eaf7ff]
                    text-[#017cc0]
                    transition

                    group-focus-within:bg-[#017cc0]
                    group-focus-within:text-white
                  "
                >
                  <LockKeyhole size={15} />
                </span>

                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="
                    w-full
                    bg-transparent
                    text-[12px]
                    font-semibold
                    text-[#071b5d]
                    outline-none

                    placeholder:font-normal
                    placeholder:text-slate-400
                  "
                />

                <button
                  type="button"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-[9px]
                    text-slate-400
                    transition

                    hover:bg-[#eef7ff]
                    hover:text-[#017cc0]
                  "
                >
                  {showPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* OPTIONS */}

            <div
              className="
                flex
                items-center
                justify-between
                gap-3
                py-0.5
                text-[10px]
              "
            >
              <label
                className="
                  flex
                  cursor-pointer
                  items-center
                  gap-2
                  font-medium
                  text-slate-500
                "
              >
                <input
                  type="checkbox"
                  className="
                    h-3.5
                    w-3.5
                    cursor-pointer
                    accent-[#017cc0]
                  "
                />

                Remember me
              </label>

              <Link
                href="/forgot-password"
                className="
                  font-black
                  text-[#017cc0]
                  transition

                  hover:text-[#164fa5]
                "
              >
                Forgot Password?
              </Link>
            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="
                group
                relative
                flex
                min-h-[49px]
                w-full
                items-center
                justify-center
                overflow-hidden
                rounded-[13px]
                bg-gradient-to-r
                from-[#164fa5]
                via-[#017cc0]
                to-[#00b5e8]
                px-4
                text-[12px]
                font-black
                text-white
                shadow-[0_10px_24px_rgba(1,124,192,0.20)]
                transition-all
                duration-300

                hover:-translate-y-0.5
                hover:shadow-[0_14px_30px_rgba(1,124,192,0.28)]
              "
            >
              Login

              <span
                className="
                  absolute
                  right-3
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-full
                  bg-white/15
                  transition-transform
                  duration-300

                  group-hover:translate-x-0.5
                "
              >
                <ArrowRight size={14} />
              </span>
            </button>
          </form>

          {/* =================================================
              REGISTER
          ================================================== */}

          <div
            className="
              mt-4
              border-t
              border-[#e2ebf4]
              pt-4
            "
          >
            <p
              className="
                text-center
                text-[10px]
                text-slate-500
              "
            >
              New to MasterMind PSC?{" "}

              <Link
                href="/register"
                className="
                  font-black
                  text-[#df1768]
                  transition

                  hover:text-[#b91455]
                "
              >
                Create an account
              </Link>
            </p>
          </div>

          {/* BOTTOM SECURITY */}

          <div
            className="
              mt-auto
              hidden
              items-center
              justify-center
              gap-1.5
              pt-4
              text-[8px]
              font-medium
              text-slate-400

              xl:flex
            "
          >
            <ShieldCheck
              size={10}
              className="text-[#017cc0]"
            />

            Secure access to your learning account
          </div>
        </div>
      </div>

      {/* =====================================================
          SECURE LOGIN CARD
      ====================================================== */}

      <article
        className="
          group
          relative
          flex
          min-h-[82px]
          items-center
          overflow-hidden
          rounded-[18px]
          border
          border-[#cfe7f6]
          bg-gradient-to-r
          from-[#f5fbff]
          to-[#eaf8ff]
          px-4
          shadow-[0_8px_22px_rgba(11,33,108,0.05)]
          transition-all
          duration-300

          hover:-translate-y-0.5
          hover:border-[#017cc0]/20
          hover:shadow-[0_12px_28px_rgba(1,124,192,0.09)]

          lg:h-full
          lg:min-h-0
        "
      >
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-8
            -top-8
            h-24
            w-24
            rounded-full
            bg-[#00b5e8]/10
          "
        />

        <div
          className="
            relative
            z-10
            flex
            w-full
            items-center
            gap-3
          "
        >
          <span
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-[12px]
              bg-[#017cc0]
              text-white
              shadow-[0_7px_16px_rgba(1,124,192,0.18)]
            "
          >
            <ShieldCheck size={18} />
          </span>

          <div className="min-w-0 flex-1">
            <h2
              className="
                text-[11px]
                font-black
                text-[#071b5d]

                xl:text-[12px]
              "
            >
              Secure Login
            </h2>

            <p
              className="
                mt-0.5
                text-[9px]
                leading-4
                text-slate-500
              "
            >
              Your account and personal data are protected.
            </p>
          </div>

          <span
            className="
              h-1.5
              w-1.5
              shrink-0
              rounded-full
              bg-[#00b5e8]
              shadow-[0_0_0_5px_rgba(0,181,232,0.08)]
            "
          />
        </div>
      </article>

      {/* =====================================================
          TRUSTED PLATFORM CARD
      ====================================================== */}

      <article
        className="
          group
          relative
          flex
          min-h-[82px]
          items-center
          overflow-hidden
          rounded-[18px]
          border
          border-[#f5d6e1]
          bg-gradient-to-r
          from-[#fff8fa]
          to-[#fff0f5]
          px-4
          shadow-[0_8px_22px_rgba(11,33,108,0.05)]
          transition-all
          duration-300

          hover:-translate-y-0.5
          hover:border-[#df1768]/20
          hover:shadow-[0_12px_28px_rgba(223,23,104,0.08)]

          lg:h-full
          lg:min-h-0
        "
      >
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -bottom-8
            -right-8
            h-24
            w-24
            rounded-full
            bg-[#df1768]/7
          "
        />

        <div
          className="
            relative
            z-10
            flex
            w-full
            items-center
            gap-3
          "
        >
          <span
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-[12px]
              bg-[#df1768]
              text-white
              shadow-[0_7px_16px_rgba(223,23,104,0.16)]
            "
          >
            <Users size={18} />
          </span>

          <div className="min-w-0 flex-1">
            <h2
              className="
                text-[11px]
                font-black
                text-[#071b5d]

                xl:text-[12px]
              "
            >
              Trusted Platform
            </h2>

            <p
              className="
                mt-0.5
                text-[9px]
                leading-4
                text-slate-500
              "
            >
              Built for Kerala PSC, SSC and RRB aspirants.
            </p>
          </div>

          <span
            className="
              h-1.5
              w-1.5
              shrink-0
              rounded-full
              bg-[#df1768]
              shadow-[0_0_0_5px_rgba(223,23,104,0.07)]
            "
          />
        </div>
      </article>
    </div>
  );
}