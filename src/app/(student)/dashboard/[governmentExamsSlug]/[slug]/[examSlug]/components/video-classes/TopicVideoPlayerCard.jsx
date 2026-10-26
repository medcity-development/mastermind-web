
"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AlertCircle,
  Clock3,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
} from "lucide-react";

function isHls(url) {
  return /\.m3u8(?:[?#]|$)/i.test(url || "");
}

export default function TopicVideoPlayerCard({
  videoRef,
  activeVideo,
  activeUrl = "",
  fallbackUrl = "",
  isPaid = false,
  previewRequired = false,
  previewFinished = false,
  onTimeUpdate,
  onPlay,
  onLogin,
}) {
  const internalRef = useRef(null);
  const mediaRef = videoRef || internalRef;
  const failedRef = useRef(false);

  const [sourceIndex, setSourceIndex] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const sources = useMemo(
    () =>
      [...new Set(
        [activeUrl, fallbackUrl].filter(Boolean)
      )],
    [activeUrl, fallbackUrl]
  );

  const source = sources[sourceIndex] || "";

  useEffect(() => {
    setSourceIndex(0);
    setAttempt(0);
    setMessage("");
    failedRef.current = false;
  }, [activeVideo?.id, activeUrl, fallbackUrl]);

  useEffect(() => {
    const video = mediaRef.current;
    if (!video) return;

    let cancelled = false;
    let hls = null;

    failedRef.current = false;

    const fail = (reason) => {
      if (cancelled || failedRef.current) return;

      failedRef.current = true;
      setLoading(false);

      if (sourceIndex + 1 < sources.length) {
        setSourceIndex((index) => index + 1);
      } else {
        setMessage(
          reason ||
          "The media server rejected this video source."
        );
      }
    };

    const onMediaError = () => {
      const code = video.error?.code;

      fail(
        `Video could not load (media error ${
          code || "unknown"
        }). The signed URL may be expired or blocked.`
      );
    };

    video.addEventListener("error", onMediaError);

    async function start() {
      try {
        video.pause();
        video.removeAttribute("src");
        video.load();

        if (!source) {
          setMessage(
            "No playback URL was returned for this lesson."
          );
          setLoading(false);
          return;
        }

        setLoading(true);
        setMessage("");

        if (
          !isHls(source) ||
          video.canPlayType(
            "application/vnd.apple.mpegurl"
          )
        ) {
          video.src = source;
          video.load();
          return;
        }

        const { default: Hls } = await import("hls.js");

        if (cancelled) return;

        if (!Hls.isSupported()) {
          fail("HLS is not supported by this browser.");
          return;
        }

        hls = new Hls({
          enableWorker: true,
          maxBufferLength: 20,
          fragLoadingMaxRetry: 0,
          manifestLoadingMaxRetry: 0,
          levelLoadingMaxRetry: 0,
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            fail(
              `Streaming error: ${
                data.details || data.type
              }. The Vimeo URL may need renewal.`
            );
          }
        });

        hls.loadSource(source);
        hls.attachMedia(video);
      } catch (error) {
        fail(
          error?.message ||
          "Unable to initialize the video player."
        );
      }
    }

    start();

    return () => {
      cancelled = true;

      video.removeEventListener(
        "error",
        onMediaError
      );

      if (hls) {
        hls.destroy();
      }

      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [
    mediaRef,
    source,
    sourceIndex,
    sources.length,
    attempt,
  ]);

  function retry() {
    setMessage("");
    setSourceIndex(0);
    setAttempt((value) => value + 1);
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-[26px] border border-[#dce8f7] bg-white shadow-[0_18px_50px_rgba(22,79,165,0.08)]">
      <div className="relative aspect-video overflow-hidden bg-[#071f55]">
        <video
          ref={mediaRef}
          controls={!previewFinished && !message}
          playsInline
          preload="metadata"
          onTimeUpdate={onTimeUpdate}
          onPlay={onPlay}
          onLoadedMetadata={() => setLoading(false)}
          onCanPlay={() => setLoading(false)}
          onPlaying={() => setLoading(false)}
          className="h-full w-full bg-black object-contain"
        />

        {loading && !message && !previewFinished && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25">
            <LoaderCircle
              className="animate-spin text-white"
              size={30}
            />
          </div>
        )}

        {message && !previewFinished && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#071f55] p-5 text-center text-white">
            <div className="max-w-md">
              <AlertCircle
                className="mx-auto text-amber-300"
                size={30}
              />

              <h3 className="mt-3 text-base font-bold">
                Video unavailable
              </h3>

              <p className="mt-2 text-xs leading-5 text-white/80">
                {message}
              </p>

              <button
                type="button"
                onClick={retry}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-blue-700"
              >
                <RefreshCw size={14} />
                Retry playback
              </button>
            </div>
          </div>
        )}

        {previewRequired && !previewFinished && (
          <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1.5 text-[10px] font-bold text-white">
            4-minute preview
          </span>
        )}

        {previewRequired && previewFinished && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#071f55]/95 p-5 text-center text-white">
            <LockKeyhole size={30} />

            <h3 className="mt-3 text-lg font-bold">
              Preview finished
            </h3>

            <p className="mt-2 text-xs text-white/75">
              Purchase the required package to continue.
            </p>

            <button
              type="button"
              onClick={onLogin}
              className="mt-4 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-blue-700"
            >
              Unlock video
            </button>
          </div>
        )}
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-blue-600">
          Now playing

          {activeVideo?.duration && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-slate-500">
              <Clock3 size={12} />
              {activeVideo.duration}
            </span>
          )}

          <span
            className={`rounded-full px-2 py-1 ${
              isPaid
                ? "bg-amber-100 text-amber-700"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {isPaid ? "Premium" : "Free"}
          </span>
        </div>

        <h3 className="mt-3 text-lg font-black text-[#071f55]">
          {activeVideo?.titleText ||
            activeVideo?.title ||
            "Video Lesson"}
        </h3>

        {activeVideo?.malayalamTitle && (
          <p className="mt-1 text-xs text-slate-500">
            {activeVideo.malayalamTitle}
          </p>
        )}
      </div>
    </div>
  );
}
