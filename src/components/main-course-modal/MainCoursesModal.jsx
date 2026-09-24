"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  createPortal,
} from "react-dom";

import {
  useRouter,
} from "next/navigation";

import {
  X,
} from "lucide-react";

import CourseOptionCard from "./CourseOptionCard";
import ModalFooter from "./ModalFooter";
import ModalHeader from "./ModalHeader";

import {
  getGovernmentExamConfigByCid,
} from "@/lib/governmentExamConfig";

/* =========================================================
   CLEAN DESTINATION PATH
========================================================= */

function cleanDestinationPath(
  value
) {
  return String(
    value ?? ""
  )
    .trim()
    .replace(
      /^\/+/,
      ""
    )
    .replace(
      /\/+$/,
      ""
    );
}

/* =========================================================
   BUILD BASE PATH
========================================================= */

function buildGovernmentExamBasePath(
  slug
) {
  if (!slug) {
    return "";
  }

  return `/government-exams-coaching/${slug}`;
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function MainCoursesModal({
  open,
  onClose,
  destinationPath = "",
}) {
  const router =
    useRouter();

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
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  /* =====================================================
     FETCH MAIN COURSES
  ===================================================== */

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function fetchMainCourses() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            "/api/main-courses"
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Unable to fetch main courses."
          );
        }

        if (cancelled) {
          return;
        }

        setCourses(
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
          "Unable to fetch main courses:",
          error
        );

        setCourses([]);

        setFilePath("");

        setError(
          error?.message ||
            "Unable to load courses right now."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchMainCourses();

    return () => {
      cancelled = true;
    };
  }, [open]);

  /* =====================================================
     LOCK BODY SCROLL
  ===================================================== */

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [open]);

  /* =====================================================
     CLOSE WITH ESC
  ===================================================== */

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(
      event
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    open,
    onClose,
  ]);

  /* =====================================================
     COURSE CLICK
  ===================================================== */

  function handleCourseClick(
    event,
    course
  ) {
    event?.preventDefault?.();

    const courseId =
      Number(
        course?.id || 0
      );

    const config =
      getGovernmentExamConfigByCid(
        courseId
      );

    if (!config) {
      console.error(
        "Government exam config not found:",
        {
          courseId,
          course,
        }
      );

      return;
    }

    /* =========================================
       BUILD DYNAMIC BASE PATH

       cid 1:
       /government-exams-coaching/kerala-psc

       cid 2:
       /government-exams-coaching/rrb-ssc
    ========================================= */

    const basePath =
      buildGovernmentExamBasePath(
        config.slug
      );

    if (!basePath) {
      return;
    }

    const destination =
      cleanDestinationPath(
        destinationPath
      );

    /* =========================================
       MAIN COURSE CLICK
    ========================================= */

    if (!destination) {
      onClose();

      router.push(
        basePath
      );

      return;
    }

    /* =========================================
       SECTION NAVIGATION

       destination = notifications

       PSC:
       /government-exams-coaching/kerala-psc/notifications

       RRB:
       /government-exams-coaching/rrb-ssc/notifications
    ========================================= */

    const targetUrl =
      `${basePath}/${destination}`;

    onClose();

    router.push(
      targetUrl
    );
  }

  /* =====================================================
     DON'T RENDER WHEN CLOSED
  ===================================================== */

  if (!open) {
    return null;
  }

  /* =====================================================
     MODAL
  ===================================================== */

  const modal = (
    <div
      className="
        fixed
        inset-0
        z-[99999]
        flex
        items-center
        justify-center
        overflow-y-auto
        bg-[#061730]/65
        px-3
        py-5
        backdrop-blur-[7px]
        sm:px-5
        sm:py-7
      "
      onClick={
        onClose
      }
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="main-courses-title"
        onClick={(
          event
        ) =>
          event.stopPropagation()
        }
        className="
          relative
          my-auto
          w-full
          max-w-[680px]
          overflow-hidden
          rounded-[24px]
          border
          border-white/60
          bg-white
          shadow-[0_35px_120px_rgba(0,25,70,0.35)]
          sm:rounded-[30px]
        "
      >
        {/* BACKGROUND */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-br
            from-white
            via-white
            to-[#f7fbff]
          "
        />

        {/* TOP GLOW */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-24
            -top-24
            h-72
            w-72
            rounded-full
            bg-[#00b5e8]/10
            blur-[80px]
          "
        />

        {/* BOTTOM GLOW */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -bottom-28
            -left-24
            h-64
            w-64
            rounded-full
            bg-[#164fa5]/[0.06]
            blur-[90px]
          "
        />

        {/* CLOSE BUTTON */}

        <button
          type="button"
          onClick={
            onClose
          }
          aria-label="Close main courses"
          className="
            absolute
            right-4
            top-4
            z-30
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            border
            border-[#164fa5]/[0.06]
            bg-white/90
            text-[#0b216c]
            shadow-[0_6px_18px_rgba(22,79,165,0.08)]
            backdrop-blur
            transition-all
            duration-300
            hover:rotate-90
            hover:bg-[#edf6ff]
            sm:right-5
            sm:top-5
            sm:h-10
            sm:w-10
          "
        >
          <X
            size={18}
          />
        </button>

        {/* CONTENT */}

        <div
          className="
            relative
            z-10
            px-4
            pb-5
            pt-6
            sm:px-7
            sm:pb-7
            sm:pt-8
            md:px-8
          "
        >
          <ModalHeader />

          {/* LOADING */}

          {loading && (
            <CourseLoadingSkeleton />
          )}

          {/* ERROR */}

          {!loading &&
            error && (
              <div
                className="
                  mt-6
                  rounded-2xl
                  border
                  border-red-100
                  bg-red-50
                  px-5
                  py-5
                  text-center
                "
              >
                <p
                  className="
                    text-[13px]
                    font-medium
                    text-red-600
                  "
                >
                  {error}
                </p>
              </div>
            )}

          {/* COURSES */}

          {!loading &&
            !error &&
            courses.length >
              0 && (
              <div
                className="
                  mt-6
                  grid
                  grid-cols-1
                  gap-4
                  sm:grid-cols-2
                "
              >
                {courses.map(
                  (
                    course
                  ) => (
                    <CourseOptionCard
                      key={
                        course?.id
                      }
                      course={
                        course
                      }
                      filePath={
                        filePath
                      }
                      onClick={(
                        event
                      ) =>
                        handleCourseClick(
                          event,
                          course
                        )
                      }
                    />
                  )
                )}
              </div>
            )}

          {/* EMPTY */}

          {!loading &&
            !error &&
            courses.length ===
              0 && (
              <div
                className="
                  mt-6
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-5
                  py-6
                  text-center
                "
              >
                <p
                  className="
                    text-[13px]
                    text-slate-500
                  "
                >
                  No courses are
                  currently
                  available.
                </p>
              </div>
            )}

          <ModalFooter />
        </div>
      </div>
    </div>
  );

  return createPortal(
    modal,
    document.body
  );
}

/* =========================================================
   LOADING SKELETON
========================================================= */

function CourseLoadingSkeleton() {
  return (
    <div
      className="
        mt-6
        grid
        grid-cols-1
        gap-4
        sm:grid-cols-2
      "
    >
      {[1, 2].map(
        (item) => (
          <div
            key={item}
            className="
              min-h-[210px]
              animate-pulse
              rounded-[22px]
              border
              border-slate-100
              bg-slate-50
              p-5
            "
          >
            <div
              className="
                h-[58px]
                w-[58px]
                rounded-[17px]
                bg-slate-200
              "
            />

            <div
              className="
                mt-4
                h-5
                w-28
                rounded
                bg-slate-200
              "
            />

            <div
              className="
                mt-3
                h-3
                w-full
                rounded
                bg-slate-200
              "
            />

            <div
              className="
                mt-2
                h-3
                w-[70%]
                rounded
                bg-slate-200
              "
            />
          </div>
        )
      )}
    </div>
  );
}