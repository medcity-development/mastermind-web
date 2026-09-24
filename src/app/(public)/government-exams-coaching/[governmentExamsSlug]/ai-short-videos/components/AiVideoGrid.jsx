"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import ShortVideoCard from "./ShortVideoCard";

export default function AiVideoGrid({
  cid,
  uid = 0,
  examName = "Government Exams",
}) {
  const [
    videos,
    setVideos,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);

  const [
    itemsPerView,
    setItemsPerView,
  ] = useState(4);

  /* =====================================================
     RESPONSIVE ITEMS
  ===================================================== */

  useEffect(() => {
    function updateItemsPerView() {
      const width =
        window.innerWidth;

      if (width < 640) {
        setItemsPerView(1);
      } else if (
        width < 768
      ) {
        setItemsPerView(2);
      } else if (
        width < 1024
      ) {
        setItemsPerView(3);
      } else {
        setItemsPerView(4);
      }
    }

    updateItemsPerView();

    window.addEventListener(
      "resize",
      updateItemsPerView
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateItemsPerView
      );
    };
  }, []);

  /* =====================================================
     FETCH DYNAMIC VIDEOS

     cid 1 -> Kerala PSC
     cid 2 -> RRB & SSC
  ===================================================== */

  useEffect(() => {
    if (
      cid === undefined ||
      cid === null ||
      cid === ""
    ) {
      setVideos([]);
      setLoading(false);
      setError(
        "Course ID is missing."
      );

      return;
    }

    const controller =
      new AbortController();

    async function fetchVideos() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            "/api/ai-videos",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

             body:
  JSON.stringify({
    uid: 0,
  }),

              cache:
                "no-store",

              signal:
                controller.signal,
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Unable to load videos."
          );
        }

        const videoData =
          Array.isArray(
            result?.videos
          )
            ? result.videos
            : Array.isArray(
                  result?.data
                )
              ? result.data
              : [];

        setVideos(
          videoData
        );

        setCurrentIndex(
          0
        );
      } catch (error) {
        if (
          error?.name ===
          "AbortError"
        ) {
          return;
        }

        console.error(
          "AI video fetch error:",
          error
        );

        setVideos([]);

        setError(
          error?.message ||
            "Unable to load AI videos right now."
        );
      } finally {
        if (
          !controller
            .signal
            .aborted
        ) {
          setLoading(
            false
          );
        }
      }
    }

    fetchVideos();

    return () => {
      controller.abort();
    };
  }, [
    cid,
    uid,
  ]);

  /* =====================================================
     CAROUSEL
  ===================================================== */

  const maxIndex =
    Math.max(
      0,
      videos.length -
        itemsPerView
    );

  useEffect(() => {
    setCurrentIndex(
      (current) =>
        Math.min(
          current,
          maxIndex
        )
    );
  }, [maxIndex]);

  function handlePrevious() {
    setCurrentIndex(
      (current) =>
        Math.max(
          current - 1,
          0
        )
    );
  }

  function handleNext() {
    setCurrentIndex(
      (current) =>
        Math.min(
          current + 1,
          maxIndex
        )
    );
  }

  /* =====================================================
     TRACK
  ===================================================== */

  const cardWidth =
    100 /
    itemsPerView;

  const translatePercentage =
    currentIndex *
    cardWidth;

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div
        className="
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
        "
      >
        {Array.from({
          length: 4,
        }).map(
          (
            _,
            index
          ) => (
            <div
              key={
                index
              }
              className="
                aspect-[9/16]
                animate-pulse
                rounded-[22px]
                bg-slate-200/70
              "
            />
          )
        )}
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <div
        className="
          rounded-[18px]
          border
          border-red-100
          bg-red-50
          px-5
          py-5
          text-center
          text-sm
          text-red-600
        "
      >
        {error}
      </div>
    );
  }

  /* =====================================================
     EMPTY

     This is useful if RRB currently has no videos.
     Later, when API adds them, they show automatically.
  ===================================================== */

  if (
    videos.length ===
    0
  ) {
    return (
      <div
        className="
          rounded-[20px]
          border
          border-[#dce8f5]
          bg-white
          px-5
          py-10
          text-center
          shadow-[0_8px_24px_rgba(15,58,110,0.05)]
        "
      >
        <p
          className="
            text-[15px]
            font-black
            text-[#0b216c]
          "
        >
          AI Videos
          Available Soon
        </p>

        <p
          className="
            mt-2
            text-[12px]
            text-slate-500
          "
        >
          AI learning
          videos for{" "}
          <span
            className="
              font-semibold
              text-slate-700
            "
          >
            {examName}
          </span>{" "}
          will be added
          soon.
        </p>
      </div>
    );
  }

  /* =====================================================
     CONTENT
  ===================================================== */

  return (
    <div
      className="
        relative
      "
    >
      {/* =================================================
          TOP CONTROLS
      ================================================= */}

      <div
        className="
          mb-4
          flex
          items-center
          justify-between
          gap-4
        "
      >
        <p
          className="
            text-xs
            font-semibold
            text-slate-500
          "
        >
          Showing{" "}
          <span
            className="
              font-black
              text-[#164fa5]
            "
          >
            {currentIndex +
              1}
          </span>

          {" - "}

          <span
            className="
              font-black
              text-[#164fa5]
            "
          >
            {Math.min(
              currentIndex +
                itemsPerView,
              videos.length
            )}
          </span>

          {" of "}

          {videos.length}
        </p>

        <div
          className="
            flex
            items-center
            gap-2
          "
        >
          {/* PREVIOUS */}

          <button
            type="button"
            onClick={
              handlePrevious
            }
            disabled={
              currentIndex ===
              0
            }
            aria-label="Previous videos"
            className="
              group
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-[#164fa5]/10
              bg-white
              text-[#164fa5]
              shadow-[0_6px_18px_rgba(11,33,108,0.06)]
              transition
              duration-300

              hover:-translate-y-0.5
              hover:bg-[#164fa5]
              hover:text-white

              disabled:pointer-events-none
              disabled:opacity-30
            "
          >
            <ChevronLeft
              size={19}
              className="
                transition
                duration-300
                group-hover:-translate-x-0.5
              "
            />
          </button>

          {/* NEXT */}

          <button
            type="button"
            onClick={
              handleNext
            }
            disabled={
              currentIndex >=
              maxIndex
            }
            aria-label="Next videos"
            className="
              group
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-gradient-to-r
              from-[#164fa5]
              to-[#017cc0]
              text-white
              shadow-[0_8px_20px_rgba(22,79,165,0.20)]
              transition
              duration-300

              hover:-translate-y-0.5
              hover:shadow-[0_12px_24px_rgba(22,79,165,0.28)]

              disabled:pointer-events-none
              disabled:opacity-30
            "
          >
            <ChevronRight
              size={19}
              className="
                transition
                duration-300
                group-hover:translate-x-0.5
              "
            />
          </button>
        </div>
      </div>

      {/* =================================================
          VIEWPORT
      ================================================= */}

      <div
        className="
          overflow-hidden
          rounded-[22px]
        "
      >
        <div
          className="
            flex
            will-change-transform
            transition-transform
            duration-500
            ease-[cubic-bezier(0.22,1,0.36,1)]
          "
          style={{
            transform:
              `translateX(-${translatePercentage}%)`,
          }}
        >
          {videos.map(
            (
              video,
              index
            ) => (
              <div
                key={
                  video?.id ??
                  index
                }
                className="
                  shrink-0
                  px-2
                "
                style={{
                  width:
                    `${cardWidth}%`,
                }}
              >
                <ShortVideoCard
                  video={
                    video
                  }
                />
              </div>
            )
          )}
        </div>
      </div>

      {/* =================================================
          PAGINATION
      ================================================= */}

      {videos.length >
        itemsPerView && (
        <div
          className="
            mt-5
            flex
            items-center
            justify-center
            gap-2
          "
        >
          {Array.from({
            length:
              maxIndex +
              1,
          }).map(
            (
              _,
              index
            ) => {
              const active =
                currentIndex ===
                index;

              return (
                <button
                  key={
                    index
                  }
                  type="button"
                  aria-label={`Show videos starting from ${index + 1}`}
                  onClick={() =>
                    setCurrentIndex(
                      index
                    )
                  }
                  className={`
                    relative
                    h-2
                    overflow-hidden
                    rounded-full
                    transition-all
                    duration-300

                    ${
                      active
                        ? "w-8 bg-[#164fa5]/10"
                        : "w-2 bg-[#164fa5]/15 hover:bg-[#164fa5]/30"
                    }
                  `}
                >
                  {active && (
                    <span
                      className="
                        absolute
                        inset-0
                        rounded-full
                        bg-gradient-to-r
                        from-[#164fa5]
                        via-[#017cc0]
                        to-[#00b5e8]
                      "
                    />
                  )}
                </button>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}