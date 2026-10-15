"use client";

import { useEffect, useState } from "react";

const QUESTIONS_PER_PAGE = 10;

function imageUrl(path, attached) {
  if (!attached || typeof window === "undefined") {
    return "";
  }

  try {
    const imagePath = String(path || "");
    const attachment = String(attached);

    const base = imagePath
      ? new URL(
          imagePath.endsWith("/")
            ? imagePath
            : `${imagePath}/`,
          window.location.origin
        )
      : new URL("/", window.location.origin);

    const url = new URL(attachment, base);

    return ["http:", "https:"].includes(url.protocol)
      ? url.href
      : "";
  } catch {
    return "";
  }
}

/*
 * Examples:
 * A. A. Delhi → A. Delhi
 * C. C. Answer → C. Answer
 * A. Delhi → A. Delhi
 *
 * Only removes repeated matching keys at the beginning.
 */
function cleanAnswerDisplay(value, fallback) {
  const text = String(value ?? "").trim();

  if (!text) return fallback;

  const match = text.match(
    /^([A-Z])\s*[.)]\s*/i
  );

  if (!match) return text;

  const answerKey = match[1].toUpperCase();

  const repeatedPrefix = new RegExp(
    `^(?:${answerKey}\\s*[.)]\\s*)+`,
    "i"
  );

  const answerText = text
    .replace(repeatedPrefix, "")
    .trim();

  return answerText
    ? `${answerKey}. ${answerText}`
    : answerKey;
}

function statusLabel(status) {
  const labels = {
    correct: "Correct",
    wrong: "Wrong",
    unanswered: "Not Answered",
    unknown: "Answer Key Unavailable",
  };

  return labels[status] || "Answer Key Unavailable";
}

function statusClass(status) {
  if (status === "correct") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "wrong") {
    return "bg-red-50 text-red-700";
  }

  return "bg-slate-100 text-slate-600";
}

export default function TopicWiseAnswerReview({
  cid,
  attemptId,
}) {
  const [state, setState] = useState({
    loading: true,
    error: "",
    questions: [],
    imagePath: "",
  });

  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setPage(1);

    setState({
      loading: true,
      error: "",
      questions: [],
      imagePath: "",
    });

    async function load() {
      try {
        const courseId = Number(cid);
        const savedAttemptId = Number(attemptId);

        if (
          !Number.isSafeInteger(courseId) ||
          courseId <= 0 ||
          !Number.isSafeInteger(savedAttemptId) ||
          savedAttemptId <= 0
        ) {
          throw new Error(
            "A valid course and saved attempt ID are required."
          );
        }

        const query = new URLSearchParams({
          cid: String(courseId),
          attemptId: String(savedAttemptId),
        });

        const response = await fetch(
          `/api/exam-attempt/topicwise-review?${query}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        let result;

        try {
          result = await response.json();
        } catch {
          throw new Error(
            "The question service returned an invalid response."
          );
        }

        if (
          !response.ok ||
          result?.status !== true
        ) {
          throw new Error(
            result?.message ||
              "Unable to load questions and answers."
          );
        }

        if (
          !Array.isArray(result.questions) ||
          !result.questions.length
        ) {
          throw new Error(
            "No questions were returned for this attempt."
          );
        }

        if (!controller.signal.aborted) {
          setState({
            loading: false,
            error: "",
            questions: result.questions,
            imagePath: result.imagePath || "",
          });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setState({
            loading: false,
            error:
              error?.message ||
              "Unable to load the exam review.",
            questions: [],
            imagePath: "",
          });
        }
      }
    }

    void load();

    return () => controller.abort();
  }, [cid, attemptId, reload]);

  if (state.loading) {
    return (
      <p
        role="status"
        className="mt-6 rounded-2xl bg-white p-5 text-slate-600"
      >
        Loading questions and saved answers…
      </p>
    );
  }

  if (state.error) {
    return (
      <div
        role="alert"
        className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800"
      >
        <p>{state.error}</p>

        <button
          type="button"
          onClick={() =>
            setReload((value) => value + 1)
          }
          className="mt-3 font-bold underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const totalQuestions = state.questions.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalQuestions / QUESTIONS_PER_PAGE)
  );

  const start = (page - 1) * QUESTIONS_PER_PAGE;

  const currentQuestions = state.questions.slice(
    start,
    start + QUESTIONS_PER_PAGE
  );

  return (
    <section className="mt-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-black text-[#071f55]">
          Questions & Answers
        </h2>

        <p className="text-sm text-slate-500">
          Showing {start + 1}–
          {Math.min(
            start + QUESTIONS_PER_PAGE,
            totalQuestions
          )}{" "}
          of {totalQuestions}
        </p>
      </div>

      <div className="space-y-5">
        {currentQuestions.map((question, index) => {
          const number =
            question.number ?? start + index + 1;

          const src = imageUrl(
            state.imagePath,
            question.attached
          );

          const yourAnswer = cleanAnswerDisplay(
            question.userDisplay,
            "Not Answered"
          );

          const correctAnswer = cleanAnswerDisplay(
            question.correctDisplay,
            "Not Available"
          );

          const yourAnswerClass =
            question.status === "wrong"
              ? "bg-red-50 text-red-800"
              : question.status === "correct"
                ? "bg-emerald-50 text-emerald-800"
                : "bg-blue-50 text-[#071f55]";

          return (
            <article
              key={`${question.id ?? number}-${number}`}
              className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="font-bold text-blue-700">
                  Question {number}
                </p>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                    question.status
                  )}`}
                >
                  {statusLabel(question.status)}
                </span>
              </div>

              <p className="mt-4 whitespace-pre-wrap break-words text-lg font-semibold leading-8 text-slate-900">
                {question.text ||
                  "Question text was not returned by the backend."}
              </p>

              {src && (
                <img
                  src={src}
                  alt={`Question ${number} attachment`}
                  loading="lazy"
                  className="mt-4 max-h-96 max-w-full rounded-xl object-contain"
                />
              )}

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div
                  className={`rounded-2xl p-4 ${yourAnswerClass}`}
                >
                  <p className="text-xs font-bold uppercase tracking-wide">
                    Your Answer
                  </p>

                  <p className="mt-2 whitespace-pre-wrap break-words font-semibold leading-7">
                    {yourAnswer}
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-800">
                  <p className="text-xs font-bold uppercase tracking-wide">
                    Correct Answer
                  </p>

                  <p className="mt-2 whitespace-pre-wrap break-words font-semibold leading-7">
                    {correctAnswer}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {totalPages > 1 && (
        <nav
          aria-label="Question review pagination"
          className="mt-5 flex items-center justify-between gap-3"
        >
          <button
            type="button"
            disabled={page === 1}
            onClick={() =>
              setPage((value) => Math.max(1, value - 1))
            }
            className="rounded-xl border bg-white px-4 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-sm text-slate-600">
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            disabled={page === totalPages}
            onClick={() =>
              setPage((value) =>
                Math.min(totalPages, value + 1)
              )
            }
            className="rounded-xl bg-blue-700 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </nav>
      )}
    </section>
  );
}