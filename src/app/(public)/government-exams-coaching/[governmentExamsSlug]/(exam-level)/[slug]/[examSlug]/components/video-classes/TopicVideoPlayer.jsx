

"use client";

import {

  useEffect,

  useMemo,

  useRef,

  useState,

} from "react";

import {

  BookOpen,

  CheckCircle2,

  Clock3,

  Crown,

  Download,

  FileText,


  LockKeyhole,

  PlayCircle,

  Sparkles,

} from "lucide-react";

import PaidVideoLoginModal from "./PaidVideoLoginModal";

import TopicVideoHeader from "./TopicVideoHeader";

import TopicVideoLoading from "./TopicVideoLoading";

import TopicVideoEmpty from "./TopicVideoEmpty";

import TopicVideoPlayerCard from "./TopicVideoPlayerCard";

import TopicVideoPlaylist from "./TopicVideoPlaylist";

import StudyPlanMockTests from "./StudyPlanMockTests";

const PREVIEW_SECONDS = 240;

/* ========================================

   VIDEO NORMALIZATION

======================================== */

function normalizeVideo(item, index) {

  const order = Number(

    item?.order ?? item?.orders ?? index + 1

  );

  return {

    ...item,

    order: Number.isFinite(order)

      ? order

      : index + 1,

    titleText:

      item?.title ||

      item?.name ||

      item?.subject ||

      item?.video_name ||

      `Lesson ${index + 1}`,

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

    accessType: String(

      item?.type || item?.access || "free"

    )

      .toLowerCase()

      .trim(),

  };

}

/* ========================================

   NOTES

======================================== */

function getNotes(value) {

  if (typeof value !== "string") {

    return "";

  }

  const cleaned = value.trim();

  if (

    !cleaned ||

    ["null", "undefined", "none"].includes(

      cleaned.toLowerCase()

    )

  ) {

    return "";

  }

  return cleaned;

}

