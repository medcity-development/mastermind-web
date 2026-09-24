import {
  getHomeResponses,
} from "@/lib/homeResponsesHelper";

import RecommendedCoursesHeader from "./RecommendedCoursesHeader";

import RecommendedCourseCard from "./RecommendedCourseCard";

import ReferAndEarnCard from "./ReferAndEarnCard";

import RecommendedStats from "./RecommendedStats";

export default async function RecommendedCoursesSection({
  cid,
  examName,
  shortName,
  governmentExamsSlug,
}) {
  const result =
    await getHomeResponses({
      uid: 0,
      cid,
    });

  const courses =
    Array.isArray(
      result?.subExams
    )
      ? result.subExams
      : [];

  return (
    <section
      className="
        relative
        my-5
        w-full
        overflow-hidden
        rounded-[26px]
        border
        border-[#dfeaf6]
        bg-gradient-to-br
        from-white
        via-[#fbfdff]
        to-[#f3f8ff]
        px-4
        py-5
        shadow-[0_14px_40px_rgba(15,58,110,0.06)]
        sm:px-5
        sm:py-6
        lg:px-6
      "
    >
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
          bg-[#00b5e8]/[0.06]
          blur-[90px]
        "
      />

      <div className="relative z-10">
        <RecommendedCoursesHeader
          examName={
            examName
          }
          shortName={
            shortName
          }
          totalCourses={
            courses.length
          }
        />

        {courses.length >
        0 ? (
          <div
            className="
              mt-5
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
            "
          >
            {courses.map(
              (course) => (
                <RecommendedCourseCard
                  key={
                    `${cid}-${course.id}`
                  }
                  course={
                    course
                  }
                  cid={
                    cid
                  }
                  governmentExamsSlug={
                    governmentExamsSlug
                  }
                  examName={
                    examName
                  }
                />
              )
            )}
          </div>
        ) : (
          <div
            className="
              mt-5
              rounded-[22px]
              border
              border-[#dce8f7]
              bg-white
              px-5
              py-14
              text-center
            "
          >
            <p
              className="
                text-sm
                font-black
                text-[#102c5c]
              "
            >
              No recommended{" "}
              {examName}{" "}
              courses found.
            </p>
          </div>
        )}

        <div
          className="
            mt-4
            grid
            gap-4
            lg:grid-cols-[minmax(0,1fr)_260px]
          "
        >
          <ReferAndEarnCard />

          <RecommendedStats
            totalCourses={
              courses.length
            }
            examName={
              examName
            }
          />
        </div>
      </div>
    </section>
  );
}