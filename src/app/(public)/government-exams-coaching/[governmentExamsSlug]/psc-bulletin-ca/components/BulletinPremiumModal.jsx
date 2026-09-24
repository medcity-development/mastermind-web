"use client";

import Link from "next/link";

import {
  ArrowRight,
  Crown,
  LockKeyhole,
  Sparkles,
  X,
} from "lucide-react";

export default function BulletinPremiumModal({
  open,
  month,
  onClose,
}) {
  if (!open) {
    return null;
  }

  const monthName =
    `${month?.month || ""} ${
      month?.year || ""
    }`.trim();

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-[#071936]/65
        px-4
        backdrop-blur-[5px]
      "
      onMouseDown={
        onClose
      }
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulletin-premium-title"
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
        className="
          relative
          w-full
          max-w-[470px]
          overflow-hidden
          rounded-[28px]
          border
          border-white/40
          bg-white
          shadow-[0_28px_80px_rgba(7,25,54,0.30)]
        "
      >
        {/* TOP GRADIENT */}
        <div
          className="
            relative
            overflow-hidden
            bg-gradient-to-br
            from-[#071936]
            via-[#164fa5]
            to-[#017cc0]
            px-6
            pb-8
            pt-7
            text-white
          "
        >
          <div
            aria-hidden="true"
            className="
              absolute
              inset-0
              opacity-[0.07]
              [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
              [background-size:28px_28px]
            "
          />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
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
              border
              border-white/15
              bg-white/10
              text-white
              transition
              hover:bg-white/20
            "
          >
            <X size={16} />
          </button>

          <div
            className="
              relative
              z-10
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-[18px]
              border
              border-white/15
              bg-white/10
              shadow-[0_10px_30px_rgba(0,0,0,0.12)]
              backdrop-blur-md
            "
          >
            <Crown
              size={24}
            />
          </div>

          <p
            className="
              relative
              z-10
              mt-5
              text-[9px]
              font-black
              uppercase
              tracking-[0.15em]
              text-blue-200
            "
          >
            Premium Bulletin
          </p>

          <h2
            id="bulletin-premium-title"
            className="
              relative
              z-10
              mt-1
              text-2xl
              font-black
            "
          >
            Unlock{" "}
            {monthName ||
              "this bulletin"}
          </h2>

          <p
            className="
              relative
              z-10
              mt-2
              max-w-sm
              text-[12px]
              leading-5
              text-blue-100
            "
          >
            This monthly PSC
            bulletin is available
            with a premium plan.
          </p>
        </div>

        {/* CONTENT */}
        <div className="p-6">
          <div
            className="
              rounded-[18px]
              border
              border-amber-100
              bg-gradient-to-r
              from-[#fffaf0]
              to-[#fff7e3]
              p-4
            "
          >
            <div
              className="
                flex
                items-start
                gap-3
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-[11px]
                  bg-amber-100
                  text-amber-700
                "
              >
                <LockKeyhole
                  size={16}
                />
              </div>

              <div>
                <p
                  className="
                    text-[11px]
                    font-black
                    text-[#713f12]
                  "
                >
                  Premium access
                  required
                </p>

                <p
                  className="
                    mt-1
                    text-[10px]
                    leading-5
                    text-amber-700
                  "
                >
                  Sign in and
                  choose a plan to
                  access premium
                  bulletin content
                  and other learning
                  resources.
                </p>
              </div>
            </div>
          </div>

          <div
            className="
              mt-4
              flex
              items-center
              gap-2
              rounded-[14px]
              bg-[#f4f8ff]
              px-4
              py-3
            "
          >
            <Sparkles
              size={14}
              className="
                shrink-0
                text-[#017cc0]
              "
            />

            <p
              className="
                text-[10px]
                font-semibold
                text-slate-600
              "
            >
              Premium plans also
              unlock additional PSC
              learning resources.
            </p>
          </div>

          {/* ACTIONS */}
          <div
            className="
              mt-6
              grid
              grid-cols-1
              gap-3
              sm:grid-cols-2
            "
          >
            <button
              type="button"
              onClick={onClose}
              className="
                min-h-[46px]
                cursor-pointer
                rounded-[14px]
                border
                border-[#dce8f7]
                bg-white
                px-5
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
              href="/login"
              className="
                group
                inline-flex
                min-h-[46px]
                cursor-pointer
                items-center
                justify-center
                gap-2
                rounded-[14px]
                bg-gradient-to-r
                from-[#164fa5]
                via-[#017cc0]
                to-[#00b5e8]
                px-5
                text-[11px]
                font-black
                text-white
                shadow-[0_10px_25px_rgba(22,79,165,0.20)]
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:shadow-[0_14px_30px_rgba(22,79,165,0.28)]
              "
            >
              Proceed

              <ArrowRight
                size={14}
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              />
            </Link>
          </div>

          <p
            className="
              mt-4
              text-center
              text-[9px]
              font-medium
              text-slate-400
            "
          >
            You&apos;ll be asked to
            sign in before
            continuing.
          </p>
        </div>
      </div>
    </div>
  );
}