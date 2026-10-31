"use client";

export default function DashboardError({ retry }) {
  return (
    <section role="alert" className="mx-auto my-10 max-w-lg rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-bold text-slate-900">This page could not be loaded</h2>
      <p className="mt-2 text-sm text-slate-600">The learning service is temporarily unavailable. Please try again shortly.</p>
      <button type="button" onClick={retry} className="mt-5 rounded-xl bg-sky-700 px-5 py-3 font-bold text-white">Try again</button>
    </section>
  );
}
