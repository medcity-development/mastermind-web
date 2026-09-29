import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  Play,
} from "lucide-react";

export default function ContinueLearning({
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
            title: "RRB NTPC",
            progress: 68,
            image:
              "/assets/rrb-ssc-coaching.webp",
          },
          {
            id: 2,
            title: "SSC CGL",
            progress: 42,
            image:
              "/assets/rrb-ssc-coaching.webp",
          },
          {
            id: 3,
            title: "SSC CHSL",
            progress: 26,
            image:
              "/assets/rrb-ssc-coaching.webp",
          },
        ]
      : [
          {
            id: 1,
            title:
              "10th Level Exams",
            progress: 68,
            image:
              "/assets/kerala-psc-coaching.webp",
          },
          {
            id: 2,
            title:
              "12th Level Exams",
            progress: 42,
            image:
              "/assets/kerala-psc-coaching.webp",
          },
          {
            id: 3,
            title:
              "Degree Level Exams",
            progress: 26,
            image:
              "/assets/kerala-psc-coaching.webp",
          },
        ];

  return (
    <section
      className="
        rounded-[24px]
        border
        border-slate-100
        bg-white
        p-5
        shadow-[0_16px_45px_rgba(15,23,42,0.05)]
        sm:p-6
      "
    >
      {/* Header */}
      <div
        className="
          flex
          items-center
          justify-between
          gap-4
        "
      >
        <div>
          <h2
            className="
              text-[21px]
              font-extrabold
              tracking-[-0.03em]
              text-[#071b59]
            "
          >
            Continue Learning
          </h2>

          <p
            className="
              mt-1
              text-[10px]
              text-slate-400
            "
          >
            Pick up where you left off
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
            bg-white
            px-4
            py-2
            text-[9px]
            font-bold
            text-blue-600
            transition

            hover:bg-blue-50

            sm:inline-flex
          "
        >
          View My Courses

          <ArrowRight
            size={12}
          />
        </Link>
      </div>

      {/* Cards */}
      <div
        className="
          mt-5
          grid
          gap-4
          md:grid-cols-3
        "
      >
        {courses.map(
          (course) => (
            <article
              key={course.id}
              className="
                overflow-hidden
                rounded-[18px]
                border
                border-slate-100
                bg-white
                shadow-[0_10px_30px_rgba(15,23,42,0.05)]
              "
            >
              <div
                className="
                  relative
                  h-[140px]
                  overflow-hidden
                  bg-[#071b59]
                "
              >
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="
                    object-cover
                    transition-transform
                    duration-500
                    hover:scale-105
                  "
                />

                <div
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-black/55
                    via-black/10
                    to-transparent
                  "
                />

                <span
                  className="
                    absolute
                    bottom-3
                    right-3
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    bg-white
                    text-[#071b59]
                    shadow-lg
                  "
                >
                  <Play
                    size={14}
                    fill="currentColor"
                  />
                </span>
              </div>

              <div className="p-4">
                <h3
                  className="
                    text-[12px]
                    font-bold
                    text-[#071b59]
                  "
                >
                  {course.title}
                </h3>

                <p
                  className="
                    mt-1
                    text-[9px]
                    text-slate-400
                  "
                >
                  {config.name}
                </p>

                {/* Progress */}
                <div
                  className="
                    mt-4
                    flex
                    items-center
                    gap-3
                  "
                >
                  <div
                    className="
                      h-[5px]
                      flex-1
                      overflow-hidden
                      rounded-full
                      bg-[#e9eef7]
                    "
                  >
                    <div
                      className="
                        h-full
                        rounded-full
                        bg-gradient-to-r
                        from-[#1683ff]
                        to-[#00b5e8]
                      "
                      style={{
                        width:
                          `${course.progress}%`,
                      }}
                    />
                  </div>

                  <span
                    className="
                      min-w-[25px]
                      text-right
                      text-[8px]
                      font-bold
                      text-slate-400
                    "
                  >
                    {course.progress}%
                  </span>
                </div>

                <button
                  type="button"
                  className="
                    mt-4
                    flex
                    h-[39px]
                    w-full
                    items-center
                    justify-between
                    rounded-[10px]
                    bg-gradient-to-r
                    from-[#0874ed]
                    to-[#099cf7]
                    px-4
                    text-[10px]
                    font-bold
                    text-white
                    shadow-[0_8px_20px_rgba(8,116,237,0.18)]
                    transition

                    hover:-translate-y-0.5
                  "
                >
                  Continue

                  <ArrowRight
                    size={13}
                  />
                </button>
              </div>
            </article>
          )
        )}
      </div>
    </section>
  );
}