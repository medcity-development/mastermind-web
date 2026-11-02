"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function ExamNavigationGuard({
  active = false,
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const dialogOpenRef = useRef(false);

  useEffect(() => {
    if (!active) return undefined;

    function handleDocumentClick(event) {
      if (!(event.target instanceof Element)) return;

      const target = event.target;
      if (
        target.closest(
          '[role="dialog"], [data-exam-navigation-guard]'
        )
      ) {
        return;
      }

      const inExamWorkspace = target.closest(
        "[data-exam-workspace]"
      );
      const isNavigationClick = target.closest(
        'a[href], [data-exam-exit]'
      );

      if (inExamWorkspace && !isNavigationClick) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      if (!dialogOpenRef.current) {
        dialogOpenRef.current = true;
        setDialogOpen(true);
      }
    }

    document.addEventListener(
      "click",
      handleDocumentClick,
      true
    );

    return () => {
      document.removeEventListener(
        "click",
        handleDocumentClick,
        true
      );
    };
  }, [active]);

  function dismissDialog() {
    dialogOpenRef.current = false;
    setDialogOpen(false);
  }

  if (!active || !dialogOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      data-exam-navigation-guard
      className="fixed inset-0 z-[11000] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="active-exam-navigation-title"
        className="w-full max-w-sm rounded-2xl border border-white/70 bg-white p-6 text-center shadow-2xl"
      >
        <h2
          id="active-exam-navigation-title"
          className="text-lg font-black text-slate-900"
        >
          Exam in progress
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          First finish or pause the exam before leaving this page.
        </p>
        <button
          type="button"
          autoFocus
          onClick={dismissDialog}
          className="mt-5 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          Continue exam
        </button>
      </section>
    </div>,
    document.body
  );
}
