"use client";

import {
  ArrowLeft,
  ListVideo,
} from "lucide-react";

export default function TopicVideoHeader({
  topic,
  count = 0,
  onBack,
}) {
  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="
          inline-flex
          items-center
          gap-2
          rounded-full
          px-2
          py-1
          text-[11px]
          font-bold
          text-[#075fc8]
          transition
          hover:bg-[#edf7ff]
        "
      >
        <ArrowLeft
          size={15}
        />

        All Topics
      </button>

      <div
        className="
          mt-5
          flex
          flex-col
          gap-3
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >
        <div>
          <p
            className="
              text-[9px]
              font-black
              uppercase
              tracking-[0.16em]
              text-[#087bea]
            "
          >
            Video Playlist
          </p>

          <h2
            className="
              mt-1
              text-xl
              font-black
              text-[#071f55]
              sm:text-2xl
            "
          >
            {topic?.name ||
              "Video Classes"}
          </h2>

          {topic?.name_mal ? (
            <p
              className="
                mt-1
                text-[12px]
                font-medium
                text-slate-500
              "
            >
              {topic.name_mal}
            </p>
          ) : null}
        </div>

        <span
          className="
            inline-flex
            w-fit
            items-center
            gap-1.5
            rounded-full
            border
            border-[#dce8f7]
            bg-white
            px-3
            py-1.5
            text-[10px]
            font-black
            text-[#075fc8]
            shadow-sm
          "
        >
          <ListVideo
            size={13}
          />

          {count}{" "}
          {count === 1
            ? "Video"
            : "Videos"}
        </span>
      </div>
    </>
  );
}