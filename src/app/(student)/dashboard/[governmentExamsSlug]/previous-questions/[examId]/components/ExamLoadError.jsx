"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function ExamLoadError({ retryAfter = 0 }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [remaining, setRemaining] = useState(() => Math.max(0, Number(retryAfter) || 0));

  useEffect(() => {
    const deadline = Date.now() + Math.max(0, Number(retryAfter) || 0) * 1000;
    const timer = setInterval(() => {
      setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [retryAfter]);

  return (
    <main className="min-h-screen bg-[#f5f9ff] p-6">
      <section className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-[#082e5a]">Unable to load the exam right now</h1>
        <p role="status" className="my-4 text-slate-600">
          {remaining > 0 ? `The exam service is busy. Please try again in ${remaining} seconds.` : "Please try loading the exam again."}
        </p>
        <button type="button" disabled={pending || remaining > 0}
          onClick={() => startTransition(() => router.refresh())}
          className="rounded-lg bg-[#017dc0] px-4 py-2 font-semibold text-white disabled:opacity-50">
          {pending ? "Loading…" : "Try again"}
        </button>
      </section>
    </main>
  );
}
