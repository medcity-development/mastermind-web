"use client";

import { useEffect } from "react";
import { ArrowRight, CheckCircle2, MinusCircle, Target, Trophy, X, XCircle } from "lucide-react";
import { isFinishedExamAttempt } from "@/lib/examAttemptStatus";

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function shown(value) {
  const number = numberOrNull(value);
  return number === null ? "—" : String(number);
}

function Stat({ icon: Icon, label, value, tone = "blue" }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    orange: "bg-orange-50 text-orange-700",
  };
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 p-3 sm:p-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon size={19} />
      </div>
      <div className="min-w-0">
        <p className="break-words text-lg font-black text-[#071f55]">{value}</p>
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export default function ExamHistoryResultModal({
  open = false,
  result = null,
  examTitle = "",
  onClose,
  onViewAnalysis,
}) {
  useEffect(() => {
    if (!open || !result || !isFinishedExamAttempt(result)) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, onClose, result]);

  if (!open || !result || !isFinishedExamAttempt(result)) return null;

  // All values have already been prepared by prepareExamHistoryResult.
  const score = numberOrNull(result.user_score ?? result.score);
  const totalMark = numberOrNull(result.total_mark ?? result.totalMark);
  const attempted = numberOrNull(result.total_attempted ?? result.attempted);
  const correct = numberOrNull(result.total_correct ?? result.correct);
  const wrong = numberOrNull(result.total_wrong ?? result.wrong);
  const questions = numberOrNull(result.total_questions ?? result.totalQuestions);
  const minusMark = numberOrNull(result.minus_mark ?? result.minusMark);
  const percentage = score !== null && totalMark > 0
    ? Math.round((score / totalMark) * 100)
    : null;
  const name = [result._resolvedExamName, examTitle, result.exam_name, result.exam_title, result.test_name]
    .find((value) => typeof value === "string" && value.trim() && value.trim() !== "-") || "Exam name unavailable";
  const type = String(result.exam_type ?? result.examType ?? result.type ?? "Exam").toUpperCase();
  const attemptId = result.id ?? result.attempt_id;
  const canAnalyze = Boolean(onViewAnalysis && attemptId !== undefined && attemptId !== null);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-[#020817]/75 px-3 py-4 backdrop-blur-sm sm:px-5" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose?.();
    }}>
      <div role="dialog" aria-modal="true" aria-labelledby="exam-result-title" className="my-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-[760px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:rounded-[28px]">
        <header className="relative shrink-0 bg-gradient-to-r from-[#071f55] via-[#164fa5] to-[#017dc0] px-5 py-6 text-white sm:px-8 sm:py-8">
          <button type="button" aria-label="Close result" onClick={onClose} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 hover:bg-white/30"><X size={18} /></button>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20"><Trophy size={23} /></div>
          <p className="mt-4 text-[11px] font-black uppercase tracking-widest text-blue-100">{type} Result</p>
          <h2 id="exam-result-title" className="mt-1 text-2xl font-black sm:text-3xl">Your Exam Result</h2>
          <p className="mt-2 break-words pr-4 text-sm text-blue-100">{name}</p>
        </header>
        <div className="min-h-0 overflow-y-auto overscroll-contain">
          <section className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-[#f8fbff] px-5 py-6 sm:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Final Score</p>
              <p className="mt-1 text-4xl font-black text-[#071f55]">{shown(score)} <span className="text-base font-semibold text-slate-400">/ {shown(totalMark)}</span></p>
            </div>
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-[7px] border-[#dff4fe] bg-white text-lg font-black text-[#017dc0] sm:h-24 sm:w-24">{percentage === null ? "—" : `${percentage}%`}</div>
          </section>
          <section className="px-5 py-6 sm:px-8">
            <h3 className="mb-4 text-base font-black text-[#071f55]">Performance Summary</h3>
            <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
              <Stat icon={Target} label="Attempted" value={questions === null ? shown(attempted) : `${shown(attempted)}/${questions}`} />
              <Stat icon={CheckCircle2} label="Correct" value={shown(correct)} tone="green" />
              <Stat icon={XCircle} label="Wrong" value={shown(wrong)} tone="red" />
              <Stat icon={MinusCircle} label="Negative Marks" value={shown(minusMark)} tone="orange" />
            </div>
            <p className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-xs leading-5 text-slate-600">Scores are taken from the prepared exam result. The modal does not calculate the score again.</p>
          </section>
        </div>
        <footer className="flex shrink-0 flex-col gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:px-8">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700">Close</button>
          <button type="button" onClick={() => onViewAnalysis?.(result)} disabled={!canAnalyze} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0b216c] to-[#017dc0] px-5 py-3 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40">View Exam Analysis <ArrowRight size={17} /></button>
        </footer>
      </div>
    </div>
  );
}
