"use client";

import {
  CheckCircle2,
  Loader2,
  Send,
} from "lucide-react";

export default function MockSubmitButton({
  onSubmit,
  saving = false,
  submitted = false,
  disabled = false,
}) {
  const isDisabled =
    saving ||
    submitted ||
    disabled;

  function handleClick() {
    if (
      isDisabled ||
      typeof onSubmit !==
        "function"
    ) {
      return;
    }

    onSubmit();
  }

  return (
    <button
      type="button"
      onClick={
        handleClick
      }
      disabled={
        isDisabled
      }
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
        disabled:cursor-not-allowed
        disabled:opacity-50
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
          bg-white/15
        "
      >
        {saving ? (
          <Loader2
            size={14}
            className="
              animate-spin
            "
          />
        ) : submitted ? (
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
        : submitted
          ? "Submitted"
          : "Submit Exam"}
    </button>
  );
}