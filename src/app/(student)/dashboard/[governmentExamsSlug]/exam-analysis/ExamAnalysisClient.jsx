
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  CircleMinus,
  ListChecks,
  RefreshCw,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";

import {
  calculateExamScore,
} from "@/lib/examResultUtils";

import {
  buildQuestionRows,
} from "./components/utils/examAnalysisUtils";

import QuestionResultCard from "./components/QuestionResultCard";
import ExamAnalysisHeader from "./components/ExamAnalysisHeader";

const QUESTIONS_PER_PAGE = 10;

function numberOrNull(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

function first(...values) {
  return values.find(
    (value) =>
      value !== null &&
      value !== undefined &&
      value !== ""
  );
}

function display(value) {
  const number = numberOrNull(value);

  return number === null
    ? "—"
    : String(Math.round(number * 100) / 100);
}

function isFailure(data) {
  return (
    !data ||
    [false, "false", 0, "0"].includes(data.status)
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  label,
  value,
  icon: Icon,
  theme = "blue",
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-violet-50 text-violet-700",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-600",
    orange: "bg-orange-50 text-orange-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`inline-flex rounded-xl p-3 ${colors[theme] ?? colors.blue
          }`}
      >
        <Icon size={21} />
      </div>

      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black text-[#082e5a]">
        {display(value)}
      </p>
    </div>
  );
}

/* =========================================================
   QUESTION REVIEW
========================================================= */

function QuestionReview({ rows = [] }) {
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (filter === "correct") {
        return row.attempted && row.isCorrect;
      }

      if (filter === "wrong") {
        return (
          row.attempted &&
          row.evaluated &&
          !row.isCorrect
        );
      }

      if (filter === "skipped") {
        return !row.attempted;
      }

      return true;
    });
  }, [rows, filter]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredRows.length / QUESTIONS_PER_PAGE
    )
  );

  const safePage = Math.min(page, totalPages);

  const visibleRows = useMemo(() => {
    const start =
      (safePage - 1) * QUESTIONS_PER_PAGE;

    return filteredRows.slice(
      start,
      start + QUESTIONS_PER_PAGE
    );
  }, [filteredRows, safePage]);

  function changePage(nextPage) {
    setPage(
      Math.min(
        Math.max(1, nextPage),
        totalPages
      )
    );

    document
      .getElementById("question-analysis")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  const filters = [
    ["all", "All"],
    ["correct", "Correct"],
    ["wrong", "Wrong"],
    ["skipped", "Skipped"],
  ];

  return (
    <section
      id="question-analysis"
      className="scroll-mt-24 space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {filters.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setFilter(value);
                setPage(1);
              }}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${filter === value
                  ? "bg-[#164fa5] text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="text-xs font-semibold text-slate-500">
          {filteredRows.length} questions
        </p>
      </div>

      {!rows.length && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Question review unavailable.
        </div>
      )}

      {rows.length > 0 &&
        filteredRows.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No questions match this filter.
          </div>
        )}

      <div className="space-y-4">
        {visibleRows.map((row, index) => (
          <QuestionResultCard
            key={`${row.id}-${row.index ?? index}`}
            row={{
              ...row,
              number:
                Number.isInteger(row.index)
                  ? row.index + 1
                  : (safePage - 1) *
                  QUESTIONS_PER_PAGE +
                  index +
                  1,
            }}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-bold text-slate-500">
            Page {safePage} of {totalPages}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => changePage(safePage - 1)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-[#164fa5] disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => changePage(safePage + 1)}
              className="rounded-xl bg-[#164fa5] px-4 py-2 text-xs font-bold text-white disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

/* =========================================================
   EXAM ANALYSIS CLIENT
========================================================= */

export default function ExamAnalysisClient(props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const cid = Number(
    props.cid ?? props.config?.cid
  );

  const attemptId =
    searchParams.get("attemptId") ??
    props.attemptId;

  const examType =
    searchParams.get("examType") ??
    props.examType ??
    "mock";

  const examTitle =
    searchParams.get("title") ??
    props.title ??
    "Exam Analysis";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [review, setReview] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadAnalysis = useCallback(
    async (signal) => {
      setLoading(true);
      setError("");
      setReview(null);

      try {
        if (
          !Number.isSafeInteger(Number(attemptId)) ||
          Number(attemptId) <= 0
        ) {
          throw new Error(
            "Valid saved attempt ID is required."
          );
        }

        if (
          !Number.isSafeInteger(cid) ||
          cid <= 0
        ) {
          throw new Error("Invalid course ID.");
        }

        const response = await fetch(
          "/api/exam-attempt/question-review",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "same-origin",
            cache: "no-store",
            signal,
            body: JSON.stringify({
              cid,
              attemptId: Number(attemptId),
              examType,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok || isFailure(data)) {
          throw new Error(
            data?.message ||
            "Unable to load exam analysis."
          );
        }

        if (!data.attempt) {
          throw new Error(
            "Saved attempt was not returned."
          );
        }

        if (!signal.aborted) {
          setReview(data);
        }
      } catch (err) {
        if (
          !signal.aborted &&
          err.name !== "AbortError"
        ) {
          setError(
            err.message ||
            "Unable to load exam analysis."
          );
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    },
    [attemptId, cid, examType]
  );

  useEffect(() => {
    const controller = new AbortController();

    loadAnalysis(controller.signal);

    return () => controller.abort();
  }, [loadAnalysis, refreshKey]);

  const record = review?.attempt ?? null;

  const questions = useMemo(
    () =>
      Array.isArray(review?.questions)
        ? review.questions
        : [],
    [review]
  );

  /* =======================================================
     PRESERVE IMAGE PATH FROM API
  ======================================================= */

  const imagePath = review?.imagePath ?? "";

  const rows = useMemo(() => {
    if (!record) return [];

    return buildQuestionRows({
      result: record,
      questions,
      imagePath,
    });
  }, [record, questions, imagePath]);

  /* =======================================================
     EXAM STATISTICS
  ======================================================= */

  const stats = useMemo(() => {
    if (!record) return null;

    const calculated = calculateExamScore({
      ...record,
      user_answers:
        record.user_answers ??
        record.user_answer_array,
      answer_array:
        record.answer_array ??
        record.correct_answers,
    });

    // The shared calculator applies Android rounding to saved counts.
    // Do not override its result with stale backend score fields.
    return {
      score: calculated.score,
      total: calculated.totalMark,
      attempted: calculated.attempted,
      correct: calculated.correct,
      wrong: calculated.wrong,
      minusMark: calculated.minusMark,
    };
  }, [record]);

  const percentage = useMemo(() => {
    const score = numberOrNull(stats?.score);
    const total = numberOrNull(stats?.total);

    if (
      score === null ||
      total === null ||
      total <= 0
    ) {
      return null;
    }

    return Math.round(
      (score / total) * 10000
    ) / 100;
  }, [stats]);

  return (
    <main className="min-h-screen bg-[#f4f7fd] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* PREMIUM HEADER */}

        <ExamAnalysisHeader
          examName={examTitle}
          loading={loading}
          onRefresh={() =>
            setRefreshKey((value) => value + 1)
          }
          onBack={() => router.back()}
        />

        {/* LOADING */}

        {loading && (
          <div className="rounded-2xl bg-white p-12 text-center">
            <RefreshCw
              size={30}
              className="mx-auto animate-spin text-blue-600"
            />

            <p className="mt-4 text-sm text-slate-600">
              Loading exam analysis and original questions...
            </p>
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-6"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="shrink-0 text-red-600" />

              <div>
                <h2 className="font-bold text-red-800">
                  Unable to load exam analysis
                </h2>

                <p className="mt-2 text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ANALYSIS */}

        {!loading && !error && record && stats && (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
              <SummaryCard
                label="Score"
                value={stats.score}
                icon={Trophy}
              />

              <SummaryCard
                label="Attempted"
                value={stats.attempted}
                icon={ListChecks}
                theme="purple"
              />

              <SummaryCard
                label="Correct"
                value={stats.correct}
                icon={CheckCircle2}
                theme="green"
              />

              <SummaryCard
                label="Wrong"
                value={stats.wrong}
                icon={XCircle}
                theme="red"
              />

              <SummaryCard
                label="Negative Mark"
                value={stats.minusMark}
                icon={CircleMinus}
                theme="orange"
              />
            </div>

            {/* PERFORMANCE OVERVIEW */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <BarChart3 className="text-[#017dc0]" />

                <h2 className="text-lg font-black text-[#082e5a]">
                  Performance Overview
                </h2>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-500">
                    Total Score
                  </p>

                  <p className="mt-2 text-3xl font-black text-[#082e5a]">
                    {display(stats.score)}

                    <span className="text-base text-slate-400">
                      {" / "}
                      {display(stats.total)}
                    </span>
                  </p>
                </div>

                <div className="rounded-xl bg-blue-50 p-5">
                  <p className="text-sm font-semibold text-blue-700">
                    Percentage
                  </p>

                  <p className="mt-2 text-3xl font-black text-[#164fa5]">
                    {percentage === null
                      ? "—"
                      : `${percentage}%`}
                  </p>
                </div>
              </div>

              {percentage !== null && (
                <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#164fa5] to-[#00b5e8]"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(100, percentage)
                      )
                        }%`,
                    }}
                  />
                </div>
              )}
            </section>

            {/* QUESTION ANALYSIS */}

            <section>
              <div className="mb-5 flex items-center gap-3">
                <Target className="text-[#017dc0]" />

                <h2 className="text-xl font-black text-[#082e5a]">
                  Question-wise Analysis
                </h2>
              </div>

              {review?.questionError && (
                <div
                  role="alert"
                  className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
                >
                  <strong>Original question paper:</strong>{" "}
                  {review.questionError}
                </div>
              )}

              <QuestionReview rows={rows} />
            </section>
          </>
        )}
      </div>
    </main>
  );
}
