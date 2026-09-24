"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";

import BulletinMonthCard from "./BulletinMonthCard";
import BulletinEmpty from "./BulletinEmpty";
import BulletinPremiumModal from "./BulletinPremiumModal";

export default function BulletinMonths({
  cid = 1,
  uid = 21,
}) {
  const [
    months,
    setMonths,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /*
   * pageOffsets stores the actual API offsets.
   *
   * Example:
   * Page 1 -> offset 0
   * Page 2 -> offset 15
   * Page 3 -> offset 30
   */
  const [
    pageOffsets,
    setPageOffsets,
  ] = useState([0]);

  const [
    currentPageIndex,
    setCurrentPageIndex,
  ] = useState(0);

  const [
    nextOffset,
    setNextOffset,
  ] = useState(null);

  const [
    selectedMonth,
    setSelectedMonth,
  ] = useState(null);

  const [
    premiumModalOpen,
    setPremiumModalOpen,
  ] = useState(false);

  const offset =
    pageOffsets[
      currentPageIndex
    ] ?? 0;

  const currentPage =
    currentPageIndex + 1;

  /* =========================================================
     LOAD BULLETIN MONTHS
  ========================================================= */

  useEffect(() => {
    let active = true;

    async function loadMonths() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `/api/psc-bulletin-ca/months?cid=${encodeURIComponent(
              cid
            )}&uid=${encodeURIComponent(
              uid
            )}&offset=${encodeURIComponent(
              offset
            )}`,
            {
              cache:
                "no-store",
            }
          );

        const rawText =
          await response.text();

        let result = null;

        try {
          result =
            rawText
              ? JSON.parse(
                  rawText
                )
              : null;
        } catch {
          console.error(
            "Bulletin response:",
            rawText
          );

          throw new Error(
            "Bulletin server returned invalid data."
          );
        }

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Unable to load bulletin months."
          );
        }

        if (
          result?.status !==
          true
        ) {
          throw new Error(
            result?.message ||
              "Unable to load bulletin months."
          );
        }

        if (!active) {
          return;
        }

        const monthData =
          Array.isArray(
            result?.months
          )
            ? result.months
            : [];

        setMonths(
          monthData
        );

        setNextOffset(
          result?.nextoffset ??
            null
        );
      } catch (error) {
        console.error(
          "Bulletin months error:",
          error
        );

        if (active) {
          setMonths([]);

          setNextOffset(
            null
          );

          setError(
            error?.message ||
              "Unable to load bulletin months."
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
  }, [
    cid,
    uid,
    offset,
  ]);

  /* =========================================================
     NEXT PAGE
  ========================================================= */

  function handleNext() {
    if (
      nextOffset === null ||
      nextOffset === undefined
    ) {
      return;
    }

    const nextPageIndex =
      currentPageIndex + 1;

    /*
     * If this page was already visited,
     * simply move to it.
     */
    if (
      pageOffsets[
        nextPageIndex
      ] !== undefined
    ) {
      setCurrentPageIndex(
        nextPageIndex
      );

      return;
    }

    /*
     * Otherwise save the new API offset.
     */
    setPageOffsets(
      (previous) => [
        ...previous,
        Number(nextOffset),
      ]
    );

    setCurrentPageIndex(
      nextPageIndex
    );
  }

  /* =========================================================
     PREVIOUS PAGE
  ========================================================= */

  function handlePrevious() {
    if (
      currentPageIndex ===
      0
    ) {
      return;
    }

    setCurrentPageIndex(
      (previous) =>
        previous - 1
    );
  }

  /* =========================================================
     NUMBERED PAGE CLICK
  ========================================================= */

  function handlePageClick(
    pageIndex
  ) {
    if (
      pageIndex < 0 ||
      pageIndex >=
        pageOffsets.length
    ) {
      return;
    }

    setCurrentPageIndex(
      pageIndex
    );
  }

  /* =========================================================
     PREMIUM CARD
  ========================================================= */

  function handleMonthClick(
    item
  ) {
    const access =
      String(
        item?.access || ""
      )
        .trim()
        .toLowerCase();

    if (access === "paid") {
      setSelectedMonth(
        item
      );

      setPremiumModalOpen(
        true
      );

      return;
    }

    /*
     * Later:
     *
     * If free bulletin content gets
     * its own details page, navigate
     * to it here.
     */
  }

  function closePremiumModal() {
    setPremiumModalOpen(
      false
    );

    setSelectedMonth(
      null
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <>
      <section
        className="
          mt-6
          rounded-[26px]
          border
          border-[#dce8f7]
          bg-white
          p-5
          shadow-[0_12px_35px_rgba(11,33,108,0.05)]
          sm:p-6
        "
      >
        {/* HEADER */}
        <div
          className="
            mb-6
            flex
            flex-wrap
            items-end
            justify-between
            gap-4
          "
        >
          <div>
            <p
              className="
                text-[9px]
                font-black
                uppercase
                tracking-[0.14em]
                text-[#017cc0]
              "
            >
              Browse Bulletin
            </p>

            <h2
              className="
                mt-1
                text-2xl
                font-black
                text-[#05176A]
              "
            >
              Select a Month
            </h2>

            <p
              className="
                mt-1
                text-[11px]
                text-slate-500
              "
            >
              Choose a month to
              access the available
              bulletin content.
            </p>
          </div>

          {!loading &&
            !error &&
            months.length >
              0 && (
              <span
                className="
                  rounded-full
                  border
                  border-[#dce8f7]
                  bg-[#eef6ff]
                  px-3
                  py-2
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.08em]
                  text-[#017cc0]
                "
              >
                {
                  months.length
                }{" "}
                Months
              </span>
            )}
        </div>

        {/* LOADING */}
        {loading && (
          <div
            className="
              flex
              min-h-[250px]
              items-center
              justify-center
            "
          >
            <div
              className="
                flex
                flex-col
                items-center
                gap-3
              "
            >
              <LoaderCircle
                size={28}
                className="
                  animate-spin
                  text-[#017cc0]
                "
              />

              <p
                className="
                  text-[11px]
                  font-semibold
                  text-slate-400
                "
              >
                Loading bulletin
                months...
              </p>
            </div>
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
              "
            >
              <p
                className="
                  text-sm
                  font-bold
                  text-red-500
                "
              >
                {error}
              </p>
            </div>
          )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          months.length ===
            0 && (
            <BulletinEmpty />
          )}

        {/* MONTH CARDS */}
        {!loading &&
          !error &&
          months.length >
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
                {months.map(
                  (
                    item,
                    index
                  ) => (
                    <BulletinMonthCard
                      key={
                        item?.id ??
                        `${item?.month}-${item?.year}-${index}`
                      }
                      item={
                        item
                      }
                      onClick={() =>
                        handleMonthClick(
                          item
                        )
                      }
                    />
                  )
                )}
              </div>

              {/* PAGINATION */}
              <div
                className="
                  mt-7
                  flex
                  flex-wrap
                  items-center
                  justify-center
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
                    currentPageIndex ===
                    0
                  }
                  aria-label="Previous page"
                  className="
                    flex
                    h-10
                    w-10
                    cursor-pointer
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#dce8f7]
                    bg-white
                    text-[#164fa5]
                    shadow-sm
                    transition-all
                    duration-300
                    hover:border-[#164fa5]
                    hover:bg-[#f6f9ff]
                    disabled:cursor-not-allowed
                    disabled:opacity-35
                  "
                >
                  <ChevronLeft
                    size={15}
                  />
                </button>

                {/* VISITED PAGE NUMBERS */}
                {pageOffsets.map(
                  (
                    _,
                    index
                  ) => {
                    const page =
                      index + 1;

                    const isActive =
                      currentPage ===
                      page;

                    return (
                      <button
                        key={
                          page
                        }
                        type="button"
                        onClick={() =>
                          handlePageClick(
                            index
                          )
                        }
                        className={`
                          flex
                          h-10
                          min-w-10
                          cursor-pointer
                          items-center
                          justify-center
                          rounded-full
                          px-3
                          text-[11px]
                          font-black
                          transition-all
                          duration-300

                          ${
                            isActive
                              ? `
                                  bg-gradient-to-r
                                  from-[#164fa5]
                                  to-[#017cc0]
                                  text-white
                                  shadow-[0_8px_20px_rgba(22,79,165,0.22)]
                                `
                              : `
                                  border
                                  border-[#dce8f7]
                                  bg-white
                                  text-[#164fa5]
                                  hover:border-[#164fa5]
                                  hover:bg-[#f5f9ff]
                                `
                          }
                        `}
                      >
                        {
                          page
                        }
                      </button>
                    );
                  }
                )}

                {/* NEXT AVAILABLE PAGE NUMBER */}
                {nextOffset !==
                  null &&
                  nextOffset !==
                    undefined &&
                  currentPageIndex ===
                    pageOffsets.length -
                      1 && (
                    <button
                      type="button"
                      onClick={
                        handleNext
                      }
                      className="
                        flex
                        h-10
                        min-w-10
                        cursor-pointer
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-[#dce8f7]
                        bg-white
                        px-3
                        text-[11px]
                        font-black
                        text-[#164fa5]
                        transition-all
                        duration-300
                        hover:border-[#164fa5]
                        hover:bg-[#f5f9ff]
                      "
                    >
                      {pageOffsets.length +
                        1}
                    </button>
                  )}

                {/* NEXT */}
                <button
                  type="button"
                  onClick={
                    handleNext
                  }
                  disabled={
                    nextOffset ===
                      null ||
                    nextOffset ===
                      undefined
                  }
                  aria-label="Next page"
                  className="
                    flex
                    h-10
                    w-10
                    cursor-pointer
                    items-center
                    justify-center
                    rounded-full
                    bg-gradient-to-r
                    from-[#164fa5]
                    to-[#017cc0]
                    text-white
                    shadow-[0_8px_20px_rgba(22,79,165,0.18)]
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    disabled:cursor-not-allowed
                    disabled:opacity-35
                  "
                >
                  <ChevronRight
                    size={15}
                  />
                </button>
              </div>
            </>
          )}
      </section>

      <BulletinPremiumModal
        open={
          premiumModalOpen
        }
        month={
          selectedMonth
        }
        onClose={
          closePremiumModal
        }
      />
    </>
  );
}