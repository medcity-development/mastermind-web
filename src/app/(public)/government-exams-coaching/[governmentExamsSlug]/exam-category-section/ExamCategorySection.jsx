"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowRight,
} from "lucide-react";

import ExamCategoryCard from "./ExamCategoryCard";

export default function ExamCategorySection({
  course,
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

  const courseId =
    course?.id;

  /* =========================================================
     FETCH SUBCATEGORIES
  ========================================================= */

  useEffect(() => {
    if (!courseId) {
      setLoading(false);

      setError(
        "Course information is unavailable."
      );

      return;
    }

    let cancelled = false;

    async function fetchCategories() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `/api/exam-category-section?cid=${encodeURIComponent(
              courseId
            )}&uid=0`,
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

        if (cancelled) {
          return;
        }

        setCategories(
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
          "Unable to fetch exam categories:",
          error
        );

        setCategories([]);
        setFilePath("");

        setError(
          "Unable to load exam categories."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchCategories();

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  /* =========================================================
     UI
  ========================================================= */

  return (
    <section
      className="
        relative
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
        lg:py-7 my-5
      "
    >
      {/* Decorative glow */}
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

    {/* Left content */}
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
      lg:text-left
    "
  >
    Choose Your
    <span className="block">
      Preferred Exam
    </span>
  </h2>

  {/* Accent */}
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
    Select a {course?.exam} exam
    category and explore available
    preparation materials, tests
    and learning resources.
  </p>

  <Link
    href="/main-courses"
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
    View All Exams

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
          {/* Loading */}

          {loading &&
            Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="
                  min-h-[180px]
                  animate-pulse
                  rounded-[20px]
                  bg-slate-200
                "
              />
            ))}

          {/* Cards */}

          {!loading &&
            !error &&
            categories.map(
              (item) => (
                <ExamCategoryCard
                key={item.id}
                item={item}
                filePath={filePath}
                courseId={courseId}
              />
              )
            )}

          {/* Empty */}

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

          {/* Error */}

          {!loading &&
            error && (
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
                  text-sm
                  text-red-500
                "
              >
                {error}
              </div>
            )}
        </div>
      </div>
    </section>
  );
}