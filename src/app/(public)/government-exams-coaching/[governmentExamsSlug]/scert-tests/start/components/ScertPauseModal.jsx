"use client";

import {
  LoaderCircle,
  PauseCircle,
  X,
} from "lucide-react";

export default function ScertPauseModal({
  open,
  saving = false,
  onClose,
  onConfirm,
}) {
  if (!open) {
    return null;
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget && !saving) {
      onClose?.();
    }
  }

  return (
    <div
      onClick={handleBackdropClick}
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-slate-950/55
        p-4
        backdrop-blur-sm
      "
    >
      <div
        className="
          relative
          w-full
          max-w-md
          overflow-hidden
          rounded-[26px]
          bg-white
          shadow-[0_30px_80px_rgba(15,23,42,0.28)]
        "
      >
        {/* CLOSE */}

        <button
          type="button"
          disabled={saving}
          onClick={onClose}
          aria-label="Close pause modal"
          className="
            absolute
            right-4
            top-4
            z-10
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
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <X size={17} />
        </button>

        <div className="p-6 sm:p-7">
          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-[18px]
              bg-gradient-to-br
              from-amber-50
              to-orange-100
              text-amber-600
            "
          >
            <PauseCircle size={26} />
          </div>

          <h2
            className="
              mt-5
              text-xl
              font-black
              text-[#071f55]
            "
          >
            Pause this exam?
          </h2>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-slate-500
            "
          >
            Your current answers and remaining time will be
            saved. You can resume the exam later.
          </p>

          <div
            className="
              mt-7
              flex
              flex-col
              gap-3
              sm:flex-row
            "
          >
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="
                flex-1
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-3
                text-sm
                font-bold
                text-slate-600
                transition
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Continue Exam
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={onConfirm}
              className="
                inline-flex
                flex-1
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-gradient-to-r
                from-amber-500
                to-orange-500
                px-4
                py-3
                text-sm
                font-bold
                text-white
                shadow-[0_10px_24px_rgba(245,158,11,0.22)]
                transition
                hover:-translate-y-0.5
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {saving ? (
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <PauseCircle size={17} />
              )}

              {saving ? "Saving..." : "Pause & Exit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}