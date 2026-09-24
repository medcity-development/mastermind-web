"use client";

import {
  Clock3,
  LockKeyhole,
  PlayCircle,
} from "lucide-react";

export default function TopicChapterCard({
  chapter,
  onClick,
}) {
  if (!chapter) {
    return null;
  }

  const isPaid =
    String(
      chapter?.type ||
        chapter?.access ||
        ""
    )
      .toLowerCase()
      .trim() ===
    "paid";

  const videoUrl =
    chapter?.videourl ||
    chapter?.videoUrl ||
    "";

  const videoHls =
    chapter?.videohls ||
    chapter?.videoHls ||
    "";

  const videoId =
    chapter?.videoid ||
    chapter?.videoId ||
    "";

  const hasVideo =
    Boolean(
      videoUrl ||
        videoHls ||
        videoId
    );

  const title =
    chapter?.title ||
    chapter?.name ||
    chapter?.subject ||
    chapter?.chapter ||
    chapter?.video_name ||
    `Video ${
      chapter?.orders ||
      chapter?.order ||
      chapter?.id ||
      ""
    }`;

  const titleMal =
    chapter?.title_mal ||
    chapter?.titleMal ||
    chapter?.name_mal ||
    chapter?.subject_mal ||
    "";

  const duration =
    chapter?.duration ||
    chapter?.video_duration ||
    "";

  return (
    <button
      type="button"
      disabled={!hasVideo}
      onClick={() => {
        if (
          hasVideo &&
          onClick
        ) {
          onClick(
            chapter
          );
        }
      }}
      className={`
        group
        relative
        w-full
        overflow-hidden
        rounded-[22px]
        border
        p-5
        text-left
        transition-all
        duration-300

        ${
          isPaid
            ? `
                border-amber-200
                bg-gradient-to-br
                from-amber-50
                via-white
                to-orange-50
              `
            : `
                border-emerald-200
                bg-gradient-to-br
                from-emerald-50
                via-white
                to-green-50
              `
        }

        ${
          hasVideo
            ? `
                cursor-pointer
                hover:-translate-y-1
                hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]
              `
            : `
                cursor-not-allowed
                opacity-70
              `
        }
      `}
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-3
        "
      >
        <span
          className={`
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-[13px]

            ${
              isPaid
                ? `
                    bg-amber-100
                    text-amber-700
                  `
                : `
                    bg-emerald-100
                    text-emerald-700
                  `
            }
          `}
        >
          {isPaid ? (
            <LockKeyhole
              size={18}
            />
          ) : (
            <PlayCircle
              size={19}
            />
          )}
        </span>

        <span
          className={`
            inline-flex
            items-center
            rounded-full
            px-3
            py-1.5
            text-[9px]
            font-black
            uppercase
            tracking-[0.06em]

            ${
              isPaid
                ? `
                    bg-amber-100
                    text-amber-700
                  `
                : `
                    bg-emerald-100
                    text-emerald-700
                  `
            }
          `}
        >
          {isPaid
            ? "Premium"
            : "Free"}
        </span>
      </div>

      <h3
        className="
          mt-4
          line-clamp-2
          text-[15px]
          font-black
          leading-6
          text-[#071f55]
        "
      >
        {title}
      </h3>

      {titleMal ? (
        <p
          className="
            mt-1
            line-clamp-2
            text-[11px]
            leading-5
            text-slate-500
          "
        >
          {titleMal}
        </p>
      ) : null}

      {duration ? (
        <div
          className="
            mt-3
            flex
            items-center
            gap-1.5
            text-[10px]
            font-semibold
            text-slate-400
          "
        >
          <Clock3
            size={13}
          />

          {duration}
        </div>
      ) : null}

      <div
        className={`
          mt-5
          flex
          items-center
          justify-center
          gap-2
          rounded-[12px]
          px-4
          py-3
          text-[10px]
          font-bold

          ${
            hasVideo
              ? isPaid
                ? `
                    bg-amber-100
                    text-amber-700
                    transition
                    group-hover:bg-amber-200
                  `
                : `
                    bg-emerald-100
                    text-emerald-700
                    transition
                    group-hover:bg-emerald-200
                  `
              : `
                  bg-slate-100
                  text-slate-400
                `
          }
        `}
      >
        {hasVideo ? (
          <>
            <PlayCircle
              size={14}
            />

            {isPaid
              ? "Preview Video"
              : "Watch Video"}
          </>
        ) : (
          "Video unavailable"
        )}
      </div>
    </button>
  );
}