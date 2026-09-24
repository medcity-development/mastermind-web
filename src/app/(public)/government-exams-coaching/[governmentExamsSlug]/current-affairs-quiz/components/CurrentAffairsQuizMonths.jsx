"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Brain,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  LoaderCircle,
  Sparkles,
} from "lucide-react";

const INITIAL_COUNT = 6;
const ROW_SIZE = 3;

const cardStyles = [
  {
    bg: "from-[#eef7ff] to-[#ffffff]",
    icon: "bg-[#087bea]",
    badge:
      "bg-[#e2f1ff] text-[#087bea]",
  },
  {
    bg: "from-[#fff1f6] to-[#ffffff]",
    icon: "bg-[#f13873]",
    badge:
      "bg-[#ffe3ed] text-[#e52c68]",
  },
  {
    bg: "from-[#f0fdf7] to-[#ffffff]",
    icon: "bg-[#10b981]",
    badge:
      "bg-[#dcfce7] text-[#059669]",
  },
  {
    bg: "from-[#fff8e7] to-[#ffffff]",
    icon: "bg-[#f59e0b]",
    badge:
      "bg-[#fef3c7] text-[#d97706]",
  },
  {
    bg: "from-[#f5f1ff] to-[#ffffff]",
    icon: "bg-[#8b5cf6]",
    badge:
      "bg-[#ede9fe] text-[#7c3aed]",
  },
  {
    bg: "from-[#ecfeff] to-[#ffffff]",
    icon: "bg-[#06b6d4]",
    badge:
      "bg-[#cffafe] text-[#0891b2]",
  },
];

function wait(ms) {
  return new Promise(
    (resolve) =>
      setTimeout(resolve, ms)
  );
}

