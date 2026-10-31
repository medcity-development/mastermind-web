
"use client";

import { Clock3, ArrowRight } from "lucide-react";

export default function ExamTimeFinishedModal({
  open,
  onBackToExams,
  message = "The time allotted for this exam has ended. You can return to the exam list and select another test.",
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="time-finished-title"
        className="w-full max-w-md rounded-[28px] bg-white p-8 text-center shadow-2xl"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-50">
          <Clock3
            size={38}
            className="text-orange-500"
          />
        </div>

        <h2
          id="time-finished-title"
          className="mt-6 text-2xl font-black text-slate-900"
        >
          Your Time Is Finished!
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          {message}
        </p>

        <button
          type="button"
          onClick={onBackToExams}
          className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          Back to Exams
          <ArrowRight size={17} />
        </button>
      </div>
    </div>
  );
}
