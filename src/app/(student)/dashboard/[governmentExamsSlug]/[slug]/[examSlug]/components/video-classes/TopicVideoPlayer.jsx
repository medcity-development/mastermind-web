
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  CheckCircle2,
  Crown,
  Download,
  FileText,
  LockKeyhole,
} from "lucide-react";

import PaidVideoLoginModal from "./PaidVideoLoginModal";
import TopicVideoHeader from "./TopicVideoHeader";
import TopicVideoLoading from "./TopicVideoLoading";
import TopicVideoEmpty from "./TopicVideoEmpty";
import TopicVideoPlayerCard from "./TopicVideoPlayerCard";
import TopicVideoPlaylist from "./TopicVideoPlaylist";
import StudyPlanMockTests from "./StudyPlanMockTests";

import {
  VIDEO_PREVIEW_SECONDS,
  getVideoAccess,
  isPaidVideo,
} from "@/lib/videoAccess";

/* =========================================================
   HELPERS
========================================================= */

function firstValue(...values) {
  return (
    values.find(
      (value) =>
        typeof value === "string" &&
        value.trim().length > 0
    )?.trim() || ""
  );
}

function validUrl(value) {
  if (!value || typeof value !== "string") {
    return false;
  }

  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" ||
      url.protocol === "http:"
    );
  } catch {
    return false;
  }
}

function normalizeAccess(item) {
  const value = String(
    item?.accessType ??
      item?.access_type ??
      item?.type ??
      item?.access ??
      (item?.is_paid === false ||
      item?.is_paid === 0 ||
      item?.is_paid === "0"
        ? "free"
        : "paid")
  )
    .trim()
    .toLowerCase();

  return [
    "free",
    "public",
    "0",
    "false",
  ].includes(value)
    ? "free"
    : "paid";
}

function normalizeBoolean(value) {
  return (
    value === true ||
    value === 1 ||
    value === "1" ||
    String(value).toLowerCase() === "true"
  );
}

function buildNotesUrl(item, notePath) {
  const directUrl = firstValue(
    item?.notesUrl,
    item?.notes_url,
    item?.notesPath
  );

  if (validUrl(directUrl)) {
    return directUrl;
  }

  const filename = firstValue(
    item?.notes,
    item?.note,
    item?.notes_file
  );

  if (!filename) return "";

  if (validUrl(filename)) {
    return filename;
  }

  if (!validUrl(notePath)) {
    return "";
  }

  try {
    const base = notePath.endsWith("/")
      ? notePath
      : `${notePath}/`;

    return new URL(
      filename.replace(/^\/+/, ""),
      base
    ).href;
  } catch {
    return "";
  }
}

