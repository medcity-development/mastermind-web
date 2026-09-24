"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  ListVideo,
} from "lucide-react";

import TopicVideoPlaylistItem from "./TopicVideoPlaylistItem";

const PLAYLIST_PAGE_SIZE = 8;

export default function TopicVideoPlaylist({
  videos = [],
  activeVideo,
  onSelect,
}) {
  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        videos.length /
          PLAYLIST_PAGE_SIZE
      )
    );

  /* =========================================================
     MOVE PAGE TO ACTIVE VIDEO
  ========================================================= */

  useEffect(() => {
    if (
      !activeVideo ||
      !videos.length
    ) {
      return;
    }

    const activeIndex =
      videos.findIndex(
        (video) =>
          String(
            video?.id
          ) ===
          String(
            activeVideo?.id
          )
      );

    if (
      activeIndex < 0
    ) {
      return;
    }

    const page =
      Math.floor(
        activeIndex /
          PLAYLIST_PAGE_SIZE
      ) + 1;

    setCurrentPage(page);
  }, [
    activeVideo?.id,
    videos,
  ]);

  /* =========================================================
     VISIBLE ITEMS
  ========================================================= */

  const visibleVideos =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        PLAYLIST_PAGE_SIZE;

      return videos.slice(
        start,
        start +
          PLAYLIST_PAGE_SIZE
      );
    }, [
      videos,
      currentPage,
    ]);

  const startIndex =
    (currentPage - 1) *
    PLAYLIST_PAGE_SIZE;

  return (
    <aside
      className="
        min-w-0
        overflow-hidden
        rounded-[26px]
        border
        border-[#dce8f7]
        bg-white
        shadow-[0_18px_50px_rgba(22,79,165,0.07)]
      "
    >
      {/* HEADER */}

      <div
        className="
          flex
          items-center
          justify-between
          gap-3
          border-b
          border-[#e8eef7]
          bg-gradient-to-r
          from-[#f8fbff]
          to-white
          p-4
          sm:p-5
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <span
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-[12px]
              bg-gradient-to-br
              from-[#075fc8]
              to-[#164fa5]
              text-white
            "
          >
            <ListVideo
              size={18}
            />
          </span>

          <div>
            <h3
              className="
                text-[14px]
                font-black
                text-[#071f55]
              "
            >
              Playlist
            </h3>

            <p
              className="
                mt-0.5
                text-[9px]
                text-slate-400
              "
            >
              All available
              lessons
            </p>
          </div>
        </div>

        <span
          className="
            rounded-full
            bg-[#edf7ff]
            px-3
            py-1.5
            text-[9px]
            font-black
            text-[#075fc8]
          "
        >
          {videos.length}
        </span>
      </div>

      {/* ITEMS */}

      <div
        className="
          p-3
          sm:p-4
        "
      >
        <div
          className="
            space-y-3
          "
        >
          {visibleVideos.map(
            (
              video,
              index
            ) => (
              <TopicVideoPlaylistItem
                key={
                  `${
                    video?.id
                  }-${
                    startIndex +
                    index
                  }`
                }
                video={
                  video
                }
                index={
                  startIndex +
                  index
                }
                active={
                  String(
                    activeVideo
                      ?.id
                  ) ===
                  String(
                    video?.id
                  )
                }
                onClick={() =>
                  onSelect(
                    video
                  )
                }
              />
            )
          )}
        </div>
      </div>

      {/* PAGINATION */}

      {totalPages > 1 ? (
        <div
          className="
            flex
            items-center
            justify-between
            gap-3
            border-t
            border-[#e8eef7]
            bg-[#fbfdff]
            px-4
            py-3
          "
        >
          <button
            type="button"
            disabled={
              currentPage <= 1
            }
            onClick={() =>
              setCurrentPage(
                (page) =>
                  Math.max(
                    1,
                    page - 1
                  )
              )
            }
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              text-slate-600
              disabled:opacity-30
            "
          >
            <ChevronLeft
              size={15}
            />
          </button>

          <p
            className="
              text-[10px]
              font-bold
              text-slate-500
            "
          >
            Page{" "}
            <span
              className="
                text-[#075fc8]
              "
            >
              {currentPage}
            </span>
            {" "}of{" "}
            {totalPages}
          </p>

          <button
            type="button"
            disabled={
              currentPage >=
              totalPages
            }
            onClick={() =>
              setCurrentPage(
                (page) =>
                  Math.min(
                    totalPages,
                    page + 1
                  )
              )
            }
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              bg-[#075fc8]
              text-white
              disabled:opacity-30
            "
          >
            <ChevronRight
              size={15}
            />
          </button>
        </div>
      ) : null}
    </aside>
  );
}