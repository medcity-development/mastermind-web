"use client";

import Link from "next/link";

import {
  Crown,
  LockKeyhole,
  Sparkles,
  X,
} from "lucide-react";

export default function PremiumMockTestModal({
  open,
  test,
  onClose,
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[99999]
        flex
        items-center
        justify-center
        bg-[#071936]/60
        px-4
        backdrop-blur-sm
      "
      onClick={onClose}
    >
      <div
        onClick={(event) =>
          event.stopPropagation()
        }
        className="
          relative
          w-full
          max-w-[430px]
          overflow-hidden
          rounded-[28px]
          border
          border-white/70
          bg-white
          p-6
          shadow-[0_30px_90px_rgba(7,25,54,0.30)]
          sm:p-7
        "
      >
        {/* BACKGROUND */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-14
            -top-16
            h-44
            w-44
            rounded-full
            bg-[#3154ee]/12
            blur-3xl
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -bottom-16
            -left-16
            h-44
            w-44
            rounded-full
            bg-[#a83279]/12
            blur-3xl
          "
        />

        {/* CLOSE */}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close premium modal"
          className="
            absolute
            right-4
            top-4
            z-20
            flex
            h-9
            w-9
            cursor-pointer
            items-center
            justify-center
            rounded-full
            bg-slate-100
            text-slate-500
            transition
            hover:bg-slate-200
          "
        >
          <X size={17} />
        </button>

        <div
          className="
            relative
            z-10
          "
        >
          {/* ICON */}

          <div
            className="
              mx-auto
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-[20px]
              bg-gradient-to-br
              from-[#5b216d]
              via-[#a83279]
              to-[#3154ee]
              text-white
              shadow-[0_14px_32px_rgba(91,33,109,0.26)]
            "
          >
            <Crown size={27} />
          </div>

          {/* TEXT */}

          <div
            className="
              mt-5
              text-center
            "
          >
            <span
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-full
                bg-amber-50
                px-3
                py-1.5
                text-[9px]
                font-black
                uppercase
                tracking-[0.12em]
                text-amber-700
              "
            >
              <Sparkles
                size={11}
              />

              Premium Test
            </span>

            <h2
              className="
                mt-3
                text-[22px]
                font-black
                text-[#172554]
              "
            >
              Unlock this mock test
            </h2>

            <p
              className="
                mx-auto
                mt-3
                max-w-[340px]
                text-[12px]
                leading-6
                text-slate-500
              "
            >
              {test?.exam_name
                ? `${test.exam_name} is available as part of a premium plan.`
                : "This mock test is available as part of a premium plan."}
            </p>
          </div>

          {/* INFO */}

          <div
            className="
              mt-5
              flex
              items-center
              gap-3
              rounded-[16px]
              border
              border-[#dfe6ff]
              bg-gradient-to-r
              from-[#f7f9ff]
              to-[#fbf7ff]
              px-4
              py-3.5
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-white
                text-[#3154ee]
                shadow-sm
              "
            >
              <LockKeyhole
                size={17}
              />
            </div>

            <p
              className="
                text-[11px]
                font-semibold
                leading-5
                text-[#52617a]
              "
            >
              Choose a premium
              package to unlock
              this test and other
              premium learning
              content.
            </p>
          </div>

          {/* ACTIONS */}

          <div
            className="
              mt-6
              grid
              grid-cols-1
              gap-2.5
              sm:grid-cols-2
            "
          >
            <button
              type="button"
              onClick={onClose}
              className="
                flex
                min-h-[46px]
                cursor-pointer
                items-center
                justify-center
                rounded-[14px]
                border
                border-slate-200
                bg-white
                px-4
                text-[11px]
                font-black
                text-slate-600
                transition
                hover:bg-slate-50
              "
            >
              Maybe Later
            </button>

            <Link
              href="/government-exams-coaching/kerala-psc/premium-packages"
              onClick={onClose}
              className="
                flex
                min-h-[46px]
                cursor-pointer
                items-center
                justify-center
                rounded-[14px]
                bg-gradient-to-r
                from-[#164fa5]
                via-[#017cc0]
                to-[#3154ee]
                px-4
                text-[11px]
                font-black
                text-white
                shadow-[0_10px_25px_rgba(49,84,238,0.20)]
                transition-all
                hover:-translate-y-0.5
              "
            >
              View Premium Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}