// src/app/(public)/profile-setup/components/CourseChoiceModal.jsx

"use client";

import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  GraduationCap,
  TrainFront,
  X,
} from "lucide-react";

import { useRouter } from "next/navigation";

const courses = [
  {
    id: "kerala-psc",

    eyebrow:
      "Kerala Government Exams",

    title: "Kerala PSC",

    description:
      "Prepare for Kerala PSC exams with classes, mock tests, previous questions and study materials.",

    icon: GraduationCap,

    dashboardHref:
      "/dashboard/kerala-psc",

    iconBg:
      "bg-[#e8f3ff]",

    iconColor:
      "text-[#017dc0]",

    borderHover:
      "hover:border-[#017dc0]",

    button:
      "bg-gradient-to-r from-[#017dc0] to-[#164fa5]",
  },

  {
    id: "rrb-ssc",

    eyebrow:
      "Central Government Exams",

    title:
      "RRB & SSC",

    description:
      "Prepare for Railway and SSC exams with expert classes, mock tests and practice resources.",

    icon: TrainFront,

    dashboardHref:
      "/dashboard/rrb-ssc",

    iconBg:
      "bg-[#fff0f5]",

    iconColor:
      "text-[#d6336c]",

    borderHover:
      "hover:border-[#d6336c]",

    button:
      "bg-gradient-to-r from-[#d6336c] to-[#ef476f]",
  },
];

export default function CourseChoiceModal({
  open,
  onClose,
}) {
  const router =
    useRouter();

  if (!open) {
    return null;
  }

  function handleCourseSelect(
    course
  ) {
    /*
     * IMPORTANT:
     *
     * Do not close the modal first.
     *
     * If we call onClose() here,
     * the OTP/profile page underneath
     * becomes visible before navigation
     * completes.
     */

    router.replace(
      course.dashboardHref
    );
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[9999]
        flex
        items-center
        justify-center
        bg-[#020617]/75
        px-4
        py-6
        backdrop-blur-[7px]
      "
    >
      <div
        className="
          relative
          w-full
          max-w-[760px]
          overflow-hidden
          rounded-[28px]
          border
          border-white/20
          bg-white
          shadow-[0_30px_100px_rgba(0,0,0,0.35)]
        "
      >
        {/* DECORATION */}

        <div
          className="
            pointer-events-none
            absolute
            -right-20
            -top-20
            h-[240px]
            w-[240px]
            rounded-full
            bg-[#017dc0]/10
            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-24
            -left-20
            h-[260px]
            w-[260px]
            rounded-full
            bg-[#7447f7]/10
            blur-3xl
          "
        />

        {/* CLOSE */}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close course selection"
          className="
            absolute
            right-5
            top-5
            z-20
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border
            border-slate-200
            bg-white
            text-slate-500
            shadow-sm
            transition-all
            duration-200

            hover:border-slate-300
            hover:bg-slate-50
            hover:text-slate-800
          "
        >
          <X size={18} />
        </button>

        <div
          className="
            relative
            z-10
            px-5
            pb-6
            pt-8

            sm:px-8
            sm:pb-8
            sm:pt-10
          "
        >
          {/* HEADER */}

          <div className="text-center">
            <div
              className="
                mx-auto
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-[18px]
                bg-gradient-to-br
                from-[#e7f5ff]
                to-[#eef0ff]
                text-[#2468f2]
              "
            >
              <BookOpenCheck
                size={27}
                strokeWidth={2}
              />
            </div>

            <p
              className="
                mt-4
                text-[11px]
                font-extrabold
                uppercase
                tracking-[0.18em]
                text-[#017dc0]
              "
            >
              One more step
            </p>

            <h2
              className="
                mt-2
                text-[27px]
                font-extrabold
                tracking-[-0.04em]
                text-[#071b59]

                sm:text-[34px]
              "
            >
              Choose Your Exam
              Category
            </h2>

            <p
              className="
                mx-auto
                mt-2
                max-w-[540px]
                text-[13px]
                leading-6
                text-slate-500

                sm:text-[14px]
              "
            >
              Select the
              government exam
              category you want
              to start preparing
              for.
            </p>
          </div>

          {/* COURSE CARDS */}

          <div
            className="
              mt-7
              grid
              grid-cols-1
              gap-4

              md:grid-cols-2
            "
          >
            {courses.map(
              (course) => {
                const Icon =
                  course.icon;

                return (
                  <button
                    key={
                      course.id
                    }
                    type="button"
                    onClick={() =>
                      handleCourseSelect(
                        course
                      )
                    }
                    className={`
                      group
                      relative
                      overflow-hidden
                      rounded-[22px]
                      border
                      border-slate-200
                      bg-white
                      p-5
                      text-left
                      shadow-[0_10px_35px_rgba(15,23,42,0.06)]
                      transition-all
                      duration-300

                      hover:-translate-y-1
                      hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)]

                      ${course.borderHover}
                    `}
                  >
                    <div
                      className="
                        flex
                        items-start
                        justify-between
                        gap-4
                      "
                    >
                      <span
                        className={`
                          flex
                          h-14
                          w-14
                          shrink-0
                          items-center
                          justify-center
                          rounded-[16px]

                          ${course.iconBg}
                          ${course.iconColor}
                        `}
                      >
                        <Icon
                          size={
                            27
                          }
                          strokeWidth={
                            1.9
                          }
                        />
                      </span>

                      <span
                        className="
                          flex
                          h-8
                          w-8
                          items-center
                          justify-center
                          rounded-full
                          bg-slate-100
                          text-slate-400
                          transition-all
                          duration-300

                          group-hover:bg-[#071b59]
                          group-hover:text-white
                        "
                      >
                        <ArrowRight
                          size={
                            16
                          }
                        />
                      </span>
                    </div>

                    <p
                      className="
                        mt-5
                        text-[10px]
                        font-extrabold
                        uppercase
                        tracking-[0.14em]
                        text-slate-400
                      "
                    >
                      {
                        course.eyebrow
                      }
                    </p>

                    <h3
                      className="
                        mt-1
                        text-[22px]
                        font-extrabold
                        tracking-[-0.03em]
                        text-[#071b59]
                      "
                    >
                      {
                        course.title
                      }
                    </h3>

                    <p
                      className="
                        mt-2
                        min-h-[66px]
                        text-[12px]
                        leading-[1.7]
                        text-slate-500
                      "
                    >
                      {
                        course.description
                      }
                    </p>

                    <div
                      className={`
                        mt-5
                        flex
                        h-[46px]
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-[12px]
                        text-[12px]
                        font-bold
                        text-white
                        shadow-sm
                        transition-all
                        duration-300

                        ${course.button}
                      `}
                    >
                      Continue with{" "}
                      {
                        course.title
                      }

                      <ArrowRight
                        size={15}
                      />
                    </div>
                  </button>
                );
              }
            )}
          </div>

          {/* FOOTER */}

          <div
            className="
              mt-5
              flex
              items-center
              justify-center
              gap-2
              text-center
              text-[11px]
              text-slate-400
            "
          >
            <CheckCircle2
              size={14}
              className="
                text-emerald-500
              "
            />

            You can explore other
            exam categories later.
          </div>
        </div>
      </div>
    </div>
  );
}