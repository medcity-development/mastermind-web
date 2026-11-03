"use client";

import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  FileQuestion,
  LockKeyhole,
  LoaderCircle,
} from "lucide-react";

import {
  extractStudyPlanExam,
  getAttemptId,
  selectStudyPlanPausedAttempt,
} from "./utils/examUtils";

export default function StudyPlanTestDetails({
  examId,
  cid,
  uid = 0,
  governmentExamsSlug,
  title = "",
  basePath,
}) {
  const router = useRouter();
  const [exam, setExam] = useState(null);
  const [pauseId, setPauseId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const rootPath =
    basePath || `/dashboard/${governmentExamsSlug}/studyplan-tests`;

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          cid: String(cid),
          examid: String(examId),
          type: "studyplan",
          offset: "0",
          resume: "1",
        });
        const response = await fetch(
          `/api/mock-tests/details?${params.toString()}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );
        const result = await response.json();

        if (!response.ok || result?.status === false) {
          throw new Error(
            result?.message ||
            "Unable to load the Study Plan test."
          );
        }

        const rawExam = extractStudyPlanExam(result, examId);

        if (!rawExam) {
          throw new Error("Study Plan test details were not returned.");
        }

        const paused = selectStudyPlanPausedAttempt(result, {
          examId,
          uid,
          cid,
        });

        if (!controller.signal.aborted) {
          setExam(rawExam);
          setPauseId(paused ? getAttemptId(paused) : null);
        }
      } catch (loadError) {
        if (
          loadError?.name !== "AbortError" &&
          !controller.signal.aborted
        ) {
          setError(
            loadError?.message ||
            "Unable to load the Study Plan test."
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void load();

    return () => controller.abort();
  }, [cid, examId, uid]);

  function startTest() {
    if (!exam) return;

    const testTitle =
      exam?.exam_name ||
      exam?.title ||
      title ||
      "Study Plan Test";
    const startQuery = new URLSearchParams({ title: testTitle });

    if (pauseId) {
      startQuery.set("mode", "resume");
      startQuery.set("pauseId", String(pauseId));
    }

    const startPath =
      `${rootPath}/${encodeURIComponent(String(examId))}/start?` +
      startQuery.toString();
    const paid = String(exam?.access || "").toLowerCase() === "paid";
    const hasPackage = exam?.packageAccess === true;

    if (paid && !hasPackage) {
      const packagesPath =
        `/dashboard/${encodeURIComponent(governmentExamsSlug)}?showPackages=1`;
      router.push(
        uid > 0
          ? packagesPath
          : `/login?redirect=${encodeURIComponent(packagesPath)}`
      );
      return;
    }

    router.push(startPath);
  }

  if (loading) {
    return (
      <div className="flex min-h-56 items-center justify-center gap-3 text-sm font-semibold text-slate-500">
        <LoaderCircle size={19} className="animate-spin text-blue-700" />
        Loading Study Plan test...
      </div>
    );
  }

  if (error) {
    return (
      <section role="alert" className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}
      </section>
    );
  }

  const paid = String(exam?.access || "").toLowerCase() === "paid";
  const hasPackage = exam?.packageAccess === true;
  const locked = paid && !hasPackage;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={() => router.push(rootPath)}
        className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-xs font-bold text-blue-800"
      >
        <ArrowLeft size={15} />
        Study Plan test cards
      </button>
      <section className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm">
        <header className="bg-gradient-to-r from-[#071f55] to-[#017dc0] p-6 text-white sm:p-9">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-100">
            Study Plan Practice
          </p>
          <h1 className="mt-2 text-2xl font-black sm:text-3xl">
            {exam?.exam_name || exam?.title || title || "Study Plan Test"}
          </h1>
          <div className="mt-5 flex flex-wrap gap-4 text-xs font-semibold text-blue-100">
            <span className="inline-flex items-center gap-2">
              <FileQuestion size={15} />
              {exam?.total_questions || "—"} Questions
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock3 size={15} />
              {exam?.total_minutes || "—"} Minutes
            </span>
            <span>
              {exam?.total_mark ?? exam?.total_marks ?? "—"} Total Marks
            </span>
          </div>
        </header>
        <div className="p-6 sm:p-9">
          <p className="max-w-2xl text-sm leading-7 text-slate-600">
            Answer each question before the timer ends. Your progress is saved when you pause, and you can resume this attempt later.
          </p>
          {locked && (
            <p className="mt-5 flex items-center gap-2 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
              <LockKeyhole size={17} />
              A plan is required to access this test.
            </p>
          )}
          <button
            type="button"
            onClick={startTest}
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-violet-600 px-6 py-3.5 text-sm font-black text-white"
          >
            {locked
              ? "View Available Plans"
              : pauseId
                ? "Resume Exam"
                : "Start Exam"}
            <ArrowRight size={17} />
          </button>
        </div>
      </section>
    </main>
  );
}
