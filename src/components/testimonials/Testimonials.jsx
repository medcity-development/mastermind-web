"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  Quote,
  Star,
} from "lucide-react";

const testimonials = [
  {
    id: 1,
    img: "/assets/avatar1.png",
    text:
      "The classes are very helpful and the teachers explain everything clearly.",
    name: "Student Name",
  },
  {
    id: 2,
    img: "/assets/avatar1.png",
    text:
      "The classes are very helpful and the teachers explain everything clearly.",
    name: "Student Name",
  },
  {
    id: 3,
    img: "/assets/avatar1.png",
    text:
      "The classes are very helpful and the teachers explain everything clearly.",
    name: "Student Name",
  },
];

export default function Testimonials() {
  return (
    <section
      className="
        relative
        overflow-hidden
        bg-[#f7fbff]
        py-16
        sm:py-20
        lg:py-24
      "
      data-aos="fade-up"
    >
      {/* =====================================================
          BACKGROUND DECORATION
      ===================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
        "
      >
        {/* Light blue glow */}

        <div
          className="
            absolute
            -left-40
            top-4
            h-[420px]
            w-[420px]
            rounded-full
            bg-[#00b5e8]/12
            blur-[120px]
          "
        />

        {/* Pink glow */}

        <div
          className="
            absolute
            -right-36
            bottom-0
            h-[420px]
            w-[420px]
            rounded-full
            bg-pink-400/12
            blur-[120px]
          "
        />

        {/* Medium blue glow */}

        <div
          className="
            absolute
            left-[50%]
            top-[28%]
            h-[280px]
            w-[280px]
            -translate-x-1/2
            rounded-full
            bg-[#017cc0]/7
            blur-[100px]
          "
        />

        {/* Light grid */}

        <div
          className="
            absolute
            inset-0
            opacity-[0.16]
            [background-image:linear-gradient(rgba(22,79,165,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(0,181,232,0.055)_1px,transparent_1px)]
            [background-size:28px_28px]
          "
        />

        {/* Dot pattern */}

        <div
          className="
            absolute
            right-[8%]
            top-14
            h-[105px]
            w-[105px]
            opacity-[0.20]
            [background-image:radial-gradient(circle,#00b5e8_1.1px,transparent_1.1px)]
            [background-size:14px_14px]
          "
        />

        <div
          className="
            absolute
            bottom-12
            left-[6%]
            h-[100px]
            w-[100px]
            opacity-[0.14]
            [background-image:radial-gradient(circle,#ec4899_1.1px,transparent_1.1px)]
            [background-size:14px_14px]
          "
        />
      </div>

      {/* =====================================================
          CONTAINER
      ===================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-7xl
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* =================================================
            HEADING
        ================================================= */}

        <div
          className="
            mx-auto
            mb-12
            max-w-3xl
            text-center
            lg:mb-14
          "
        >
          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-[#164fa5]/10
              bg-white/90
              px-4
              py-2
              shadow-[0_6px_20px_rgba(15,23,42,0.05)]
              backdrop-blur
            "
          >
            <span
              className="
                h-2
                w-2
                rounded-full
                bg-pink-500
              "
            />

            <span
              className="
                text-[11px]
                font-black
                uppercase
                tracking-[0.18em]
                text-[#164fa5]
              "
            >
              Student Stories
            </span>
          </div>

          <h2
            className="
              mt-5
              text-3xl
              font-black
              tracking-[-0.035em]
              text-[#0b216c]
              sm:text-4xl
              md:text-5xl
            "
          >
            What Our{" "}
            <span className="text-[#164fa5]">
              Students Say
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-5
              max-w-2xl
              text-sm
              leading-7
              text-slate-600
              sm:text-base
            "
          >
            Hear from students who are
            learning, growing and preparing
            with confidence through our
            classes.
          </p>
        </div>

        {/* =================================================
            TESTIMONIAL GRID
        ================================================= */}

        <div
          className="
            grid
            grid-cols-1
            gap-5
            lg:grid-cols-[1.08fr_0.92fr]
          "
        >
          {/* =================================================
              LARGE FEATURED CARD
          ================================================= */}

          <article
            className="
              group
              relative
              min-h-[430px]
              overflow-hidden
              rounded-[30px]
              border
              border-white/20
              bg-[#164fa5]
              p-7
              text-white
              shadow-[0_24px_70px_rgba(22,79,165,0.20)]
              transition-all
              duration-300
              hover:-translate-y-1
              hover:shadow-[0_28px_75px_rgba(22,79,165,0.26)]
              sm:p-9
            "
          >
            {/* Color glows */}

            <div
              aria-hidden="true"
              className="
                absolute
                -right-24
                -top-24
                h-72
                w-72
                rounded-full
                bg-[#00b5e8]/30
                blur-3xl
              "
            />

            <div
              aria-hidden="true"
              className="
                absolute
                -bottom-28
                -left-28
                h-72
                w-72
                rounded-full
                bg-pink-400/20
                blur-3xl
              "
            />

            {/* Dot pattern */}

            <div
              aria-hidden="true"
              className="
                absolute
                inset-0
                opacity-[0.08]
                [background-image:radial-gradient(circle,#ffffff_1px,transparent_1px)]
                [background-size:22px_22px]
              "
            />

            <div
              className="
                relative
                z-10
                flex
                h-full
                flex-col
                justify-between
              "
            >
              <div>
                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >
                  <span
                    className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-2xl
                      bg-white/15
                      text-white
                      backdrop-blur
                    "
                  >
                    <Quote
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </span>

                  <Rating />
                </div>

                <p
                  className="
                    mt-8
                    max-w-xl
                    text-xl
                    font-medium
                    leading-9
                    text-white/95
                    sm:text-2xl
                  "
                >
                  “{testimonials[0].text}”
                </p>
              </div>

              <StudentProfile
                item={testimonials[0]}
                light
                large
              />
            </div>
          </article>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div
            className="
              grid
              gap-5
            "
          >
            {/* TOP BLUE CARD */}

            <article
              className="
                group
                relative
                overflow-hidden
                rounded-[26px]
                border
                border-[#00b5e8]/20
                bg-[#eaf9ff]
                p-6
                shadow-[0_16px_45px_rgba(15,23,42,0.06)]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-[0_20px_50px_rgba(1,124,192,0.12)]
              "
            >
              <div
                aria-hidden="true"
                className="
                  absolute
                  -right-16
                  -top-16
                  h-40
                  w-40
                  rounded-full
                  bg-[#00b5e8]/18
                  blur-3xl
                "
              />

              <div
                aria-hidden="true"
                className="
                  absolute
                  -bottom-16
                  -left-16
                  h-32
                  w-32
                  rounded-full
                  bg-[#164fa5]/8
                  blur-3xl
                "
              />

              <div className="relative z-10">
                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >
                  <span
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      bg-[#017cc0]
                      text-white
                      shadow-sm
                    "
                  >
                    <Quote
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  </span>

                  <Rating />
                </div>

                <p
                  className="
                    mt-5
                    text-base
                    leading-7
                    text-slate-700
                  "
                >
                  “{testimonials[1].text}”
                </p>

                <StudentProfile
                  item={testimonials[1]}
                />
              </div>
            </article>

            {/* BOTTOM CARDS */}

            <div
              className="
                grid
                grid-cols-1
                gap-5
                sm:grid-cols-2
              "
            >
              <SmallCard
                item={testimonials[2]}
                variant="pink"
              />

              <SmallCard
                item={testimonials[0]}
                variant="cyan"
              />
            </div>
          </div>
        </div>

        {/* =================================================
            VIEW ALL BUTTON
        ================================================= */}

        <div
          className="
            mt-10
            flex
            justify-center
          "
        >
          <Link
            href="/testimonials/"
            className="
              group
              inline-flex
              items-center
              justify-center
              gap-2.5
              rounded-full
              bg-mediumBlue
              px-7
              py-3.5
              text-sm
              font-extrabold
              text-white
              shadow-[0_12px_30px_rgba(22,79,165,0.22)]
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:bg-[#0b216c]
              hover:shadow-[0_18px_38px_rgba(22,79,165,0.28)]
            "
          >
            View All Testimonials

            <ArrowRight
              className="
                h-4
                w-4
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   SMALL CARD
========================================================= */

function SmallCard({
  item,
  variant = "cyan",
}) {
  const variants = {
    cyan: {
      card:
        "border-[#00b5e8]/25 bg-[#e6f8ff]",

      glow:
        "bg-[#00b5e8]/20",

      icon:
        "bg-[#017cc0] text-white",

      text:
        "text-slate-700",
    },

    pink: {
      card:
        "border-pink-300/70 bg-[#ffe1ec]",

      glow:
        "bg-pink-400/25",

      icon:
        "bg-pink-500 text-white",

      text:
        "text-[#6c2a44]",
    },
  };

  const style =
    variants[variant];

  return (
    <article
      className={`
        group
        relative
        flex
        min-h-[245px]
        flex-col
        justify-between
        overflow-hidden
        rounded-[24px]
        border
        p-5
        shadow-[0_12px_35px_rgba(15,23,42,0.05)]
        transition-all
        duration-300

        hover:-translate-y-1
        hover:shadow-[0_18px_45px_rgba(15,23,42,0.09)]

        ${style.card}
      `}
    >
      {/* Glow */}

      <div
        aria-hidden="true"
        className={`
          pointer-events-none
          absolute
          -right-14
          -top-14
          h-32
          w-32
          rounded-full
          blur-3xl

          ${style.glow}
        `}
      />

      {/* Dot texture */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.10]
          [background-image:radial-gradient(circle,#164fa5_1px,transparent_1px)]
          [background-size:18px_18px]
        "
      />

      <div
        className="
          relative
          z-10
        "
      >
        <span
          className={`
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-xl
            shadow-sm

            ${style.icon}
          `}
        >
          <Quote
            className="h-4 w-4"
            aria-hidden="true"
          />
        </span>

        <p
          className={`
            mt-5
            text-sm
            leading-6

            ${style.text}
          `}
        >
          “{item.text}”
        </p>
      </div>

      <div className="relative z-10">
        <StudentProfile
          item={item}
          small
        />
      </div>
    </article>
  );
}

/* =========================================================
   STUDENT PROFILE
========================================================= */

function StudentProfile({
  item,
  light = false,
  large = false,
  small = false,
}) {
  return (
    <div
      className={`
        flex
        items-center
        gap-3

        ${
          large
            ? "mt-10"
            : "mt-6"
        }
      `}
    >
      <div
        className={`
          relative
          shrink-0
          overflow-hidden
          rounded-full
          border-[3px]
          shadow-sm

          ${
            light
              ? "border-white/40"
              : "border-white"
          }

          ${
            small
              ? "h-10 w-10"
              : large
              ? "h-14 w-14"
              : "h-12 w-12"
          }
        `}
      >
        <Image
          src={item.img}
          alt={item.name}
          fill
          sizes={
            small
              ? "40px"
              : large
              ? "56px"
              : "48px"
          }
          className="
            object-cover
            object-center
          "
        />
      </div>

      <div className="min-w-0">
        <p
          className={`
            truncate
            font-black

            ${
              light
                ? "text-white"
                : "text-[#0b216c]"
            }

            ${
              large
                ? "text-base"
                : "text-sm"
            }
          `}
        >
          {item.name}
        </p>

        <p
          className={`
            mt-0.5
            text-xs
            font-medium

            ${
              light
                ? "text-white/70"
                : "text-slate-500"
            }
          `}
        >
          Student
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   RATING
========================================================= */

function Rating() {
  return (
    <div
      className="
        flex
        items-center
        gap-1
      "
      aria-label="5 out of 5 stars"
    >
      {Array.from({
        length: 5,
      }).map(
        (_, index) => (
          <Star
            key={index}
            className="
              h-3.5
              w-3.5
              fill-amber-400
              text-amber-400
            "
            aria-hidden="true"
          />
        )
      )}
    </div>
  );
}