"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  LoaderCircle,
} from "lucide-react";

import TopicChapterCard from "./TopicChapterCard";
import TopicVideoPlayer from "./TopicVideoPlayer";

export default function TopicChapterList({
  topic,
  chapters = [],
  loading = false,
  error = "",
  onBack,
}) {
  const [
    selectedChapter,
    setSelectedChapter,
  ] = useState(null);

  const [
    showPlayer,
    setShowPlayer,
  ] = useState(false);

  /* =========================================================
     SORT CHAPTERS
  ========================================================= */

  const sortedChapters =
    useMemo(() => {
      if (
        !Array.isArray(
          chapters
        )
      ) {
        return [];
      }

      return [...chapters].sort(
        (a, b) => {
          const orderA =
            Number(
              a?.order ??
                a?.orders ??
                0
            );

          const orderB =
            Number(
              b?.order ??
                b?.orders ??
                0
            );

          if (
            orderA !==
            orderB
          ) {
            return (
              orderA -
              orderB
            );
          }

          return 0;
        }
      );
    }, [chapters]);

  /* =========================================================
     AUTO OPEN CHAPTER 1
  ========================================================= */

  useEffect(() => {
    if (
      loading ||
      !sortedChapters.length
    ) {
      return;
    }

    const firstChapter =
      sortedChapters[0];

    setSelectedChapter(
      firstChapter
    );

    setShowPlayer(
      true
    );
  }, [
    topic?.id,
    loading,
    sortedChapters,
  ]);

  /* =========================================================
     VIDEO PLAYER
  ========================================================= */

  if (
    showPlayer &&
    selectedChapter
  ) {
    return (
      <TopicVideoPlayer
        topic={topic}
        chapter={
          selectedChapter
        }
        chapters={
          sortedChapters
        }
        loading={
          loading
        }
        error={error}
        onBack={() => {
          setShowPlayer(
            false
          );
        }}
      />
    );
  }

  /* =========================================================
     CHAPTER LIST
  ========================================================= */

  return (
    <section
      className="
        mt-5
        rounded-[24px]
        border
        border-[#dce8f7]
        bg-[#fbfdff]
        p-5
        sm:p-6
      "
    >
      <button
        type="button"
        onClick={onBack}
        className="
          inline-flex
          items-center
          gap-2
          text-[11px]
          font-bold
          text-[#075fc8]
        "
      >
        <ArrowLeft
          size={15}
        />

        All Topics
      </button>

      <div className="mt-5">
        <p
          className="
            text-[9px]
            font-black
            uppercase
            tracking-[0.14em]
            text-[#087bea]
          "
        >
          Video Classes
        </p>

        <h2
          className="
            mt-1
            text-xl
            font-black
            text-[#071f55]
          "
        >
          {topic?.name ||
            topic?.subject ||
            topic?.title ||
            "Topic"}
        </h2>

        {!loading &&
        sortedChapters.length >
          0 ? (
          <p
            className="
              mt-2
              text-[11px]
              font-semibold
              text-slate-400
            "
          >
            {
              sortedChapters.length
            }{" "}
            {sortedChapters.length ===
            1
              ? "Video"
              : "Videos"}
          </p>
        ) : null}
      </div>

      {error ? (
        <div
          className="
            mt-5
            rounded-[14px]
            border
            border-red-100
            bg-red-50
            px-4
            py-3
            text-[11px]
            text-red-500
          "
        >
          {error}
        </div>
      ) : null}

      {loading ? (
        <div
          className="
            flex
            min-h-[220px]
            items-center
            justify-center
          "
        >
          <LoaderCircle
            size={25}
            className="
              animate-spin
              text-[#075fc8]
            "
          />
        </div>
      ) : sortedChapters.length >
        0 ? (
        <div
          className="
            mt-6
            grid
            gap-4
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {sortedChapters.map(
            (
              chapter,
              index
            ) => (
              <TopicChapterCard
                key={
                  chapter?.id ??
                  index
                }
                chapter={
                  chapter
                }
                onClick={() => {
                  setSelectedChapter(
                    chapter
                  );

                  setShowPlayer(
                    true
                  );
                }}
              />
            )
          )}
        </div>
      ) : (
        <div
          className="
            mt-6
            rounded-[20px]
            border
            border-dashed
            border-slate-300
            bg-white
            px-5
            py-12
            text-center
          "
        >
          No video classes
          available.
        </div>
      )}
    </section>
  );
}