
"use client";

import { Loader2, PauseCircle } from "lucide-react";

export default function ExamPauseConfirmationModal({
  open = false,
  saving = false,
  error = "",
  onConfirm,
  onContinue,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="exam-pause-confirm-title"
        className="w-full max-w-md rounded-[26px] bg-white p-7 text-center shadow-2xl"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
          <PauseCircle
            size={38}
            className="text-amber-600"
          />
        </div>

        <h2
          id="exam-pause-confirm-title"
          className="mt-6 text-2xl font-black text-slate-900"
        >
          Are you sure you want to pause?
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Your answers and remaining time will be
          saved. You can resume this exam later
          from your dashboard.
        </p>

        {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onContinue}
            disabled={saving}
            className="flex-1 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Continue Exam
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={saving}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />
                Saving...
              </>
            ) : (
              "Yes, Pause Exam"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
