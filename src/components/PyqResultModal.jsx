"use client";

import {
    useEffect,
    useRef,
} from "react";

export default function PyqResultModal({
    open,
    result,
    examTitle,
    onClose,
    onViewAnalysis,
}) {
    const dialog = useRef(null);

    useEffect(() => {
        const element = dialog.current;

        if (!element) return;

        if (open && !element.open) {
            element.showModal();
        }

        if (!open && element.open) {
            element.close();
        }

        return () => {
            if (element.open) {
                element.close();
            }
        };
    }, [open]);

    const counts = [
        ["Attempted", result?.total_attempted],
        ["Correct", result?.total_correct],
        ["Wrong", result?.total_wrong],
    ];

    return (
        <dialog
            ref={dialog}
            onCancel={onClose}
            onClose={onClose}
            aria-labelledby="pyq-result-title"
            className="
        fixed inset-0 m-auto
        w-[calc(100%-32px)] max-w-lg
        rounded-3xl border border-blue-100
        bg-white p-6 shadow-2xl
        backdrop:bg-slate-950/60
      "
        >
            <div className="flex items-start justify-between gap-4">
                <h2
                    id="pyq-result-title"
                    className="text-xl font-black text-[#082e5a]"
                >
                    Exam Result
                </h2>

                <button
                    type="button"
                    aria-label="Close result"
                    onClick={onClose}
                    className="rounded-full bg-slate-100 px-3 py-1"
                >
                    ×
                </button>
            </div>

            <p className="mt-2 text-sm font-semibold text-slate-500">
                {examTitle}
            </p>

            <div className="my-5 rounded-2xl bg-blue-50 p-5 text-center">
                <p className="text-xs font-bold text-blue-700">
                    Score
                </p>

                <p className="mt-2 text-4xl font-black text-[#082e5a]">
                    {result?.user_score ?? "—"}

                    <span className="text-lg text-slate-400">
                        {" "}/ {result?.total_mark ?? "—"}
                    </span>
                </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
                {counts.map(([label, value]) => (
                    <div
                        key={label}
                        className="rounded-xl bg-slate-50 p-3"
                    >
                        <p className="text-xl font-black text-[#082e5a]">
                            {value ?? "—"}
                        </p>

                        <p className="text-xs text-slate-500">
                            {label}
                        </p>
                    </div>
                ))}
            </div>

            <p className="mt-4 text-xs text-slate-500">
                Your attempt has been saved to your account.
            </p>

            <button
                type="button"
                onClick={() => onViewAnalysis(result)}
                className="
          mt-5 w-full rounded-xl
          bg-gradient-to-r
          from-[#164fa5] to-[#017dc0]
          py-3 font-bold text-white
        "
            >
                View Analysis
            </button>
        </dialog>
    );
}