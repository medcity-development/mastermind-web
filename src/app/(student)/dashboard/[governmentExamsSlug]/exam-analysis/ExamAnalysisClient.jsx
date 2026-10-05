"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import ExamAnalysisHeader from "./components/ExamAnalysisHeader";
import ExamSummaryCards from "./components/ExamSummaryCards";
import SavedResultCard from "./components/SavedResultCard";
import QuestionAnalysisList from "./components/QuestionAnalysisList";

import {
  buildQuestionRows,
  calculateAnalysisSummary,
  getResultItem,
} from "./components/utils/examAnalysisUtils";

/* =========================================================
   SAFE JSON
========================================================= */

async function readJsonResponse(
  response
) {
  const text =
    await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(
      text
    );
  } catch {
    throw new Error(
      `Server returned invalid JSON. HTTP ${response.status}.`
    );
  }
}

/* =========================================================
   CLIENT
========================================================= */

export default function ExamAnalysisClient({
  cid,
  attemptId,
  examType,
  examName,
}) {
  const [
    result,
    setResult,
  ] = useState(null);

  const [
    questions,
    setQuestions,
  ] = useState([]);

  const [
    resultLoading,
    setResultLoading,
  ] = useState(false);

  const [
    questionsLoading,
    setQuestionsLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  /* =======================================================
     LOAD SAVED ATTEMPT
  ======================================================= */

  const loadResult =
    useCallback(
      async () => {
        if (
          !cid ||
          !attemptId ||
          !examType
        ) {
          setResult(null);
          setQuestions([]);

          setError(
            "Saved exam result information is missing."
          );

          return;
        }

        try {
          setResultLoading(
            true
          );

          setError("");

          const response =
            await fetch(
              "/api/exam-attempt/analytics-details",
              {
                method:
                  "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                cache:
                  "no-store",

                body:
                  JSON.stringify({
                    cid,

                    id:
                      attemptId,

                    exam_type:
                      examType,
                  }),
              }
            );

          const data =
            await readJsonResponse(
              response
            );

          if (
            !response.ok ||
            data?.status ===
            false
          ) {
            throw new Error(
              data?.message ||
              data?.msg ||
              "Unable to load saved exam result."
            );
          }

          const savedResult =
            getResultItem(
              data
            );

          if (!savedResult) {
            throw new Error(
              "Saved exam result was not found."
            );
          }

          setResult(
            savedResult
          );
        } catch (error) {
          console.error(
            "Load saved result:",
            error
          );

          setResult(null);

          setQuestions([]);

          setError(
            error?.message ||
            "Unable to load saved exam result."
          );
        } finally {
          setResultLoading(
            false
          );
        }
      },
      [
        cid,
        attemptId,
        examType,
      ]
    );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadResult();
  }, [loadResult]);

  /* =======================================================
     LOAD QUESTIONS
  ======================================================= */

  const loadQuestions =
    useCallback(
      async () => {
        const examId =
          Number(
            result?.exam_id
          );

        if (
          !result ||
          !Number.isFinite(
            examId
          ) ||
          examId <= 0 ||
          !cid ||
          !examType
        ) {
          setQuestions([]);

          return;
        }

        try {
          setQuestionsLoading(
            true
          );

          setError("");

          const params =
            new URLSearchParams({
              cid:
                String(cid),

              examid:
                String(
                  examId
                ),

              examtype:
                String(
                  examType
                ),
            });

          const response =
            await fetch(
              `/api/student-dashboard/mock-tests/questions?${params.toString()}`,
              {
                method:
                  "GET",

                cache:
                  "no-store",
              }
            );

          const data =
            await readJsonResponse(
              response
            );

          if (
            !response.ok ||
            data?.status ===
            false
          ) {
            throw new Error(
              data?.message ||
              data?.msg ||
              "Unable to load exam questions."
            );
          }

          setQuestions(
            Array.isArray(
              data?.data
            )
              ? data.data
              : []
          );
        } catch (error) {
          console.error(
            "Load exam questions:",
            error
          );

          setQuestions([]);

          setError(
            error?.message ||
            "Unable to load exam questions."
          );
        } finally {
          setQuestionsLoading(
            false
          );
        }
      },
      [
        result,
        cid,
        examType,
      ]
    );

  /* =======================================================
     LOAD QUESTIONS AFTER RESULT
  ======================================================= */

  useEffect(() => {
    if (result) {
      loadQuestions();
    }
  }, [
    result,
    loadQuestions,
  ]);

  /* =======================================================
     QUESTION ROWS
  ======================================================= */

  const questionRows =
    useMemo(
      () =>
        buildQuestionRows({
          result,
          questions,
        }),
      [
        result,
        questions,
      ]
    );

  /* =======================================================
     ANALYSIS

     IMPORTANT:

     Do NOT use old saved:
       result.user_score
       result.minus_mark
       result.total_correct
       result.total_wrong

     Recalculate from actual answers.
  ======================================================= */

  const analysis =
    useMemo(
      () =>
        calculateAnalysisSummary({
          rows:
            questionRows,

          totalQuestions:
            result?.total_questions,

          totalMark:
            result?.total_mark,
        }),
      [
        questionRows,
        result,
      ]
    );

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh =
    useCallback(
      async () => {
        setError("");

        await loadResult();
      },
      [
        loadResult,
      ]
    );

  const loading =
    resultLoading ||
    questionsLoading;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="
        space-y-5
      "
    >
      <ExamAnalysisHeader
        examName={
          examName
        }
        loading={
          loading
        }
        onRefresh={
          handleRefresh
        }
      />

      {error ? (
        <div
          className="
            rounded-[18px]
            border
            border-red-200
            bg-red-50
            px-5
            py-4
            text-[12px]
            font-bold
            text-red-600
          "
        >
          {error}
        </div>
      ) : null}

      {resultLoading &&
        !result ? (
        <LoadingState />
      ) : null}

      {result ? (
        <>
          <ExamSummaryCards
            counts={
              analysis
            }
          />

          <SavedResultCard
            result={
              result
            }
            counts={
              analysis
            }
          />

          <QuestionAnalysisList
            rows={
              questionRows
            }
            loading={
              questionsLoading
            }
          />
        </>
      ) : null}
    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingState() {
  return (
    <div
      className="
        h-[280px]
        animate-pulse
        rounded-[24px]
        bg-slate-200
      "
    />
  );
}