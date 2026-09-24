"use client";

import {
  ClockAlert,
  LogIn,
  PauseCircle,
  Send,
  X,
} from "lucide-react";

function getModalContent(
  reason
) {
  if (
    reason === "pause"
  ) {
    return {
      eyebrow:
        "Pause Exam",
      title:
        "Login to pause this exam",
      description:
        "Please login to save your current answers, remaining time and exam progress.",
      button:
        "Login & Save Progress",
      Icon:
        PauseCircle,
      allowClose:
        true,
    };
  }

  if (
    reason ===
    "timeout"
  ) {
    return {
      eyebrow:
        "Time Completed",
      title:
        "Your exam time has ended",
      description:
        "Please login to save this attempt and continue to your result.",
      button:
        "Login to View Result",
      Icon:
        ClockAlert,
      allowClose:
        false,
    };
  }

  return {
    eyebrow:
      "Submit Exam",
    title:
      "Login to submit your exam",
    description:
      "Please login to save your mock test attempt and view your result.",
    button:
      "Login & Submit",
    Icon:
      Send,
    allowClose:
      true,
  };
}

export default function MockLoginModal({
  open,
  reason = "submit",
  onClose,
  onLogin,
}) {
  if (!open) {
    return null;
  }

  const {
    eyebrow,
    title,
    description,
    button,
    Icon,
    allowClose,
  } =
    getModalContent(
      reason
    );

  function handleBackdropClick() {
    if (
      allowClose
    ) {
      onClose?.();
    }
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[9999]
        flex
        items-center
        justify-center
        bg-slate-950/65
        px-4
        backdrop-blur-[6px]
      "
      onClick={
        handleBackdropClick
      }
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mock-login-title"
        onClick={(
          event
        ) =>
          event.stopPropagation()
        }
        className="
          relative
          w-full
          max-w-[430px]
          overflow-hidden
          rounded-[26px]
          border
          border-white/20
          bg-white
          p-6
          shadow-[0_30px_90px_rgba(15,23,42,0.35)]
          sm:p-7
        "
      >
        {/* DECORATION */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-16
            -top-16
            h-44
            w-44
            rounded-full
            bg-blue-200/60
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
            h-40
            w-40
            rounded-full
            bg-cyan-200/40
            blur-3xl
          "
        />

        {/* CLOSE */}

        {allowClose ? (
          <button
            type="button"
            aria-label="Close"
            onClick={
              onClose
            }
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
              bg-slate-100
              text-slate-500
              transition
              hover:bg-slate-200
              hover:text-slate-800
            "
          >
            <X
              size={16}
            />
          </button>
        ) : null}

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
              rounded-[16px]
              bg-gradient-to-br
              from-[#071f55]
              via-[#075fc8]
              to-[#017dc0]
              text-white
              shadow-[0_12px_28px_rgba(7,95,200,0.25)]
            "
          >
            <Icon
              size={23}
            />
          </div>

          <p
            className="
              mt-5
              text-[10px]
              font-black
              uppercase
              tracking-[0.14em]
              text-[#075fc8]
            "
          >
            {eyebrow}
          </p>

          <h2
            id="mock-login-title"
            className="
              mt-1
              text-[22px]
              font-black
              text-[#071f55]
            "
          >
            {title}
          </h2>

          <p
            className="
              mt-3
              text-[13px]
              leading-6
              text-slate-500
            "
          >
            {description}
          </p>

          <button
            type="button"
            onClick={
              onLogin
            }
            className="
              mt-6
              inline-flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-[13px]
              bg-gradient-to-r
              from-[#071f55]
              via-[#075fc8]
              to-[#017dc0]
              px-5
              py-3.5
              text-[12px]
              font-bold
              text-white
              shadow-[0_12px_28px_rgba(7,95,200,0.24)]
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:shadow-[0_16px_34px_rgba(7,95,200,0.32)]
            "
          >
            <LogIn
              size={15}
            />

            {button}
          </button>

          {allowClose ? (
            <button
              type="button"
              onClick={
                onClose
              }
              className="
                mt-3
                w-full
                rounded-[13px]
                border
                border-slate-200
                bg-white
                px-5
                py-3
                text-[11px]
                font-bold
                text-slate-500
                transition
                hover:bg-slate-50
                hover:text-slate-700
              "
            >
              Continue Exam
            </button>
          ) : (
            <p
              className="
                mt-4
                text-center
                text-[10px]
                font-medium
                text-slate-400
              "
            >
              The exam cannot be
              continued because the
              timer has expired.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}