"use client";

import {
  useState,
} from "react";

import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileQuestion,
  Loader2,
} from "lucide-react";

import PreviousQuestionCard from "./PreviousQuestionCard";

export default function PreviousQuestionsList({
  initialExams = [],
  initialNextOffset = null,
  categories = [],
  uid = 0,
  cid,
  type = "pqp",
  examName,
  shortName,
  governmentExamsSlug,
}) {
  const [
    activeFilter,
    setActiveFilter,
  ] = useState(0);

  const [
    exams,
    setExams,
  ] = useState(
    Array.isArray(
      initialExams
    )
      ? initialExams
      : []
  );

  const [
    nextOffset,
    setNextOffset,
  ] = useState(
    initialNextOffset
  );

  const [
    currentOffset,
    setCurrentOffset,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  /* =========================================================
     ACTIVE CATEGORIES FROM API
  ========================================================= */

  const availableCategories =
    Array.isArray(categories)
      ? categories.filter(
          (item) =>
            String(
              item?.status ??
                "1"
            ) === "1"
        )
      : [];

  /* =========================================================
     PARAMS
  ========================================================= */

  function buildParams({
    filter = 0,
    offset = 0,
  }) {
    const params =
      new URLSearchParams();

    params.set(
      "uid",
      String(uid ?? 0)
    );

    params.set(
      "cid",
      String(cid)
    );

    params.set(
      "type",
      String(
        type || "pqp"
      )
    );

    params.set(
      "filter",
      String(filter)
    );

    params.set(
      "offset",
      String(offset)
    );

    return params;
  }

  /* =========================================================
     FETCH EXAMS
  ========================================================= */

  async function fetchExams({
    filter = 0,
    offset = 0,
  }) {
    try {
      setLoading(true);

      setError("");

      const params =
        buildParams({
          filter,
          offset,
        });

      const response =
        await fetch(
          `/api/previous-questions?${params.toString()}`,
          {
            cache:
              "no-store",
          }
        );

      if (!response.ok) {
        throw new Error(
          `Request failed: ${response.status}`
        );
      }

      const result =
        await response.json();

      setExams(
        Array.isArray(
          result?.data
        )
          ? result.data
          : []
      );

      setNextOffset(
        result?.nextOffset ??
          null
      );

      setCurrentOffset(
        Number(offset) ||
          0
      );
    } catch (error) {
      console.error(
        "Previous questions:",
        error
      );

      setExams([]);

      setNextOffset(
        null
      );

      setError(
        "Unable to load previous questions."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     CHANGE CATEGORY
  ========================================================= */

  async function handleCategoryChange(
    categoryId
  ) {
    if (loading) {
      return;
    }

    const filter =
      Number(
        categoryId
      );

    if (
      filter ===
      Number(activeFilter)
    ) {
      return;
    }

    setActiveFilter(
      filter
    );

    setCurrentOffset(0);

    await fetchExams({
      filter,
      offset: 0,
    });
  }

  /* =========================================================
     ALL
  ========================================================= */

  async function handleShowAll() {
    if (
      loading ||
      activeFilter === 0
    ) {
      return;
    }

    setActiveFilter(0);

    setCurrentOffset(0);

    await fetchExams({
      filter: 0,
      offset: 0,
    });
  }

  /* =========================================================
     NEXT
  ========================================================= */

  async function handleNext() {
    if (
      nextOffset == null ||
      loading
    ) {
      return;
    }

    await fetchExams({
      filter:
        activeFilter,

      offset:
        nextOffset,
    });
  }

  /* =========================================================
     PREVIOUS
  ========================================================= */

  async function handlePrevious() {
    if (
      currentOffset <= 0 ||
      loading
    ) {
      return;
    }

    const previousOffset =
      Math.max(
        Number(
          currentOffset
        ) - 10,
        0
      );

    await fetchExams({
      filter:
        activeFilter,

      offset:
        previousOffset,
    });
  }

  /* =========================================================
     CURRENT PAGE
  ========================================================= */

  const currentPage =
    Math.floor(
      Number(
        currentOffset
      ) / 10
    ) + 1;

  return (
    <section>
      {/* =====================================================
          FILTER AREA
      ===================================================== */}

      <div
        className="
          relative
          mb-7
          overflow-hidden
          rounded-[24px]
          border
          border-blue-100
          bg-white
          p-4
          shadow-[0_14px_40px_rgba(15,23,42,0.05)]
          sm:p-5
        "
      >
        <div
          aria-hidden="true"
          className="
            absolute
            -right-14
            -top-14
            h-40
            w-40
            rounded-full
            bg-blue-100/70
            blur-3xl
          "
        />

        <div className="relative z-10">
          <div
            className="
              mb-5
              flex
              flex-col
              gap-3
              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >
            <div>
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-[#017cc0]
                "
              >
                {shortName ||
                  examName}{" "}
                Previous Questions
              </p>

              <h2
                className="
                  mt-1
                  text-[18px]
                  font-extrabold
                  text-[#0b1f44]
                  sm:text-[21px]
                "
              >
                Practice{" "}
                {examName} PYQs
              </h2>

              <p
                className="
                  mt-1
                  text-[11px]
                  text-slate-500
                "
              >
                Select an
                available exam
                category.
              </p>
            </div>

            {loading && (
              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-blue-50
                  px-3
                  py-2
                  text-[10px]
                  font-bold
                  text-[#164fa5]
                "
              >
                <Loader2
                  size={13}
                  className="animate-spin"
                />

                Loading exams
              </div>
            )}
          </div>

          {/* ===============================================
              DYNAMIC API FILTERS
          =============================================== */}

          {availableCategories.length >
            0 && (
            <div
              className="
                flex
                flex-wrap
                gap-2
              "
            >
              {/* ALL */}

              <button
                type="button"
                disabled={
                  loading
                }
                onClick={
                  handleShowAll
                }
                className={`
                  inline-flex
                  items-center
                  gap-2
                  rounded-[12px]
                  border
                  px-4
                  py-2.5
                  text-[11px]
                  font-bold
                  transition-all

                  ${
                    activeFilter ===
                    0
                      ? `
                          border-[#164fa5]
                          bg-gradient-to-r
                          from-[#0b216c]
                          to-[#164fa5]
                          text-white
                        `
                      : `
                          border-slate-200
                          bg-white
                          text-slate-600
                          hover:bg-blue-50
                          hover:text-[#164fa5]
                        `
                  }
                `}
              >
                <FileQuestion
                  size={14}
                />

                All
              </button>

              {/* API CATEGORIES */}

              {availableCategories.map(
                (category) => {
                  const id =
                    Number(
                      category?.id
                    );

                  const active =
                    Number(
                      activeFilter
                    ) === id;

                  return (
                    <button
                      key={
                        category?.id
                      }
                      type="button"
                      disabled={
                        loading
                      }
                      onClick={() =>
                        handleCategoryChange(
                          id
                        )
                      }
                      className={`
                        inline-flex
                        items-center
                        gap-2
                        rounded-[12px]
                        border
                        px-4
                        py-2.5
                        text-[11px]
                        font-bold
                        transition-all

                        ${
                          active
                            ? `
                                border-[#164fa5]
                                bg-gradient-to-r
                                from-[#0b216c]
                                to-[#164fa5]
                                text-white
                                shadow-[0_8px_20px_rgba(22,79,165,0.20)]
                              `
                            : `
                                border-slate-200
                                bg-white
                                text-slate-600
                                hover:border-blue-200
                                hover:bg-blue-50
                                hover:text-[#164fa5]
                              `
                        }
                      `}
                    >
                      <FileQuestion
                        size={
                          14
                        }
                      />

                      {category?.name ||
                        `Category ${id}`}
                    </button>
                  );
                }
              )}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div
          className="
            mb-5
            rounded-[16px]
            border
            border-red-100
            bg-red-50
            px-4
            py-3
            text-[12px]
            font-semibold
            text-red-600
          "
        >
          {error}
        </div>
      )}

      {/* =====================================================
          CARDS
      ===================================================== */}

      {loading ? (
        <div
          className="
            flex
            min-h-[300px]
            items-center
            justify-center
            rounded-[22px]
            border
            border-slate-200
            bg-white
          "
        >
          <Loader2
            size={27}
            className="
              animate-spin
              text-[#164fa5]
            "
          />
        </div>
      ) : exams.length >
        0 ? (
        <div
          className="
            grid
            grid-cols-1
            gap-5
            md:grid-cols-2
          "
        >
          {exams.map(
            (exam) => (
              <PreviousQuestionCard
                key={
                  exam?.id
                }
                item={
                  exam
                }
                uid={uid}
                cid={cid}
                type={
                  type
                }
                examName={
                  examName
                }
                governmentExamsSlug={
                  governmentExamsSlug
                }
              />
            )
          )}
        </div>
      ) : (
        <div
          className="
            rounded-[22px]
            border
            border-dashed
            border-slate-300
            bg-white
            px-5
            py-14
            text-center
          "
        >
          <BookOpen
            size={25}
            className="
              mx-auto
              text-[#164fa5]
            "
          />

          <h3
            className="
              mt-3
              text-[15px]
              font-extrabold
              text-[#0b1f44]
            "
          >
            No previous
            questions
            available
          </h3>
        </div>
      )}

      {/* =====================================================
          PAGINATION
      ===================================================== */}

      {!loading &&
        exams.length > 0 && (
          <div
            className="
              mt-8
              flex
              items-center
              justify-center
              gap-3
            "
          >
            <button
              type="button"
              onClick={
                handlePrevious
              }
              disabled={
                currentOffset ===
                  0 ||
                loading
              }
              className="
                inline-flex
                h-10
                items-center
                gap-1.5
                rounded-[11px]
                border
                border-slate-200
                bg-white
                px-4
                text-[11px]
                font-bold
                text-slate-600
                disabled:opacity-40
              "
            >
              <ChevronLeft
                size={14}
              />

              Previous
            </button>

            <span
              className="
                flex
                h-10
                items-center
                justify-center
                rounded-[11px]
                bg-[#164fa5]
                px-4
                text-[11px]
                font-extrabold
                text-white
              "
            >
              Page{" "}
              {currentPage}
            </span>

            <button
              type="button"
              onClick={
                handleNext
              }
              disabled={
                nextOffset ==
                  null ||
                loading
              }
              className="
                inline-flex
                h-10
                items-center
                gap-1.5
                rounded-[11px]
                bg-gradient-to-r
                from-[#0b216c]
                to-[#164fa5]
                px-4
                text-[11px]
                font-bold
                text-white
                disabled:opacity-40
              "
            >
              Next

              <ChevronRight
                size={14}
              />
            </button>
          </div>
        )}
    </section>
  );
}