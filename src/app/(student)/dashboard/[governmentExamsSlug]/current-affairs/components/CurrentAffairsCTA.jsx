// src/app/(student)/dashboard/[governmentExamsSlug]/current-affairs/components/CurrentAffairsCTA.jsx

import Link from "next/link";

import {
    ArrowRight,
    BookOpen,
    Sparkles,
} from "lucide-react";

export default function CurrentAffairsCTA({
    examName,
    governmentExamsSlug,
}) {
    const safeExamName =
        examName ||
        "Government Exams";

    return (
        <section
            className="
        group
        relative

        mt-5

        overflow-hidden

        rounded-[22px]

        border
        border-[#d8e7ff]

        bg-gradient-to-r
        from-[#eaf6ff]
        via-[#fff5fa]
        to-[#f3efff]

        px-5
        py-5

        shadow-[0_12px_35px_rgba(22,79,165,0.07)]

        sm:px-6
      "
        >
            <div
                aria-hidden="true"
                className="
          pointer-events-none
          absolute
          -left-10
          -top-14

          h-32
          w-32

          rounded-full

          bg-[#00b5e8]/10

          blur-2xl
        "
            />

            <div
                aria-hidden="true"
                className="
          pointer-events-none
          absolute
          right-[18%]
          top-[-60px]

          h-36
          w-36

          rounded-full

          bg-[#e83e8c]/10

          blur-3xl
        "
            />

            <div
                aria-hidden="true"
                className="
          pointer-events-none
          absolute
          -bottom-16
          right-8

          h-36
          w-36

          rounded-full

          bg-[#7c3aed]/10

          blur-3xl
        "
            />

            <div
                className="
          relative
          z-10

          flex
          flex-col
          gap-5

          sm:flex-row
          sm:items-center
          sm:justify-between
        "
            >
                <div
                    className="
            flex
            items-center
            gap-4
          "
                >
                    <span
                        className="
              relative

              flex
              h-14
              w-14
              shrink-0
              items-center
              justify-center

              rounded-[16px]

              bg-gradient-to-br
              from-[#087bea]
              via-[#2563eb]
              to-[#7c3aed]

              text-white

              shadow-[0_10px_25px_rgba(37,99,235,0.25)]
            "
                    >
                        <BookOpen
                            size={23}
                        />

                        <span
                            className="
                absolute
                -right-1.5
                -top-1.5

                flex
                h-5
                w-5
                items-center
                justify-center

                rounded-full

                border-2
                border-white

                bg-[#ff4f9a]

                text-white
              "
                        >
                            <Sparkles
                                size={10}
                            />
                        </span>
                    </span>

                    <div>
                        <span
                            className="
                text-[9px]
                font-bold
                uppercase
                tracking-[0.13em]
                text-[#e83e8c]
              "
                        >
                            Keep Learning
                        </span>

                        <h3
                            className="
                mt-1

                text-[15px]
                font-bold
                tracking-[-0.02em]
                text-[#102c5c]

                sm:text-base
              "
                        >
                            Stay Informed.
                            Stay Ahead.
                        </h3>

                        <p
                            className="
                mt-1

                max-w-[500px]

                text-[11px]
                leading-5
                text-slate-500
              "
                        >
                            Stay consistent
                            with{" "}
                            {safeExamName}
                            {" "}
                            current affairs and
                            make every update
                            count.
                        </p>
                    </div>
                </div>

                <Link
                    href={
                        `/dashboard/${governmentExamsSlug}`
                    }
                    className="
            group/button

            flex
            h-11
            shrink-0
            items-center
            justify-center
            gap-2

            rounded-full

            bg-gradient-to-r
            from-[#087bea]
            via-[#7c3aed]
            to-[#e83e8c]

            px-6

            text-[11px]
            font-semibold
            text-white

            shadow-[0_10px_24px_rgba(124,58,237,0.20)]

            transition-all
            duration-300

            hover:-translate-y-0.5
          "
                >
                    Back to Dashboard

                    <ArrowRight
                        size={15}
                        className="
              transition-transform
              duration-300

              group-hover/button:translate-x-1
            "
                    />
                </Link>
            </div>
        </section>
    );
}