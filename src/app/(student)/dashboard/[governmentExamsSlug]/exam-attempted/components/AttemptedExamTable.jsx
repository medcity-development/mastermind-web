"use client";

import Link from "next/link";
import { Eye, FileQuestion } from "lucide-react";
import { getAttemptEndTime, getAttemptStartTime, getAttemptExamName, getAttemptExamType, getExamTypeLabel } from "../utils/examHistoryUtils";
import {
  isFinishedExamAttempt,
  isPausedExamAttempt,
} from "@/lib/examAttemptStatus";

function display(value) {
  return value === null || value === undefined || value === "" ? "—" : String(value);
}
function nameOf(attempt) {
  const candidates = [attempt?._resolvedExamName, attempt?.exam_name, attempt?.examName,
  attempt?.exam_title, attempt?.examTitle, attempt?.test_name, attempt?.test_title,
  attempt?.exam?.exam_name, attempt?.exam?.title, getAttemptExamName(attempt)];
  return candidates.find((value) => typeof value === "string" && value.trim() && !["-", "—"].includes(value.trim()))?.trim() || "Exam name unavailable";
}
function AttemptTime({ attempt, kind }) {
  const value = kind === "start" ? getAttemptStartTime(attempt) : getAttemptEndTime(attempt);
  const label = kind === "start" ? "Start Time" : "Completed Time";
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-semibold text-slate-500">{label}:</span>
      <span className="font-bold text-slate-700">{value}</span>
    </div>
  );
}
function AttemptTimes({ attempt }) {
  return (
    <div className="space-y-1 text-xs">
      <AttemptTime attempt={attempt} kind="start" />
      {isFinishedExamAttempt(attempt) && <AttemptTime attempt={attempt} kind="end" />}
    </div>
  );
}
function AnalysisButton({ attempt, getAnalysisHref }) {
  const href = getAnalysisHref?.(attempt);
  if (!href) return null;

  return (
    <Link href={href} prefetch={false}
      aria-label="View exam analysis" title="View analysis"
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#164fa5] to-[#017dc0] text-white transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500">
      <Eye size={17} aria-hidden="true" />
    </Link>
  );
}
export default function AttemptedExamTable({ attempts = [], startIndex = 0, loading = false, getAnalysisHref, emptyMessage = "No attempted exams found." }) {
  if (loading) return <div className="space-y-3 p-4 sm:p-6" aria-label="Loading exam history">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />)}</div>;
  if (!attempts.length) return <div className="flex flex-col items-center gap-3 px-6 py-16 text-center"><FileQuestion size={32} className="text-slate-400" /><p className="font-bold text-slate-600">{emptyMessage}</p></div>;

  return (
    <>
      <div className="space-y-3 p-3 sm:p-4 md:hidden">
        {attempts.map((attempt, index) => {
          const type = getAttemptExamType(attempt);
          const isPaused = isPausedExamAttempt(attempt);
          const isFinished = isFinishedExamAttempt(attempt);
          return (
            <article key={`${type}-${attempt.id ?? attempt.attempt_id ?? index}-${index}`} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-[#e7f6fd] px-3 py-1.5 text-[11px] font-extrabold text-[#017dc0]">{getExamTypeLabel(type)}</span>
                <span className="text-[11px] font-semibold text-slate-500">#{startIndex + index + 1}</span>
              </div>
              <h3 className="mt-3 break-words text-sm font-extrabold leading-6 text-[#082e5a]">{nameOf(attempt)}</h3>
              <div className="mt-2 space-y-1 text-xs text-slate-500">
                <AttemptTime attempt={attempt} kind="start" />
                <AttemptTime attempt={attempt} kind="end" />
              </div>
              <div className="mt-4 rounded-xl bg-[#f5f8fd] p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{isFinished ? "Score" : "Status"}</p>
                {!isFinished ? (
                  <p className="mt-1 text-sm font-bold text-amber-700">{isPaused ? "Paused" : "Not finished"} — finish the exam to see your score</p>
                ) : (
                  <p className="mt-1 text-2xl font-black text-[#082e5a]">{display(attempt.user_score)} <span className="text-sm font-semibold text-slate-400">/ {display(attempt.total_mark)}</span></p>
                )}
              </div>
              {isFinished && (
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-slate-50 p-2"><p className="text-lg font-black text-[#082e5a]">{display(attempt.total_attempted)}</p><p className="text-[10px] font-semibold text-slate-500">Attempted</p></div>
                  <div className="rounded-xl bg-emerald-50 p-2"><p className="text-lg font-black text-emerald-600">{display(attempt.total_correct)}</p><p className="text-[10px] font-semibold text-emerald-700">Correct</p></div>
                  <div className="rounded-xl bg-red-50 p-2"><p className="text-lg font-black text-red-500">{display(attempt.total_wrong)}</p><p className="text-[10px] font-semibold text-red-600">Wrong</p></div>
                </div>
              )}
              <div className="mt-4"><AnalysisButton attempt={attempt} getAnalysisHref={getAnalysisHref} /></div>
            </article>
          );
        })}
      </div>
      <div className="hidden w-full min-w-0 overflow-x-scroll overscroll-x-contain pb-2 [scrollbar-gutter:stable] md:block" tabIndex={0} aria-label="Exam history table, scroll horizontally to see all columns">
        <table className="w-full min-w-[960px] text-left">
          <thead className="bg-[#f5f8fd]"><tr className="border-b border-[#e2eaf5] text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
            <th scope="col" className="whitespace-nowrap px-4 py-5">#</th>
            <th scope="col" className="whitespace-nowrap px-4 py-5">Exam Name</th>
            <th scope="col" className="hidden whitespace-nowrap px-4 py-5 lg:table-cell">Type</th>
            <th scope="col" className="whitespace-nowrap px-4 py-5">Score</th>
            <th scope="col" className="whitespace-nowrap px-4 py-5">Attempted</th>
            <th scope="col" className="hidden whitespace-nowrap px-4 py-5 lg:table-cell">Correct</th>
            <th scope="col" className="hidden whitespace-nowrap px-4 py-5 lg:table-cell">Wrong</th>
            <th scope="col" className="px-4 py-5">Activity times</th>
            <th scope="col" className="sticky right-0 z-20 border-l border-[#e2eaf5] bg-[#f5f8fd] px-4 py-5 text-center shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.45)]">Result</th>
          </tr></thead>
          <tbody>{attempts.map((attempt, index) => {
            const type = getAttemptExamType(attempt);
            const isFinished = isFinishedExamAttempt(attempt);
            const isPaused = isPausedExamAttempt(attempt);
            return <tr key={`${type}-${attempt.id ?? attempt.attempt_id ?? index}-${index}`} className="border-b border-slate-100 transition hover:bg-[#f5faff]">
              <td className="px-4 py-5 text-sm font-black text-[#082e5a]">{startIndex + index + 1}</td>
              <td className="min-w-[190px] max-w-[300px] px-4 py-5"><p className="break-words text-sm font-extrabold text-[#082e5a]">{nameOf(attempt)}</p></td>
              <td className="hidden px-4 py-5 lg:table-cell"><span className="rounded-full bg-[#e7f6fd] px-3 py-2 text-xs font-extrabold text-[#017dc0]">{getExamTypeLabel(type)}</span></td>
              <td className="whitespace-nowrap px-4 py-5">{!isFinished ? <span className="text-xs font-bold text-amber-700">{isPaused ? "Paused" : "Not finished"} — finish to see score</span> : <><span className="font-black text-[#082e5a]">{display(attempt.user_score)}</span><span className="ml-1 text-xs font-bold text-slate-400">/ {display(attempt.total_mark)}</span></>}</td>
              <td className="px-4 py-5 text-sm font-bold text-slate-600">{isFinished ? display(attempt.total_attempted) : "—"}</td>
              <td className="hidden px-4 py-5 text-sm font-black text-emerald-600 lg:table-cell">{isFinished ? display(attempt.total_correct) : "—"}</td>
              <td className="hidden px-4 py-5 text-sm font-black text-red-500 lg:table-cell">{isFinished ? display(attempt.total_wrong) : "—"}</td>
              <td className="min-w-[230px] px-4 py-5 text-xs font-semibold text-slate-600"><AttemptTimes attempt={attempt} /></td>
              <td className="sticky right-0 z-10 border-l border-slate-100 bg-white px-4 py-5 shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.45)]"><AnalysisButton attempt={attempt} getAnalysisHref={getAnalysisHref} /></td>
            </tr>;
          })}</tbody>
        </table>
      </div>
    </>
  );
}
