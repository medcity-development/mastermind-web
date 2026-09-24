"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BookOpen,
  Search,
} from "lucide-react";

import ExamSyllabusCard from "./ExamSyllabusCard";

export default function ExamSyllabusList({
  cid,
  examName,
  shortName,
}) {
  const [
    syllabus,
    setSyllabus,
  ] = useState([]);

  const [
    filePath,
    setFilePath,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /* =========================================================
     FETCH SYLLABUS
  ========================================================= */

  useEffect(() => {
    if (
      cid === undefined ||
      cid === null ||
      cid === ""
    ) {
      setSyllabus([]);
      setFilePath("");
      setLoading(false);
      setError(
        "Course information is missing."
      );

      return;
    }

    let cancelled =
      false;

    async function fetchSyllabus() {
      try {
        setLoading(true);
        setError("");

        const params =
          new URLSearchParams({
            cid:
              String(cid),

            uid:
              "0",
          });

        const response =
          await fetch(
            `/api/exam-syllabus?${params.toString()}`,
            {
              method:
                "GET",

              cache:
                "no-store",
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Unable to load syllabus."
          );
        }

        if (cancelled) {
          return;
        }

        setSyllabus(
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
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Unable to fetch syllabus:",
          error
        );

        setSyllabus([]);

        setFilePath("");

        setError(
          error?.message ||
            "Unable to load exam syllabus."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchSyllabus();

    return () => {
      cancelled = true;
    };
  }, [cid]);

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredSyllabus =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return syllabus;
      }

      return syllabus.filter(
        (item) => {
          const title =
            String(
              item?.title ??
                item?.name ??
                item?.exam_name ??
                ""
            ).toLowerCase();

          return title.includes(
            query
          );
        }
      );
    }, [
      syllabus,
      search,
    ]);

  /* =========================================================
     DISPLAY NAME
  ========================================================= */

  const displayName =
    examName ||
    shortName ||
    "Exam";

  return (
    <section
      className="
        mt-5
        rounded-[26px]
        border
        border-[#dce8f7]
        bg-white
        p-4
        shadow-[0_14px_40px_rgba(22,79,165,0.06)]
        sm:p-6
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          flex
          flex-col
          gap-4
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <span
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-[14px]
              bg-gradient-to-br
              from-[#087bea]
              via-[#2563eb]
              to-[#7c3aed]
              text-white
            "
          >
            <BookOpen
              size={20}
            />
          </span>

          <div>
            <h2
              className="
                text-lg
                font-black
                text-[#102c5c]
              "
            >
              Available Syllabuses
            </h2>

            <p
              className="
                mt-0.5
                text-[11px]
                text-slate-500
              "
            >
              Browse and open{" "}
              {displayName}{" "}
              syllabus PDFs.
            </p>
          </div>
        </div>

        {/* =====================================================
            SEARCH
        ===================================================== */}

        <div
          className="
            relative
            w-full
            lg:max-w-[350px]
          "
        >
          <Search
            size={16}
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-slate-400
            "
          />

          <input
            type="text"
            value={search}
            onChange={(
              event
            ) =>
              setSearch(
                event.target.value
              )
            }
            placeholder={`Search ${displayName} syllabus...`}
            className="
              h-11
              w-full
              rounded-[14px]
              border
              border-[#dce8f7]
              bg-[#f8fbff]
              pl-11
              pr-4
              text-xs
              text-[#102c5c]
              outline-none
              transition
              placeholder:text-slate-400
              focus:border-[#087bea]/40
              focus:ring-4
              focus:ring-[#087bea]/5
            "
          />
        </div>
      </div>

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (
        <div
          className="
            mt-5
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
            (_, index) => (
              <div
                key={index}
                className="
                  h-[180px]
                  animate-pulse
                  rounded-[20px]
                  bg-slate-100
                "
              />
            )
          )}
        </div>
      )}

      {/* =====================================================
          DATA
      ===================================================== */}

      {!loading &&
        !error &&
        filteredSyllabus.length >
          0 && (
          <div
            className="
              mt-5
              grid
              grid-cols-1
              gap-4
              md:grid-cols-2
              xl:grid-cols-3
            "
          >
            {filteredSyllabus.map(
              (
                item,
                index
              ) => (
               <ExamSyllabusCard
  key={
    item?.id ??
    index
  }
  item={item}
  filePath={filePath}
  examName={displayName}
/>
              )
            )}
          </div>
        )}

      {/* =====================================================
          EMPTY
      ===================================================== */}

      {!loading &&
        !error &&
        filteredSyllabus.length ===
          0 && (
          <div
            className="
              mt-5
              rounded-[20px]
              border
              border-slate-200
              bg-slate-50
              px-5
              py-12
              text-center
              text-sm
              text-slate-500
            "
          >
            No{" "}
            {displayName}{" "}
            syllabus found.
          </div>
        )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {!loading &&
        error && (
          <div
            className="
              mt-5
              rounded-[20px]
              border
              border-red-100
              bg-red-50
              px-5
              py-12
              text-center
              text-sm
              text-red-500
            "
          >
            {error}
          </div>
        )}
    </section>
  );
}