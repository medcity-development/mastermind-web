"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowRight,
} from "lucide-react";

import {
  getGovernmentExamConfigByCid,
} from "@/lib/governmentExamConfig";

import ExamCategoryCard from "./ExamCategoryCard";

export default function ExamCategorySection({
  course,
  uid,
  governmentExamsSlug:
  providedGovernmentExamsSlug,
}) {
  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    filePath,
    setFilePath,
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
     COURSE
  ========================================================= */

  const courseId =
    course?.id;

  /* =========================================================
     GOVERNMENT EXAM CONFIG

     cid 1 -> kerala-psc
     cid 2 -> rrb-ssc
  ========================================================= */

  const governmentConfig =
    getGovernmentExamConfigByCid(
      courseId
    );

  const governmentExamsSlug =
    providedGovernmentExamsSlug ||
    governmentConfig?.slug ||
    "";

  /* =========================================================
     FETCH CATEGORIES
  ========================================================= */

  const fetchCategories =
    useCallback(
      async ({
        showLoader = true,
      } = {}) => {
        if (!courseId) {
          setLoading(false);

          setError(
            "Course information is unavailable."
          );

          return;
        }

        try {
          if (showLoader) {
            setLoading(true);
          }

          setError("");

          const params =
            new URLSearchParams({
              cid:
                String(
                  courseId
                ),

              uid:
                String(
                  uid || ""
                ),
            });

          const response =
            await fetch(
              `/api/exam-category-section?${params.toString()}`,
              {
                method:
                  "GET",

                cache:
                  "no-store",
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
              "Exam category API did not return JSON."
            );
          }

          const result =
            await response.json();

          if (!response.ok) {
            throw new Error(
              result?.message ||
              "Unable to load exam categories."
            );
          }

          const nextCategories =
            Array.isArray(
              result?.data
            )
              ? result.data
              : [];

          setCategories(
            nextCategories
          );

          setFilePath(
            String(
              result?.file_path ??
              ""
            )
          );
        } catch (error) {
          console.error(
            "Unable to fetch exam categories:",
            error
          );

          /*
           * IMPORTANT:
           * Do not clear existing cards here.
           *
           * If the page is restored using
           * browser Back and this request
           * temporarily fails, the old data
           * should remain visible.
           */

          setError(
            error?.message ||
            "Unable to load exam categories."
          );
        } finally {
          setLoading(false);
        }
      },
      [
        courseId,
        uid,
      ]
    );

  /* =========================================================
     INITIAL FETCH
  ========================================================= */

  useEffect(() => {
    queueMicrotask(() => {
      fetchCategories();
    });
  }, [
    fetchCategories,
  ]);

  /* =========================================================
     BACK / FORWARD NAVIGATION FIX

     Re-fetch when browser restores
     this page from history / bfcache.
  ========================================================= */

  useEffect(() => {
    function handlePageShow() {
      fetchCategories({
        showLoader:
          false,
      });
    }

    window.addEventListener(
      "pageshow",
      handlePageShow
    );

    return () => {
      window.removeEventListener(
        "pageshow",
        handlePageShow
      );
    };
  }, [
    fetchCategories,
  ]);

  /* =========================================================
     UI
  ========================================================= */

  return (
    <section
      className="
        relative
        my-5
        w-full
        overflow-hidden
        rounded-[26px]
        border
        border-[#dceaf7]
        bg-gradient-to-br
        from-[#eef8ff]
        via-white
        to-[#f4f9ff]
        px-4
        py-5
        shadow-[0_15px_40px_rgba(15,58,110,0.07)]
        sm:px-5
        sm:py-6
        lg:px-6
        lg:py-7
      "
    >
      {/* DECORATIVE GLOW */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-24
          -top-24
          h-64
          w-64
          rounded-full
          bg-[#00b5e8]/10
          blur-[100px]
        "
      />

      <div
        className="
          relative
          z-10
          grid
          gap-6
          lg:grid-cols-[260px_minmax(0,1fr)]
          xl:grid-cols-[290px_minmax(0,1fr)]
        "
      >
        {/* =================================================
            LEFT
        ================================================== */}

        <div
          className="
            flex
            flex-col
            items-center
            justify-center
            text-center
            lg:items-start
            lg:text-left
          "
        >
          <p
            className="
              text-[10px]
              font-extrabold
              uppercase
              tracking-[0.22em]
              text-[#164fa5]
              sm:text-[11px]
            "
          >
            Take a step closer
          </p>

          <h2
            className="
              mt-2
              text-3xl
              font-black
              leading-[1.05]
              tracking-[-0.035em]
              text-[#0b216c]
              sm:text-4xl
            "
          >
            Choose Your

            <span className="block">
              Preferred Exam
            </span>
          </h2>

          <div
            className="
              mt-3
              h-[3px]
              w-10
              rounded-full
              bg-[#f13873]
            "
          />

          <p
            className="
              mt-4
              max-w-[330px]
              text-[12px]
              leading-6
              text-[#667ca0]
              sm:text-[13px]
              lg:max-w-[270px]
            "
          >
            Select a{" "}
            {course?.exam ||
              governmentConfig?.name ||
              "government"}{" "}
            exam category and explore
            available preparation
            materials, tests and
            learning resources.
          </p>

          <Link
            href={`/dashboard/${governmentExamsSlug}`}
            className="
              group
              mt-5
              inline-flex
              w-fit
              items-center
              justify-center
              gap-3
              rounded-full
              border
              border-[#1976ed]
              bg-white
              px-5
              py-3
              text-[12px]
              font-bold
              text-[#164fa5]
              shadow-[0_6px_18px_rgba(25,118,237,0.08)]
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:bg-[#164fa5]
              hover:text-white
              hover:shadow-[0_10px_24px_rgba(22,79,165,0.18)]
            "
          >
            Check your exams

            <ArrowRight
              className="
                h-4
                w-4
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            />
          </Link>
        </div>

        {/* =================================================
            RIGHT
        ================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-3
            sm:grid-cols-2
            lg:gap-4
          "
        >
          {/* LOADING */}

          {loading &&
            categories.length ===
            0 &&
            Array.from({
              length: 4,
            }).map(
              (_, index) => (
                <div
                  key={
                    index
                  }
                  className="
                    min-h-[180px]
                    animate-pulse
                    rounded-[20px]
                    bg-slate-200
                  "
                />
              )
            )}

          {/* CARDS */}

          {categories.length >
            0 &&
            categories.map(
              (item) => (
                <ExamCategoryCard
                  key={
                    item.id
                  }
                  item={
                    item
                  }
                  filePath={
                    filePath
                  }
                  governmentExamsSlug={
                    governmentExamsSlug
                  }
                />
              )
            )}

          {/* EMPTY */}

          {!loading &&
            !error &&
            categories.length ===
            0 && (
              <div
                className="
                  col-span-full
                  rounded-[20px]
                  border
                  border-slate-200
                  bg-white
                  px-5
                  py-10
                  text-center
                  text-sm
                  text-slate-500
                "
              >
                No exam categories are
                currently available.
              </div>
            )}

          {/* ERROR */}

          {!loading &&
            error &&
            categories.length ===
            0 && (
              <div
                className="
                  col-span-full
                  rounded-[20px]
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
                    text-red-500
                  "
                >
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    fetchCategories()
                  }
                  className="
                    mt-4
                    inline-flex
                    items-center
                    justify-center
                    rounded-full
                    bg-[#164fa5]
                    px-5
                    py-2.5
                    text-[11px]
                    font-bold
                    text-white
                    transition
                    hover:bg-[#0b216c]
                  "
                >
                  Try Again
                </button>
              </div>
            )}
        </div>
      </div>
    </section>
  );
}
