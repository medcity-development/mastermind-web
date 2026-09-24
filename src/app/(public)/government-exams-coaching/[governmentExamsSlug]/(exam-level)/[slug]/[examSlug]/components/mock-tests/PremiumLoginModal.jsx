"use client";

import {
  Crown,
  LogIn,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

export default function PremiumLoginModal({
  open,
  exam,
  onClose,
}) {
  const router =
    useRouter();

  if (!open) {
    return null;
  }

  const title =
    exam?.exam_name ||
    exam?.exam ||
    exam?.name ||
    "Premium Mock Test";

  function handleLogin() {
    router.push(
      "/login"
    );
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
        bg-[#071f55]/60
        px-4
        py-8
        backdrop-blur-[5px]
      "
      onClick={
        onClose
      }
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Login required"
        onClick={(
          event
        ) =>
          event.stopPropagation()
        }
        className="
          relative
          w-full
          max-w-[440px]
          overflow-hidden
          rounded-[28px]
          border
          border-white/70
          bg-white
          shadow-[0_35px_100px_rgba(7,31,85,0.32)]
        "
      >
        {/* TOP GRADIENT */}

        <div
          className="
            relative
            overflow-hidden
            bg-gradient-to-br
            from-[#fff8dc]
            via-[#fffdf5]
            to-[#fff5cf]
            px-6
            pb-6
            pt-7
            sm:px-7
          "
        >
          <div
            aria-hidden="true"
            className="
              absolute
              -right-16
              -top-16
              h-44
              w-44
              rounded-full
              bg-amber-300/25
              blur-3xl
            "
          />

          <button
            type="button"
            onClick={
              onClose
            }
            aria-label="Close modal"
            className="
              absolute
              right-4
              top-4
              z-20
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              border
              border-slate-200/80
              bg-white/90
              text-slate-500
              shadow-sm
              transition
              hover:bg-white
              hover:text-slate-800
            "
          >
            <X
              size={16}
            />
          </button>

          <div
            className="
              relative
              z-10
            "
          >
            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-[18px]
                bg-gradient-to-br
                from-amber-400
                to-orange-500
                text-white
                shadow-[0_12px_28px_rgba(245,158,11,0.30)]
              "
            >
              <Crown
                size={27}
              />
            </div>

            <p
              className="
                mt-5
                text-[9px]
                font-black
                uppercase
                tracking-[0.16em]
                text-amber-600
              "
            >
              Premium Mock Test
            </p>

            <h2
              className="
                mt-2
                text-[23px]
                font-black
                leading-tight
                tracking-[-0.03em]
                text-[#071f55]
              "
            >
              Login to access this
              exam
            </h2>

            <p
              className="
                mt-3
                line-clamp-2
                text-[13px]
                font-semibold
                leading-6
                text-slate-600
              "
            >
              {title}
            </p>
          </div>
        </div>

        {/* CONTENT */}

        <div
          className="
            px-6
            py-6
            sm:px-7
          "
        >
          <div
            className="
              flex
              items-start
              gap-3
              rounded-[16px]
              border
              border-blue-100
              bg-[#f5f9ff]
              p-4
            "
          >
            <span
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-[11px]
                bg-[#e8f3ff]
                text-[#075fc8]
              "
            >
              <ShieldCheck
                size={17}
              />
            </span>

            <div>
              <p
                className="
                  text-[12px]
                  font-black
                  text-[#071f55]
                "
              >
                Login required
              </p>

              <p
                className="
                  mt-1
                  text-[11px]
                  leading-5
                  text-slate-500
                "
              >
                Sign in to your
                MasterMind account
                to continue to this
                premium mock test.
              </p>
            </div>
          </div>

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
              onClick={
                onClose
              }
              className="
                min-h-[46px]
                rounded-[14px]
                border
                border-slate-200
                bg-white
                px-5
                text-[12px]
                font-bold
                text-slate-600
                transition
                hover:bg-slate-50
              "
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={
                handleLogin
              }
              className="
                inline-flex
                min-h-[46px]
                items-center
                justify-center
                gap-2
                rounded-[14px]
                bg-gradient-to-r
                from-[#164fa5]
                via-[#075fc8]
                to-[#017dc0]
                px-5
                text-[12px]
                font-black
                text-white
                shadow-[0_12px_28px_rgba(22,79,165,0.22)]
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:shadow-[0_16px_34px_rgba(22,79,165,0.28)]
              "
            >
              <LogIn
                size={16}
              />

              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}