"use client";

import Image from "next/image";

import {
  Play,
  Sparkles,
} from "lucide-react";

export default function ShortVideoCard({
  video,
}) {
  /* =========================================================
     SAFE VALUES
  ========================================================= */

  const title =
    video?.title ||
    video?.name ||
    "AI Learning Video";

  const description =
    video?.description ||
    video?.caption ||
    "";

  /* =========================================================
     THUMBNAIL

     Supports:
     - normalized helper field
     - raw API field
  ========================================================= */

  const thumbnail =
    video?.thumbnailUrl ||
    video?.thumbnail_url ||
    video?.thumbnail ||
    "";

  /* =========================================================
     VIDEO URL

     IMPORTANT:
     Your API returns:
     link: "https://player.vimeo.com/..."

     So `link` must be supported directly.
  ========================================================= */

  const videoUrl =
    String(
      video?.videoUrl ||
        video?.video_url ||
        video?.link ||
        video?.url ||
        ""
    ).trim();

  const canPlay =
    videoUrl.length > 0;

  /* =========================================================
     PLAY
  ========================================================= */

  function handlePlay() {
    if (!videoUrl) {
      console.warn(
        "Video URL missing:",
        video
      );

      return;
    }

    window.open(
      videoUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <article
      className="
        group
        relative
        w-full
        overflow-hidden
        rounded-[18px]
        border
        border-[#164fa5]/10
        bg-white
        shadow-[0_8px_24px_rgba(11,33,108,0.07)]
        transition-all
        duration-300

        sm:rounded-[20px]

        hover:-translate-y-1
        hover:shadow-[0_18px_40px_rgba(11,33,108,0.12)]
      "
    >
      <button
        type="button"
        onClick={
          handlePlay
        }
        aria-label={
          canPlay
            ? `Play ${title}`
            : `${title} is unavailable`
        }
        className="
          relative
          block
          aspect-[4/5]
          w-full
          overflow-hidden
          bg-[#0b216c]
          text-left

          md:aspect-[3/4]
          lg:aspect-[9/14]
        "
      >
        {/* =================================================
            THUMBNAIL
        ================================================= */}

        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={title}
            fill
            sizes="
              (max-width: 639px) 100vw,
              (max-width: 767px) 50vw,
              (max-width: 1023px) 33vw,
              25vw
            "
            className="
              object-cover
              object-center
              transition-transform
              duration-500
              ease-out
              group-hover:scale-[1.035]
            "
          />
        ) : (
          <div
            className="
              absolute
              inset-0
              bg-gradient-to-br
              from-[#164fa5]
              via-[#017cc0]
              to-[#00b5e8]
            "
          />
        )}

        {/* =================================================
            DARK OVERLAY
        ================================================= */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-t
            from-[#07174f]/95
            via-[#07174f]/20
            to-transparent
          "
        />

        {/* =================================================
            BADGE
        ================================================= */}

        <div
          className="
            absolute
            left-2.5
            top-2.5
            z-10
            inline-flex
            items-center
            gap-1
            rounded-full
            border
            border-white/15
            bg-black/25
            px-2
            py-1
            text-[8px]
            font-bold
            uppercase
            tracking-[0.12em]
            text-white
            backdrop-blur-md

            sm:left-3
            sm:top-3
            sm:gap-1.5
            sm:px-2.5
            sm:py-1.5
            sm:text-[9px]
          "
        >
          <Sparkles
            size={10}
            className="
              text-[#00b5e8]
              sm:size-[11px]
            "
          />

          AI Short
        </div>

        {/* =================================================
            PLAY BUTTON
        ================================================= */}

        <div
          className={`
            absolute
            left-1/2
            top-1/2
            z-10
            flex
            h-10
            w-10
            -translate-x-1/2
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            border
            border-white/25
            text-white
            shadow-[0_8px_24px_rgba(0,0,0,0.18)]
            backdrop-blur-md
            transition-all
            duration-300

            sm:h-12
            sm:w-12

            ${
              canPlay
                ? `
                    bg-black/40
                    group-hover:scale-110
                    group-hover:bg-white/30
                  `
                : `
                    bg-black/25
                    opacity-50
                  `
            }
          `}
        >
          <Play
            size={20}
            fill="white"
            strokeWidth={0}
            className="
              ml-0.5
              sm:h-[23px]
              sm:w-[23px]
            "
          />
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div
          className="
            absolute
            inset-x-0
            bottom-0
            z-10
            p-2.5

            sm:p-3
            lg:p-3.5
          "
        >
          <h3
            className="
              line-clamp-2
              text-[11px]
              font-black
              leading-[1.35]
              text-white

              sm:text-[12px]
              md:text-[13px]
            "
          >
            {title}
          </h3>

          {description && (
            <p
              className="
                mt-1
                hidden
                line-clamp-1
                text-[9px]
                leading-4
                text-white/65

                sm:block
                md:text-[10px]
              "
            >
              {description}
            </p>
          )}

          {!canPlay && (
            <p
              className="
                mt-1.5
                text-[9px]
                font-semibold
                text-white/55
              "
            >
              Video unavailable
            </p>
          )}
        </div>
      </button>
    </article>
  );
}