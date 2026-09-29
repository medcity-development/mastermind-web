import {
    Loader2,
    Pause,
  } from "lucide-react";
  
  export default function ExamPause({
    onPause,
    saving = false,
  }) {
    return (
      <button
        type="button"
        onClick={onPause}
        disabled={saving}
        className="
          inline-flex
          min-h-[46px]
          items-center
          justify-center
          gap-2
          rounded-[13px]
          border
          border-amber-200
          bg-gradient-to-r
          from-amber-50
          via-orange-50
          to-yellow-50
          px-5
          text-[12px]
          font-bold
          text-amber-700
          transition-all
          duration-300
          hover:-translate-y-0.5
          hover:border-amber-300
          hover:shadow-[0_10px_25px_rgba(245,158,11,0.15)]
          disabled:cursor-not-allowed
          disabled:opacity-60 cursor-pointer
        "
      >
        {saving ? (
          <Loader2
            size={15}
            className="animate-spin"
          />
        ) : (
          <Pause size={15} />
        )}
  
        {saving
          ? "Saving..."
          : "Pause Exam"}
      </button>
    );
  }