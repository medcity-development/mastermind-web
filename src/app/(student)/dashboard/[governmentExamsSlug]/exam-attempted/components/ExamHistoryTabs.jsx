"use client";
import { memo } from "react";

function ExamHistoryTabs({ tabs = [], activeTab = "all", onChange }) {
  if (!tabs.length) return null;
  return (
    <nav aria-label="Filter exam history by type" className="max-w-full overflow-x-auto rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-sm">
      <div className="flex w-max min-w-full items-center gap-1">
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return <button key={tab.key} type="button" aria-pressed={active} onClick={() => onChange?.(tab.key)} className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-500 ${active ? "bg-[#123b75] text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-[#123b75]"}`}>
            {tab.label}<span className={`min-w-5 rounded-md px-1.5 py-0.5 text-[10px] tabular-nums ${active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"}`}>{tab.count ?? 0}</span>
          </button>;
        })}
      </div>
    </nav>
  );
}
export default memo(ExamHistoryTabs);
