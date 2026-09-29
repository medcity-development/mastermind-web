"use client";

import {
  Loader2,
  Pause,
} from "lucide-react";

export default function MockPauseButton({
  onPause,
  saving = false,
  disabled = false,
}) {
  const isDisabled =
    saving || disabled;

  return (
    <button
      type="button"
      onClick={onPause}
      disabled={isDisabled}
      className="
        group

        inline-flex
        min-h-[46px]
        items-center
        justify-center
        gap-2.5

        rounded-[13px]

        border
        border-amber-200

        bg-gradient-to-r
        from-amber-50
        via-orange-50
        to-yellow-50

        px-6

        text-[12px]
        font-extrabold

        text-amber-700

        shadow-[0_7px_20px_rgba(245,158,11,0.07)]

        transition-all
        duration-300

        hover:-translate-y-0.5
        hover:border-amber-300
        hover:shadow-[0_12px_26px_rgba(245,158,11,0.14)]

        disabled:cursor-not-allowed
        disabled:opacity-45
        disabled:hover:translate-y-0
      "
    >
      <span
        className="
          flex
          h-7
          w-7
          items-center
          justify-center

          rounded-full

          bg-amber-100

          transition-transform
          duration-300

          group-hover:scale-105
        "
      >
        {saving ? (
          <Loader2
            size={14}
            className="animate-spin"
          />
        ) : (
          <Pause
            size={13}
            fill="currentColor"
          />
        )}
      </span>

      {saving
        ? "Please wait..."
        : "Pause Exam"}
    </button>
  );
}