
"use client";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import ExamHistoryHeader from "./components/ExamHistoryHeader";
import ExamHistoryTabs from "./components/ExamHistoryTabs";
import AttemptedExamTable from "./components/AttemptedExamTable";
import ExamHistoryPagination from "./components/ExamHistoryPagination";

import { buildExamHistoryTabs } from "./utils/examHistoryUtils";

import {
  ITEMS_PER_PAGE,
  normalizeType,
  examIdOf,
  attemptIdOf,
  resolveName,
  positiveId,
} from "./utils/examHistoryCore";

import { getAttemptExamType } from "./utils/examHistoryUtils";

import useExamHistory from "./hooks/useExamHistory";
import useVisibleExamNames from "./hooks/useVisibleExamNames";

export default function ExamHistoryClient({
  cid,
  examTypes = [],
  examName = "",
  governmentExamsSlug = "",
  hasActivePlan = false,
}) {
  const safeCid = positiveId(cid);

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    attempts,
    loading,
    historyIncomplete,
    rateLimited,
    loadedCount,
    totalTypes,
    types,
    refresh,
    updateName,
  } = useExamHistory({
    cid: safeCid,
    examTypes,
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

      if (
        activeTab !== "all" &&
        type !== activeTab
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
    attempts.length === 0
      ? historyIncomplete
        ? "Exam history is temporarily unavailable. Please try again later."
        : "No exams attempted so far."
      : "No exams match your search or filter.";

  return (
    <div className="w-full min-w-0 space-y-5">
      <ExamHistoryHeader
        examName={examName}
        search={search}
        onSearch={handleSearch}
        loading={loading}
        onRefresh={refresh}
      />

      <div className="min-w-0 max-w-full overflow-x-auto">
        <ExamHistoryTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={handleTabChange}
        />
      </div>

      {loading && attempts.length > 0 && (
        <p
          role="status"
          className="text-xs text-slate-500"
        >
          Updating exam history ({loadedCount} of{" "}
          {totalTypes} exam types processed)...
        </p>
      )}

      {historyIncomplete && !loading && (
        <p
          role="status"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          {rateLimited
            ? "The exam history server is rate-limited. Please wait before refreshing. Previously loaded attempts remain available."
            : "Some exam history could not be refreshed. Previously loaded attempts remain available."}
        </p>
      )}

      <section className="w-full min-w-0 overflow-hidden rounded-[24px] border border-[#d8e5f4] bg-white shadow-[0_15px_40px_rgba(15,23,42,0.05)]">
        <AttemptedExamTable
          attempts={visibleAttempts}
          loading={
            loading && attempts.length === 0
          }
          startIndex={startIndex}
          getAnalysisHref={getAnalysisHref}
          emptyMessage={emptyMessage}
        />

        {filteredAttempts.length > 0 && (
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
