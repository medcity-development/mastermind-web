"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";

function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const result = [];
  sorted.forEach((page, index) => {
    if (index && page - sorted[index - 1] > 1) result.push("...");
    result.push(page);
  });
  return result;
}

export default function ExamHistoryPagination({ currentPage = 1, totalPages = 1, totalItems = 0, startIndex = 0, itemsPerPage = 10, onPageChange }) {
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const pages = getPageNumbers(currentPage, totalPages);
  return (
    <nav aria-label="Exam history pagination" className="flex min-w-0 flex-col items-center gap-3 border-t border-slate-100 bg-[#fbfdff] px-3 py-4 sm:flex-row sm:justify-between sm:px-5">
      <p className="text-center text-xs text-slate-500 sm:text-left">Showing <strong className="text-[#082e5a]">{totalItems ? startIndex + 1 : 0}</strong> to <strong className="text-[#082e5a]">{endIndex}</strong> of <strong className="text-[#082e5a]">{totalItems}</strong> entries</p>
      <div className="flex max-w-full items-center justify-center gap-1">
        <button type="button" aria-label="Previous page" disabled={currentPage <= 1} onClick={() => onPageChange?.(currentPage - 1)} className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-600 disabled:opacity-40 sm:px-3"><ChevronLeft size={15} /><span className="hidden sm:inline">Previous</span></button>
        <div className="hidden items-center gap-1 sm:flex">{pages.map((page, index) => page === "..." ? <span key={`dots-${index}`} className="px-1 text-xs text-slate-400">...</span> : <button key={page} type="button" aria-label={`Page ${page}`} aria-current={page === currentPage ? "page" : undefined} onClick={() => onPageChange?.(page)} className={`h-9 min-w-9 rounded-lg px-2 text-xs font-bold ${page === currentPage ? "bg-[#164fa5] text-white" : "border border-slate-200 bg-white text-slate-600"}`}>{page}</button>)}</div>
        <span className="rounded-lg bg-[#e7f6fd] px-3 py-2 text-xs font-bold text-[#164fa5] sm:hidden">{currentPage} / {totalPages}</span>
        <button type="button" aria-label="Next page" disabled={currentPage >= totalPages} onClick={() => onPageChange?.(currentPage + 1)} className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-600 disabled:opacity-40 sm:px-3"><span className="hidden sm:inline">Next</span><ChevronRight size={15} /></button>
      </div>
    </nav>
  );
}
