"use client";

import { useRef, useState } from "react";
import { MessageSquare, Plus, List, LoaderCircle } from "lucide-react";

const buttonClass = "inline-flex items-center justify-center gap-2 rounded-xl border border-blue-100 px-4 py-3 text-sm font-bold text-[#164fa5] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50";

export default function FeedbackClient() {
  const [view, setView] = useState("add");
  const [problem, setProblem] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);
  const submitting = useRef(false);
  const totalPages = Math.max(1, Math.ceil(feedback.length / 10));

  async function loadFeedback() {
    setView("list");
    setLoading(true);
    setError("");
    setPage(1);
    try {
      const response = await fetch("/api/student/feedback", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.status) throw new Error(result.message || "Unable to load feedback.");
      setFeedback(result.data || []);
    } catch (error) {
      setError(error.message || "Unable to load feedback.");
    } finally { setLoading(false); }
  }

  async function submit(event) {
    event.preventDefault();
    if (submitting.current || !message.trim() || !problem.trim()) return;
    submitting.current = true;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/student/feedback", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem: problem.trim(), message: message.trim() }),
      });
      const result = await response.json();
      if (!response.ok || !result.status) throw new Error(result.message || "Unable to submit feedback.");
      setMessage("");
      setProblem("");
      setSuccess("Thank you! Your feedback has been submitted.");
      await loadFeedback();
    } catch (error) {
      setError(error.message || "Unable to submit feedback.");
    } finally { submitting.current = false; setSaving(false); }
  }

  return (
    <section className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)] sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-[#0b1f44]"><MessageSquare size={20} /> Feedback</h2>
          <p className="mt-1 text-sm text-slate-500">Share your suggestions and view replies from our team.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={buttonClass} disabled={saving || loading} aria-expanded={view === "add"} aria-controls="profile-feedback-content" onClick={() => { setView("add"); setError(""); setSuccess(""); }}><Plus size={16} /> Add feedback</button>
          <button type="button" className={buttonClass} disabled={saving || loading} aria-expanded={view === "list"} aria-controls="profile-feedback-content" onClick={() => { setSuccess(""); loadFeedback(); }}><List size={16} /> View feedbacks</button>
        </div>
      </div>
      {success && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{success}</p>}
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div id="profile-feedback-content">
        {view === "add" && (
          <form onSubmit={submit} className="mt-6 space-y-3">
            <label htmlFor="feedback-subject" className="block text-sm font-bold text-slate-700">Subject</label>
            <input id="feedback-subject" value={problem} onChange={event => setProblem(event.target.value)} required maxLength={150} disabled={saving} placeholder="For example, SCERT tests" className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" />
            <label htmlFor="feedback-message" className="block text-sm font-bold text-slate-700">Your feedback</label>
            <textarea id="feedback-message" value={message} onChange={event => setMessage(event.target.value)} required maxLength={2000} rows={5} disabled={saving} aria-describedby="feedback-limit" placeholder="Tell us what we can improve…" className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" />
            <p id="feedback-limit" className="text-xs text-slate-500">{message.length}/2,000 characters</p>
            <button type="submit" disabled={saving || !message.trim() || !problem.trim()} className={buttonClass}>{saving && <LoaderCircle size={16} className="animate-spin" />}{saving ? "Submitting…" : "Submit feedback"}</button>
          </form>
        )}
        {view === "list" && (
          <div className="mt-6" aria-busy={loading}>
            {loading ? <p role="status" className="text-sm text-slate-500">Loading feedback…</p> : error ? <button type="button" className={buttonClass} onClick={loadFeedback}>Try again</button> : feedback.length === 0 ? <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">You haven’t submitted any feedback yet.</p> : (
              <>
                <ul className="space-y-3">
                  {feedback.slice((page - 1) * 10, page * 10).map(item => (
                    <li key={item.id} className="rounded-xl border border-slate-200 p-4">
                      {item.problem && <h3 className="mb-2 text-sm font-bold text-[#0b1f44]">{item.problem}</h3>}
                      <p className="whitespace-pre-wrap break-words text-sm text-slate-800">{item.message}</p>
                      <p className="mt-2 text-xs text-slate-500">{item.createdAt}</p>
                      {item.reply ? <div className="mt-3 rounded-lg bg-blue-50 p-3"><p className="text-xs font-bold text-[#164fa5]">Team reply</p><p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">{item.reply}</p></div> : <p className="mt-3 text-xs text-slate-500">Awaiting reply</p>}
                    </li>
                  ))}
                </ul>
                {totalPages > 1 && <nav aria-label="Feedback pagination" className="mt-4 flex items-center justify-end gap-3"><button type="button" className={buttonClass} disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><span className="text-xs text-slate-500">Page {page} of {totalPages}</span><button type="button" className={buttonClass} disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button></nav>}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
