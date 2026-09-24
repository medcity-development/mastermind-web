import {
  BookOpen,
  CheckCircle2,
} from "lucide-react";

function getCourseTitle(
  course
) {
  if (
    typeof course ===
    "string"
  ) {
    return course;
  }

  return (
    course?.exam ||
    course?.exam_name ||
    course?.name ||
    course?.title ||
    course?.course ||
    "Included Course"
  );
}

export default function PackageCoursesSection({
  courses = [],
}) {
  const courseList =
    Array.isArray(courses)
      ? courses
      : [];

  if (!courseList.length) {
    return null;
  }

  return (
    <section
      className="
        relative
        mt-8
        overflow-hidden
        rounded-[28px]
        border
        border-[#dfe9f4]
        bg-white
        p-6
        shadow-[0_18px_45px_rgba(15,58,110,0.07)]
        sm:p-8
      "
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-20
          -top-20
          h-64
          w-64
          rounded-full
          bg-[#00b5e8]/10
          blur-[90px]
        "
      />

      <div className="relative z-10">
        {/* HEADER */}

        <div
          className="
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-[16px]
                bg-[#edf6ff]
                text-[#164fa5]
              "
            >
              <BookOpen
                size={22}
              />
            </div>

            <div>
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-[#f13873]
                "
              >
                Course Access
              </p>

              <h2
                className="
                  mt-1
                  text-2xl
                  font-black
                  tracking-[-0.03em]
                  text-[#0b216c]
                "
              >
                Included Courses
              </h2>

              <p
                className="
                  mt-1
                  text-[12px]
                  text-slate-500
                "
              >
                Get access to the
                courses included in
                this package.
              </p>
            </div>
          </div>

          <span
            className="
              w-fit
              rounded-full
              bg-[#edf7ff]
              px-4
              py-2
              text-[11px]
              font-bold
              text-[#075fc8]
            "
          >
            {courseList.length}{" "}
            {courseList.length ===
            1
              ? "Course"
              : "Courses"}
          </span>
        </div>

        {/* COURSES */}

        <div
          className="
            mt-7
            grid
            gap-4
            sm:grid-cols-2
            lg:grid-cols-3
          "
        >
          {courseList.map(
            (
              course,
              index
            ) => {
              const title =
                getCourseTitle(
                  course
                );

              return (
                <article
                  key={`${title}-${index}`}
                  className="
                    group
                    flex
                    items-center
                    gap-4
                    rounded-[20px]
                    border
                    border-[#dce8f4]
                    bg-gradient-to-br
                    from-white
                    to-[#f8fbff]
                    p-5
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-[#bfd7ee]
                    hover:shadow-[0_15px_35px_rgba(15,58,110,0.10)]
                  "
                >
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-[15px]
                      bg-[#edf6ff]
                      text-[#164fa5]
                    "
                  >
                    <BookOpen
                      size={20}
                    />
                  </div>

                  <div
                    className="
                      min-w-0
                      flex-1
                    "
                  >
                    <p
                      className="
                        text-[9px]
                        font-black
                        uppercase
                        tracking-[0.12em]
                        text-[#087bea]
                      "
                    >
                      Included Course
                    </p>

                    <h3
                      className="
                        mt-1
                        text-[15px]
                        font-black
                        leading-6
                        text-[#172c50]
                      "
                    >
                      {title}
                    </h3>
                  </div>

                  <div
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-[#e8f8ef]
                      text-[#16824f]
                    "
                  >
                    <CheckCircle2
                      size={17}
                    />
                  </div>
                </article>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}