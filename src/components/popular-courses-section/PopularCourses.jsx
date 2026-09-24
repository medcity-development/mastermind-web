"use client";

import { useState } from "react";

import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Layers3,
  Shield,
  TrainFront,
} from "lucide-react";

import MainCoursesModal from "@/components/main-course-modal/MainCoursesModal";

const courses = [
  {
    title: "Kerala PSC\nDegree Level",
    description:
      "Complete preparation for Kerala PSC Degree Level Exams.",
    classes: "120+ Classes",
    icon: Shield,
    gradient:
      "from-[#0756de] to-[#3679ef]",
  },
  {
    title: "Kerala PSC\n10th Level",
    description:
      "Complete preparation for Kerala PSC 10th Level Exams.",
    classes: "100+ Classes",
    icon: GraduationCap,
    gradient:
      "from-[#5439d9] to-[#9559f4]",
  },
  {
    title: "SSC\nExams",
    description:
      "SSC CGL, CHSL, MTS & other SSC Examinations preparation.",
    classes: "150+ Classes",
    icon: BookOpen,
    gradient:
      "from-[#178b48] to-[#37bd78]",
  },
  {
    title: "RRB\nExams",
    description:
      "RRB NTPC, Group D & other RRB Examinations preparation.",
    classes: "120+ Classes",
    icon: TrainFront,
    gradient:
      "from-[#ed7800] to-[#ffa537]",
  },
  {
    title: "Combo\nCourses",
    description:
      "Special combined course for multiple competitive exams.",
    classes: "200+ Classes",
    icon: Layers3,
    gradient:
      "from-[#df2752] to-[#fb517b]",
  },
];

export default function PopularCourses() {
  const [
    showMainCourses,
    setShowMainCourses,
  ] = useState(false);

  return (
    <>
      <section className="bg-white py-15">
        <div
          data-aos="fade-up"
          className="
            mx-auto
            max-w-9xl
            px-5
            sm:px-6
            md:px-10
            lg:px-16
            xl:px-20
          "
        >
          {/* Header */}
          <div
            className="
              mb-5
              flex
              items-end
              justify-between
              gap-4
            "
          >
            <div>
              <p
                className="
                  mb-1
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-blue-600
                "
              >
                Popular Courses
              </p>

              <h2
                className="
                  text-2xl
                  font-bold
                  text-[#111a57]
                  sm:text-3xl
                "
              >
                Our{" "}
                <span className="text-blue-600">
                  Popular Courses
                </span>
              </h2>
            </div>

            {/* Desktop View All */}
            <button
              type="button"
              onClick={() =>
                setShowMainCourses(true)
              }
              className="
                hidden
                items-center
                gap-2
                rounded-lg
                border
                border-blue-500
                px-5
                py-2.5
                text-sm
                font-semibold
                text-blue-700
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-blue-50
                hover:shadow-sm
                sm:flex
              "
            >
              View All Courses

              <ArrowRight size={16} />
            </button>
          </div>

          {/* Course grid */}
          <div
            className="
              grid
              grid-cols-1
              gap-2
              sm:grid-cols-2
              xl:grid-cols-5
            "
          >
            {courses.map(
              (course, index) => {
                const Icon =
                  course.icon;

                return (
                  <div
                    key={course.title}
                    className={`
                      group
                      relative
                      flex
                      min-h-[215px]
                      flex-col
                      overflow-hidden
                      rounded-xl
                      bg-gradient-to-br
                      ${course.gradient}
                      p-5
                      text-white
                      shadow-md
                      transition-all
                      duration-300

                      hover:-translate-y-1
                      hover:shadow-xl

                      ${
                        index ===
                        courses.length - 1
                          ? "sm:col-span-2 xl:col-span-1"
                          : ""
                      }
                    `}
                  >
                    {/* Icon + title */}
                    <div
                      className="
                        mb-4
                        flex
                        items-start
                        gap-4
                      "
                    >
                      <div
                        className="
                          flex
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-white/15
                          backdrop-blur-sm
                        "
                      >
                        <Icon
                          size={24}
                          strokeWidth={2.2}
                        />
                      </div>

                      <h3
                        className="
                          whitespace-pre-line
                          text-[18px]
                          font-bold
                          leading-[1.2]
                        "
                      >
                        {course.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p
                      className="
                        text-[13px]
                        leading-5
                        text-white/95
                      "
                    >
                      {course.description}
                    </p>

                    {/* Footer */}
                    <div
                      className="
                        mt-auto
                        flex
                        items-center
                        justify-between
                        pt-5
                      "
                    >
                      <span
                        className="
                          text-[13px]
                          font-bold
                        "
                      >
                        {course.classes}
                      </span>

                      <button
                        type="button"
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-full
                          bg-white
                          text-blue-600
                          transition-all
                          duration-300
                          group-hover:translate-x-1
                        "
                        aria-label={`View ${course.title.replace(
                          "\n",
                          " "
                        )}`}
                      >
                        <ArrowRight
                          size={17}
                        />
                      </button>
                    </div>
                  </div>
                );
              }
            )}
          </div>

          {/* Mobile View All */}
          <button
            type="button"
            onClick={() =>
              setShowMainCourses(true)
            }
            className="
              mt-6
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-lg
              border
              border-blue-500
              px-5
              py-3
              text-sm
              font-semibold
              text-blue-700
              transition-all
              duration-300
              hover:bg-blue-50
              sm:hidden
            "
          >
            View All Courses

            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Main Courses Modal */}
      <MainCoursesModal
        open={showMainCourses}
        onClose={() =>
          setShowMainCourses(false)
        }
      />
    </>
  );
}