import {
    BookOpen,
    GraduationCap,
  } from "lucide-react";
  
  export default function PackageCoursesSection({
    courses = [],
  }) {
    if (
      !Array.isArray(courses) ||
      courses.length === 0
    ) {
      return null;
    }
  
    return (
      <section
        className="
          relative
          overflow-hidden
          rounded-[24px]
          bg-gradient-to-r
          from-[#071936]
          via-[#164fa5]
          to-[#017cc0]
          p-5
          text-white
          shadow-[0_16px_40px_rgba(7,25,54,0.14)]
          sm:p-6
        "
      >
        {/* GRID BACKGROUND */}
        <div
          aria-hidden="true"
          className="
            absolute
            inset-0
            opacity-[0.05]
            [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
            [background-size:30px_30px]
          "
        />
  
        <div className="relative z-10">
          {/* HEADER */}
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-[13px]
                border
                border-white/10
                bg-white/10
              "
            >
              <GraduationCap
                size={18}
              />
            </div>
  
            <div>
              <p
                className="
                  text-[8px]
                  font-black
                  uppercase
                  tracking-[0.14em]
                  text-blue-200
                "
              >
                Included Courses
              </p>
  
              <h2
                className="
                  mt-0.5
                  text-xl
                  font-black
                "
              >
                Courses in this Plan
              </h2>
            </div>
          </div>
  
          {/* COURSES */}
          <div
            className="
              mt-5
              grid
              grid-cols-1
              gap-3
              md:grid-cols-2
            "
          >
            {courses.map(
              (course, index) => (
                <div
                  key={
                    course?.id ??
                    `${course?.title}-${index}`
                  }
                  className="
                    group
                    flex
                    items-center
                    gap-3
                    rounded-[16px]
                    border
                    border-white/10
                    bg-white/10
                    px-4
                    py-4
                    backdrop-blur-sm
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:bg-white/15
                  "
                >
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-[12px]
                      bg-white/10
                      text-blue-100
                    "
                  >
                    <BookOpen
                      size={16}
                    />
                  </div>
  
                  <div>
                    <p
                      className="
                        text-[8px]
                        font-bold
                        uppercase
                        tracking-[0.1em]
                        text-blue-200
                      "
                    >
                      Course
                    </p>
  
                    <p
                      className="
                        mt-0.5
                        text-[12px]
                        font-black
                        leading-5
                        text-white
                      "
                    >
                      {course?.title}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>
    );
  }