import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  Sparkles,
} from "lucide-react";

import { createSlug } from "@/lib/pscSlug";

export default function TopicWiseExamCard({
  item,
  uid = 0,
  governmentExamsSlug,
  examName,
  basePath,
}) {
  if (!item?.id || !governmentExamsSlug) {
    return null;
  }

  const title = item.subject || "Topic";

  const root =
    basePath ||
    `${Number(uid) > 0 ? "/dashboard" : "/government-exams-coaching"}` +
    `/${governmentExamsSlug}/topic-wise-exams`;

  const href =
    `${root}/test/${createSlug(title)}`;

  const name = examName || "Government Exam";

  return (
    <article className="group flex h-full min-h-[320px] flex-col rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#017dc0]">
          <BookOpen size={23} />
        </div>

        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] font-black text-amber-700">
          <Sparkles size={11} />
          Topic Wise
        </span>
      </div>

      <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-emerald-600">
        {name} Practice
      </p>

      <h3 className="mt-2 text-xl font-black text-slate-900">
        {title}
      </h3>

      {item.subject_mal && (
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {item.subject_mal}
        </p>
      )}

      <p className="my-5 text-sm leading-6 text-slate-500">
        Practice focused questions from this topic
        and strengthen your preparation.
      </p>

      <Link
        href={href}
        className="mt-auto flex items-center justify-between rounded-2xl bg-[#017dc0] px-5 py-3 text-sm font-bold text-white"
      >
        Start Practice
        <ArrowRight size={16} />
      </Link>
    </article>
  );
}