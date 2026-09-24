"use client";

import {
  useEffect,
  useState,
} from "react";

import MainCourseCard from "./MainCourseCard";

const courseContent = {
  1: {
    href: "/government-exams-coaching/kerala-psc",
    points: [
      "Topic-wise Study Materials",
      "Previous Year Questions",
      "Mock Tests & Model Exams",
      "Expert Guidance",
    ],
  },

  2: {
    href: "/rrb-ssc-exams-coaching",
    points: [
      "Comprehensive Study Notes",
      "Previous Year Questions",
      "Mock Tests & Practice Sets",
      "Latest Exam Updates",
    ],
  },
};

export default function MainCoursesGrid() {
  const [courses, setCourses] =
    useState([]);

  const [filePath, setFilePath] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function fetchCourses() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            "/api/main-courses",
            {
              method: "GET",
              cache: "no-store",
            }
          );

        const result =
          await response.json();

        console.log(
          "MAIN COURSES API:",
          result
        );

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Failed to fetch courses."
          );
        }

        if (!mounted) {
          return;
        }

        
        setCourses(
          Array.isArray(result?.data)
            ? result.data
            : []
        );

        setFilePath(
          result?.file_path || ""
        );
      } catch (error) {
        console.error(
          "Course loading error:",
          error
        );

        if (mounted) {
          setError(
            "Unable to load courses."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchCourses();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div
        className="
          grid
          gap-5
          md:grid-cols-2
        "
      >
        {[1, 2].map((item) => (
          <div
            key={item}
            className="
              min-h-[390px]
              animate-pulse
              rounded-[26px]
              bg-[#edf4fb]
            "
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="
          rounded-2xl
          border
          border-red-200
          bg-red-50
          p-5
          text-sm
          text-red-600
        "
      >
        {error}
      </div>
    );
  }

  if (!courses.length) {
    return (
      <div
        className="
          rounded-2xl
          border
          border-[#dbe7f4]
          bg-white
          p-6
          text-center
          text-sm
          text-slate-500
        "
      >
        No courses available.
      </div>
    );
  }

  return (
    <div
      className="
        grid
        gap-5
        md:grid-cols-2
      "
    >
      {courses.map((course) => {
        const extra =
          courseContent[
            Number(course.id)
          ] || {};

        return (
          <MainCourseCard
            key={course.id}
            course={course}
            filePath={filePath}
            href={
              extra.href ||
              "/main-courses"
            }
            points={
              extra.points || []
            }
          />
        );
      })}
    </div>
  );
}