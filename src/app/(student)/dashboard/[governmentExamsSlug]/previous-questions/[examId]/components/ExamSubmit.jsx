import {
    Loader2,
    Send,
  } from "lucide-react";
  
  export default function ExamSubmit({
    answeredCount,
    totalQuestions,
    onSubmit,
    saving = false,
  }) {
    return (
      <div
        className="
          flex
          flex-col
          gap-4
          rounded-[18px]
          border
          border-emerald-200
          bg-gradient-to-r
          from-emerald-50
          via-white
          to-cyan-50
          p-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <p
            className="
              text-[13px]
              font-extrabold
              text-[#0b1f44]
            "
          >
            Ready to finish?
          </p>
  
          <p
            className="
              mt-1
              text-[11px]
              text-slate-500
            "
          >
            {answeredCount} of{" "}
            {totalQuestions} answered
          </p>
        </div>
  
        <button
          type="button"
          onClick={onSubmit}
          disabled={saving}
          className="
            inline-flex
            min-h-[46px]
            items-center
            justify-center
            gap-2
            rounded-[13px]
            bg-gradient-to-r
            from-emerald-600
            to-teal-500
            px-6
            text-[12px]
            font-bold
            text-white
            shadow-[0_12px_28px_rgba(16,185,129,0.25)]
            transition-all
            hover:-translate-y-0.5
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
            <Send size={15} />
          )}
  
          {saving
            ? "Saving..."
            : "Submit & Finish"}
        </button>
      </div>
    );
  }