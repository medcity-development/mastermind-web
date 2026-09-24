"use client";

import {
  Loader2,
  Send,
} from "lucide-react";

export default function MockSubmitButton({
  onSubmit,
  saving = false,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={
        onSubmit
      }
      disabled={
        saving ||
        disabled
      }
      className="
        inline-flex
        min-h-[46px]
        items-center
        justify-center
        gap-2
        rounded-[13px]
        bg-gradient-to-r
        from-[#164fa5]
        via-[#075fc8]
        to-[#017dc0]
        px-6
        text-[12px]
        font-bold
        text-white
        shadow-[0_10px_25px_rgba(22,79,165,0.18)]
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:shadow-[0_15px_30px_rgba(22,79,165,0.24)]
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
    >
      {saving ? (
        <Loader2
          size={15}
          className="animate-spin"
        />
      ) : (
        <Send
          size={15}
        />
      )}

      {saving
        ? "Submitting..."
        : "Submit Exam"}
    </button>
  );
}