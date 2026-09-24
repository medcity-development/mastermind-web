"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  BellRing,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";

import NotificationCard from "./NotificationCard";
import NotificationsEmpty from "./NotificationsEmpty";

const ITEMS_PER_PAGE = 6;

export default function NotificationsList({
  cid,
  examName,
}) {
  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    filePath,
    setFilePath,
  ] = useState("");

  const [
    nextOffset,
    setNextOffset,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loadingMore,
    setLoadingMore,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  /* =========================================================
     INITIAL FETCH
  ========================================================= */

  useEffect(() => {
    if (!cid) {
      return;
    }

    let active = true;

    async function loadNotifications() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `/api/notifications?cid=${encodeURIComponent(
              cid
            )}&offset=0`
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Unable to load notifications."
          );
        }

        if (!active) {
          return;
        }

        setNotifications(
          Array.isArray(
            result?.data
          )
            ? result.data
            : []
        );

        setFilePath(
          String(
            result?.file_path ??
              ""
          )
        );

        setNextOffset(
          result?.nextoffset ??
            null
        );

        setCurrentPage(1);
      } catch (error) {
        console.error(
          "Notification fetch error:",
          error
        );

        if (active) {
          setError(
            `Unable to load ${examName} notifications.`
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadNotifications();

    return () => {
      active = false;
    };
  }, [
    cid,
    examName,
  ]);

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages =
    Math.ceil(
      notifications.length /
        ITEMS_PER_PAGE
    );

  const startIndex =
    (currentPage - 1) *
    ITEMS_PER_PAGE;

  const visibleNotifications =
    notifications.slice(
      startIndex,
      startIndex +
        ITEMS_PER_PAGE
    );

  function handlePageChange(
    page
  ) {
    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =========================================================
     LOAD MORE
  ========================================================= */

  async function handleLoadMore() {
    if (
      nextOffset === null ||
      nextOffset === undefined ||
      loadingMore
    ) {
      return;
    }

    try {
      setLoadingMore(true);

      const response =
        await fetch(
          `/api/notifications?cid=${encodeURIComponent(
            cid
          )}&offset=${encodeURIComponent(
            nextOffset
          )}`
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to load more notifications."
        );
      }

      const newItems =
        Array.isArray(
          result?.data
        )
          ? result.data
          : [];

      setNotifications(
        (current) => {
          const combined = [
            ...current,
            ...newItems,
          ];

          return Array.from(
            new Map(
              combined.map(
                (item) => [
                  item?.id,
                  item,
                ]
              )
            ).values()
          );
        }
      );

      if (
        result?.file_path
      ) {
        setFilePath(
          result.file_path
        );
      }

      setNextOffset(
        result?.nextoffset ??
          null
      );
    } catch (error) {
      console.error(
        "Load more notifications error:",
        error
      );
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <section
      className="
        mt-6
        rounded-[26px]
        border
        border-[#dce8f7]
        bg-white/70
        p-4
        shadow-[0_12px_35px_rgba(11,33,108,0.05)]
        sm:p-6
      "
    >
      {/* HEADER */}

      <div
        className="
          mb-6
          flex
          items-center
          gap-3
        "
      >
        <div
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-[14px]
            bg-gradient-to-br
            from-[#087bea]
            to-[#164fa5]
            text-white
          "
        >
          <BellRing size={19} />
        </div>

        <div>
          <h2
            className="
              text-xl
              font-black
              text-[#102c5c]
            "
          >
            Latest Notifications
          </h2>

          <p
            className="
              mt-0.5
              text-[11px]
              text-slate-500
            "
          >
            Latest {examName} recruitment
            updates and official PDFs.
          </p>
        </div>
      </div>

      {/* LOADING */}

      {loading && (
        <div
          className="
            grid
            grid-cols-1
            gap-4
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {Array.from({
            length: 6,
          }).map(
            (
              _,
              index
            ) => (
              <div
                key={index}
                className="
                  min-h-[240px]
                  animate-pulse
                  rounded-[22px]
                  bg-slate-100
                "
              />
            )
          )}
        </div>
      )}

      {/* ERROR */}

      {!loading &&
        error && (
          <div
            className="
              rounded-[18px]
              border
              border-red-100
              bg-red-50
              px-5
              py-10
              text-center
              text-sm
              font-medium
              text-red-500
            "
          >
            {error}
          </div>
        )}

      {/* RESULTS */}

      {!loading &&
        !error && (
          <>
            {notifications.length >
            0 ? (
              <div
                className="
                  grid
                  grid-cols-1
                  gap-4
                  md:grid-cols-2
                  xl:grid-cols-3
                "
              >
                {visibleNotifications.map(
                  (item) => (
                    <NotificationCard
                      key={
                        item?.id
                      }
                      item={item}
                      filePath={
                        filePath
                      }
                      examName={
                        examName
                      }
                    />
                  )
                )}
              </div>
            ) : (
              <NotificationsEmpty />
            )}

            {/* PAGINATION */}

            {notifications.length >
              ITEMS_PER_PAGE && (
              <div
                className="
                  mt-8
                  flex
                  flex-wrap
                  items-center
                  justify-center
                  gap-2
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    handlePageChange(
                      currentPage -
                        1
                    )
                  }
                  disabled={
                    currentPage ===
                    1
                  }
                  className="
                    flex
                    h-10
                    items-center
                    justify-center
                    gap-1
                    rounded-full
                    border
                    border-[#dce8f7]
                    bg-white
                    px-4
                    text-xs
                    font-bold
                    text-[#164fa5]
                    transition
                    hover:border-[#164fa5]
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  <ChevronLeft
                    size={15}
                  />

                  Previous
                </button>

                {Array.from({
                  length:
                    totalPages,
                }).map(
                  (
                    _,
                    index
                  ) => {
                    const page =
                      index + 1;

                    return (
                      <button
                        type="button"
                        key={page}
                        onClick={() =>
                          handlePageChange(
                            page
                          )
                        }
                        className={`
                          flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-full
                          text-xs
                          font-black
                          transition

                          ${
                            currentPage ===
                            page
                              ? `
                                  bg-[#164fa5]
                                  text-white
                                  shadow-[0_7px_18px_rgba(22,79,165,0.24)]
                                `
                              : `
                                  border
                                  border-[#dce8f7]
                                  bg-white
                                  text-[#164fa5]
                                  hover:border-[#164fa5]
                                `
                          }
                        `}
                      >
                        {page}
                      </button>
                    );
                  }
                )}

                <button
                  type="button"
                  onClick={() =>
                    handlePageChange(
                      currentPage +
                        1
                    )
                  }
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  className="
                    flex
                    h-10
                    items-center
                    justify-center
                    gap-1
                    rounded-full
                    border
                    border-[#dce8f7]
                    bg-white
                    px-4
                    text-xs
                    font-bold
                    text-[#164fa5]
                    transition
                    hover:border-[#164fa5]
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  Next

                  <ChevronRight
                    size={15}
                  />
                </button>
              </div>
            )}

            {/* LOAD MORE */}

            {notifications.length >
              0 &&
              nextOffset !==
                null &&
              nextOffset !==
                undefined && (
                <div
                  className="
                    mt-6
                    flex
                    justify-center
                  "
                >
                  <button
                    type="button"
                    onClick={
                      handleLoadMore
                    }
                    disabled={
                      loadingMore
                    }
                    className="
                      inline-flex
                      min-w-[160px]
                      items-center
                      justify-center
                      gap-2
                      rounded-full
                      bg-[#164fa5]
                      px-6
                      py-3
                      text-xs
                      font-bold
                      text-white
                      shadow-[0_8px_20px_rgba(22,79,165,0.18)]
                      transition
                      hover:bg-[#087bea]
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {loadingMore ? (
                      <>
                        <LoaderCircle
                          size={15}
                          className="animate-spin"
                        />

                        Loading...
                      </>
                    ) : (
                      "Load More Notifications"
                    )}
                  </button>
                </div>
              )}
          </>
        )}
    </section>
  );
}