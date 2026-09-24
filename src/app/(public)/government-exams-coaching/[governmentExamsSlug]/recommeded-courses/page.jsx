import Link from "next/link";

import {
  ArrowLeft,
  BookOpen,
} from "lucide-react";

import SubExamSection from "./[recommendedCoursesSlug]/components/SubExamSection";

export const metadata = {
  title:
    "Recommended Kerala PSC Courses | MasterMind Academy",

  description:
    "Explore recommended Kerala PSC courses and preparation resources including video classes, mock tests, previous questions and SCERT exams.",
};

export default function RecommendedCoursesPage() {
  return (
    <main
      className="
        min-h-screen
        bg-[#f5f9ff]
        pb-14
        pt-[100px]
        lg:pt-[115px]
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-[1450px]
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* ============================================
            BACK
        ============================================ */}

        <Link
          href="/government-exams-coaching/kerala-psc"
          className="
            inline-flex
            items-center
            gap-2
            text-[12px]
            font-bold
            text-[#075fc8]
            transition
            hover:text-[#071f55]
          "
        >
          <ArrowLeft size={16} />

          Back to Kerala PSC
        </Link>

        {/* ============================================
            HERO
        ============================================ */}

        <section
          className="
            relative
            mt-5
            overflow-hidden
            rounded-[28px]
            bg-gradient-to-r
            from-[#071f55]
            via-[#075fc8]
            to-[#7c3aed]
            px-6
            py-9
            text-white
            shadow-[0_18px_45px_rgba(22,79,165,0.18)]
            sm:px-8
            lg:px-10
          "
        >
          {/* GRID */}

          <div
            aria-hidden="true"
            className="
              absolute
              inset-0
              opacity-[0.07]
              [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
              [background-size:32px_32px]
            "
          />

          {/* GLOW */}

          <div
            aria-hidden="true"
            className="
              absolute
              -right-16
              -top-20
              h-64
              w-64
              rounded-full
              bg-[#00b5e8]/20
              blur-[90px]
            "
          />

          <div
            className="
              relative
              z-10
              max-w-3xl
            "
          >
            <span
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-[15px]
                bg-white/15
                text-white
                backdrop-blur
              "
            >
              <BookOpen size={22} />
            </span>

            <p
              className="
                mt-5
                text-[10px]
                font-black
                uppercase
                tracking-[0.18em]
                text-blue-100
              "
            >
              Kerala PSC Learning
            </p>

            <h1
              className="
                mt-2
                text-3xl
                font-black
                tracking-[-0.03em]
                sm:text-4xl
              "
            >
              Recommended Courses
            </h1>

            <p
              className="
                mt-3
                max-w-2xl
                text-sm
                leading-7
                text-blue-100
              "
            >
              Choose a course and access
              available video classes,
              mock tests, previous year
              questions and SCERT practice
              resources.
            </p>
          </div>
        </section>

        {/* ============================================
            ALL RECOMMENDED COURSES
        ============================================ */}

        <SubExamSection />
      </div>
    </main>
  );
}