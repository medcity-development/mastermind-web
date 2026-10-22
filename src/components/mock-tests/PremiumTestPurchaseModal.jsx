"use client";

import {
  Crown,
  X,
} from "lucide-react";

export default function PremiumTestPurchaseModal({
  open,
  testName,
  onClose,
  onConfirm,
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-[#071f55]/60 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="premium-test-purchase-title"
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm hover:bg-white"
        >
          <X size={17} />
        </button>

        <div className="bg-gradient-to-br from-amber-50 to-orange-100 px-6 py-7 sm:px-8">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
            <Crown size={27} />
          </span>
          <p className="mt-5 text-[10px] font-black uppercase tracking-[0.15em] text-amber-700">
            Premium mock test
          </p>
          <h2
            id="premium-test-purchase-title"
            className="mt-2 text-2xl font-black leading-tight text-[#071f55]"
          >
            A plan is required to start this test
          </h2>
          {testName ? (
            <p className="mt-3 text-sm font-semibold text-slate-600">
              {testName}
            </p>
          ) : null}
        </div>

        <div className="px-6 py-6 sm:px-8">
          <p className="text-sm leading-6 text-slate-600">
            Continue to sign in and view the available plans for your exam.
          </p>
          <button
            type="button"
            onClick={onConfirm}
            className="mt-5 w-full rounded-xl bg-gradient-to-r from-blue-700 to-violet-600 px-5 py-3 text-sm font-black text-white transition hover:brightness-110"
          >
            OK
          </button>
        </div>
      </section>
    </div>
  );
}
