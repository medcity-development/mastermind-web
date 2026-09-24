"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  BookOpen,
  RefreshCw,
} from "lucide-react";

import SubExamCard from "./SubExamCard";

/* =========================================================
   SUB EXAM LIST
========================================================= */

export default function SubExamList({
  cid = "1",
  subId,
  levelSlug,
}) {
  const [
    exams,
    setExams,
  ] = useState([]);

  const [
    iconPath,
    setIconPath,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    retryCount,
    setRetryCount,
  ] = useState(0);

  /* =======================================================
     FETCH SUB EXAMS
  ======================================================= */

  useEffect(() => {
    if (
      !cid ||
      !subId
    ) {
      setLoading(false);

      setError(
        "Exam information is unavailable."
      );

      return;
    }

    let cancelled =
      false;

    async function fetchExams() {
      try {
        setLoading(true);
        setError("");

        const url =
          `/api/sub-exams` +
          `?cid=${encodeURIComponent(
            cid
          )}` +
          `&subId=${encodeURIComponent(
            subId
          )}` +
          `&uid=0`;

        const response =
          await fetch(
            url,
            {
              method: "GET",
              cache: "no-store",
            }
          );

        const contentType =
          response.headers.get(
            "content-type"
          );

        if (
          !contentType?.includes(
            "application/json"
          )
        ) {
          throw new Error(
            "Sub exams API did not return JSON."
          );
        }

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Unable to load exams."
          );
        }

        if (cancelled) {
          return;
        }

        const examList =
          Array.isArray(
            result?.data
          )
            ? result.data
            : [];

        console.log(
          "SUB EXAMS RESPONSE:",
          result
        );

        console.log(
          "SUB EXAMS LIST:",
          examList
        );

        setExams(
          examList
        );

        setIconPath(
          String(
            result?.icon_path ??
              ""
          )
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Unable to fetch sub exams:",
          error
        );

        setExams([]);
        setIconPath("");

        setError(
          error?.message ||
            "Unable to load exams."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchExams();

    return () => {
      cancelled = true;
    };
  }, [
    cid,
    subId,
    retryCount,
  ]);

  /* =======================================================
     UI
  ======================================================= */

  return (
    <section
      className="
        relative
        mt-5
        overflow-hidden
        rounded-[26px]
        border
        border-[#dce8f7]
        bg-gradient-to-br
        from-white
        via-[#fbfdff]
        to-[#f5f9ff]
        p-4
        shadow-[0_14px_40px_rgba(22,79,165,0.06)]
        sm:p-6
      "
    >
      {/* DECORATIVE GLOW */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-16
          -top-16
          h-48
          w-48
          rounded-full
          bg-[#7c3aed]/5
          blur-3xl
        "
      />

      {/* HEADER */}

      <div
        className="
          relative
          z-10
          mb-5
          flex
          flex-col
          gap-3
          sm:flex-row
          sm:items-center
          sm:justify-between
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
              shrink-0
              items-center
              justify-center
              rounded-[14px]
              bg-gradient-to-br
              from-[#087bea]
              via-[#2563eb]
              to-[#7c3aed]
              text-white
              shadow-[0_8px_20px_rgba(37,99,235,0.20)]
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
              Available Exams
            </h2>

            <p
              className="
                mt-0.5
                text-[11px]
                text-slate-500
              "
            >
              Select an exam and continue your preparation.
            </p>
          </div>
        </div>

        {!loading &&
          !error &&
          exams.length >
            0 && (
            <span
              className="
                inline-flex
                w-fit
                items-center
                rounded-full
                bg-[#edf7ff]
                px-3
                py-1.5
                text-[10px]
                font-bold
                text-[#087bea]
              "
            >
              {exams.length}{" "}
              {exams.length ===
              1
                ? "Exam"
                : "Exams"}
            </span>
          )}
      </div>

      {/* ===================================================
          LOADING STATE
      =================================================== */}

      {loading && (
        <div
          className="
            relative
            z-10
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
                  overflow-hidden
                  rounded-[22px]
                  border
                  border-slate-100
                  bg-white
                "
              >
                <div
                  className="
                    h-[175px]
                    animate-pulse
                    bg-slate-100
                  "
                />

                <div
                  className="
                    space-y-3
                    p-5
                  "
                >
                  <div
                    className="
                      h-4
                      w-3/4
                      animate-pulse
                      rounded-full
                      bg-slate-100
                    "
                  />

                  <div
                    className="
                      h-3
                      w-1/2
                      animate-pulse
                      rounded-full
                      bg-slate-100
                    "
                  />
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* ===================================================
          EXAM CARDS
      =================================================== */}

      {!loading &&
        !error &&
        exams.length >
          0 && (
          <div
            className="
              relative
              z-10
              grid
              grid-cols-1
              gap-4
              md:grid-cols-2
              xl:grid-cols-3
            "
          >
            {exams.map(
              (exam) => (
                <SubExamCard
                key={exam.id}
                exam={exam}
                cid={cid}
                iconPath={iconPath}
                levelSlug={levelSlug}
              />
              )
            )}
          </div>
        )}

      {/* ===================================================
          EMPTY STATE
      =================================================== */}

      {!loading &&
        !error &&
        exams.length ===
          0 && (
          <div
            className="
              relative
              z-10
              rounded-[20px]
              border
              border-[#dce8f7]
              bg-white
              px-5
              py-12
              text-center
            "
          >
            <span
              className="
                mx-auto
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-[15px]
                bg-[#edf7ff]
                text-[#087bea]
              "
            >
              <BookOpen
                size={21}
              />
            </span>

            <h3
              className="
                mt-4
                text-sm
                font-bold
                text-[#102c5c]
              "
            >
              No exams available
            </h3>

            <p
              className="
                mx-auto
                mt-1
                max-w-[400px]
                text-[11px]
                leading-5
                text-slate-500
              "
            >
              No exams are currently available under this exam level.
            </p>
          </div>
        )}

      {/* ===================================================
          ERROR STATE
      =================================================== */}

      {!loading &&
        error && (
          <div
            className="
              relative
              z-10
              rounded-[20px]
              border
              border-red-100
              bg-red-50
              px-5
              py-10
              text-center
            "
          >
            <h3
              className="
                text-sm
                font-bold
                text-red-600
              "
            >
              Unable to load exams
            </h3>

            <p
              className="
                mt-1
                text-[11px]
                text-red-500
              "
            >
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                setRetryCount(
                  (value) =>
                    value + 1
                )
              }
              className="
                mx-auto
                mt-4
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-red-500
                px-4
                py-2
                text-[11px]
                font-bold
                text-white
                transition
                hover:bg-red-600
              "
            >
              <RefreshCw
                size={14}
              />

              Try Again
            </button>
          </div>
        )}
    </section>
  );
}