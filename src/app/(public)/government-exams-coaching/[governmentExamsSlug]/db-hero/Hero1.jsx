import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  GraduationCap,
  Users,
} from "lucide-react";

/* =========================================================
   STAT ICONS
========================================================= */

const STAT_ICONS = {
  users: Users,
  book: BookOpen,
  calendar: CalendarDays,
  graduation:
    GraduationCap,
};

/* =========================================================
   HERO
========================================================= */

export default function Hero1({
  hero,
  basePath = "",
  examName = "Government Exam",
}) {
  if (!hero) {
    return null;
  }

  const {
    image =
      "/assets/images/default-exam-hero.jpg",

    eyebrow =
      `${examName} Preparation`,

    headingPrefix =
      "Master Your",

    headingHighlight =
      `${examName} Exams`,

    descriptionItems = [],

    ctaText =
      `Explore ${examName}`,

    ctaPath = "",

    stats = [],

    sideText = [],
  } = hero;

  const ctaHref =
    ctaPath
      ? `${String(
          basePath
        ).replace(
          /\/+$/,
          ""
        )}/${String(
          ctaPath
        ).replace(
          /^\/+/,
          ""
        )}`
      : basePath || "/";

  return (
    <section
      className="
        relative
        min-h-[520px]
        w-full
        overflow-hidden
        rounded-[24px]
        border
        border-white/20
        shadow-[0_24px_70px_rgba(11,33,108,0.18)]

        sm:min-h-[500px]
        sm:rounded-[26px]

        lg:min-h-[455px]
        lg:rounded-[28px]

        xl:min-h-[470px]
      "
      data-aos="fade-right"
    >
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-0
        "
      >
        <Image
          src={image}
          alt={`${examName} coaching`}
          fill
          priority
          sizes="100vw"
          className="
            object-cover
            object-[62%_center]

            sm:object-[62%_center]
            md:object-[60%_center]
            lg:object-center
          "
        />
      </div>

      {/* =====================================================
          DESKTOP OVERLAY
      ===================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-[1]
          hidden
          sm:block
        "
        style={{
          background: `
            linear-gradient(
              90deg,
              rgba(15, 43, 124, 0.96) 0%,
              rgba(17, 55, 139, 0.94) 16%,
              rgba(18, 74, 157, 0.88) 28%,
              rgba(15, 93, 175, 0.70) 38%,
              rgba(10, 119, 192, 0.42) 45%,
              rgba(5, 145, 207, 0.16) 51%,
              rgba(5, 155, 214, 0.05) 55%,
              rgba(5, 155, 214, 0) 59%,
              transparent 100%
            )
          `,
        }}
      />

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-[1]

          bg-[linear-gradient(180deg,rgba(12,42,122,0.94)_0%,rgba(11,71,156,0.88)_52%,rgba(6,119,188,0.72)_100%)]

          sm:hidden
        "
      />

      {/* =====================================================
          BOTTOM ATMOSPHERE
      ===================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          z-[2]
          h-[25%]
          bg-gradient-to-t
          from-[#087fc2]/10
          to-transparent
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
          min-h-[520px]
          w-full
          flex-col
          justify-center

          px-5
          py-8

          sm:min-h-[500px]
          sm:w-[58%]
          sm:px-8
          sm:py-10

          lg:min-h-[455px]
          lg:w-[54%]
          lg:px-10
          lg:py-10

          xl:min-h-[470px]
          xl:w-[52%]
          xl:px-14
        "
      >
        {/* EYEBROW */}

        <div
          className="
            inline-flex
            w-fit
            items-center
            gap-2
            rounded-full
            border
            border-[#8ceaff]/30
            bg-white/[0.06]
            px-3
            py-1.5
            shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
            backdrop-blur-sm
          "
        >
          <span
            className="
              h-1.5
              w-1.5
              shrink-0
              rounded-full
              bg-[#8deeff]
              shadow-[0_0_10px_rgba(104,231,255,0.9)]
            "
          />

          <p
            className="
              text-[8px]
              font-extrabold
              uppercase
              tracking-[0.2em]
              text-[#a0efff]

              sm:text-[9px]
              xl:text-[10px]
            "
          >
            {eyebrow}
          </p>
        </div>

        {/* HEADING */}

        <h1
          className="
            mt-4
            max-w-[650px]

            text-[36px]
            font-black
            leading-[0.98]
            tracking-[-0.045em]
            text-white

            sm:text-[40px]
            md:text-[44px]
            lg:text-[48px]
            xl:text-[58px]
          "
        >
          {headingPrefix}

          <span className="block">
            <span
              className="
                bg-gradient-to-r
                from-[#32e3fa]
                via-[#00c9eb]
                to-[#86f1ff]
                bg-clip-text
                text-transparent
              "
            >
              {headingHighlight}
            </span>
          </span>
        </h1>

        {/* DESCRIPTION ITEMS */}

        {descriptionItems.length >
          0 && (
          <div
            className="
              mt-4
              flex
              max-w-[720px]
              flex-wrap
              items-center
              gap-x-2
              gap-y-1

              text-[11px]
              font-medium
              leading-5
              text-white/90

              sm:text-[12px]
              xl:text-[13px]
            "
          >
            {descriptionItems.map(
              (
                item,
                index
              ) => (
                <span
                  key={`${item}-${index}`}
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <span>
                    {item}
                  </span>

                  {index <
                    descriptionItems.length -
                      1 && (
                    <span
                      className="
                        hidden
                        text-white/40
                        md:inline
                      "
                    >
                      |
                    </span>
                  )}
                </span>
              )
            )}
          </div>
        )}

        {/* CTA */}

        <Link
          href={ctaHref}
          className="
            group
            mt-6
            inline-flex
            w-fit
            items-center
            justify-center
            gap-2.5
            rounded-full

            bg-gradient-to-r
            from-[#f13873]
            via-[#ff2d78]
            to-[#ff4f8c]

            px-6
            py-3.5

            text-[12px]
            font-bold
            text-white

            shadow-[0_12px_30px_rgba(241,56,115,0.38)]

            transition-all
            duration-300

            hover:-translate-y-0.5
            hover:shadow-[0_18px_38px_rgba(241,56,115,0.48)]

            sm:px-7
            sm:text-[13px]
          "
        >
          <Bell className="h-4 w-4" />

          <span>
            {ctaText}
          </span>

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

        {/* STATS */}

        {stats.length >
          0 && (
          <div
            className="
              mt-7
              grid
              max-w-[680px]
              grid-cols-2
              gap-2.5

              lg:mt-6
              lg:grid-cols-4
              lg:gap-3
            "
          >
            {stats.map(
              (item) => {
                const Icon =
                  STAT_ICONS[
                    item.type
                  ] ||
                  GraduationCap;

                return (
                  <div
                    key={`${item.value}-${item.label}`}
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-2.5
                      rounded-[14px]
                      border
                      border-white/15
                      bg-white/[0.09]
                      px-3
                      py-2.5
                      shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
                      backdrop-blur-md
                      transition-all
                      duration-300

                      hover:-translate-y-0.5
                      hover:bg-white/[0.14]
                    "
                  >
                    <div
                      className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-white/10
                        text-white
                        ring-1
                        ring-white/10
                      "
                    >
                      <Icon
                        className="
                          h-3.5
                          w-3.5
                        "
                        strokeWidth={2}
                      />
                    </div>

                    <div className="min-w-0">
                      <p
                        className="
                          text-[11px]
                          font-black
                          leading-none
                          text-white
                          xl:text-[12px]
                        "
                      >
                        {item.value}
                      </p>

                      <p
                        className="
                          mt-1
                          text-[8px]
                          leading-[1.25]
                          text-white/75
                          xl:text-[9px]
                        "
                      >
                        {item.label}
                      </p>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* =====================================================
          SIDE TEXT
      ===================================================== */}

      {sideText.length > 0 && (
        <div
          className="
            pointer-events-none
            absolute
            right-[5%]
            top-[50px]
            z-20

            hidden
            rotate-[-6deg]

            text-center
            font-semibold
            italic
            leading-[1.02]
            text-white

            lg:block
          "
        >
          {sideText.map(
            (item) => (
              <p
                key={item}
                className="text-[21px]"
              >
                {item}
              </p>
            )
          )}

          <div
            className="
              ml-2
              mt-2
              h-[3px]
              w-[68px]
              rotate-[-8deg]
              rounded-full
              bg-[#ff2c83]
              shadow-[0_0_12px_rgba(255,44,131,0.4)]
            "
          />
        </div>
      )}
    </section>
  );
}