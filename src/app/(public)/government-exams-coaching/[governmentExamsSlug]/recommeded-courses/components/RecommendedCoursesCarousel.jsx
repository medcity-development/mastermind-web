"use client";

import { useRef } from "react";

import RecommendedCourseCard from "./RecommendedCourseCard";
import RecommendedCoursesHeader from "./RecommendedCoursesHeader";

export default function RecommendedCoursesCarousel({
  courses,
  cid,
  examName,
  governmentExamsSlug,
}) {
  const trackRef = useRef(null);

  function scrollCourses(direction) {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const firstCard = track.firstElementChild;
    const cardWidth =
      firstCard?.getBoundingClientRect().width ?? track.clientWidth;

    track.scrollBy({
      left: direction * (cardWidth + 16),
      behavior: "smooth",
    });
  }

  return (
    <>
      <RecommendedCoursesHeader
        onPrevious={() => scrollCourses(-1)}
        onNext={() => scrollCourses(1)}
        viewAllHref={`/government-exams-coaching/${governmentExamsSlug}/recommended-courses`}
      />

      <div
        ref={trackRef}
        className="
          mt-5
          flex
          snap-x
          snap-mandatory
          gap-4
          overflow-x-auto
          scroll-smooth
          overscroll-x-contain
          pb-2
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
        aria-label="Recommended courses"
      >
        {courses.map((course) => (
          <div
            key={`${cid}-${course.id}`}
            className="
              w-full
              shrink-0
              snap-start
              sm:w-[calc(50%_-_0.5rem)]
              lg:w-[calc(33.333%_-_0.667rem)]
              xl:w-[calc(25%_-_0.75rem)]
            "
          >
            <RecommendedCourseCard
              course={course}
              cid={cid}
              governmentExamsSlug={governmentExamsSlug}
              examName={examName}
            />
          </div>
        ))}
      </div>
    </>
  );
}
