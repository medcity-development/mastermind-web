"use client";

import {
  Clock3,
  LockKeyhole,
  PlayCircle,
} from "lucide-react";

export default function TopicVideoPlayerCard({
  videoRef,
  activeVideo,
  activeUrl,
  isPaid,
  previewFinished,
  onTimeUpdate,
  onPlay,
  onLogin,
}) {
  return (
    <div
      className="
        min-w-0
        overflow-hidden
        rounded-[26px]
        border
        border-[#dce8f7]
        bg-white
        shadow-[0_18px_50px_rgba(22,79,165,0.08)]
      "
    >
      {/* PLAYER */}

      <div
        className="
          relative
          aspect-video
          overflow-hidden
          bg-[#071f55]
        "
      >
        {activeUrl ? (
          <video
            ref={videoRef}
            key={activeVideo?.id}
            src={activeUrl}
            controls
            autoPlay
            muted
            playsInline
            preload="metadata"
            onTimeUpdate={
              onTimeUpdate
            }
            onPlay={onPlay}
            className="
              h-full
              w-full
              bg-black
              object-contain
            "
          />
        ) : (
          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              bg-gradient-to-br
              from-[#071f55]
              via-[#0b3a83]
              to-[#075fc8]
              text-white
            "
          >
            <div className="text-center">
              <span
                className="
                  mx-auto
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-full
                  bg-white/10
                  backdrop-blur
                "
              >
                <PlayCircle
                  size={34}
                />
              </span>

              <p
                className="
                  mt-4
                  text-sm
                  font-bold
                "
              >
                Video unavailable
              </p>
            </div>
          </div>
        )}

        {/* PREMIUM PREVIEW */}

        {isPaid &&
        !previewFinished ? (
          <div
            className="
              absolute
              left-4
              top-4
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-white/10
              bg-black/55
              px-3.5
              py-2
              text-[9px]
              font-black
              uppercase
              tracking-[0.08em]
              text-white
              backdrop-blur-md
            "
          >
            <LockKeyhole
              size={12}
            />

            4 min preview
          </div>
        ) : null}

        {/* PREVIEW FINISHED */}

        {isPaid &&
        previewFinished ? (
          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              bg-gradient-to-br
              from-[#071f55]/95
              via-[#0c3d87]/95
              to-[#0b56aa]/95
              px-6
              text-center
              text-white
              backdrop-blur-[2px]
            "
          >
            <div>
              <span
                className="
                  mx-auto
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-[18px]
                  border
                  border-white/15
                  bg-white/10
                "
              >
                <LockKeyhole
                  size={28}
                />
              </span>

              <h3
                className="
                  mt-4
                  text-lg
                  font-black
                "
              >
                Preview finished
              </h3>

              <p
                className="
                  mx-auto
                  mt-2
                  max-w-sm
                  text-[11px]
                  leading-5
                  text-white/70
                "
              >
                Login to continue
                watching this premium
                lesson.
              </p>

              <button
                type="button"
                onClick={onLogin}
                className="
                  mt-5
                  rounded-[13px]
                  bg-white
                  px-6
                  py-3
                  text-[11px]
                  font-black
                  text-[#075fc8]
                  shadow-[0_10px_30px_rgba(0,0,0,0.16)]
                  transition
                  hover:-translate-y-0.5
                "
              >
                Login to Continue
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* INFO */}

      <div
        className="
          border-t
          border-[#edf2f7]
          bg-white
          p-5
          sm:p-6
        "
      >
        <div
          className="
            flex
            flex-wrap
            items-center
            gap-2
          "
        >
          <span
            className="
              text-[9px]
              font-black
              uppercase
              tracking-[0.14em]
              text-[#087bea]
            "
          >
            Now Playing
          </span>

          {activeVideo
            ?.duration ? (
            <span
              className="
                inline-flex
                items-center
                gap-1
                rounded-full
                bg-[#f3f7fb]
                px-2.5
                py-1
                text-[9px]
                text-slate-500
              "
            >
              <Clock3
                size={11}
              />

              {
                activeVideo.duration
              }
            </span>
          ) : null}

          <span
            className={`
              rounded-full
              px-2.5
              py-1
              text-[9px]
              font-black
              uppercase

              ${
                isPaid
                  ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700"
              }
            `}
          >
            {isPaid
              ? "Premium"
              : "Free"}
          </span>
        </div>

        <h3
          className="
            mt-3
            text-[18px]
            font-black
            leading-6
            text-[#071f55]
          "
        >
          {
            activeVideo
              ?.titleText
          }
        </h3>

        {activeVideo
          ?.malayalamTitle ? (
          <p
            className="
              mt-1
              text-[13px]
              font-semibold
              leading-6
              text-slate-600
            "
          >
            {
              activeVideo
                .malayalamTitle
            }
          </p>
        ) : null}
      </div>
    </div>
  );
}