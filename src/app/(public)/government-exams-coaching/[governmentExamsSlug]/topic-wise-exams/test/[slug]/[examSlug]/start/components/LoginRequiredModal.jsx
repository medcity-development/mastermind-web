"use client";

import { LogIn, X } from "lucide-react";

export default function LoginRequiredModal({
  open,
  action,
  onClose,
  onLogin,
  error = "",
}) {
  if (!open) return null;

  const isPause = action === "pause";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#071f55]/50 px-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="topic-wise-login-title"
        className="relative w-full max-w-[430px] rounded-[26px] bg-white p-7 shadow-[0_30px_80px_rgba(7,31,85,0.28)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close login dialog"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500"
        >
          <X size={17} />
        </button>

        <div className="flex h-14 w-14 items-center justify-center rounded-[17px] bg-[#eaf5ff] text-[#075fc8]">
          <LogIn size={23} />
        </div>

        <p className="mt-5 text-[10px] font-black uppercase tracking-[0.14em] text-[#017dc0]">
          Login Required
        </p>

        <h2
          id="topic-wise-login-title"
          className="mt-2 text-2xl font-black text-[#071f55]"
        >
          {isPause ? "Save your progress" : "View your result"}
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          {isPause
            ? "Sign in to save your paused exam. Your answers and remaining time will be retained."
            : "Sign in to save this attempt and view your result. New users will complete their profile first."}
        </p>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[13px] border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onLogin}
            className="inline-flex items-center gap-2 rounded-[13px] bg-[#075fc8] px-5 py-3 text-sm font-bold text-white"
          >
            <LogIn size={16} />
            Continue to Login
          </button>
        </div>
      </div>
    </div>
  );
}