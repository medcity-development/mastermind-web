"use client";

import {
  Crown,
  Download,
  FileText,
  LockKeyhole,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import PaidVideoLoginModal from "./PaidVideoLoginModal";
import TopicVideoHeader from "./TopicVideoHeader";
import TopicVideoLoading from "./TopicVideoLoading";
import TopicVideoEmpty from "./TopicVideoEmpty";
import TopicVideoPlayerCard from "./TopicVideoPlayerCard";
import TopicVideoPlaylist from "./TopicVideoPlaylist";
import StudyPlanMockTests from "./StudyPlanMockTests";

const PAID_PREVIEW_SECONDS =
  240;

export default function TopicVideoPlayer({
  topic,
  chapter,
  chapters = [],
  loading = false,
  error = "",
  onBack,
  mockTestId,
  cid,
  governmentExamsSlug,
  onStartMockTest,
}) {
  const videoRef =
    useRef(null);

  const [
    activeVideo,
    setActiveVideo,
  ] = useState(null);

  const [
    showLoginModal,
    setShowLoginModal,
  ] = useState(false);

  const [
    previewFinished,
    setPreviewFinished,
  ] = useState(false);

  const [
    modalDismissed,
    setModalDismissed,
  ] = useState(false);

  /* =========================================================
     NORMALIZE + SORT VIDEOS
  ========================================================= */

  const videos =
    useMemo(() => {
      if (
        !Array.isArray(
          chapters
        )
      ) {
        return [];
      }

      const normalized =
        chapters.map(
          (
            item,
            index
          ) => {
            const order =
              Number(
                item?.order ??
                  item?.orders ??
                  index + 1
              ) || index + 1;

            return {
              ...item,

              order,

              playlistIndex:
                index + 1,

              titleText:
                item?.title ||
                item?.name ||
                item?.subject ||
                item?.video_name ||
                `Chapter ${order}`,

              malayalamTitle:
                item?.titleMal ||
                item?.title_mal ||
                item?.name_mal ||
                "",

              videoUrl:
                item?.videoUrl ||
                item?.videourl ||
                item?.video_url ||
                "",

              videoHls:
                item?.videoHls ||
                item?.videohls ||
                item?.video_hls ||
                "",

              accessType:
                String(
                  item?.type ||
                    item?.access ||
                    "free"
                )
                  .toLowerCase()
                  .trim(),
            };
          }
        );

      return normalized.sort(
        (a, b) =>
          Number(a.order) -
          Number(b.order)
      );
    }, [chapters]);

  /* =========================================================
     SELECT INITIAL VIDEO
     1. clicked chapter
     2. chapter order 1
     3. first available chapter
  ========================================================= */

  useEffect(() => {
    if (!videos.length) {
      setActiveVideo(null);
      return;
    }

    let initialVideo =
      null;

    /* ---------------------------------------------------------
       CLICKED CHAPTER
    --------------------------------------------------------- */

    if (chapter?.id) {
      initialVideo =
        videos.find(
          (video) =>
            String(
              video?.id
            ) ===
            String(
              chapter?.id
            )
        ) || null;
    }

    /* ---------------------------------------------------------
       CHAPTER 1
    --------------------------------------------------------- */

    if (!initialVideo) {
      initialVideo =
        videos.find(
          (video) =>
            Number(
              video?.order
            ) === 1
        ) || null;
    }

    /* ---------------------------------------------------------
       FALLBACK
    --------------------------------------------------------- */

    if (!initialVideo) {
      initialVideo =
        videos[0];
    }

    setActiveVideo(
      initialVideo
    );
  }, [
    videos,
    chapter?.id,
  ]);

  /* =========================================================
     RESET PREMIUM STATE WHEN VIDEO CHANGES
  ========================================================= */

  useEffect(() => {
    setPreviewFinished(
      false
    );

    setShowLoginModal(
      false
    );

    setModalDismissed(
      false
    );
  }, [activeVideo?.id]);

  /* =========================================================
     AUTOPLAY WHEN ACTIVE VIDEO CHANGES
  ========================================================= */

  useEffect(() => {
    const video =
      videoRef.current;

    if (
      !video ||
      !activeVideo
    ) {
      return;
    }

    video.muted = true;

    const playPromise =
      video.play();

    playPromise?.catch?.(
      () => {
        /* autoplay may be blocked */
      }
    );
  }, [activeVideo?.id]);

  /* =========================================================
     PREMIUM PREVIEW LIMIT
  ========================================================= */

  function handleTimeUpdate() {
    const video =
      videoRef.current;

    if (
      !video ||
      !activeVideo
    ) {
      return;
    }

    const paid =
      activeVideo
        .accessType ===
      "paid";

    if (!paid) {
      return;
    }

    if (
      video.currentTime >=
      PAID_PREVIEW_SECONDS
    ) {
      video.pause();

      if (
        video.currentTime >
        PAID_PREVIEW_SECONDS
      ) {
        video.currentTime =
          PAID_PREVIEW_SECONDS;
      }

      setPreviewFinished(
        true
      );

      if (
        !modalDismissed
      ) {
        setShowLoginModal(
          true
        );
      }
    }
  }

  /* =========================================================
     BLOCK PLAY AFTER PREVIEW
  ========================================================= */

  function handlePlay() {
    const video =
      videoRef.current;

    if (
      !video ||
      activeVideo
        ?.accessType !==
        "paid"
    ) {
      return;
    }

    if (
      previewFinished ||
      video.currentTime >=
        PAID_PREVIEW_SECONDS
    ) {
      video.pause();

      setPreviewFinished(
        true
      );

      if (
        !modalDismissed
      ) {
        setShowLoginModal(
          true
        );
      }
    }
  }

  /* =========================================================
     SELECT VIDEO FROM PLAYLIST
  ========================================================= */

  function handleSelectVideo(
    video
  ) {
    if (!video) {
      return;
    }

    const player =
      videoRef.current;

    if (player) {
      player.pause();
      player.currentTime =
        0;
    }

    setPreviewFinished(
      false
    );

    setShowLoginModal(
      false
    );

    setModalDismissed(
      false
    );

    setActiveVideo(
      video
    );
  }

  /* =========================================================
     LOGIN MODAL
  ========================================================= */

  function handleCloseModal() {
    setShowLoginModal(
      false
    );

    setModalDismissed(
      true
    );
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <TopicVideoLoading />
    );
  }

  /* =========================================================
     EMPTY
  ========================================================= */

  if (!videos.length) {
    return (
      <section
        className="
          mt-5
          rounded-[28px]
          border
          border-[#dce8f7]
          bg-white
          p-5
        "
      >
        <TopicVideoHeader
          topic={topic}
          count={0}
          onBack={onBack}
        />

        <TopicVideoEmpty />
      </section>
    );
  }

  /* =========================================================
     CURRENT VIDEO
  ========================================================= */

  const activeUrl =
    activeVideo?.videoUrl ||
    activeVideo?.videoHls ||
    "";

  const isPaid =
    activeVideo
      ?.accessType ===
    "paid";

  const notesUrl =
    activeVideo?.notesUrl ||
    (/^https?:\/\//i.test(activeVideo?.notes || "")
      ? activeVideo.notes
      : "");
  const hasNotes = Boolean(
    notesUrl || activeVideo?.notes
  );

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <>
      <section
        className="
          mt-5
          rounded-[28px]
          border
          border-[#dce8f7]
          bg-gradient-to-b
          from-white
          to-[#f8fbff]
          p-4
          shadow-[0_18px_60px_rgba(22,79,165,0.06)]
          sm:p-5
        "
      >
        {/* HEADER */}

        <TopicVideoHeader
          topic={topic}
          count={
            videos.length
          }
          onBack={onBack}
        />

        {/* ERROR */}

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
              font-semibold
              text-red-500
            "
          >
            {error}
          </div>
        ) : null}

        {/* PLAYER + PLAYLIST */}

        <div
          className="
            mt-6
            grid
            grid-cols-1
            gap-6
            2xl:grid-cols-[minmax(0,1fr)_380px]
          "
        >
          <TopicVideoPlayerCard
            videoRef={
              videoRef
            }
            activeVideo={
              activeVideo
            }
            activeUrl={
              activeUrl
            }
            isPaid={
              isPaid
            }
            previewFinished={
              previewFinished
            }
            onTimeUpdate={
              handleTimeUpdate
            }
            onPlay={
              handlePlay
            }
            onLogin={() => {
              setModalDismissed(
                false
              );

              setShowLoginModal(
                true
              );
            }}
          />

          <TopicVideoPlaylist
            videos={videos}
            activeVideo={
              activeVideo
            }
            onSelect={
              handleSelectVideo
            }
          />
        </div>
        {(hasNotes || activeVideo) && (
          <div className="mt-6 grid w-full grid-cols-1 items-stretch gap-5 lg:grid-cols-2">
            {hasNotes && (
              <section className="h-full overflow-hidden rounded-[24px] border border-blue-100 bg-white shadow-[0_10px_35px_rgba(15,58,110,0.05)]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-violet-50 p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                      <FileText size={21} />
                    </span>
                    <div>
                      <h3 className="text-sm font-black text-[#071f55]">
                        Study Notes
                      </h3>
                      <p className="mt-1 text-[11px] text-slate-500">
                        PDF learning resources
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 text-[10px] font-black text-amber-700">
                    <Crown size={12} />
                    PREMIUM
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-[#f8fbff] p-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                      <FileText size={21} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-xs font-black text-[#071f55]">
                        {activeVideo?.titleText || "Chapter Notes"}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-500">
                        PDF Document
                      </p>
                    </div>
                    {!isPaid && notesUrl ? (
                      <a
                        href={notesUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="View study notes"
                        className="text-blue-700 hover:text-blue-900"
                      >
                        <Download size={17} />
                      </a>
                    ) : (
                      <LockKeyhole
                        size={17}
                        className="shrink-0 text-amber-600"
                      />
                    )}
                  </div>
                  {!isPaid && notesUrl ? (
                    <a
                      href={notesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#075fc8] to-[#7c3aed] px-4 py-3 text-xs font-black text-white transition hover:brightness-110"
                    >
                      <Download size={15} />
                      View Study Notes
                    </a>
                  ) : (
                    <p className="mt-4 text-[11px] leading-5 text-slate-500">
                      {isPaid
                        ? "Unlock the required plan to access these study materials."
                        : "The notes file URL is not configured."}
                    </p>
                  )}
                </div>
              </section>
            )}

            <div className={hasNotes ? "" : "lg:col-span-2"}>
              <StudyPlanMockTests
                topicId={topic?.id}
                mockTestId={mockTestId}
                cid={cid}
                governmentExamsSlug={governmentExamsSlug}
                onStartTest={onStartMockTest}
              />
            </div>
          </div>
        )}
      </section>

      {/* LOGIN MODAL */}

      <PaidVideoLoginModal
        open={
          showLoginModal
        }
        onClose={
          handleCloseModal
        }
      />
    </>
  );
}