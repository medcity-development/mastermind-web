"use client";

import {
  BookOpen,
  ChevronRight,
  PlayCircle,
} from "lucide-react";

export default function TopicFolderCard({
  topic,
  onClick,
}) {
  if (!topic) {
    return null;
  }

  const title =
    topic?.name ||
    topic?.subject ||
    topic?.title ||
    topic?.topic ||
    "Topic";

  const titleMal =
    topic?.name_mal ||
    topic?.subject_mal ||
    topic?.title_mal ||
    "";

  const count =
    Number(
      topic?.count ??
        topic?.chapter_count ??
        topic?.total ??
        0
    ) || 0;

  return (
    <button
      type="button"
      onClick={() =>
        onClick?.(topic)
      }
      className="
        group
        flex
        h-full
        w-full
        flex-col
        rounded-[20px]
        border
        border-[#dce8f7]
        bg-white
        p-5
        text-left
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-[#075fc8]/30
        hover:shadow-[0_14px_35px_rgba(22,79,165,0.09)]
      "
    >
      {/* TOP */}

      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <span
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-[14px]
            bg-[#edf7ff]
            text-[#087bea]
          "
        >
          <BookOpen
            size={19}
          />
        </span>

        <span
          className="
            inline-flex
            items-center
            gap-1.5
            rounded-full
            bg-[#edf7ff]
            px-3
            py-1.5
            text-[9px]
            font-black
            text-[#075fc8]
          "
        >
          <PlayCircle
            size={11}
          />

          {count}{" "}
          {count === 1
            ? "Video"
            : "Videos"}
        </span>
      </div>

      {/* TYPE */}

      <p
        className="
          mt-4
          text-[9px]
          font-black
          uppercase
          tracking-[0.14em]
          text-[#087bea]
        "
      >
        Video Topic
      </p>

      {/* TITLE */}

      <h3
        className="
          mt-2
          text-[16px]
          font-black
          leading-6
          text-[#071f55]
        "
      >
        {title}
      </h3>

      {/* MALAYALAM TITLE */}

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

      {/* FOOTER */}

      <div
        className="
          mt-auto
          pt-5
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            border-t
            border-[#e8eef7]
            pt-4
          "
        >
          <span
            className="
              text-[10px]
              font-semibold
              text-slate-500
            "
          >
            {count > 0
              ? `${count} video ${
                  count === 1
                    ? "lesson"
                    : "lessons"
                }`
              : "No videos available"}
          </span>

          <span
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              bg-[#edf7ff]
              text-[#075fc8]
              transition-all
              duration-300
              group-hover:bg-[#075fc8]
              group-hover:text-white
            "
          >
            <ChevronRight
              size={15}
              className="
                transition-transform
                duration-300
                group-hover:translate-x-0.5
              "
            />
          </span>
        </div>
      </div>
    </button>
  );
}