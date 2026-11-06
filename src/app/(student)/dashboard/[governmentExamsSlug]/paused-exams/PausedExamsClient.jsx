"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CirclePause, Play, RefreshCw, Search, ChevronLeft, ChevronRight, ArrowUpRight, BookOpen, LoaderCircle } from "lucide-react";
import usePausedExamHistory from "./usePausedExamHistory";
import useVisibleExamNames from "../exam-attempted/hooks/useVisibleExamNames";
import { attemptIdOf, examIdOf, normalizeType, resolveName } from "../exam-attempted/utils/examHistoryCore";
import { isPausedExamAttempt } from "@/lib/examAttemptStatus";
import { getPausedAttemptIds } from "@/lib/pausedExamAttempts";

const PAGE_SIZE = 10;
const BADGES = { mock: "bg-blue-50 text-blue-700", pqp: "bg-violet-50 text-violet-700", scert: "bg-emerald-50 text-emerald-700", topicwise: "bg-cyan-50 text-cyan-700", tst: "bg-amber-50 text-amber-700", studyplan: "bg-rose-50 text-rose-700" };
const LABELS = { mock: "Mock", pqp: "PYQ", scert: "SCERT", topicwise: "Topic Wise", tst: "Statement Type", studyplan: "Study Plan" };

export default function PausedExamsClient({ cid, governmentExamsSlug, examName }) {
  const router = useRouter();
  const { attempts, loading, historyIncomplete, rateLimited, refresh, updateName } = usePausedExamHistory({ cid });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [opening, setOpening] = useState("");
  const [error, setError] = useState("");
  const paused = useMemo(() => {
    const ids = Object.fromEntries(Object.keys(LABELS).map((type) => [type,
      getPausedAttemptIds(attempts.filter((row) => normalizeType(row._examType ?? row.exam_type) === type)
        .map((row) => ({ ...row, exam_id: examIdOf(row), pauseid: attemptIdOf(row) })))]));
    return attempts.filter((row) => {
      const type = normalizeType(row._examType ?? row.exam_type);
      return isPausedExamAttempt(row) &&
        ids[type]?.[String(examIdOf(row))] === String(attemptIdOf(row));
    });
  }, [attempts]);
  const filtered = useMemo(() => paused.filter((row) => {
    const type = normalizeType(row._examType ?? row.exam_type);
    return (filter === "all" || type === filter) &&
      `${resolveName(row)} ${LABELS[type]} ${examIdOf(row)}`.toLowerCase().includes(search.trim().toLowerCase());
  }), [paused, search, filter]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const start = (current - 1) * PAGE_SIZE;
  const visible = useMemo(() => filtered.slice(start, start + PAGE_SIZE), [filtered, start]);
  const pageNumbers = Array.from({ length: Math.min(5, pages) }, (_, index) =>
    Math.max(1, Math.min(current - 2, pages - 4)) + index);
  const controlClass = "inline-flex min-h-10 min-w-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-35";
  useVisibleExamNames({ cid, attempts: visible, onNameResolved: updateName });

  async function resume(row) {
    const type = normalizeType(row._examType ?? row.exam_type);
    setOpening(`${type}:${attemptIdOf(row)}`);
    setError("");
    try {
      const response = await fetch("/api/exam-attempt/resume", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ governmentExamsSlug, examType: type, examId: examIdOf(row), pauseId: attemptIdOf(row) }),
      });
      const result = await response.json();
      if (!response.ok || !result.href) throw new Error(result.message || "Unable to resume this exam.");
      router.push(result.href);
    } catch (err) {
      setError(err.message || "Unable to resume this exam. Please try again.");
      setOpening("");
    }
  }

  return (
    <main className="min-h-screen min-w-0 bg-[#f5f7fc] px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto w-full min-w-0 max-w-[1450px] space-y-6">
        <header className="relative isolate overflow-hidden rounded-[28px] bg-gradient-to-br from-[#071e4f] via-[#103d87] to-[#176ca5] p-6 text-white shadow-[0_16px_50px_-22px_rgba(12,51,110,0.55)] sm:p-8">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-80 w-80 rounded-full border-[50px] border-white/5" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />{examName} &middot; Your learning space</p>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Pick up where you left off.</h1>
              <p className="mt-2 text-sm leading-6 text-blue-100/80">Resume your paused exams, with your saved progress ready to go.</p>
            </div>
            <div className="flex shrink-0 items-center gap-4 self-start rounded-2xl border border-white/15 bg-white/10 px-5 py-4 sm:self-auto">
              <CirclePause size={28} className="text-cyan-200" />
              <div><p className="text-2xl font-bold tabular-nums">{loading ? <span className="text-sm text-blue-100">Loading...</span> : paused.length}</p><p className="text-[11px] text-blue-100">Paused {!loading && paused.length === 1 ? "exam" : "exams"}</p></div>
            </div>
          </div>
        </header>

        <section aria-labelledby="paused-title" className="overflow-hidden rounded-[24px] border border-[#e0e8f3] bg-white shadow-[0_8px_35px_-18px_rgba(15,40,85,0.18)]">
          <div className="space-y-5 border-b border-slate-100 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h2 id="paused-title" className="text-lg font-bold text-[#0b2451]">Paused Exams</h2><p className="mt-1 text-xs text-slate-500">A little more practice. One step closer.</p></div>
              <button type="button" onClick={refresh} disabled={loading || !!opening} className={controlClass}><RefreshCw size={14} className={loading ? "motion-safe:animate-spin" : ""} />Refresh</button>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search size={17} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400" />
                <input aria-label="Search paused exams" placeholder="Search by exam name..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50" />
              </div>
              <select aria-label="Filter by exam type" value={filter} onChange={(event) => { setFilter(event.target.value); setPage(1); }} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 sm:w-44">
                <option value="all">All exam types</option>{Object.entries(LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
          </div>
          {error && <p role="alert" className="m-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
          {historyIncomplete && !loading && <p role="status" className="m-4 rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">{rateLimited ? "The server is busy. Please wait before refreshing." : "Some exams could not be loaded. Refresh to try again."}</p>}
          {loading ? (
            <div role="status" aria-live="polite" className="flex min-h-64 flex-col items-center justify-center gap-4 px-6 py-14 text-center">
              <LoaderCircle size={32} aria-hidden="true" className="text-blue-600 motion-safe:animate-spin" />
              <div>
                <p className="text-sm font-semibold text-[#102c57]">Loading your paused exams...</p>
                <p className="mt-2 text-xs text-slate-500">Please wait while we check your saved progress.</p>
              </div>
            </div>
          ) : (
          <>

          <table className="block w-full text-left text-sm md:table md:table-fixed">
            <caption className="sr-only">Paused exams, ten exams per page</caption>
            <thead className="sr-only bg-[#f8faff] text-[10px] uppercase tracking-[0.12em] text-slate-400 md:not-sr-only md:table-header-group"><tr><th scope="col" className="w-16 px-6 py-4">#</th><th scope="col" className="px-5 py-4">Exam name</th><th scope="col" className="w-36 px-5 py-4">Type</th><th scope="col" className="w-40 px-5 py-4 text-right">Continue</th></tr></thead>
            <tbody className="block divide-y divide-slate-100 md:table-row-group">
              {visible.map((row, index) => {
                const type = normalizeType(row._examType ?? row.exam_type);
                const key = `${type}:${attemptIdOf(row)}`;
                const title = resolveName(row) || `Exam #${examIdOf(row)}`;
                return <tr key={key} className="group grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-4 p-5 transition-colors hover:bg-blue-50/30 md:table-row md:p-0">
                  <td className="hidden px-6 py-5 text-xs font-medium tabular-nums text-slate-400 md:table-cell">{String(start + index + 1).padStart(2, "0")}</td>
                  <th scope="row" className="col-span-2 min-w-0 text-left md:px-5 md:py-5">
                    <div className="flex items-center gap-3"><span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50/60 text-blue-500"><BookOpen size={18} /></span><div className="min-w-0"><p className="break-words text-[13px] font-semibold leading-6 text-[#102c57] [overflow-wrap:anywhere]">{title}</p><p className="mt-0.5 flex items-center gap-1.5 text-[10px] font-normal text-slate-400"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" />Paused &middot; Ready to resume</p></div></div>
                  </th>
                  <td className="md:px-5 md:py-5"><span className={`inline-flex rounded-lg px-2.5 py-1.5 text-[10px] font-bold ${BADGES[type] || BADGES.mock}`}>{LABELS[type]}</span></td>
                  <td className="text-right md:px-5 md:py-5"><button type="button" aria-label={`Resume ${title}`} onClick={() => resume(row)} disabled={!!opening} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1261c9] to-[#079aca] px-4 text-xs font-semibold text-white shadow-sm transition hover:shadow-[0_5px_16px_-5px_rgba(18,97,201,0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-wait disabled:opacity-50">{opening === key ? <LoaderCircle size={14} className="motion-safe:animate-spin" /> : <Play size={13} fill="currentColor" />}{opening === key ? "Opening..." : "Resume"}<ArrowUpRight size={13} className="hidden lg:block" /></button></td>
                </tr>;
              })}
            </tbody>
          </table>
          {!loading && !visible.length && <div className="px-6 py-14 text-center"><CirclePause size={32} className="mx-auto mb-4 text-blue-300" /><h3 className="font-semibold text-slate-700">{search || filter !== "all" ? "No matching exams" : "You're all caught up"}</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">{search || filter !== "all" ? "Try another name or choose a different exam type." : historyIncomplete ? "Unable to load all paused exams. Please try refreshing." : "When you pause an exam, you can continue it from here."}</p></div>}

          <footer className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/60 px-4 py-4 lg:flex-row sm:px-6">
            <p aria-live="polite" className="text-center text-[11px] text-slate-500 sm:text-left">Showing <span className="font-semibold text-slate-700">{filtered.length ? start + 1 : 0}&ndash;{Math.min(start + PAGE_SIZE, filtered.length)}</span> of <span className="font-semibold text-slate-700">{filtered.length}</span> exams<span className="ml-2 hidden text-slate-400 lg:inline">&middot; 10 per page</span></p>
            <nav aria-label="Paused exams pagination" className="flex max-w-full items-center gap-1.5">
              <button type="button" aria-label="Previous page" disabled={current === 1} onClick={() => setPage(current - 1)} className={controlClass}><ChevronLeft size={15} /><span className="hidden lg:inline">Previous</span></button>
              <span className="px-3 text-xs font-medium text-slate-500 sm:hidden">{current} / {pages}</span>
              <div className="hidden gap-1.5 sm:flex">{pageNumbers.map((number) => <button type="button" key={number} aria-label={`Page ${number}`} aria-current={number === current ? "page" : undefined} onClick={() => setPage(number)} className={number === current ? "min-h-10 min-w-10 rounded-xl bg-[#113e84] px-2 text-xs font-bold text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" : controlClass}>{number}</button>)}</div>
              <button type="button" aria-label="Next page" disabled={current === pages} onClick={() => setPage(current + 1)} className={controlClass}><span className="hidden lg:inline">Next</span><ChevronRight size={15} /></button>
            </nav>
          </footer>
          </>
          )}
        </section>
      </div>
    </main>
  );
}
