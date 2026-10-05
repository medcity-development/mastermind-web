"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { normalizeQuestions } from "../utils/examUtils";
import { buildAttemptPayload, getAttemptId } from "@/lib/examAttemptData";

export default function useExamController({ exam, questions = [], uid, cid, examType, lastPosition, initialPauseId = null }) {
  const normalizedQuestions = useMemo(() => normalizeQuestions(questions), [questions]);
  const totalQuestions = normalizedQuestions.length;
  const durationMinutes = Number(exam?.total_minutes ?? exam?.duration ?? exam?.exam_duration) || 0;
  const totalDurationSeconds = durationMinutes * 60;
  const [currentPage, setCurrentPage] = useState(1);
  const [answers, setAnswers] = useState({});
  const [remainingSeconds, setRemainingSeconds] = useState(totalDurationSeconds);
  const [pauseId, setPauseId] = useState(initialPauseId);
  const [submitted, setSubmitted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const savingRef = useRef(false);
  const draftKey = `exam_draft_${uid}_${cid}_${examType}_${exam?.id}`;

  useEffect(() => {
    try {
      const draft = JSON.parse(localStorage.getItem(draftKey) || "null");
      if (!draft) return;
      // Restore the saved attempt after mounting; storage is unavailable on the server.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnswers(draft.answers || {});
      setPauseId(draft.pauseId || initialPauseId);
      setRemainingSeconds(Math.max(0, Number(draft.remainingSeconds) || 0));
      setCurrentPage(draft.currentPage || 1);
      setPaused(true);
    } catch { /* A corrupt or unavailable cache must not prevent taking the exam. */ }
  }, [draftKey, initialPauseId]);

  useEffect(() => {
    if (!totalDurationSeconds || paused || submitted || saving) return;
    const timer = window.setInterval(() => setRemainingSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [totalDurationSeconds, paused, submitted, saving]);

  const timerFinished = totalDurationSeconds > 0 && remainingSeconds === 0;
  const totalPages = Math.max(1, Math.ceil(totalQuestions / 10));
  const startIndex = (currentPage - 1) * 10;
  const answerArray = normalizedQuestions.map((q) => q.answerkey ?? q.answer ?? 0);
  const userAnswers = normalizedQuestions.map((q) => answers[q.id] ?? 0);
  const payload = buildAttemptPayload({
    cid, exam_id: exam?.id, exam_type: examType, lastposition: lastPosition || examType,
    total_questions: totalQuestions, paused_time: remainingSeconds,
    total_mark: exam?.total_mark, minus_mark: exam?.minus_mark ?? exam?.negative_mark,
    answer_array: answerArray, user_answers: userAnswers,
  }, uid);
  const answeredCount = payload.total_attempted;
  function scrollToTop() { window.scrollTo({ top: 0, behavior: "smooth" }); }
  function handlePageChange(page) { setCurrentPage(Math.min(totalPages, Math.max(1, page))); scrollToTop(); }

  async function save(status) {
    if (savingRef.current || submitted) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError("");
    try {
      const response = await fetch(`/api/exam-attempt/${pauseId ? "update" : "create"}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, exam_status: status, ...(pauseId ? { pauseid: pauseId } : {}) }),
      });
      const result = await response.json();
      if (!response.ok || result.status === false) throw new Error(result.message || "Unable to save exam. Please retry.");
      const id = pauseId || getAttemptId(result);
      if (!id && status === "pause") throw new Error("The service did not return an attempt ID. Please retry.");
      setPauseId(id);
      if (status === "complete") {
        setSubmitted(true);
        setPaused(false);
        try { localStorage.removeItem(draftKey); } catch {}
        scrollToTop();
      } else {
        setPaused(true);
        try { localStorage.setItem(draftKey, JSON.stringify({ pauseId: id, answers, remainingSeconds, currentPage })); } catch {}
      }
    } catch (error) { setSaveError(error.message); }
    finally { savingRef.current = false; setSaving(false); }
  }

  return {
    currentPage, totalPages, startIndex, endIndex: Math.min(startIndex + 10, totalQuestions),
    currentQuestions: normalizedQuestions.slice(startIndex, startIndex + 10), totalQuestions,
    answers, answeredCount, unansweredCount: totalQuestions - answeredCount,
    progress: totalQuestions ? Math.round(answeredCount / totalQuestions * 100) : 0,
    submitted, saving, paused, saveError, correctCount: payload.total_correct, wrongCount: payload.total_wrong,
    pauseId, durationMinutes, totalDurationSeconds, remainingSeconds,
    elapsedSeconds: totalDurationSeconds - remainingSeconds, timerFinished,
    handleAnswer: (id, answer) => { if (!submitted && !paused && !savingRef.current && !timerFinished) setAnswers((previous) => ({ ...previous, [id]: answer })); },
    handlePreviousPage: () => handlePageChange(currentPage - 1),
    handleNextPage: () => handlePageChange(currentPage + 1), handlePageChange,
    handlePause: () => paused ? setPaused(false) : save("pause"),
    handleSubmit: () => save("complete"),
  };
}
