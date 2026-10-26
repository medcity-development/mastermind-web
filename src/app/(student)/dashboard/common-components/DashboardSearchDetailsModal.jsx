"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  Clock3,
  FileQuestion,
  Loader2,
  Target,
  X,
} from "lucide-react";

function displayValue(value) {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "object") return "";
  return String(value);
}

function DetailStat({ icon: Icon, label, value }) {
  if (!displayValue(value)) return null;

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon size={14} />
        <span className="text-[10px] font-bold">{label}</span>
      </div>
      <p className="mt-2 text-sm font-black text-slate-800">{displayValue(value)}</p>
    </div>
  );
}

export default function DashboardSearchDetailsModal({
  item,
  governmentExamsSlug,
  onClose,
  onOpenFullDetails,
}) {
  const [exam, setExam] = useState(null);
  const [instructions, setInstructions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const rawId =
    item?.exam_id ??
    item?.test_id ??
    item?.examId ??
    item?.examid ??
    item?.testid ??
    item?.id;
  const type = String(
    item?.type ||
      item?.exam_type ||
      item?.test_type ||
      item?.category_type ||
      ""
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadDetails() {
      try {
        const params = new URLSearchParams({
          governmentExamsSlug,
          examId: String(rawId),
          type,
        });
        const response = await fetch(`/api/search-details?${params}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const result = await response.json();

        if (!response.ok || result?.status !== true) {
          throw new Error(result?.message || "Unable to load exam details.");
        }

        setExam(result.exam);
        setInstructions(result.instructions || []);
      } catch (loadError) {
        if (loadError?.name !== "AbortError") {
          console.error("Dashboard search details:", loadError);
          setError(loadError?.message || "Unable to load exam details.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadDetails();
    return () => controller.abort();
  }, [governmentExamsSlug, rawId, type]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const title =
    exam?.exam_name ||
    exam?.name ||
    exam?.title ||
    item?.name ||
    item?.exam_name ||
    item?.title ||
    "Exam details";
  const normalizedInstructions = instructions
    .map((instruction) =>
      typeof instruction === "string"
        ? instruction
        : instruction?.instructions || instruction?.text || ""
    )
    .filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-modal="true"
        aria-labelledby="dashboard-search-details-title"
        role="dialog"
        className="flex max-h-[min(760px,92vh)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-7">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <FileQuestion size={19} />
            </span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-600">
                Search result details
              </p>
              <h2
                id="dashboard-search-details-title"
                className="mt-1 text-base font-black leading-snug text-slate-900 sm:text-lg"
              >
                {title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close exam details"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
          {loading ? (
            <div className="flex min-h-48 items-center justify-center gap-2 text-sm font-semibold text-slate-500">
              <Loader2 size={18} className="animate-spin" />
              Loading exam details...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertCircle size={18} />
                <p className="text-sm font-bold">Could not load full details</p>
              </div>
              <p role="alert" className="mt-2 text-sm text-amber-700">{error}</p>
              <p className="mt-2 text-xs leading-5 text-amber-700">
                You can still open the exam page for more information.
              </p>
            </div>
          ) : exam ? (
            <>
              {exam.qpcode ? (
                <p className="mb-4 text-xs font-semibold text-slate-500">
                  Question paper code: <span className="font-bold text-slate-700">{exam.qpcode}</span>
                </p>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <DetailStat icon={BookOpen} label="Questions" value={exam.total_questions} />
                <DetailStat icon={Target} label="Marks" value={exam.total_mark} />
                <DetailStat
                  icon={Clock3}
                  label="Duration"
                  value={
                    exam.total_minutes
                      ? `${exam.total_minutes} minutes`
                      : exam.duration
                  }
                />
                <DetailStat
                  icon={CalendarDays}
                  label="Exam date"
                  value={exam.exam_date || exam.date}
                />
              </div>

              {normalizedInstructions.length ? (
                <section className="mt-6">
                  <h3 className="text-sm font-black text-slate-800">Instructions</h3>
                  <ol className="mt-3 space-y-2">
                    {normalizedInstructions.map((instruction, index) => (
                      <li
                        key={`${index}-${instruction.slice(0, 24)}`}
                        className="rounded-xl bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-600"
                      >
                        <span className="mr-2 font-black text-blue-700">{index + 1}.</span>
                        {instruction}
                      </li>
                    ))}
                  </ol>
                </section>
              ) : null}
            </>
          ) : null}
        </div>

        <footer className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onOpenFullDetails}
            className="rounded-xl bg-blue-700 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-blue-800"
          >
            Open exam page
          </button>
        </footer>
      </section>
    </div>
  );
}
