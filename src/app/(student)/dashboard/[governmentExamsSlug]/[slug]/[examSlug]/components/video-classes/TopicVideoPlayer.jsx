"use client";

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

const PAID_PREVIEW_SECONDS =
  240;

export default function TopicVideoPlayer({
  topic,
  chapter,
  chapters = [],
  loading = false,
  error = "",
  onBack,
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