"use client";

import {
  CheckCircle2,
  Loader2,
  Send,
} from "lucide-react";

export default function MockSubmitButton({
  onSubmit,
  saving = false,
  disabled = false,
}) {
  const isDisabled =
    saving || disabled;

  return (
    <button
      type="button"
      onClick={onSubmit}
      disabled={isDisabled}
      className="
        group

        inline-flex
        min-h-[46px]
        items-center
        justify-center
        gap-2.5

        rounded-[13px]

        bg-gradient-to-r
        from-[#164fa5]
        via-[#1268c7]
        to-[#017dc0]

        px-6

        text-[12px]
        font-extrabold
        text-white

        shadow-[0_10px_25px_rgba(22,79,165,0.18)]

        transition-all
        duration-300

        hover:-translate-y-0.5
        hover:shadow-[0_15px_32px_rgba(22,79,165,0.26)]

        disabled:cursor-not-allowed
        disabled:opacity-45
        disabled:hover:translate-y-0
        disabled:hover:shadow-[0_10px_25px_rgba(22,79,165,0.18)]
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

          bg-white/15

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
        ) : disabled ? (
          <CheckCircle2
            size={14}
          />
        ) : (
          <Send
            size={13}
          />
        )}
      </span>

      {saving
        ? "Submitting..."
        : "Submit Exam"}
    </button>
  );
}