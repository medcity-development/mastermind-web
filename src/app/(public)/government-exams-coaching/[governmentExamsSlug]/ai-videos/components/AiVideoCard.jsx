import Image from "next/image";

import {
  ArrowUpRight,
  Play,
  Sparkles,
} from "lucide-react";

export default function AiVideoCard({
  item,
}) {
  if (!item) {
    return null;
  }

  const title =
    item?.title ||
    "AI Learning Video";

  const description =
    item?.description || "";

  const videoUrl =
    item?.link || "";

  const thumbnailUrl =
    item?.thumbnailUrl || "";

  return (
    <article
      className="
        group
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-[24px]
        border
        border-[#dbe8f7]
        bg-white
        shadow-[0_10px_30px_rgba(22,79,165,0.06)]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-[#075fc8]/20
        hover:shadow-[0_20px_45px_rgba(22,79,165,0.13)]
      "
    >
      {/* =========================================
          THUMBNAIL
      ========================================= */}

      <div
        className="
          relative
          aspect-[4/5]
          w-full
          shrink-0
          overflow-hidden
          bg-slate-100
        "
      >
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            priority={false}
            sizes="
              (max-width: 640px) 100vw,
              (max-width: 1024px) 50vw,
              (max-width: 1536px) 33vw,
              25vw
            "
            className="
              object-cover
              object-top
              transition-transform
              duration-500
              ease-out
              group-hover:scale-[1.02]
            "
            unoptimized
          />
        ) : (
          <div
            className="
              flex
              h-full
              w-full
              items-center
              justify-center
              bg-gradient-to-br
              from-[#edf6ff]
              via-blue-50
              to-violet-100
            "
          >
            <div
              className="
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                bg-white
                text-[#075fc8]
                shadow-lg
              "
            >
              <Play
                size={26}
                fill="currentColor"
                className="ml-1"
              />
            </div>
          </div>
        )}

        {/* =========================================
            SUBTLE BOTTOM OVERLAY
        ========================================= */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-x-0
            bottom-0
            h-[30%]
            bg-gradient-to-t
            from-[#071f55]/35
            via-[#071f55]/5
            to-transparent
          "
        />

        {/* =========================================
            AI VIDEO BADGE
        ========================================= */}

        <div
          className="
            absolute
            left-4
            top-4
            z-10
          "
        >
          <span
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-full
              border
              border-white/70
              bg-white/95
              px-3
              py-1.5
              text-[9px]
              font-black
              uppercase
              tracking-[0.12em]
              text-[#075fc8]
              shadow-[0_5px_15px_rgba(0,0,0,0.08)]
              backdrop-blur-md
            "
          >
            <Sparkles
              size={11}
            />

            AI Video
          </span>
        </div>

        {/* =========================================
            CENTER PLAY BUTTON
        ========================================= */}

        {videoUrl ? (
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Watch ${title}`}
            className="
              absolute
              left-1/2
              top-1/2
              z-10
              flex
              h-[58px]
              w-[58px]
              -translate-x-1/2
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              border
              border-white/60
              bg-white/95
              text-[#075fc8]
              shadow-[0_12px_30px_rgba(0,0,0,0.22)]
              backdrop-blur-sm
              transition-all
              duration-300
              hover:scale-110
              hover:bg-white
            "
          >
            <Play
              size={22}
              fill="currentColor"
              className="ml-1"
            />
          </a>
        ) : null}
      </div>

      {/* =========================================
          CONTENT
      ========================================= */}

      <div
        className="
          flex
          flex-1
          flex-col
          p-5
        "
      >
        <p
          className="
            text-[9px]
            font-black
            uppercase
            tracking-[0.15em]
            text-[#017dc0]
          "
        >
          Kerala PSC Learning
        </p>

        <h3
          className="
            mt-2
            line-clamp-2
            text-[17px]
            font-black
            leading-[26px]
            text-[#071f55]
          "
        >
          {title}
        </h3>

        {description &&
        description !== title ? (
          <p
            className="
              mt-2
              line-clamp-2
              text-[12px]
              leading-5
              text-slate-500
            "
          >
            {description}
          </p>
        ) : null}

        {/* =========================================
            WATCH BUTTON
        ========================================= */}

        <div className="mt-auto pt-5">
          {videoUrl ? (
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="
                group/button
                flex
                w-full
                items-center
                justify-between
                rounded-[14px]
                bg-gradient-to-r
                from-[#075fc8]
                via-[#3154ee]
                to-[#7c3aed]
                px-4
                py-3.5
                text-[11px]
                font-bold
                text-white
                shadow-[0_8px_20px_rgba(49,84,238,0.18)]
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:shadow-[0_12px_25px_rgba(49,84,238,0.28)]
              "
            >
              <span
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <Play
                  size={13}
                  fill="currentColor"
                />

                Watch Video
              </span>

              <span
                className="
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-full
                  bg-white/15
                  transition-transform
                  duration-300
                  group-hover/button:translate-x-0.5
                "
              >
                <ArrowUpRight
                  size={14}
                />
              </span>
            </a>
          ) : (
            <div
              className="
                rounded-[14px]
                bg-slate-100
                px-4
                py-3.5
                text-center
                text-[11px]
                font-bold
                text-slate-400
              "
            >
              Video unavailable
            </div>
          )}
        </div>
      </div>
    </article>
  );
}