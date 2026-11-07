"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Crown, FileQuestion, Gift, Pause, Target } from "lucide-react";

export default function PreviousQuestionCard({
  item, uid = 0, cid = 1, type = "pqp", governmentExamsSlug, pauseId,
}) {
  if (!item) return null;
  const { id, exam_name, total_questions, total_mark, course, subcourse, access } = item;
  const isPaid = access === "paid";
  const href = pauseId
    ? {
        pathname: `/dashboard/${governmentExamsSlug}/previous-questions/${id}/start`,
        query: { uid: String(uid), cid: String(cid), type: String(type), mode: "resume", pauseId: String(pauseId) },
      }
    : isPaid && item.packageAccess !== true
      ? `/dashboard/${governmentExamsSlug}?showPackages=1`
      : `/dashboard/${governmentExamsSlug}/previous-questions/${id}?uid=${uid}&cid=${cid}&type=${type}`;
  const BadgeIcon = pauseId ? Pause : isPaid ? Crown : Gift;

  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_4px_24px_-12px_rgba(15,35,75,0.16)] transition duration-300 hover:border-blue-200 hover:shadow-[0_20px_48px_-20px_rgba(22,79,165,0.28)] motion-safe:hover:-translate-y-1">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#153b78] via-[#137cba] to-cyan-300" />
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#102d60] to-[#2165a9] text-white shadow-lg shadow-blue-900/10"><FileQuestion size={22} strokeWidth={1.6} aria-hidden="true" /></span>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">Question paper</p>
              <p className="mt-1 text-xs font-semibold text-[#164fa5]">{course || "Previous Questions"}</p>
            </div>
          </div>
          <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold ring-1 ring-inset ${pauseId ? "bg-amber-50 text-amber-800 ring-amber-200" : isPaid ? "bg-[#fff8eb] text-[#946719] ring-[#ecd9b0]" : "bg-emerald-50 text-emerald-700 ring-emerald-200/70"}`}>
            <BadgeIcon size={12} aria-hidden="true" />{pauseId ? "Paused" : isPaid ? "Premium" : "Free"}
          </span>
        </div>

        <h3 className="break-words text-[14px] font-bold leading-6 tracking-tight text-[#10264b] sm:text-[15px]">{exam_name || "Previous question paper"}</h3>
        {subcourse && <p className="mt-3 flex items-center gap-2 text-xs text-slate-500"><span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />{subcourse}</p>}

        <div className="mt-auto pt-5">
          <dl className="grid grid-cols-2 divide-x divide-slate-200/80 rounded-2xl border border-slate-100 bg-[#f7f9fc] py-3">
            <Stat icon={BookOpen} label="Questions" value={total_questions} />
            <Stat icon={Target} label="Total marks" value={total_mark} />
          </dl>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50 px-4 py-4 sm:px-5">
        <span className="text-[11px] font-medium text-slate-500">{pauseId ? "Continue where you left off" : "Practice at your own pace"}</span>
        <Link href={href} className="group/action inline-flex w-full min-h-11 items-center justify-center gap-3 rounded-xl bg-[#123b76] px-5 py-3 text-xs font-bold text-white shadow-md shadow-blue-900/10 transition hover:bg-[#0c2c5c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">
          {pauseId ? "Resume Exam" : isPaid ? "View Premium Test" : "Start Exam"}
          <ArrowRight size={15} aria-hidden="true" className="transition-transform motion-safe:group-hover/action:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="px-3 sm:px-4">
      <dt className="flex items-center gap-2 text-[10px] font-medium text-slate-500"><Icon size={14} className="text-[#4380b6]" aria-hidden="true" />{label}</dt>
      <dd className="mt-1.5 text-xl font-bold tabular-nums tracking-tight text-[#10264b]">{value ?? "?"}</dd>
    </div>
  );
}
