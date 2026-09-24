"use client";

import {
  LockKeyhole,
  PlayCircle,
} from "lucide-react";

export default function TopicVideoPlaylistItem({
  video,
  index,
  active = false,
  onClick,
}) {
  const paid =
    video?.accessType ===
    "paid";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group
        flex
        w-full
        items-center
        gap-3
        rounded-[16px]
        border
        p-3.5
        text-left
        transition-all
        duration-300

        ${
          active
            ? `
                border-[#075fc8]/30
                bg-gradient-to-r
                from-[#eef6ff]
                to-[#f8fbff]
                shadow-[0_8px_22px_rgba(22,79,165,0.08)]
              `
            : `
                border-transparent
                bg-[#f8fbff]
                hover:border-[#dce8f7]
                hover:bg-white
                hover:shadow-[0_8px_20px_rgba(22,79,165,0.05)]
              `
        }
      `}
    >
      <span
        className={`
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-[12px]

          ${
            paid
              ? "bg-amber-100 text-amber-700"
              : active
                ? "bg-[#075fc8] text-white"
                : "bg-white text-[#075fc8] shadow-sm"
          }
        `}
      >
        {paid ? (
          <LockKeyhole
            size={16}
          />
        ) : (
          <PlayCircle
            size={17}
          />
        )}
      </span>

      <div
        className="
          min-w-0
          flex-1
        "
      >
        <div
          className="
            flex
            items-center
            gap-2
          "
        >
          <span
            className="
              text-[8px]
              font-black
              uppercase
              tracking-[0.1em]
              text-slate-400
            "
          >
            Video {index + 1}
          </span>

          {video?.duration ? (
            <span
              className="
                text-[8px]
                font-semibold
                text-slate-400
              "
            >
              {video.duration}
            </span>
          ) : null}
        </div>

        <p
          className="
            mt-1
            line-clamp-1
            text-[11px]
            font-black
            text-[#071f55]
          "
        >
          {video?.titleText}
        </p>

        {video
          ?.malayalamTitle ? (
          <p
            className="
              mt-1
              line-clamp-1
              text-[10px]
              leading-4
              text-slate-500
            "
          >
            {
              video
                .malayalamTitle
            }
          </p>
        ) : null}
      </div>
    </button>
  );
}