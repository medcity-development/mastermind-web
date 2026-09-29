// src/app/(student)/dashboard/[governmentExamsSlug]/current-affairs/components/CurrentAffairsHero.jsx

import Image from "next/image";

import {
    BookOpen,
    Newspaper,
    Target,
} from "lucide-react";

/* =========================================================
   HERO IMAGE CONFIG
========================================================= */

const HERO_IMAGE_MAP = {
    "kerala-psc":
        "/assets/government-exams-coaching/kerala-psc.webp",

    "rrb-ssc":
        "/assets/government-exams-coaching/kerala-psc.webp",
};

/* =========================================================
   HERO THEME CONFIG
========================================================= */

const HERO_THEME_MAP = {
    "kerala-psc": {
        overlay:
            "from-[#061f52]/95 via-[#075fc8]/85 to-[#111d61]/90",

        leftShade:
            "from-[#041b49]/80 via-[#082d72]/35 to-transparent",

        accentText:
            "text-[#5ee9ff]",

        dot:
            "bg-[#67e8f9]",

        glow:
            "bg-[#00b5e8]/25",
    },

    "rrb-ssc": {
        overlay:
            "from-[#081a44]/95 via-[#164fa5]/88 to-[#24115f]/90",

        leftShade:
            "from-[#061633]/85 via-[#153c88]/40 to-transparent",

        accentText:
            "text-[#67e8f9]",

        dot:
            "bg-[#67e8f9]",

        glow:
            "bg-[#7c3aed]/25",
    },
};

/* =========================================================
   DEFAULTS
========================================================= */

const DEFAULT_IMAGE =
    "/assets/government-exams-coaching/kerala-psc.webp";

const DEFAULT_THEME = {
    overlay:
        "from-[#061f52]/95 via-[#075fc8]/85 to-[#111d61]/90",

    leftShade:
        "from-[#041b49]/80 via-[#082d72]/35 to-transparent",

    accentText:
        "text-[#5ee9ff]",

    dot:
        "bg-[#67e8f9]",

    glow:
        "bg-[#00b5e8]/25",
};

export default function CurrentAffairsHero({
    examName,
    shortName,
    governmentExamsSlug,
}) {
    const safeExamName =
        examName ||
        "Government Exams";

    const safeShortName =
        shortName ||
        safeExamName;

    const safeSlug =
        String(
            governmentExamsSlug || ""
        )
            .trim()
            .toLowerCase();

    const heroImage =
        HERO_IMAGE_MAP[
        safeSlug
        ] ||
        DEFAULT_IMAGE;

    const theme =
        HERO_THEME_MAP[
        safeSlug
        ] ||
        DEFAULT_THEME;

    return (
        <section
            className="
        relative
        min-h-[320px]
        overflow-hidden
        rounded-[24px]
        px-6
        py-8
        text-white
        shadow-[0_18px_50px_rgba(7,73,155,0.18)]

        sm:px-8
        sm:py-10

        lg:min-h-[360px]
        lg:px-12
        lg:py-12
      "
        >
            {/* =====================================================
          BACKGROUND IMAGE
      ===================================================== */}

            <Image
                src={heroImage}
                alt={`${safeExamName} current affairs preparation`}
                fill
                priority
                sizes="100vw"
                className="
          object-cover
          object-center
        "
            />

            {/* =====================================================
          MAIN OVERLAY
      ===================================================== */}

            <div
                aria-hidden="true"
                className={`
          absolute
          inset-0
          z-[1]

          bg-gradient-to-r

          ${theme.overlay}
        `}
            />

            {/* =====================================================
          LEFT SHADE
      ===================================================== */}

            <div
                aria-hidden="true"
                className={`
          absolute
          inset-y-0
          left-0
          z-[2]

          w-[78%]

          bg-gradient-to-r

          ${theme.leftShade}
        `}
            />

            {/* =====================================================
          TOP RIGHT CIRCLE
      ===================================================== */}

            <div
                aria-hidden="true"
                className="
          absolute
          -right-24
          -top-24
          z-[3]

          h-72
          w-72

          rounded-full

          bg-white/10
        "
            />

            {/* =====================================================
          SECOND CIRCLE
      ===================================================== */}

            <div
                aria-hidden="true"
                className="
          absolute
          right-[12%]
          top-[18%]
          z-[3]

          h-24
          w-24

          rounded-full

          border
          border-white/10
        "
            />

            {/* =====================================================
          GLOW
      ===================================================== */}

            <div
                aria-hidden="true"
                className={`
          absolute
          bottom-[-80px]
          right-[10%]
          z-[3]

          h-[230px]
          w-[230px]

          rounded-full

          blur-3xl

          ${theme.glow}
        `}
            />

            {/* =====================================================
          GRID
      ===================================================== */}

            <div
                aria-hidden="true"
                className="
          absolute
          inset-0
          z-[3]

          opacity-[0.06]

          [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
          [background-size:34px_34px]
        "
            />

            {/* =====================================================
          CONTENT
      ===================================================== */}

            <div
                className="
          relative
          z-10

          flex
          min-h-[260px]
          items-center
        "
            >
                <div
                    className="
            max-w-[700px]
          "
                >
                    {/* BADGE */}

                    <div
                        className="
              inline-flex
              items-center
              gap-2

              rounded-full

              border
              border-white/20

              bg-white/10

              px-3.5
              py-2

              text-[10px]
              font-semibold
              uppercase
              tracking-[0.14em]

              backdrop-blur-md
            "
                    >
                        <span
                            className={`
                h-2
                w-2

                rounded-full

                shadow-[0_0_12px_rgba(103,232,249,0.9)]

                ${theme.dot}
              `}
                        />

                        {safeShortName}
                        {" "}
                        Current Affairs
                    </div>

                    {/* TITLE */}

                    <h1
                        className="
              mt-5

              max-w-[700px]

              text-4xl
              font-bold
              leading-[1.05]
              tracking-[-0.04em]

              sm:text-5xl

              lg:text-[58px]
            "
                    >
                        {safeExamName}

                        <br />

                        <span
                            className={
                                theme.accentText
                            }
                        >
                            Current Affairs
                        </span>
                    </h1>

                    {/* DESCRIPTION */}

                    <p
                        className="
              mt-5

              max-w-[650px]

              text-sm
              leading-7
              text-white/80

              sm:text-[15px]
            "
                    >
                        Browse month-wise current
                        affairs materials, daily
                        updates, important news and
                        exam-focused content designed
                        for{" "}
                        {safeExamName}
                        {" "}
                        preparation.
                    </p>

                    {/* FEATURES */}

                    <div
                        className="
              mt-7

              flex
              flex-wrap
              gap-3
            "
                    >
                        <Feature
                            icon={
                                Newspaper
                            }
                            text={`${safeShortName} Relevant Updates`}
                        />

                        <Feature
                            icon={Target}
                            text="Curated for Exams"
                        />

                        <Feature
                            icon={BookOpen}
                            text="Stronger General Awareness"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

/* =========================================================
   FEATURE
========================================================= */

function Feature({
    icon: Icon,
    text,
}) {
    return (
        <div
            className="
        flex
        items-center
        gap-2.5

        rounded-xl

        border
        border-white/15

        bg-white/10

        px-3
        py-2.5

        text-[11px]
        font-medium
        text-white

        shadow-sm

        backdrop-blur-md

        transition
        duration-300

        hover:bg-white/15
      "
        >
            <span
                className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center

          rounded-lg

          bg-white/10
        "
            >
                <Icon
                    size={16}
                />
            </span>

            {text}
        </div>
    );
}