function normalizeVideo(item, index, notePath) {
  const order =
    Number(
      item?.order ??
      item?.orders ??
      index + 1
    ) || index + 1;

  const videoUrl = firstValue(
    item?.videoUrl,
    item?.videourl,
    item?.video_url,
    item?.video_link,
    item?.videoLink,
    item?.mp4_url,
    item?.mp4
  );

  const videoHls = firstValue(
    item?.videoHls,
    item?.videohls,
    item?.video_hls,
    item?.hls_url,
    item?.hlsUrl,
    item?.m3u8
  );

  return {
    ...item,

    id:
      item?.id ??
      item?.chapter_id ??
      `chapter-${index}`,

    order,

    titleText:
      firstValue(
        item?.titleText,
        item?.title,
        item?.name,
        item?.subject,
        item?.video_name
      ) || `Chapter ${order}`,

    malayalamTitle: firstValue(
      item?.malayalamTitle,
      item?.titleMal,
      item?.title_mal,
      item?.name_mal
    ),

    accessType: normalizeAccess(item),

    videoUrl: validUrl(videoUrl)
      ? videoUrl
      : "",

    videoHls: validUrl(videoHls)
      ? videoHls
      : "",

    notesUrl: buildNotesUrl(
      item,
      notePath
    ),

    packageAccess:
      item?.packageAccess === true,
  };
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

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
  notePath = "",
  hasPremiumAccess = false,
  activePlans = null,
  verifiedAccessByVideoId = {},
}) {
  const videoRef = useRef(null);
  const previewLockedRef = useRef(false);

  const [selectedId, setSelectedId] =
    useState(null);

  const [
    previewFinished,
    setPreviewFinished,
  ] = useState(false);

  const [
    showLoginModal,
    setShowLoginModal,
  ] = useState(false);

  const [
    modalDismissed,
    setModalDismissed,
  ] = useState(false);

  /* =======================================================
     VIDEOS
  ======================================================= */

  const videos = useMemo(() => {
    if (!Array.isArray(chapters)) {
      return [];
    }

    return chapters
      .map((item, index) =>
        normalizeVideo(
          item,
          index,
          notePath
        )
      )
      .sort(
        (a, b) =>
          a.order - b.order
      );
  }, [chapters, notePath]);

  /* =======================================================
     ACTIVE VIDEO
  ======================================================= */

  const activeVideo = useMemo(() => {
    if (!videos.length) return null;

    if (selectedId !== null) {
      const selected = videos.find(
        (video) =>
          String(video.id) ===
          String(selectedId)
      );

      if (selected) return selected;
    }

    if (chapter?.id != null) {
      const initial = videos.find(
        (video) =>
          String(video.id) ===
          String(chapter.id)
      );

      if (initial) return initial;
    }

    return videos[0];
  }, [
    videos,
    selectedId,
    chapter?.id,
  ]);

  const activeId = activeVideo?.id;

  /* =======================================================
     VIDEO SOURCES

     Prefer HLS, fallback to MP4.
  ======================================================= */

  const activeUrl =
    activeVideo?.videoHls ||
    activeVideo?.videoUrl ||
    "";

  const fallbackUrl =
    activeVideo?.videoHls &&
    activeVideo?.videoUrl &&
    activeVideo.videoHls !==
      activeVideo.videoUrl
      ? activeVideo.videoUrl
      : "";

  /* =======================================================
     ACCESS VERIFICATION
  ======================================================= */

  const getAccess = useCallback(
    (video) => {
      if (!video) {
        return {
          fullAccess: false,
          previewRequired: false,
        };
      }

      const verified =
        verifiedAccessByVideoId?.[
          String(video.id)
        ] === true;

      const courseVerified =
        normalizeBoolean(
          hasPremiumAccess
        ) &&
        normalizeBoolean(
          video?.coursePackageVerified
        );

      return getVideoAccess({
        video,
        activePlans,
        verifiedPackageAccess:
          verified || courseVerified,
      });
    },
    [
      activePlans,
      hasPremiumAccess,
      verifiedAccessByVideoId,
    ]
  );

  const access = useMemo(
    () => getAccess(activeVideo),
    [activeVideo, getAccess]
  );

  const isPaid =
    activeVideo
      ? isPaidVideo(activeVideo)
      : false;

  const previewRequired =
    Boolean(activeVideo) &&
    access.previewRequired;

  const notesLocked =
    isPaid &&
    !access.fullAccess;

  /* =======================================================
     PLAYLIST ACCESS

     Keep each video's access independent.
  ======================================================= */

  const playlistVideos = useMemo(
    () =>
      videos.map((video) => ({
        ...video,
        packageAccess:
          getAccess(video).fullAccess &&
          isPaidVideo(video),
      })),
    [videos, getAccess]
  );

  /* =======================================================
     RESET ON TOPIC CHANGE
  ======================================================= */

  useEffect(() => {
    setSelectedId(null);
  }, [topic?.id]);

  /* =======================================================
     RESET ON VIDEO CHANGE
  ======================================================= */

  useEffect(() => {
    previewLockedRef.current = false;

    setPreviewFinished(false);
    setShowLoginModal(false);
    setModalDismissed(false);
  }, [
    activeId,
    activeUrl,
  ]);

  /* =======================================================
     RESET WHEN ACCESS GRANTED
  ======================================================= */

  useEffect(() => {
    if (access.fullAccess) {
      previewLockedRef.current = false;
      setPreviewFinished(false);
      setShowLoginModal(false);
    }
  }, [access.fullAccess]);

  /* =======================================================
     FINISH PREVIEW
  ======================================================= */

  const finishPreview = useCallback(() => {
    if (!previewRequired) return;

    if (previewLockedRef.current) {
      return;
    }

    previewLockedRef.current = true;

    const player = videoRef.current;

    if (player) {
      player.pause();

      try {
        if (
          player.currentTime >
          VIDEO_PREVIEW_SECONDS
        ) {
          player.currentTime =
            VIDEO_PREVIEW_SECONDS;
        }
      } catch {
        // Ignore unsupported seek operations.
      }
    }

    setPreviewFinished(true);

    if (!modalDismissed) {
      setShowLoginModal(true);
    }
  }, [
    previewRequired,
    modalDismissed,
  ]);

  /* =======================================================
     ENFORCE PREVIEW
  ======================================================= */

  const handleTimeUpdate = useCallback(() => {
    const player = videoRef.current;

    if (
      !player ||
      !previewRequired
    ) {
      return;
    }

    if (
      player.currentTime >=
      VIDEO_PREVIEW_SECONDS
    ) {
      finishPreview();
    }
  }, [
    previewRequired,
    finishPreview,
  ]);

  const handlePlay = useCallback(() => {
    const player = videoRef.current;

    if (
      !player ||
      !previewRequired
    ) {
      return;
    }

    if (
      previewLockedRef.current ||
      previewFinished ||
      player.currentTime >=
        VIDEO_PREVIEW_SECONDS
    ) {
      player.pause();
      finishPreview();
    }
  }, [
    previewRequired,
    previewFinished,
    finishPreview,
  ]);

  /* =======================================================
     SELECT VIDEO
  ======================================================= */

  const handleSelectVideo = useCallback(
    (video) => {
      if (!video) return;

      videoRef.current?.pause();

      previewLockedRef.current = false;

      setPreviewFinished(false);
      setShowLoginModal(false);
      setModalDismissed(false);

      setSelectedId(video.id);
    },
    []
  );

  /* =======================================================
     MODAL
  ======================================================= */

  const handleOpenLogin = useCallback(() => {
    videoRef.current?.pause();

    setShowLoginModal(true);
    setModalDismissed(false);
  }, []);

  const handleCloseLogin = useCallback(() => {
    setShowLoginModal(false);
    setModalDismissed(true);
  }, []);

  /* =======================================================
     STUDY NOTES
  ======================================================= */

  const notesUrl =
    activeVideo?.notesUrl || "";

  const hasNotes = Boolean(
    notesUrl ||
    activeVideo?.notes
  );

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return <TopicVideoLoading />;
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  if (!videos.length) {
    return (
      <section className="mt-5 rounded-[28px] border border-[#dce8f7] bg-white p-5">
        <TopicVideoHeader
          topic={topic}
          count={0}
          onBack={onBack}
        />

        {error && (
          <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        <TopicVideoEmpty />
      </section>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <>
      <section className="mt-5 min-w-0 rounded-[28px] border border-[#dce8f7] bg-gradient-to-b from-white to-[#f8fbff] p-4 shadow-[0_18px_60px_rgba(22,79,165,0.06)] sm:p-5">
        <TopicVideoHeader
          topic={topic}
          count={videos.length}
          onBack={onBack}
        />

        {error && (
          <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* VIDEO + PLAYLIST */}

        <div className="mt-6 grid min-w-0 grid-cols-1 items-start gap-6 2xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0">
            <TopicVideoPlayerCard
              key={String(
                activeId ?? "empty"
              )}
              videoRef={videoRef}
              activeVideo={activeVideo}
              activeUrl={activeUrl}
              fallbackUrl={fallbackUrl}
              isPaid={isPaid}
              previewRequired={
                previewRequired
              }
              previewFinished={
                previewFinished
              }
              onTimeUpdate={
                handleTimeUpdate
              }
              onPlay={handlePlay}
              onLogin={
                handleOpenLogin
              }
            />
          </div>

          <div className="min-w-0">
            <TopicVideoPlaylist
              videos={playlistVideos}
              activeVideo={activeVideo}
              onSelect={
                handleSelectVideo
              }
            />
          </div>
        </div>

        {/* NOTES + MOCK TESTS */}

        <div className="mt-6 grid w-full grid-cols-1 items-stretch gap-5 lg:grid-cols-2">
          {hasNotes && (
            <section
              className={`h-full min-w-0 overflow-hidden rounded-[24px] border shadow-sm ${
                notesLocked
                  ? "border-amber-200 bg-amber-50"
                  : "border-emerald-200 bg-emerald-50/40"
              }`}
            >
              <div
                className={`flex flex-wrap items-center justify-between gap-3 border-b p-5 ${
                  notesLocked
                    ? "border-amber-100"
                    : "border-emerald-100"
                }`}
              >
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

                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-black ${
                    notesLocked
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {notesLocked ? (
                    <Crown size={12} />
                  ) : (
                    <CheckCircle2 size={12} />
                  )}

                  {notesLocked
                    ? "PREMIUM"
                    : "AVAILABLE"}
                </span>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <FileText size={21} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-xs font-black text-[#071f55]">
                      {activeVideo?.titleText ||
                        "Chapter Notes"}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-500">
                      PDF Document
                    </p>
                  </div>

                  {notesLocked ? (
                    <LockKeyhole
                      size={17}
                      className="text-amber-600"
                    />
                  ) : notesUrl ? (
                    <a
                      href={notesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Open study notes"
                      className="text-blue-700"
                    >
                      <Download size={17} />
                    </a>
                  ) : null}
                </div>

                {!notesLocked &&
                notesUrl ? (
                  <a
                    href={notesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-black text-white hover:brightness-110"
                  >
                    <Download size={15} />
                    View Study Notes
                  </a>
                ) : notesLocked ? (
                  <div className="mt-4">
                    <p className="text-[11px] leading-5 text-slate-500">
                      Unlock the required package
                      to access these study materials.
                    </p>

                    <button
                      type="button"
                      onClick={
                        handleOpenLogin
                      }
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#075fc8] px-4 py-3 text-xs font-black text-white hover:bg-[#164fa5]"
                    >
                      <LockKeyhole size={14} />
                      Unlock Study Notes
                    </button>
                  </div>
                ) : (
                  <p className="mt-4 text-[11px] text-slate-500">
                    Notes URL is not configured.
                  </p>
                )}
              </div>
            </section>
          )}

          <div
            className={`min-w-0 ${
              hasNotes
                ? ""
                : "lg:col-span-2"
            }`}
          >
            <StudyPlanMockTests
              topicId={topic?.id}
              mockTestId={mockTestId}
              cid={cid}
              governmentExamsSlug={
                governmentExamsSlug
              }
              onStartTest={
                onStartMockTest
              }
            />
          </div>
        </div>
      </section>

      <PaidVideoLoginModal
        open={showLoginModal}
        onClose={handleCloseLogin}
      />
    </>
  );
}
