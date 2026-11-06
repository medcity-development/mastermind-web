"use client";

import { History, RefreshCw, Search, ArrowUpRight } from "lucide-react";

export default function ExamHistoryHeader({ examName, search, onSearch, loading, onRefresh }) {
  return (
    <header className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b214b] via-[#123b75] to-[#087f9c] p-5 text-white shadow-[0_16px_40px_-20px_rgba(15,53,104,0.55)] sm:p-8">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border-[48px] border-white/5" />
      <div className="relative flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-lg">
          <p className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />{examName} <span className="text-white/30">/</span> Your learning journey</p>
          <div className="flex items-center gap-3"><History size={27} strokeWidth={1.6} className="text-cyan-200" /><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Exam History</h1></div>
          <p className="mt-3 text-sm leading-6 text-blue-100/80">Every attempt is a step forward. Revisit your scores and see where you can improve.</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
          <div className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 transition focus-within:border-cyan-200 focus-within:bg-white/15 xl:w-64">
            <Search size={18} aria-hidden="true" className="shrink-0 text-blue-100" />
            <input aria-label="Search exam history" type="search" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Find an exam..." className="w-full min-w-0 bg-transparent py-3 text-sm text-white outline-none placeholder:text-blue-100/65" />
          </div>
          <button type="button" onClick={onRefresh} disabled={loading} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-xs font-semibold text-[#123b75] shadow-sm transition hover:bg-cyan-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200 disabled:cursor-wait disabled:opacity-60"><RefreshCw size={15} className={loading ? "motion-safe:animate-spin" : ""} />{loading ? "Updating" : "Refresh"}<ArrowUpRight size={14} aria-hidden="true" /></button>
        </div>
      </div>
    </header>
  );
}
