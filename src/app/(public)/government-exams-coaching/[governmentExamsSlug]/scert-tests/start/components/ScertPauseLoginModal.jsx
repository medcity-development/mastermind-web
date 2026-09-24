"use client";

import {
  LogIn,
  PauseCircle,
  X,
} from "lucide-react";

export default function ScertPauseLoginModal({
  open,
  onClose,
  onLogin,
}) {
  if (!open) {
    return null;
  }

  function handleBackdropClick(
    event
  ) {
    if (
      event.target ===
      event.currentTarget
    ) {
      onClose?.();
    }
  }

  return (
    <div
      onClick={
        handleBackdropClick
      }
      className="
        fixed
        inset-0
        z-[120]
        flex
        items-center
        justify-center
        bg-slate-950/60
        p-4
        backdrop-blur-sm
      "
    >
      <div
        className="
          relative
          w-full
          max-w-[430px]
          overflow-hidden
          rounded-[28px]
          bg-white
          shadow-[0_30px_90px_rgba(7,31,85,0.35)]
        "
      >
        {/* CLOSE */}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
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
            bg-white/15
            text-white
            backdrop-blur
            transition
            hover:bg-white/25
          "
        >
          <X size={17} />
        </button>

        {/* HEADER */}

        <div
          className="
            relative
            overflow-hidden
            bg-gradient-to-br
            from-[#071f55]
            via-[#075fc8]
            to-[#00a8df]
            px-6
            py-9
            text-center
            text-white
          "
        >
          <div
            aria-hidden="true"
            className="
              absolute
              inset-0
              opacity-[0.08]
              [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
              [background-size:30px_30px]
            "
          />

          <div
            className="
              relative
              z-10
            "
          >
            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-[20px]
                border
                border-white/20
                bg-white/15
                backdrop-blur
              "
            >
              <PauseCircle
                size={29}
              />
            </div>

            <p
              className="
                mt-5
                text-[10px]
                font-black
                uppercase
                tracking-[0.18em]
                text-blue-100
              "
            >
              Save Your Progress
            </p>

            <h2
              className="
                mt-2
                text-2xl
                font-black
              "
            >
              Login to Pause Exam
            </h2>

            <p
              className="
                mx-auto
                mt-3
                max-w-[320px]
                text-[13px]
                leading-6
                text-blue-100
              "
            >
              Login to save your
              answers and remaining
              time, then continue the
              exam later.
            </p>
          </div>
        </div>

        {/* BODY */}

        <div className="p-6 sm:p-7">
          <div
            className="
              rounded-[18px]
              border
              border-[#dce8f7]
              bg-[#f7fbff]
              p-4
              text-center
            "
          >
            <p
              className="
                text-[12px]
                leading-6
                text-slate-500
              "
            >
              You are currently taking
              this exam as a guest.
              Login is required before
              your progress can be
              saved.
            </p>
          </div>

          <button
            type="button"
            onClick={onLogin}
            className="
              mt-5
              inline-flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-[14px]
              bg-gradient-to-r
              from-[#071f55]
              via-[#075fc8]
              to-[#017dc0]
              px-5
              py-3.5
              text-sm
              font-bold
              text-white
              shadow-[0_12px_30px_rgba(22,79,165,0.22)]
              transition
              hover:-translate-y-0.5
            "
          >
            <LogIn
              size={18}
            />

            Login to Continue
          </button>

          <button
            type="button"
            onClick={onClose}
            className="
              mt-2
              w-full
              rounded-[14px]
              px-5
              py-3
              text-sm
              font-bold
              text-slate-500
              transition
              hover:bg-slate-50
              hover:text-[#071f55]
            "
          >
            Continue Exam
          </button>
        </div>
      </div>
    </div>
  );
}