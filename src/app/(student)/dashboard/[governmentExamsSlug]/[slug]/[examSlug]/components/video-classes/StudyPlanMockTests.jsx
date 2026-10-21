"use client";
import { useEffect, useState } from "react";
import { Crown, Clock3, FileQuestion, LoaderCircle } from "lucide-react";

export default function StudyPlanMockTests({ mockTestId, cid, onStartTest }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!mockTestId || !cid) { setExams([]); setError(""); setLoading(false); return; }
    const controller = new AbortController();
    async function load() {
      setLoading(true); setError(""); setExams([]);
      try {
        const q = new URLSearchParams({ examId: String(mockTestId), cid: String(cid) });
        const response = await fetch(`/api/studyplan-mock-tests?${q}`, {cache:"no-store",signal:controller.signal});
        const result = await response.json();
        if (!response.ok || result?.status !== true) throw new Error(result?.message || "Unable to load mock tests");
        if (!controller.signal.aborted) setExams(Array.isArray(result.exams) ? result.exams : []);
      } catch (e) { if (e.name !== "AbortError" && !controller.signal.aborted) setError(e.message); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    load();
    return () => controller.abort();
  }, [mockTestId,cid]);
  if (!mockTestId) return null;
  if (loading) return <p className="mt-6 flex items-center gap-2 text-sm text-amber-700"><LoaderCircle className="animate-spin" size={16}/>Loading purchased tests...</p>;
  if (error) return <p role="alert" className="mt-6 text-sm text-red-600">{error}</p>;
  if (!exams.length) return null;
  return <section className="mt-7 rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-7">
    <h2 className="flex items-center gap-2 text-xl font-black text-[#071f55]"><Crown className="text-amber-600"/>Your Available Study Plan Tests</h2>
    <div className="mt-5 grid gap-4 md:grid-cols-2">{exams.map(exam => <article key={exam.id} className="rounded-2xl border border-amber-200 bg-white p-5">
      <h3 className="font-black text-[#071f55]">{exam.exam_name}</h3>
      <div className="mt-3 flex gap-4 text-xs text-slate-600"><span className="flex items-center gap-1"><FileQuestion size={14}/>{exam.total_questions} questions</span><span className="flex items-center gap-1"><Clock3 size={14}/>{exam.total_minutes} minutes</span></div>
      <button type="button" disabled={!onStartTest} onClick={() => onStartTest?.(exam)} className="mt-5 rounded-xl bg-amber-500 px-5 py-3 text-xs font-bold text-white disabled:opacity-50">Start Mock Test</button>
    </article>)}</div>
  </section>;
}
