"use client";

import {
  LockKeyhole,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";

export default function TopicVideoPlaylistItem({
  video,
  index,
  active = false,
  onClick,
}) {
  const accessType = String(
    video?.accessType ??
      video?.type ??
      video?.access ??
      "paid"
  )
    .trim()
    .toLowerCase();

  const isFree = accessType === "free";

  const hasPackageAccess =
    video?.packageAccess === true;

  const canPlayFull =
    isFree || hasPackageAccess;

  const isPreview = !canPlayFull;

  const title =
    video?.titleText ||
    video?.title ||
    `Video ${index + 1}`;

  const malayalamTitle =
    video?.malayalamTitle ||
    video?.title_mal ||
    "";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={`
        group flex w-full items-center gap-3
        rounded-[16px] border p-3.5 text-left
        transition-all duration-200
        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-blue-600
        ${
          active
            ? "border-blue-300 bg-blue-50 shadow-sm"
            : "border-transparent bg-[#f8fbff] hover:border-blue-100 hover:bg-white"
        }
      `}
    >
      <span
        className={`
          flex h-11 w-11 shrink-0
          items-center justify-center rounded-xl
          ${
            isPreview
              ? "bg-amber-100 text-amber-700"
              : active
                ? "bg-blue-600 text-white"
                : "bg-emerald-50 text-emerald-600"
          }
        `}
      >
        {isPreview ? (
          <LockKeyhole size={17} />
        ) : active ? (
          <PlayCircle size={19} />
        ) : (
          <CheckCircle2 size={18} />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
            Video {index + 1}
          </span>

          {video?.duration && (
            <span className="text-[9px] font-medium text-slate-400">
              {video.duration}
            </span>
          )}

          <span
            className={`
              rounded-full px-2 py-0.5
              text-[9px] font-bold
              ${
                isFree
                  ? "bg-emerald-100 text-emerald-700"
                  : hasPackageAccess
                    ? "bg-blue-100 text-blue-700"
                    : "bg-amber-100 text-amber-700"
              }
            `}
          >
            {isFree
              ? "Free"
              : hasPackageAccess
                ? "Unlocked"
                : "4 min preview"}
          </span>
        </div>

        <p className="mt-1 line-clamp-2 text-[12px] font-black text-[#071f55]">
          {title}
        </p>

        {malayalamTitle && (
          <p className="mt-1 line-clamp-1 text-[10px] text-slate-500">
            {malayalamTitle}
          </p>
        )}
      </div>

      {active && (
        <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
      )}
    </button>
  );
}