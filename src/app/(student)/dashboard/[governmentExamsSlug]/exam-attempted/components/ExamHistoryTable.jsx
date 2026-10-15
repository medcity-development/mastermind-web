"use client";

import Link from "next/link";
import { BarChart3, FileQuestion } from "lucide-react";

export default function ExamHistoryTable({
  rows = [],
  loading = false,
  error = false,
  emptyMessage = "No exams attempted so far.",
}) {
  const items = Array.isArray(rows) ? rows : [];

  return (
    <section className="overflow-hidden rounded-[24px] border border-[#d8e5f4] bg-white shadow-[0_15px_40px_rgba(15,23,42,0.05)]">
      <header className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <h2 className="text-lg font-black text-[#082e5a]">Exam Analysis</h2>
        <p className="mt-1 text-xs text-slate-500">
          Review your previous exam attempts and analytics.
        </p>
      </header>

      {loading ? (
        <div className="space-y-3 p-5" role="status" aria-label="Loading exam history">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="h-[72px] animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : error ? (
        <div className="px-6 py-14 text-center" role="alert">
          <FileQuestion size={30} className="mx-auto text-slate-300" />
          <p className="mt-3 text-sm font-bold text-slate-600">
            Exam history is temporarily unavailable.
          </p>
          <p className="mt-1 text-xs text-slate-500">Please try again later.</p>
        </div>
      ) : items.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <FileQuestion size={30} className="mx-auto text-slate-300" />
          <p className="mt-3 text-sm font-bold text-slate-600">{emptyMessage}</p>
          <p className="mt-1 text-xs text-slate-500">
            Completed exams will appear here once their results are saved.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left">
              <thead className="border-b border-slate-200 bg-[#f7faff]">
                <tr className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  <th className="px-5 py-4 sm:px-6" scope="col">#</th>
                  <th className="px-5 py-4 sm:px-6" scope="col">Exam Name</th>
                  <th className="px-5 py-4 sm:px-6" scope="col">Total Attempts</th>
                  <th className="px-5 py-4 sm:px-6" scope="col">View Details</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row, index) => (
                  <tr key={row.id ?? `${row.examName}-${index}`} className="border-b border-slate-100 last:border-0 hover:bg-[#f8fbff]">
                    <td className="px-5 py-4 text-sm font-black text-[#082e5a] sm:px-6">{index + 1}</td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-700 sm:px-6">
                      <span className="inline-flex items-center gap-3">
                        <span className="rounded-xl bg-[#e8f6fc] p-2 text-[#017dc0]"><FileQuestion size={16} /></span>
                        {row.examName || "Exam name unavailable"}
                      </span>
                    </td>
                    <td className="px-5 py-4 sm:px-6">
                      <span className="rounded-full bg-[#eef7ff] px-3 py-1.5 text-xs font-black text-[#017dc0]">
                        {row.totalAttempts ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-4 sm:px-6">
                      {typeof row.href === "string" && row.href.startsWith("/") ? (
                        <Link href={row.href} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#164fa5] to-[#017dc0] px-4 py-2.5 text-xs font-extrabold text-white hover:opacity-90">
                          <BarChart3 size={15} /> View Analytics
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-400">Unavailable</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <footer className="border-t border-slate-100 bg-[#fbfdff] px-5 py-3 text-xs font-semibold text-slate-500 sm:px-6">
            Showing 1 to {items.length} of {items.length} entries
          </footer>
        </>
      )}
    </section>
  );
}
