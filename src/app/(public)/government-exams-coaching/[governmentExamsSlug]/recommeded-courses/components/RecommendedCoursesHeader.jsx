import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

export default function RecommendedCoursesHeader() {
  return (
    <div
      className="
        flex
        flex-col
        gap-4

        sm:flex-row
        sm:items-end
        sm:justify-between
      "
    >
      <div>
        <p
          className="
            text-[10px]
            font-extrabold
            uppercase
            tracking-[0.2em]
            text-[#164fa5]
          "
        >
          Popular Learning Paths
        </p>

        <h2
          className="
            mt-1
            text-2xl
            font-black
            leading-tight
            tracking-[-0.035em]
            text-[#0b216c]

            sm:text-3xl
          "
        >
          Recommended Courses for You
        </h2>

        <div
          className="
            mt-2
            h-[3px]
            w-10
            rounded-full
            bg-[#f13873]
          "
        />
      </div>

      <div
        className="
          flex
          flex-wrap
          items-center
          gap-2
        "
      >
        <button
          type="button"
          aria-label="Previous courses"
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border
            border-[#dce8f5]
            bg-white
            text-[#164fa5]
            shadow-sm
            transition-all
            duration-300

            hover:-translate-y-0.5
            hover:border-[#b9d5ef]
          "
        >
          <ArrowLeft size={16} />
        </button>

        <button
          type="button"
          aria-label="Next courses"
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border
            border-[#dce8f5]
            bg-white
            text-[#164fa5]
            shadow-sm
            transition-all
            duration-300

            hover:-translate-y-0.5
            hover:border-[#b9d5ef]
          "
        >
          <ArrowRight size={16} />
        </button>

        <Link
          href="/government-exams-coaching/kerala-psc/recommended-courses"
          className="
            group
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-[#1976ed]
            bg-white
            px-5
            py-2.5
            text-[11px]
            font-bold
            text-[#164fa5]
            transition-all
            duration-300

            hover:bg-[#164fa5]
            hover:text-white
          "
        >
          View All Courses

          <ArrowRight
            className="
              h-4
              w-4
              transition-transform
              duration-300
              group-hover:translate-x-1
            "
          />
        </Link>
      </div>
    </div>
  );
}