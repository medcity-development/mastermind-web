"use client";

import {
  BookOpen,
  Download,
  FileText,
  LockKeyhole,
} from "lucide-react";

export default function TopicVideoNotes({
  chapter,
  isPremiumUser = false,
  notesBaseUrl = "",
  onUpgrade,
}) {
  const notes = chapter?.notes;

  // Hide the entire section if notes are unavailable.
  if (
    notes === null ||
    notes === undefined ||
    typeof notes !== "string" ||
    !notes.trim() ||
    notes.trim().toLowerCase() === "null"
  ) {
    return null;
  }

  const fileName = notes.trim();

  // Accept a full URL or a filename.
  const notesUrl = /^https?:\/\//i.test(fileName)
    ? fileName
    : notesBaseUrl
      ? `${notesBaseUrl.replace(/\/$/, "")}/${fileName.replace(/^\//, "")}`
      : "";

  return (
    <section className="mt-6 overflow-hidden rounded-[24px] border border-[#dce8f7] bg-white shadow-[0_12px_35px_rgba(22,79,165,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf2f7] bg-gradient-to-r from-[#f2f8ff] to-[#faf5ff] px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e7efff] text-[#075fc8]">
            <BookOpen size={21} />
          </span>

          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#075fc8]">
              Study Materials
            </p>

            <h3 className="text-base font-black text-[#071f55]">
              Premium Study Notes
            </h3>
          </div>
        </div>

        <span className="rounded-full bg-amber-100 px-3 py-1.5 text-[10px] font-black text-amber-700">
          Premium
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-3 rounded-2xl border border-[#e7edf6] bg-[#f9fbff] p-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <FileText size={23} />
          </span>

          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-black text-[#071f55]">
              {chapter?.title ||
                chapter?.name ||
                "Chapter Notes"}
            </h4>

            <p className="mt-1 truncate text-xs text-slate-500">
              PDF Study Material
            </p>
          </div>
        </div>

        {isPremiumUser && notesUrl ? (
          <a
            href={notesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#075fc8] to-[#7c3aed] px-5 py-3 text-xs font-black text-white transition hover:brightness-110"
          >
            <Download size={16} />
            View / Download Notes
          </a>
        ) : (
          <div className="mt-4">
            <p className="mb-3 text-xs leading-5 text-slate-500">
              Purchase the required plan to access
              these premium PDF study notes.
            </p>

            <button
              type="button"
              onClick={onUpgrade}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-xs font-black text-white transition hover:brightness-110"
            >
              <LockKeyhole size={15} />
              Unlock Premium Notes
            </button>
          </div>
        )}
      </div>
    </section>
  );
}