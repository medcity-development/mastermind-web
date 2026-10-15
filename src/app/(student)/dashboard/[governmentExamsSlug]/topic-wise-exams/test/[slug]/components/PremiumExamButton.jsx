
"use client";

import {
  LockKeyhole,
  Crown,
} from "lucide-react";

export default function PremiumExamButton() {
  return (
    <div className="mt-auto space-y-3">
      <div
        className="
          flex items-center justify-center gap-2
          rounded-xl border border-amber-200
          bg-gradient-to-r from-amber-50 to-yellow-50
          px-4 py-3
          text-xs font-bold text-amber-800
        "
      >
        <Crown size={15} />
        Premium Exam
      </div>

      <button
        type="button"
        disabled
        title="Premium access is required to attempt this exam."
        className="
          flex w-full cursor-not-allowed
          items-center justify-center gap-2
          rounded-xl bg-slate-100
          px-5 py-3.5
          text-sm font-black text-slate-500
        "
      >
        <LockKeyhole size={16} />
        Premium Access Required
      </button>
    </div>
  );
}
