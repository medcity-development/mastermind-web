"use client";

import {
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  LoaderCircle,
} from "lucide-react";
import { getPausedAttempts } from "@/lib/pausedExamAttempts";

export default function StudyPlanTestsHome({
  cid,
  governmentExamsSlug,
}) {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadPausedTests() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/exam-attempt/user-exams", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cid,
            exam_type: "studyplan",
          }),
          cache: "no-store",
          signal: controller.signal,
        });
        const result = await response.json();

        if (!response.ok || result?.status === false) {
          throw new Error(
            result?.message ||
            "Unable to load paused Study Plan exams."
          );
        }

        const paused = getPausedAttempts(result);

        if (!controller.signal.aborted) setAttempts(paused);
      } catch (loadError) {
        if (
          loadError?.name !== "AbortError" &&
          !controller.signal.aborted
        ) {
          setError(
            loadError?.message ||
            "Unable to load paused Study Plan exams."
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadPausedTests();
    return () => controller.abort();
  }, [cid]);

  return (
    <main className="mx-auto w-full max-w-9xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="rounded-3xl bg-gradient-to-r from-[#071f55] to-[#017dc0] p-6 text-white sm:p-9">
        <p className="text-[10px] font-black uppercase tracking-widest text-blue-100">
          Study Plan Practice
        </p>
        <h1 className="mt-2 text-3xl font-black">Study Plan Tests</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
          Continue paused exams here. You can also start a Study Plan test from its lesson page.
        </p>
      </header>

      <section className="mt-8">
        <h2 className="text-lg font-black text-[#071f55]">Paused exams</h2>

        {loading && (
          <div className="mt-5 flex min-h-36 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-sm text-slate-500">
            <LoaderCircle size={18} className="animate-spin text-blue-700" />
            Loading paused exams...
          </div>
        )}

        {error && (
          <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        )}

        {!loading && !error && !attempts.length && (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <BookOpen size={25} className="mx-auto text-blue-700" />
            <p className="mt-3 font-bold text-slate-700">No paused Study Plan exams</p>
            <p className="mt-1 text-sm text-slate-500">
              Your paused tests will appear here.
            </p>
          </div>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {attempts.map((attempt) => {
            const id = attempt.exam_id ?? attempt.examId;
            const title =
              attempt.exam_name ||
              attempt.exam_title ||
              attempt.title ||
              `Study Plan Test ${id}`;
            const href =
              `/dashboard/${encodeURIComponent(governmentExamsSlug)}` +
              `/studyplan-tests/${encodeURIComponent(String(id))}?` +
              new URLSearchParams({ title }).toString();

            return (
              <article key={`${id}-${attempt.id ?? attempt.pauseid ?? ""}`} className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                  Paused Study Plan Exam
                </p>
                <h3 className="mt-2 text-base font-black text-[#071f55]">{title}</h3>
                <Link
                  href={href}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-xs font-bold text-white"
                >
                  Resume exam
                  <ArrowRight size={15} />
                </Link>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
