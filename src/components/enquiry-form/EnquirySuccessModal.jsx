"use client";

import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

export default function EnquirySuccessModal({ onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        aria-labelledby="enquiry-success-title"
        aria-modal="true"
        className="relative w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl"
        role="dialog"
      >
        <button
          aria-label="Close success message"
          className="absolute right-4 top-4 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </button>

        <CheckCircle2
          aria-hidden="true"
          className="mx-auto h-16 w-16 text-emerald-500"
          strokeWidth={1.7}
        />
        <h2
          className="mt-5 text-2xl font-bold text-slate-900"
          id="enquiry-success-title"
        >
          Enquiry submitted!
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Thank you for contacting MasterMind Academy. Our team will get back
          to you shortly.
        </p>
        <button
          autoFocus
          className="mt-7 rounded-xl bg-[#087ee9] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#075ee7] focus:outline-none focus:ring-2 focus:ring-[#087ee9] focus:ring-offset-2"
          onClick={onClose}
          type="button"
        >
          Done
        </button>
      </section>
    </div>
  );
}
