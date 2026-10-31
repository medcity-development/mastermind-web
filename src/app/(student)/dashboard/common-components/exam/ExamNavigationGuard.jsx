
"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, LockKeyhole, X } from "lucide-react";

export default function ExamNavigationGuard({
  active = true,
  children,
}) {
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  const warn = useCallback(() => {
    setShowModal(true);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!active) {
      setShowModal(false);
      return;
    }

    function isExamContent(target) {
      return (
        target instanceof Element &&
        Boolean(target.closest("[data-exam-content]"))
      );
    }

    function blockOutsideClick(event) {
      if (isExamContent(event.target)) return;

      if (
        event.target instanceof Element &&
        event.target.closest("[data-exam-guard-modal]")
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      warn();
    }

    function blockOutsideKeyboard(event) {
      if (isExamContent(event.target)) return;

      if (
        event.target instanceof Element &&
        event.target.closest("[data-exam-guard-modal]")
      ) {
        return;
      }

      if (
        event.key === "Enter" ||
        event.key === " "
      ) {
        const target = event.target;

        if (
          target instanceof Element &&
          target.closest(
            "a,button,[role='button'],[role='link']"
          )
        ) {
          event.preventDefault();
          event.stopPropagation();
          warn();
        }
      }
    }

    function warnBeforeUnload(event) {
      event.preventDefault();
      event.returnValue = "";
    }

    document.addEventListener(
      "pointerdown",
      blockOutsideClick,
      true
    );

    document.addEventListener(
      "click",
      blockOutsideClick,
      true
    );

    document.addEventListener(
      "keydown",
      blockOutsideKeyboard,
      true
    );

    window.addEventListener(
      "beforeunload",
      warnBeforeUnload
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        blockOutsideClick,
        true
      );

      document.removeEventListener(
        "click",
        blockOutsideClick,
        true
      );

      document.removeEventListener(
        "keydown",
        blockOutsideKeyboard,
        true
      );

      window.removeEventListener(
        "beforeunload",
        warnBeforeUnload
      );
    };
  }, [active, warn]);

  return (
    <>
      <div data-exam-content>
        {children}
      </div>

      {mounted &&
        active &&
        showModal &&
        createPortal(
          <div
            data-exam-guard-modal
            role="presentation"
            className="
              fixed inset-0 z-[99999]
              flex items-center justify-center
              bg-slate-950/65 p-4
              backdrop-blur-sm
            "
          >
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="exam-lock-title"
              aria-describedby="exam-lock-description"
              className="
                relative w-full max-w-md
                rounded-[24px] bg-white
                p-7 text-center
                shadow-2xl sm:p-9
              "
            >
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Close warning"
                className="
                  absolute right-4 top-4
                  rounded-full p-2
                  text-slate-400
                  hover:bg-slate-100
                "
              >
                <X size={19} />
              </button>

              <div
                className="
                  mx-auto flex h-16 w-16
                  items-center justify-center
                  rounded-2xl bg-amber-50
                  text-amber-600
                "
              >
                <LockKeyhole size={29} />
              </div>

              <h2
                id="exam-lock-title"
                className="
                  mt-6 text-2xl font-black
                  text-[#071f55]
                "
              >
                Exam in Progress
              </h2>

              <p
                id="exam-lock-description"
                className="
                  mt-3 text-sm leading-7
                  text-slate-600
                "
              >
                Please pause or finish your exam
                before leaving this page.
              </p>

              <div
                className="
                  mt-5 flex items-start gap-3
                  rounded-xl border border-amber-100
                  bg-amber-50 p-4 text-left
                "
              >
                <AlertTriangle
                  size={19}
                  className="mt-0.5 shrink-0 text-amber-600"
                />
                <p className="text-xs leading-6 text-amber-800">
                  Your examination is currently active.
                  Complete or pause the exam using the
                  available exam controls before navigating
                  elsewhere.
                </p>
              </div>

              <button
                type="button"
                autoFocus
                onClick={() => setShowModal(false)}
                className="
                  mt-6 w-full rounded-xl
                  bg-[#075fc8] px-6 py-3.5
                  text-sm font-bold text-white
                  hover:bg-[#064ba0]
                "
              >
                Continue Examination
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
