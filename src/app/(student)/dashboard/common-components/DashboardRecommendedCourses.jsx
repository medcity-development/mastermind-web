import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
} from "lucide-react";

export default function DashboardRecommendedCourses({
  config,
}) {
  if (!config) {
    return null;
  }

  const isRrb =
    config.slug === "rrb-ssc";

  const courses =
    isRrb
      ? [
          {
            id: 1,
            title:
              "RRB NTPC Complete Course",
          },
          {
            id: 2,
            title:
              "SSC CGL Complete Course",
          },
          {
            id: 3,
            title:
              "SSC CHSL Preparation",
          },
          {
            id: 4,
            title:
              "RRB Group D",
          },
        ]
      : [
          {
            id: 1,
            title:
              "Mission LDC 2026-27",
          },
          {
            id: 2,
            title:
              "Kerala PSC Staff Nurse",
          },
          {
            id: 3,
            title:
              "Civil Police Officer",
          },
          {
            id: 4,
            title:
              "Secretariat Assistant",
          },
          {
            id: 5,
            title:
              "Lower Division Clerk",
          },
          {
            id: 6,
            title:
              "Degree Level Prelims",
          },
        ];

  const fallbackImage =
    isRrb
      ? "/assets/rrb-ssc-coaching.webp"
      : "/assets/kerala-psc-coaching.webp";

  return (
    <section
      className="
        rounded-[24px]
        border
        border-[#f4e9ef]
        bg-gradient-to-br
        from-[#fff9fb]
        via-white
        to-[#f8fbff]
        p-5
        shadow-[0_16px_45px_rgba(15,23,42,0.05)]
        sm:p-6
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
          gap-4
        "
      >
        <div>
          <p
            className="
              text-[8px]
              font-bold
              uppercase
              tracking-[0.14em]
              text-[#ff5c8a]
            "
          >
            Popular Learning Paths
          </p>

          <h2
            className="
              mt-1
              text-[21px]
              font-extrabold
              tracking-[-0.03em]
              text-[#071b59]
            "
          >
            Recommended Courses for You
          </h2>

          <p
            className="
              mt-1
              text-[10px]
              text-slate-400
            "
          >
            Based on your interests and
            learning goals
          </p>
        </div>

        <Link
          href={`${config.basePath}/recommended-courses`}
          className="
            hidden
            items-center
            gap-2
            rounded-full
            border
            border-blue-200
            px-4
            py-2
            text-[9px]
            font-bold
            text-blue-600
            sm:inline-flex
          "
        >
          View All Courses

          <ArrowRight
            size={12}
          />
        </Link>
      </div>

      <div
        className="
          mt-5
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        {courses.map(
          (course) => (
            <article
              key={course.id}
              className="
                overflow-hidden
                rounded-[17px]
                border
                border-slate-100
                bg-white
                p-3
                shadow-[0_8px_25px_rgba(15,23,42,0.04)]
                transition-all
                duration-300

                hover:-translate-y-1
                hover:shadow-[0_15px_35px_rgba(15,23,42,0.08)]
              "
            >
              <div
                className="
                  relative
                  h-[115px]
                  overflow-hidden
                  rounded-[13px]
                  bg-[#eef5ff]
                "
              >
                <Image
                  src={fallbackImage}
                  alt={course.title}
                  fill
                  sizes="300px"
                  className="
                    object-cover
                  "
                />
              </div>

              <div className="pt-3">
                <p
                  className="
                    text-[7px]
                    font-bold
                    uppercase
                    tracking-[0.1em]
                    text-blue-500
                  "
                >
                  {config.shortName}
                </p>

                <h3
                  className="
                    mt-1
                    line-clamp-2
                    min-h-[32px]
                    text-[11px]
                    font-bold
                    leading-4
                    text-[#071b59]
                  "
                >
                  {course.title}
                </h3>

                <p
                  className="
                    mt-1
                    text-[8px]
                    text-slate-400
                  "
                >
                  {config.name}
                </p>

                <Link
                  href={`${config.basePath}/recommended-courses`}
                  className="
                    mt-3
                    flex
                    h-[34px]
                    items-center
                    justify-between
                    rounded-[9px]
                    bg-[#eff6ff]
                    px-3
                    text-[9px]
                    font-bold
                    text-blue-600
                    transition

                    hover:bg-blue-600
                    hover:text-white
                  "
                >
                  Explore Course

                  <ArrowRight
                    size={11}
                  />
                </Link>
              </div>
            </article>
          )
        )}
      </div>
    </section>
  );
}