export default function CurrentAffairsQuizMonths({
  cid = 1,
  uid = 0,
  onSelect,
}) {
  const [months, setMonths] =
    useState([]);

  const [
    quizCounts,
    setQuizCounts,
  ] = useState({});

  const [
    visibleCount,
    setVisibleCount,
  ] = useState(INITIAL_COUNT);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
   * =====================================
   * LOAD MONTHS
   * =====================================
   */

  useEffect(() => {
    let active = true;

    async function loadMonths() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `/api/current-affairs-quiz/months?cid=${encodeURIComponent(
              cid
            )}&uid=${encodeURIComponent(
              uid
            )}&offset=10`,
            {
              cache: "no-store",
            }
          );

        const result =
          await response.json();

        console.log(
          "QUIZ MONTHS:",
          result
        );

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Unable to load quiz months."
          );
        }

        if (!active) {
          return;
        }

        const data =
          Array.isArray(
            result?.data
          )
            ? result.data
            : [];

        /*
         * IMPORTANT
         *
         * Do NOT filter using quizCount.
         *
         * The month API itself tells us
         * whether the month has quizzes:
         *
         * quiz > 0
         *
         * This prevents May or any other
         * month from disappearing when a
         * count request temporarily fails.
         */

        const availableMonths =
          data.filter(
            (item) =>
              Number(
                item?.quiz || 0
              ) > 0
          );

        setMonths(
          availableMonths
        );

        setQuizCounts(
          {}
        );

        setVisibleCount(
          INITIAL_COUNT
        );
      } catch (error) {
        console.error(
          "Quiz months error:",
          error
        );

        if (active) {
          setError(
            error?.message ||
              "Unable to load quiz months."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadMonths();

    return () => {
      active = false;
    };
  }, [cid, uid]);

  /*
   * =====================================
   * VISIBLE MONTHS
   * =====================================
   */

  const visibleMonths =
    months.slice(
      0,
      visibleCount
    );

  const canShowMore =
    visibleCount <
    months.length;

  const canShowLess =
    visibleCount >
    INITIAL_COUNT;

  /*
   * =====================================
   * LOAD REAL QUIZ COUNTS
   *
   * Month id -> quiz list
   *
   * Example:
   *
   * July:
   * month.id = 131
   *
   * /list?cid=131
   *
   * result.data.length
   * = real quiz count
   * =====================================
   */

  useEffect(() => {
    if (
      visibleMonths.length ===
      0
    ) {
      return;
    }

    let active = true;

    async function loadCounts() {
      /*
       * Request one month at a time.
       *
       * Do NOT use Promise.all here.
       * The external PSC API was returning
       * "Too Many Requests".
       */

      for (
        const month of visibleMonths
      ) {
        if (!active) {
          return;
        }

        /*
         * Already loaded.
         */

        if (
          Object.prototype.hasOwnProperty.call(
            quizCounts,
            month.id
          )
        ) {
          continue;
        }

        try {
          const response =
            await fetch(
              `/api/current-affairs-quiz/list?cid=${encodeURIComponent(
                month.id
              )}&uid=${encodeURIComponent(
                uid
              )}`,
              {
                cache:
                  "no-store",
              }
            );

          const result =
            await response.json();

          if (!active) {
            return;
          }

          if (!response.ok) {
            console.error(
              `Quiz count failed for ${month.month} ${month.year}:`,
              result
            );

            /*
             * null means:
             * request failed,
             * not zero quizzes.
             */

            setQuizCounts(
              (previous) => ({
                ...previous,
                [month.id]:
                  null,
              })
            );

            await wait(500);

            continue;
          }

          const quizzes =
            Array.isArray(
              result?.data
            )
              ? result.data
              : [];

          setQuizCounts(
            (previous) => ({
              ...previous,
              [month.id]:
                quizzes.length,
            })
          );

          /*
           * Small gap between API calls
           * to avoid rate limiting.
           */

          await wait(400);
        } catch (error) {
          console.error(
            `Quiz count error for ${month.month} ${month.year}:`,
            error
          );

          if (active) {
            setQuizCounts(
              (previous) => ({
                ...previous,
                [month.id]:
                  null,
              })
            );
          }

          await wait(500);
        }
      }
    }

    loadCounts();

    return () => {
      active = false;
    };

    /*
     * We intentionally don't add
     * quizCounts here.
     *
     * Adding it would trigger this effect
     * again every time a count updates.
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    months,
    visibleCount,
    uid,
  ]);

  /*
   * =====================================
   * VIEW MORE
   * =====================================
   */

  function handleViewMore() {
    setVisibleCount(
      (current) =>
        Math.min(
          current +
            ROW_SIZE,
          months.length
        )
    );
  }

  /*
   * =====================================
   * SHOW LESS
   * =====================================
   */

  function handleShowLess() {
    setVisibleCount(
      (current) =>
        Math.max(
          INITIAL_COUNT,
          current -
            ROW_SIZE
        )
    );
  }

  return (
    <section
      className="
        mt-6
        overflow-hidden
        rounded-[28px]
        border
        border-[#dce8f7]
        bg-white
        shadow-[0_18px_55px_rgba(11,33,108,0.07)]
      "
    >
      {/* =================================
          HEADER
      ================================= */}

      <div
        className="
          relative
          overflow-hidden
          border-b
          border-[#e5edf8]
          bg-gradient-to-r
          from-[#f7fbff]
          via-white
          to-[#f7f4ff]
          px-5
          py-6
          sm:px-7
        "
      >
        <div
          aria-hidden="true"
          className="
            absolute
            -right-16
            -top-20
            h-52
            w-52
            rounded-full
            bg-[#087bea]/5
            blur-2xl
          "
        />

        <div
          className="
            relative
            flex
            items-center
            gap-4
          "
        >
          <div
            className="
              relative
              flex
              h-14
              w-14
              shrink-0
              items-center
              justify-center
              rounded-[18px]
              bg-gradient-to-br
              from-[#087bea]
              to-[#164fa5]
              text-white
              shadow-[0_12px_28px_rgba(8,123,234,0.25)]
            "
          >
            <CalendarDays
              size={23}
            />

            <span
              className="
                absolute
                -right-1
                -top-1
                flex
                h-5
                w-5
                items-center
                justify-center
                rounded-full
                bg-[#f13873]
                text-white
              "
            >
              <Sparkles
                size={10}
              />
            </span>
          </div>

          <div>
            <p
              className="
                text-[9px]
                font-black
                uppercase
                tracking-[0.18em]
                text-[#087bea]
              "
            >
              Practice Zone
            </p>

            <h2
              className="
                mt-1
                text-xl
                font-black
                text-[#102c5c]
                sm:text-2xl
              "
            >
              Current Affairs
              Quizzes
            </h2>

            <p
              className="
                mt-1
                text-[11px]
                text-slate-500
              "
            >
              Choose a month to
              start practicing.
            </p>
          </div>
        </div>
      </div>

      {/* =================================
          CONTENT
      ================================= */}

      <div
        className="
          p-5
          sm:p-7
        "
      >
        {/* LOADING */}

        {loading && (
          <div
            className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
              lg:grid-cols-3
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
                    min-h-[140px]
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
                rounded-[20px]
                border
                border-red-100
                bg-red-50
                px-5
                py-10
                text-center
                text-sm
                font-bold
                text-red-500
              "
            >
              {error}
            </div>
          )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          months.length ===
            0 && (
            <div
              className="
                rounded-[22px]
                bg-slate-50
                px-5
                py-14
                text-center
              "
            >
              <Brain
                size={32}
                className="
                  mx-auto
                  text-slate-300
                "
              />

              <p
                className="
                  mt-3
                  text-sm
                  font-bold
                  text-slate-500
                "
              >
                No quizzes
                available.
              </p>
            </div>
          )}

        {/* =================================
            MONTH CARDS
        ================================= */}

        {!loading &&
          !error &&
          visibleMonths.length >
            0 && (
            <>
              <div
                className="
                  grid
                  grid-cols-1
                  gap-4
                  sm:grid-cols-2
                  lg:grid-cols-3
                "
              >
                {visibleMonths.map(
                  (
                    item,
                    index
                  ) => {
                    const style =
                      cardStyles[
                        index %
                          cardStyles.length
                      ];

                    const count =
                      quizCounts[
                        item.id
                      ];

                    const isCountLoading =
                      count ===
                      undefined;

                    const countFailed =
                      count ===
                      null;

                    return (
                      <button
                        key={
                          item?.id
                        }
                        type="button"
                        onClick={() =>
                          onSelect?.(
                            item
                          )
                        }
                        className={`
                          group
                          relative
                          overflow-hidden
                          rounded-[22px]
                          border
                          border-[#dce8f7]
                          bg-gradient-to-br
                          ${style.bg}
                          p-5
                          text-left
                          transition-all
                          duration-300
                          hover:-translate-y-1
                          hover:border-[#087bea]/30
                          hover:shadow-[0_18px_42px_rgba(22,79,165,0.12)]
                        `}
                      >
                        <div
                          className="
                            flex
                            items-start
                            justify-between
                            gap-4
                          "
                        >
                          <div
                            className={`
                              flex
                              h-11
                              w-11
                              items-center
                              justify-center
                              rounded-[14px]
                              ${style.icon}
                              text-white
                              shadow-sm
                            `}
                          >
                            <CalendarDays
                              size={18}
                            />
                          </div>

                          {/* REAL QUIZ COUNT */}

                          <span
                            className={`
                              inline-flex
                              min-h-[27px]
                              items-center
                              justify-center
                              gap-1.5
                              rounded-full
                              px-3
                              py-1.5
                              text-[9px]
                              font-black
                              uppercase
                              tracking-[0.08em]
                              ${style.badge}
                            `}
                          >
                            {isCountLoading ? (
                              <>
                                <LoaderCircle
                                  size={10}
                                  className="
                                    animate-spin
                                  "
                                />

                                Loading
                              </>
                            ) : countFailed ? (
                              "Available"
                            ) : (
                              <>
                                {count}{" "}
                                {count === 1
                                  ? "Quiz"
                                  : "Quizzes"}
                              </>
                            )}
                          </span>
                        </div>

                        <div
                          className="
                            mt-7
                            flex
                            items-end
                            justify-between
                            gap-3
                          "
                        >
                          <div>
                            <p
                              className="
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-[0.12em]
                                text-slate-400
                              "
                            >
                              Current
                              Affairs
                            </p>

                            <h3
                              className="
                                mt-1
                                text-xl
                                font-black
                                text-[#102c5c]
                              "
                            >
                              {
                                item?.month
                              }{" "}
                              {
                                item?.year
                              }
                            </h3>
                          </div>

                          <div
                            className="
                              flex
                              h-10
                              w-10
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              bg-white
                              text-[#087bea]
                              shadow-sm
                              transition-all
                              duration-300
                              group-hover:bg-[#164fa5]
                              group-hover:text-white
                            "
                          >
                            <ChevronRight
                              size={17}
                            />
                          </div>
                        </div>
                      </button>
                    );
                  }
                )}
              </div>

              {/* =================================
                  VIEW MORE / SHOW LESS
              ================================= */}

              {(canShowMore ||
                canShowLess) && (
                <div
                  className="
                    mt-7
                    flex
                    flex-wrap
                    items-center
                    justify-center
                    gap-3
                  "
                >
                  {canShowLess && (
                    <button
                      type="button"
                      onClick={
                        handleShowLess
                      }
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-full
                        border
                        border-[#dce8f7]
                        bg-white
                        px-6
                        py-3
                        text-[11px]
                        font-black
                        text-[#164fa5]
                        shadow-sm
                        transition-all
                        duration-300
                        hover:-translate-y-0.5
                        hover:border-[#164fa5]/30
                        hover:shadow-md
                      "
                    >
                      Show Less

                      <ChevronUp
                        size={15}
                      />
                    </button>
                  )}

                  {canShowMore && (
                    <button
                      type="button"
                      onClick={
                        handleViewMore
                      }
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-full
                        bg-gradient-to-r
                        from-[#087bea]
                        to-[#164fa5]
                        px-6
                        py-3
                        text-[11px]
                        font-black
                        text-white
                        shadow-[0_10px_25px_rgba(8,123,234,0.25)]
                        transition-all
                        duration-300
                        hover:-translate-y-0.5
                        hover:shadow-[0_14px_32px_rgba(8,123,234,0.32)]
                      "
                    >
                      View More

                      <ChevronDown
                        size={15}
                      />
                    </button>
                  )}
                </div>
              )}
            </>
          )}
      </div>
    </section>
  );
}