"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import MockTestCard from "./MockTestCard";

const PAGE_SIZE = 10;

export default function MockTestList({
  cid,
  uid = 0,
  filter = 0,
  examName,
  shortName,
  governmentExamsSlug,
}) {
  const [
    tests,
    setTests,
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
    currentOffset,
    setCurrentOffset,
  ] = useState(0);

  const [
    nextOffset,
    setNextOffset,
  ] = useState(null);

  const [
    highestPage,
    setHighestPage,
  ] = useState(1);

  const currentPage =
    Math.floor(
      currentOffset /
        PAGE_SIZE
    ) + 1;

  /* =======================================================
     LOAD
  ======================================================= */

  async function loadTests(
    offset = 0
  ) {
    if (!cid) {
      setError(
        "Course ID is missing."
      );

      setLoading(false);

      return;
    }

    try {
      setLoading(true);
      setError("");

      const params =
        new URLSearchParams({
          cid:
            String(cid),

          uid:
            String(uid),

          offset:
            String(offset),

          filter:
            String(filter),
        });

      const response =
        await fetch(
          `/api/mock-tests/list?${params.toString()}`,
          {
            cache:
              "no-store",
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to load mock tests."
        );
      }

      const testData =
        Array.isArray(
          result?.data
        )
          ? result.data
          : [];

      const apiNextOffset =
        result?.nextoffset ??
        result?.nextOffset ??
        null;

      setTests(
        testData
      );

      setCurrentOffset(
        offset
      );

      setNextOffset(
        apiNextOffset
      );

      const loadedPage =
        Math.floor(
          offset /
            PAGE_SIZE
        ) + 1;

      const discoveredPage =
        apiNextOffset != null
          ? loadedPage + 1
          : loadedPage;

      setHighestPage(
        (previous) =>
          Math.max(
            previous,
            discoveredPage
          )
      );
    } catch (error) {
      console.error(
        `Mock tests for ${examName}:`,
        error
      );

      setTests([]);

      setNextOffset(
        null
      );

      setError(
        error?.message ||
          "Unable to load mock tests."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     RELOAD WHEN MAIN COURSE CHANGES
  ======================================================= */

  useEffect(() => {
    if (!cid) {
      return;
    }

    setTests([]);

    setCurrentOffset(0);

    setNextOffset(
      null
    );

    setHighestPage(1);

    loadTests(0);
  }, [
    cid,
    uid,
    filter,
  ]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  function scrollToList() {
    window.scrollTo({
      top: 0,
      behavior:
        "smooth",
    });
  }

  async function handlePageClick(
    page
  ) {
    if (
      loading ||
      page < 1 ||
      page === currentPage
    ) {
      return;
    }

    const offset =
      (page - 1) *
      PAGE_SIZE;

    await loadTests(
      offset
    );

    scrollToList();
  }

  async function handlePrevious() {
    if (
      loading ||
      currentPage <= 1
    ) {
      return;
    }

    await handlePageClick(
      currentPage - 1
    );
  }

  async function handleNext() {
    if (
      loading ||
      nextOffset == null
    ) {
      return;
    }

    await loadTests(
      Number(
        nextOffset
      )
    );

    scrollToList();
  }

  const pageNumbers =
    Array.from(
      {
        length:
          highestPage,
      },
      (_, index) =>
        index + 1
    );

  /* =======================================================
     LOADING
  ======================================================= */

  if (
    loading &&
    tests.length === 0
  ) {
    return (
      <div
        className="
          grid
          gap-5
          md:grid-cols-2
          xl:grid-cols-3
        "
      >
        {Array.from({
          length: 6,
        }).map(
          (_, index) => (
            <div
              key={
                index
              }
              className="
                h-[280px]
                animate-pulse
                rounded-[24px]
                border
                border-slate-200
                bg-white
              "
            />
          )
        )}
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <div
        className="
          rounded-[20px]
          border
          border-rose-200
          bg-rose-50
          px-5
          py-8
          text-center
        "
      >
        <p
          className="
            text-[13px]
            font-bold
            text-rose-600
          "
        >
          {error}
        </p>
      </div>
    );
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  if (
    tests.length === 0
  ) {
    return (
      <div
        className="
          rounded-[20px]
          border
          border-slate-200
          bg-white
          px-5
          py-12
          text-center
        "
      >
        <p
          className="
            text-[13px]
            font-bold
            text-slate-500
          "
        >
          No {examName} mock
          tests are currently
          available.
        </p>
      </div>
    );
  }

  return (
    <section>
      <div
        className={`
          grid
          gap-5
          md:grid-cols-2
          xl:grid-cols-3

          ${
            loading
              ? "pointer-events-none opacity-60"
              : ""
          }
        `}
      >
        {tests.map(
          (test) => (
            <MockTestCard
              key={
                test?.id
              }
              test={
                test
              }
              uid={
                uid
              }
              cid={
                cid
              }
              examName={
                examName
              }
              shortName={
                shortName
              }
              governmentExamsSlug={
                governmentExamsSlug
              }
            />
          )
        )}
      </div>

      <div
        className="
          mt-9
          flex
          flex-wrap
          items-center
          justify-center
          gap-2
        "
      >
        <button
          type="button"
          onClick={
            handlePrevious
          }
          disabled={
            loading ||
            currentPage === 1
          }
          className="
            inline-flex
            h-10
            items-center
            justify-center
            gap-1.5
            rounded-[11px]
            border
            border-slate-200
            bg-white
            px-4
            text-[11px]
            font-bold
            text-slate-600
            shadow-sm
            transition
            hover:bg-blue-50
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          <ChevronLeft
            size={14}
          />

          Previous
        </button>

        <div
          className="
            flex
            items-center
            gap-2
          "
        >
          {pageNumbers.map(
            (page) => {
              const isActive =
                page ===
                currentPage;

              return (
                <button
                  key={
                    page
                  }
                  type="button"
                  onClick={() =>
                    handlePageClick(
                      page
                    )
                  }
                  disabled={
                    loading
                  }
                  aria-current={
                    isActive
                      ? "page"
                      : undefined
                  }
                  className={`
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-[11px]
                    border
                    text-[11px]
                    font-extrabold
                    transition

                    ${
                      isActive
                        ? `
                            border-[#164fa5]
                            bg-[#164fa5]
                            text-white
                          `
                        : `
                            border-slate-200
                            bg-white
                            text-slate-600
                            hover:bg-blue-50
                          `
                    }
                  `}
                >
                  {page}
                </button>
              );
            }
          )}
        </div>

        <button
          type="button"
          onClick={
            handleNext
          }
          disabled={
            loading ||
            nextOffset == null
          }
          className="
            inline-flex
            h-10
            items-center
            justify-center
            gap-1.5
            rounded-[11px]
            border
            border-[#164fa5]
            bg-[#164fa5]
            px-4
            text-[11px]
            font-bold
            text-white
            transition
            hover:bg-[#0b216c]
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          Next

          <ChevronRight
            size={14}
          />
        </button>
      </div>
    </section>
  );
}