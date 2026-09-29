// src/app/(student)/dashboard/[governmentExamsSlug]/current-affairs/[slug]/components/CurrentAffairsMonthHeader.jsx

import Link from "next/link";

import {
    ArrowLeft,
    CalendarDays,
    Newspaper,
} from "lucide-react";

export default function CurrentAffairsMonthHeader({
    title,
    examName,
    shortName,
    backHref,
}) {
    const safeExamName =
        examName ||
        "Government Exams";

    const safeShortName =
        shortName ||
        safeExamName;

    return (
        <section
            className="
        relative

        overflow-hidden

        rounded-[24px]

        bg-gradient-to-r
        from-[#061f52]
        via-[#0b57b7]
        to-[#087bea]

        px-5
        py-7

        text-white

        shadow-[0_18px_45px_rgba(8,74,160,0.18)]

        sm:px-7
        sm:py-8
      "
        >
            {/* GRID */}

            <div
                aria-hidden="true"
                className="
          pointer-events-none
          absolute
          inset-0

          opacity-[0.07]

          [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
          [background-size:30px_30px]
        "
            />

            {/* GLOW */}

            <div
                aria-hidden="true"
                className="
          pointer-events-none
          absolute
          -right-20
          -top-20

          h-56
          w-56

          rounded-full

          bg-[#5ee9ff]/20

          blur-3xl
        "
            />

            <div className="relative z-10">
                <Link
                    href={
                        backHref ||
                        "/dashboard"
                    }
                    className="
            inline-flex
            items-center
            gap-2

            rounded-full

            border
            border-white/20

            bg-white/10

            px-3
            py-2

            text-[10px]
            font-semibold
            text-white

            backdrop-blur-md

            transition

            hover:bg-white/15
          "
                >
                    <ArrowLeft
                        size={14}
                    />

                    Back to Current Affairs
                </Link>

                <div
                    className="
            mt-6

            flex
            items-start
            gap-4
          "
                >
                    <span
                        className="
              flex
              h-14
              w-14
              shrink-0
              items-center
              justify-center

              rounded-[16px]

              border
              border-white/15

              bg-white/10

              backdrop-blur-md
            "
                    >
                        <Newspaper
                            size={25}
                        />
                    </span>

                    <div>
                        <div
                            className="
                flex
                items-center
                gap-2

                text-[10px]
                font-bold
                uppercase
                tracking-[0.14em]
                text-[#7eeeff]
              "
                        >
                            <CalendarDays
                                size={13}
                            />

                            {safeShortName}
                            {" "}
                            Current Affairs
                        </div>

                        <h1
                            className="
                mt-2

                text-2xl
                font-extrabold
                tracking-[-0.03em]

                sm:text-3xl
              "
                        >
                            {title}
                        </h1>

                        <p
                            className="
                mt-2

                max-w-[650px]

                text-[12px]
                leading-6
                text-white/75
              "
                        >
                            Browse daily current
                            affairs updates for{" "}
                            {safeExamName}
                            {" "}
                            preparation.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}