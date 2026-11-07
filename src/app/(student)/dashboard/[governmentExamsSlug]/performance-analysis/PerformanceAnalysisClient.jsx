"use client";

import {
  Loader2,
} from "lucide-react";

import usePerformanceAnalysis from "./hooks/usePerformanceAnalysis";

import PerformanceHero from "./components/PerformanceHero";
import PerformanceSummaryGrid from "./components/PerformanceSummaryGrid";
import AccuracyGrid from "./components/AccuracyGrid";
import ExamHistorySection from "./components/ExamHistorySection";

import ScoreTrendChart from "./score-trend/ScoreTrendChart";

export default function PerformanceAnalysisClient({
  cid,
  uid,
  examName,
}) {
  const {
    attempts,
    summary,
    loading,
    refreshing,
    completed,
    totalTypes,
    error,
  } =
    usePerformanceAnalysis({
      cid,
      uid,
    });

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div
        className="
          flex
          min-h-[420px]
          items-center
          justify-center
        "
      >
        <div
          className="
            flex
            flex-col
            items-center
            gap-3
          "
        >
          <Loader2
            className="
              h-8
              w-8
              animate-spin
              text-[#017dc0]
            "
          />

          <p
            className="
              text-sm
              font-semibold
              text-slate-500
            "
          >
            Loading performance… {completed}/{totalTypes} exam types checked
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <section
      className="
        pb-8
      "
    >
      {error ? (
        <div
          role="alert"
          className="
            mb-5

            rounded-[16px]

            border
            border-red-100

            bg-red-50

            px-5
            py-4

            text-[11px]
            font-bold
            text-red-600
          "
        >
          {error}
        </div>
      ) : null}

      <PerformanceHero
        examName={
          examName
        }
      />

      {refreshing && (
        <p role="status" className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Updating performance… {completed}/{totalTypes} exam types checked. Totals may change as results arrive.
        </p>
      )}

      <PerformanceSummaryGrid
        summary={
          summary
        }
      />

      <ScoreTrendChart
        attempts={
          attempts
        }
      />

      <AccuracyGrid
        summary={
          summary
        }
      />

      <ExamHistorySection
        cid={cid}
        attempts={
          attempts
        }
      />
    </section>
  );
}
