
"use client";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import ExamHistoryHeader from "./components/ExamHistoryHeader";
import { LoaderCircle, Layers3, CircleCheck, CirclePause } from "lucide-react";
import { isFinishedExamAttempt, isPausedExamAttempt } from "@/lib/examAttemptStatus";
import ExamHistoryTabs from "./components/ExamHistoryTabs";
import AttemptedExamTable from "./components/AttemptedExamTable";
import ExamHistoryPagination from "./components/ExamHistoryPagination";

import {
  buildExamHistoryTabs,
  getExamHistoryTabType,
} from "./utils/examHistoryUtils";

import {
  ITEMS_PER_PAGE,
  normalizeType,
  examIdOf,
  attemptIdOf,
  resolveName,
  positiveId,
} from "./utils/examHistoryCore";

import { getAttemptExamType, getExamTypeLabel } from "./utils/examHistoryUtils";

import useExamHistory from "./hooks/useExamHistory";
import useVisibleExamNames from "./hooks/useVisibleExamNames";

export default function ExamHistoryClient({
  cid,
  uid,
  examTypes = [],
  examName = "",
  governmentExamsSlug = "",
}) {
  const safeCid = positiveId(cid);

  const [activeTab, setActiveTab] = useState("all");
  const [historyScope, setHistoryScope] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    attempts,
    loading,
    historyIncomplete,
    failedTypes,
    unverifiedTypes,
    unresolvedCount,
    rateLimited,
    loadedCount,
    totalTypes,
    types,
    refresh,
    updateName,
  } = useExamHistory({
    cid: safeCid,
    uid,
    examTypes,
    scope: historyScope,
  });

  const tabs = useMemo(
    () =>
      buildExamHistoryTabs(attempts)
        .map((tab) => ({
          ...tab,
          key:
            tab.key ??
            tab.value ??
            tab.id,
        }))
        .filter(
          (tab) =>
            tab.key === "all" ||
            types.includes(normalizeType(tab.key))
        ),
    [attempts, types]
  );

  const filteredAttempts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return attempts.filter((attempt) => {
      const type = normalizeType(
        getAttemptExamType(attempt)
      );
      const tabType = getExamHistoryTabType(type);

      if (
        activeTab !== "all" &&
        tabType !== activeTab
      ) {
        return false;
      }

      if (!query) return true;

      return (
        resolveName(attempt)
          .toLowerCase()
          .includes(query) ||
        type.includes(query) ||
        String(examIdOf(attempt) ?? "")
          .includes(query)
      );
    });
  }, [attempts, activeTab, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredAttempts.length / ITEMS_PER_PAGE
    )
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safePage - 1) * ITEMS_PER_PAGE;

  const visibleAttempts = useMemo(
    () =>
      filteredAttempts.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
      ),
    [filteredAttempts, startIndex]
  );

  useVisibleExamNames({
    cid: safeCid,
    attempts: visibleAttempts,
    onNameResolved: updateName,
  });

  const getAnalysisHref = useCallback(
    (attempt) => {
      const attemptId = attemptIdOf(attempt);

      const examType = normalizeType(
        getAttemptExamType(attempt)
      );

      if (
        !attemptId ||
        !examType ||
        !governmentExamsSlug
      ) {
        return null;
      }

      const params = new URLSearchParams({
        attemptId: String(attemptId),
        examType,
        title: resolveName(attempt),
      });

      return (
        `/dashboard/${encodeURIComponent(
          governmentExamsSlug
        )}/exam-analysis?${params.toString()}`
      );
    },
    [governmentExamsSlug]
  );

  const handleSearch = useCallback((value) => {
    setSearch(value);
    setCurrentPage(1);
  }, []);

  const handleTabChange = useCallback(
    (value) => {
      const next = normalizeType(value);

      if (
        next !== "all" &&
        !types.includes(next)
      ) {
        return;
      }

      setActiveTab(next);
      setCurrentPage(1);
    },
    [types]
  );

  const emptyMessage =
    historyIncomplete && attempts.length === 0
      ? "Exam history is unavailable"
      : attempts.length === 0
      ? "No exams attempted yet"
      : "No exams match your search or filter.";

  const emptyDescription =
    historyIncomplete && attempts.length === 0
      ? "We could not load a complete history. Please try refreshing in a moment."
      : attempts.length === 0
      ? "Attempt an exam to see your scores and analysis here."
      : "Try changing your search or selecting a different exam type.";

  return (
    <div className="w-full min-w-0 space-y-5">
      <ExamHistoryHeader
        examName={historyScope === "all" ? "All courses" : examName}
        search={search}
        onSearch={handleSearch}
        loading={loading}
        onRefresh={refresh}
      />

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { label: "Attempts", value: attempts.length, Icon: Layers3, color: "bg-blue-50 text-blue-600" },
          { label: "Completed", value: attempts.filter(isFinishedExamAttempt).length, Icon: CircleCheck, color: "bg-emerald-50 text-emerald-600" },
          { label: "Paused", value: attempts.filter(isPausedExamAttempt).length, Icon: CirclePause, color: "bg-amber-50 text-amber-600" },
        ].map(({ label, value, Icon, color }) => (
          <div key={label} className="flex min-w-0 flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${color}`}><Icon size={20} strokeWidth={1.7} aria-hidden="true" /></span>
            <div><p className="text-xl font-bold tabular-nums tracking-tight text-[#102c57] sm:text-2xl">{loading ? <span className="inline-block h-6 w-8 animate-pulse rounded bg-slate-100" aria-label="Loading" /> : value}</p><p className="mt-0.5 text-[10px] font-medium text-slate-500 sm:text-xs">{label}</p></div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-base font-bold text-slate-800">Your attempts</h2><p className="mt-1 text-xs text-slate-500">Finished and paused exams, all in one place.</p></div>
        <div className="flex items-center gap-3">
       
        <select
          id="history-course"
          value={historyScope}
          onChange={(event) => { setHistoryScope(event.target.value); setCurrentPage(1); }}
          className="min-h-11 w-full min-w-0 rounded-xl bg-gradient-to-r
  from-[#2e64ca]/10
  via-[#1d68da]/10
  to-[#ca53ce]/10
  text-black px-4 py-2 text-xs font-semibold text-[#123b75] outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 sm:w-44"
        >
          <option value="all" className="text-black bg-gray-50">
            All courses
          </option>
          <option value="course" className="text-black bg-gray-50">{examName}</option>
        </select>
        </div>
      </div>

      <div className="min-w-0 max-w-full overflow-x-auto">
        <ExamHistoryTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={handleTabChange}
        />
      </div>

      {historyIncomplete && !loading && (
        <div
          role="status"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          {rateLimited ? (
            <p>The exam history server is rate-limited. Please wait before refreshing.</p>
          ) : failedTypes.length > 0 ? (
            <p>Could not refresh {failedTypes.map(getExamTypeLabel).join(", ")}. Please try again.</p>
          ) : null}
          {unverifiedTypes.length > 0 && (
            <p>
              {unresolvedCount > 0 ? `${unresolvedCount} saved attempt${unresolvedCount === 1 ? "" : "s"}` : "Some saved attempts"}{" "}
              could not be matched to this course ({unverifiedTypes.map(getExamTypeLabel).join(", ")}).
              {" "}Only verified attempts are shown. Refresh to retry verification.
            </p>
          )}
          {failedTypes.length > 0 && attempts.length > 0 && (
            <p className="mt-1">Available attempts are still shown below.</p>
          )}
        </div>
      )}

      <section className="w-full min-w-0 overflow-hidden rounded-[24px] border border-[#d8e5f4] bg-white shadow-[0_15px_40px_rgba(15,23,42,0.05)]">
        {loading ? (
          <div role="status" aria-live="polite" className="flex min-h-72 flex-col items-center justify-center gap-4 px-6 py-14 text-center">
            <LoaderCircle size={36} aria-hidden="true" className="text-[#017dc0] motion-safe:animate-spin" />
            <div>
              <p className="text-sm font-semibold text-[#082e5a]">Loading your exams...</p>
              <p className="mt-2 text-xs text-slate-500">{loadedCount} of {totalTypes} exam types checked</p>
            </div>
          </div>
        ) : (
        <AttemptedExamTable
          attempts={visibleAttempts}
          startIndex={startIndex}
          getAnalysisHref={getAnalysisHref}
          emptyMessage={emptyMessage}
          emptyDescription={emptyDescription}
        />
        )}

        {!loading && filteredAttempts.length > 0 && (
          <ExamHistoryPagination
            currentPage={safePage}
            totalPages={totalPages}
            totalItems={filteredAttempts.length}
            startIndex={startIndex}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={(page) => {
              if (
                page >= 1 &&
                page <= totalPages
              ) {
                setCurrentPage(page);
              }
            }}
          />
        )}
      </section>
    </div>
  );
}
