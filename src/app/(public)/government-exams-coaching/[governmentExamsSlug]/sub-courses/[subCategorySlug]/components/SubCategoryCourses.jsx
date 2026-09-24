"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  BookOpen,
  LoaderCircle,
} from "lucide-react";

import SubCategoryCourseCard from "./SubCategoryCourseCard";

export default function SubCategoryCourses({
  cid = 1,
  subId,
  subCategorySlug,
}) {
  const [
    courses,
    setCourses,
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

  useEffect(() => {
    if (!subId) {
      setCourses([]);
      setLoading(false);

      return;
    }

    let cancelled =
      false;

    async function loadCourses() {
      try {
        setLoading(true);
        setError("");

        const params =
          new URLSearchParams({
            cid:
              String(cid),

            subId:
              String(subId),

            uid: "0",
          });

        const response =
          await fetch(
            `/api/sub-exams?${params.toString()}`,
            {
              cache:
                "no-store",
            }
          );

        const result =
          await response.json();

        console.log(
          "SUB CATEGORY COURSES:",
          result
        );

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Unable to load courses."
          );
        }

        if (cancelled) {
          return;
        }

        /*
         * Your existing /api/sub-exams
         * response appears to return:
         *
         * {
         *   status,
         *   iconPath,
         *   data
         * }
         */

        setCourses(
          Array.isArray(
            result?.data
          )
            ? result.data
            : []
        );

        setFilePath(
          result?.iconPath ||
            result?.icon_path ||
            ""
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Sub category courses:",
          error
        );

        setCourses([]);

        setError(
          error?.message ||
            "Unable to load courses."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCourses();

    return () => {
      cancelled = true;
    };
  }, [
    cid,
    subId,
  ]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <section
        className="
          mt-8
          flex
          min-h-[250px]
          items-center
          justify-center
          rounded-[26px]
          border
          border-[#dce8f7]
          bg-white
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
            size={27}
            className="
              animate-spin
              text-[#075fc8]
            "
          />

          <p
            className="
              text-xs
              font-semibold
              text-slate-500
            "
          >
            Loading courses...
          </p>
        </div>
      </section>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <div
        className="
          mt-8
          rounded-[22px]
          border
          border-red-100
          bg-red-50
          p-6
          text-center
          text-sm
          font-semibold
          text-red-500
        "
      >
        {error}
      </div>
    );
  }

  return (
    <section className="mt-10">
      {/* HEADER */}

      <div
        className="
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
              font-black
              uppercase
              tracking-[0.18em]
              text-[#017dc0]
            "
          >
            Available Courses
          </p>

          <h2
            className="
              mt-2
              text-2xl
              font-black
              text-[#071f55]
              sm:text-3xl
            "
          >
            Choose your Course
          </h2>

          <p
            className="
              mt-2
              text-sm
              text-slate-500
            "
          >
            Select a course to access
            all available preparation
            resources.
          </p>
        </div>

        <span
          className="
            w-fit
            rounded-full
            bg-[#eaf4ff]
            px-4
            py-2
            text-[11px]
            font-bold
            text-[#075fc8]
          "
        >
          {courses.length}{" "}
          {courses.length === 1
            ? "Course"
            : "Courses"}
        </span>
      </div>

      {/* COURSES */}

      {courses.length >
      0 ? (
        <div
          className="
            mt-7
            grid
            grid-cols-1
            gap-5
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
          "
        >
          {courses.map(
            (course) => (
              <SubCategoryCourseCard
                key={
                  course.id
                }
                course={
                  course
                }
                cid={cid}
                subId={
                  subId
                }
                subCategorySlug={
                  subCategorySlug
                }
                filePath={
                  filePath
                }
              />
            )
          )}
        </div>
      ) : (
        <div
          className="
            mt-7
            rounded-[24px]
            border
            border-dashed
            border-[#cbdbea]
            bg-white
            px-6
            py-14
            text-center
          "
        >
          <BookOpen
            size={27}
            className="
              mx-auto
              text-[#087bea]
            "
          />

          <h3
            className="
              mt-3
              text-sm
              font-black
              text-[#071f55]
            "
          >
            No courses available
          </h3>
        </div>
      )}
    </section>
  );
}