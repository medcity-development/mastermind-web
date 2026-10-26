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

const PAGE_SIZE = 8;

export default function TopicVideoPlaylist({
  videos = [],
  activeVideo,
  onSelect,
}) {
  const [currentPage, setCurrentPage] =
    useState(1);

  const safeVideos = useMemo(
    () => (Array.isArray(videos) ? videos : []),
    [videos]
  );

  const totalPages = Math.max(
    1,
    Math.ceil(safeVideos.length / PAGE_SIZE)
  );

  useEffect(() => {
    if (!activeVideo?.id) return;

    const activeIndex = safeVideos.findIndex(
      (video) =>
        String(video?.id) ===
        String(activeVideo.id)
    );

    if (activeIndex < 0) return;

    setCurrentPage(
      Math.floor(activeIndex / PAGE_SIZE) + 1
    );
  }, [activeVideo?.id, safeVideos]);

  useEffect(() => {
    setCurrentPage((page) =>
      Math.min(Math.max(page, 1), totalPages)
    );
  }, [totalPages]);

  const startIndex =
    (currentPage - 1) * PAGE_SIZE;

  const visibleVideos = safeVideos.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  return (
    <aside className="min-w-0 overflow-hidden rounded-[24px] border border-[#dce8f7] bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-[#f8fbff] p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <ListVideo size={19} />
          </span>

          <div>
            <h3 className="text-sm font-black text-[#071f55]">
              Playlist
            </h3>

            <p className="mt-0.5 text-[10px] text-slate-500">
              Select a lesson to watch
            </p>
          </div>
        </div>

        <span className="rounded-full bg-blue-100 px-3 py-1 text-[10px] font-bold text-blue-700">
          {safeVideos.length} Lessons
        </span>
      </div>

      <div className="space-y-2 p-3 sm:p-4">
        {visibleVideos.length ? (
          visibleVideos.map((video, index) => (
            <TopicVideoPlaylistItem
              key={`${video?.id ?? "video"}-${startIndex + index}`}
              video={video}
              index={startIndex + index}
              active={
                String(activeVideo?.id) ===
                String(video?.id)
              }
              onClick={() => onSelect?.(video)}
            />
          ))
        ) : (
          <div className="rounded-xl bg-slate-50 p-8 text-center text-xs text-slate-500">
            No videos available.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-3">
          <button
            type="button"
            aria-label="Previous playlist page"
            disabled={currentPage <= 1}
            onClick={() =>
              setCurrentPage((page) =>
                Math.max(1, page - 1)
              )
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
          >
            <ChevronLeft size={17} />
          </button>

          <span className="text-xs font-bold text-slate-500">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            aria-label="Next playlist page"
            disabled={currentPage >= totalPages}
            onClick={() =>
              setCurrentPage((page) =>
                Math.min(totalPages, page + 1)
              )
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white disabled:opacity-40"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      )}
    </aside>
  );
}