function getNotesUrl(notes, baseUrl) {
  if (!notes) return "";
  if (/^https?:\/\//i.test(notes)) return notes;
  if (!baseUrl) return "";
  return `${baseUrl.replace(/\/+$/, "")}/${notes.replace(/^\/+/, "")}`;
}

/* ========================================

   RESOURCE HEADER

======================================== */

function ResourceHeader({

  icon: Icon,

  title,

  subtitle,

  color = "blue",

}) {

  const colors = {

    blue: "bg-blue-100 text-blue-700",

    amber: "bg-amber-100 text-amber-700",

  };

  return (

    <div className="flex items-center gap-3">

      <div

        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${colors[color]}`}

      >

        <Icon size={21} />

      </div>

      <div className="min-w-0">

        <h3 className="text-sm font-black text-[#071f55]">

          {title}

        </h3>

        <p className="mt-1 text-[11px] text-slate-500">

          {subtitle}

        </p>

      </div>

    </div>

  );

}

/* ========================================

   NOTES CARD

======================================== */

function NotesCard({

  video,

  hasPremiumAccess,

  notesBaseUrl,

  onUnlock,

}) {

  const notes = getNotes(video?.notes);

  if (!notes) return null;

  const notesUrl = getNotesUrl(

    notes,

    notesBaseUrl

  );

  return (

    <section className="h-full overflow-hidden rounded-[24px] border border-blue-100 bg-white shadow-[0_10px_35px_rgba(15,58,110,0.05)]">

      <div className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-violet-50 p-5">

        <div className="flex flex-wrap items-center justify-between gap-3">

          <ResourceHeader

            icon={FileText}

            title="Study Notes"

            subtitle="PDF learning resources"

          />

          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 text-[10px] font-black text-amber-700">

            <Crown size={12} />

            PREMIUM

          </span>

        </div>

      </div>

      <div className="p-5">

        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-[#f8fbff] p-4">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">

            <FileText size={21} />

          </div>

          <div className="min-w-0 flex-1">

            <p className="line-clamp-2 text-xs font-black text-[#071f55]">

              {video?.titleText || "Chapter Notes"}

            </p>

            <p className="mt-1 text-[10px] text-slate-500">

              PDF Document

            </p>

          </div>

          {hasPremiumAccess ? (

            <CheckCircle2

              size={17}

              className="shrink-0 text-emerald-600"

            />

          ) : (

            <LockKeyhole

              size={17}

              className="shrink-0 text-amber-600"

            />

          )}

        </div>

        {hasPremiumAccess && notesUrl ? (

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

          <div className="mt-4">

            <p className="text-[11px] leading-5 text-slate-500">

              {hasPremiumAccess

                ? "The notes file URL is not configured."

                : "Unlock the required plan to access these study materials."}

            </p>

            {!hasPremiumAccess && onUnlock && (

              <button

                type="button"

                onClick={onUnlock}

                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-xs font-black text-white transition hover:brightness-110"

              >

                <LockKeyhole size={14} />

                Unlock Notes

              </button>

            )}

          </div>

        )}

      </div>

    </section>

  );

}

/* ========================================

   MAIN COMPONENT

======================================== */

export default function TopicVideoPlayer({

  topic,

  chapter,

  chapters = [],

  loading = false,

  error = "",

  onBack,

  mockTestId,

  cid = 1,

  uid = 0,

  onStartMockTest,

  onLoginRequired,

  hasPremiumAccess = false,

  notesBaseUrl = "",

  onUpgrade,

}) {

  const videoRef = useRef(null);

  const [

    activeVideoId,

    setActiveVideoId,

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

  /* ========================================

     VIDEOS

  ======================================== */

  const videos = useMemo(() => {

    if (!Array.isArray(chapters)) {

      return [];

    }

    return chapters

      .map(normalizeVideo)

      .sort((a, b) => a.order - b.order)

      .map((item, index) => ({

        ...item,

        playlistIndex: index + 1,

      }));

  }, [chapters]);

  const initialVideo = useMemo(() => {

    return (

      videos.find(

        (item) =>

          chapter?.id != null &&

          String(item.id) === String(chapter.id)

      ) ||

      videos.find((item) => item.order === 1) ||

      videos[0] ||

      null

    );

  }, [videos, chapter?.id]);

  const activeVideo =

    videos.find(

      (item) =>

        activeVideoId != null &&

        String(item.id) ===

          String(activeVideoId)

    ) || initialVideo;

  const activeId = activeVideo?.id;

  useEffect(() => {

    setActiveVideoId(null);

  }, [topic?.id, chapter?.id]);

  useEffect(() => {

    setPreviewFinished(false);

    setShowLoginModal(false);

    setModalDismissed(false);

  }, [activeId]);

  const isPaid =

    activeVideo?.accessType === "paid";

  const isPreviewOnly =

    isPaid && !hasPremiumAccess;

  const activeUrl =

    activeVideo?.videoUrl ||

    activeVideo?.videoHls ||

    "";

  const hasNotes = Boolean(

    getNotes(activeVideo?.notes)

  );

  // getChaptersList may expose the linked test as `mocktest`.
  const resolvedMockTestId =
    mockTestId ?? topic?.mocktest ?? topic?.mockTestId ??
    chapter?.mocktest ?? chapter?.mockTestId ??
    activeVideo?.mocktest ?? activeVideo?.mockTestId;

  const hasMockTest =
    resolvedMockTestId != null &&
    String(resolvedMockTestId).trim() !== "" &&
    Number(resolvedMockTestId) > 0;

  /* ========================================

     PREVIEW CONTROL

  ======================================== */

  function enforcePreviewLimit() {

    const player = videoRef.current;

    if (!player || !isPreviewOnly) {

      return;

    }

    if (

      player.currentTime >= PREVIEW_SECONDS ||

      previewFinished

    ) {

      player.pause();

      if (

        player.currentTime > PREVIEW_SECONDS

      ) {

        player.currentTime =

          PREVIEW_SECONDS;

      }

      setPreviewFinished(true);

      if (!modalDismissed && Number(uid) <= 0) {

        setShowLoginModal(true);

      }

    }

  }

  /* ========================================

     SELECT VIDEO

  ======================================== */

  function handleSelectVideo(video) {

    if (!video) return;

    const player = videoRef.current;

    if (player) {

      player.pause();

      player.currentTime = 0;

    }

    setPreviewFinished(false);

    setShowLoginModal(false);

    setModalDismissed(false);

    setActiveVideoId(video.id);

  }

  /* ========================================

     PREMIUM ACTION

  ======================================== */

  function handleUnlock() {

    if (Number(uid) > 0 && onUpgrade) {

      onUpgrade();

      return;

    }

    if (Number(uid) <= 0 && onLoginRequired) {

      onLoginRequired();

      return;

    }

    setModalDismissed(false);

    setShowLoginModal(true);

  }

  /* ========================================

     AUTOPLAY

  ======================================== */

  useEffect(() => {

    const player = videoRef.current;

    if (!player || !activeVideo) {

      return;

    }

    player.muted = true;

    const promise = player.play();

    promise?.catch?.(() => {});

  }, [activeId]);

  /* ========================================

     LOADING

  ======================================== */

  if (loading) {

    return <TopicVideoLoading />;

  }

  if (!videos.length) {

    return (

      <section className="mt-5 rounded-[26px] border border-blue-100 bg-white p-5">

        <TopicVideoHeader

          topic={topic}

          count={0}

          onBack={onBack}

        />

        <TopicVideoEmpty />

      </section>

    );

  }

  /* ========================================

     RENDER

  ======================================== */

  return (

    <>

      <section className="mt-5 overflow-hidden rounded-[28px] border border-[#dce8f7] bg-white shadow-[0_18px_60px_rgba(15,58,110,0.07)]">

        {/* Light, distinct playlist heading (separate from the main hero) */}
      <div className="relative overflow-hidden border-b border-sky-100 bg-gradient-to-br from-[#effaff] via-white to-[#eef0ff] px-5 py-6 sm:px-7 sm:py-7">
        <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="relative">
          <div className="[&_button]:text-[#075fc8] [&_h1]:text-[#092b59] [&_h2]:text-[#092b59] [&_p]:text-slate-600">
            <TopicVideoHeader topic={topic} count={videos.length} onBack={onBack} />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-white px-3 py-1.5 text-[11px] font-bold text-[#075fc8] shadow-sm">
              <PlayCircle size={14} /> {videos.length} lessons
            </span>
            {isPreviewOnly && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-700">
                <Clock3 size={14} /> 4-minute preview
              </span>
            )}
            {hasPremiumAccess && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
                <CheckCircle2 size={14} /> Premium access
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 lg:p-6">

          {error && (

            <div

              role="alert"

              className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700"

            >

              {error}

            </div>

          )}

          {/* PLAYER + PLAYLIST */}

          <div className="grid grid-cols-1 items-start gap-5 xl:items-stretch xl:grid-cols-[minmax(0,1fr)_340px]">

            {/* VIDEO PLAYER */}

            <div className="min-w-0 overflow-hidden rounded-[24px] shadow-[0_12px_40px_rgba(8,30,75,0.10)] xl:h-full">

              <TopicVideoPlayerCard

                videoRef={videoRef}

                activeVideo={activeVideo}

                activeUrl={activeUrl}

                isPaid={isPreviewOnly}

                previewFinished={

                  isPreviewOnly && previewFinished

                }

                onTimeUpdate={enforcePreviewLimit}

                onPlay={enforcePreviewLimit}

                onLogin={handleUnlock}

              />

            </div>

            {/* SINGLE PLAYLIST */}

            <div className="min-w-0 overflow-hidden rounded-[24px] border border-blue-100 bg-white shadow-[0_12px_35px_rgba(15,58,110,0.05)]">

              <div className="max-h-[580px] overflow-y-auto">

                <TopicVideoPlaylist

                  videos={videos}

                  activeVideo={activeVideo}

                  onSelect={handleSelectVideo}

                />

              </div>

            </div>

          </div>

          {/* STUDY RESOURCES */}

          {(hasNotes || hasMockTest || activeVideo) && (

            <div className="mt-6 grid w-full grid-cols-1 items-stretch gap-5 lg:grid-cols-2">

              {hasNotes && (

                <NotesCard

                  video={activeVideo}

                  hasPremiumAccess={

                    hasPremiumAccess

                  }

                  notesBaseUrl={

                    notesBaseUrl

                  }

                  onUnlock={handleUnlock}

                />

              )}

              <div className={hasNotes ? "" : "lg:col-span-2"}>

                  <StudyPlanMockTests

                    topicId={topic?.id}

                    mockTestId={resolvedMockTestId}

                    cid={cid}

                    uid={uid}

                    onLoginRequired={

                      onLoginRequired

                    }

                    onStartTest={

                      onStartMockTest

                    }

                  />

              </div>

            </div>

          )}

        </div>

      </section>

      <PaidVideoLoginModal

        open={showLoginModal}

        onClose={() => {

          setShowLoginModal(false);

          setModalDismissed(true);

        }}

      />

    </>

  );

}
