"use client";

import {
  Flag,
  LoaderCircle,
  Pause,
} from "lucide-react";

export default function ScertExamActions({
  saving = false,
  submitted = false,
  onPause,
  onFinish,
}) {
  const disabled =
    saving || submitted;

  return (
    <div
      className="
        mt-8
        flex
        flex-col
        gap-3
        border-t
        border-slate-100
        pt-6
        sm:flex-row
        sm:items-center
        sm:justify-end
      "
    >
      {/* PAUSE */}

      <button
        type="button"
        disabled={disabled}
        onClick={onPause}
        className="
          inline-flex
          items-center
          justify-center
          gap-2
          rounded-xl
          border
          border-amber-200
          bg-amber-50
          px-6
          py-3.5
          text-sm
          font-bold
          text-amber-700
          transition-all
          duration-200
          hover:-translate-y-0.5
          hover:border-amber-300
          hover:bg-amber-100
          disabled:cursor-not-allowed
          disabled:opacity-50
          disabled:hover:translate-y-0
        "
      >
        <Pause size={17} />

        Pause & Exit
      </button>

      {/* FINISH */}

      <button
        type="button"
        disabled={disabled}
        onClick={onFinish}
        className="
          inline-flex
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-gradient-to-r
          from-[#071f55]
          via-[#075fc8]
          to-[#017dc0]
          px-6
          py-3.5
          text-sm
          font-bold
          text-white
          shadow-[0_10px_25px_rgba(22,79,165,0.18)]
          transition-all
          duration-200
          hover:-translate-y-0.5
          hover:shadow-[0_14px_30px_rgba(22,79,165,0.24)]
          disabled:cursor-not-allowed
          disabled:opacity-50
          disabled:hover:translate-y-0
        "
      >
        {saving ? (
          <LoaderCircle
            size={17}
            className="animate-spin"
          />
        ) : (
          <Flag size={17} />
        )}

        {saving
          ? "Please wait..."
          : "Finish Exam"}
      </button>
    </div>
  );
}