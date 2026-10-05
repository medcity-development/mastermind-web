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
            Loading performance...
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
        attempts={
          attempts
        }
      />
    </section>
  );
}