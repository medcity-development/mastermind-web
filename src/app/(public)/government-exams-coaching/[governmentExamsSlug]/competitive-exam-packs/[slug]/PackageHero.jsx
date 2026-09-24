import Image from "next/image";

import {
  BookOpenCheck,
  GraduationCap,
  Sparkles,
} from "lucide-react";

/* =========================================================
   GET ONLY INTRO / ABOUT TEXT
========================================================= */

function getAboutDescription(
  description = ""
) {
  if (!description) {
    return "";
  }

  const text = String(
    description
  )
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  /*
   * Everything before "Course Highlights"
   * stays inside the hero.
   */
  const parts = text.split(
    /(?:\?\s*)?Course\s+Highlights\s*:/i
  );

  return (
    parts[0]?.trim() || ""
  );
}

/* =========================================================
   PACKAGE HERO
========================================================= */

export default function PackageHero({
  packageData,
}) {
  if (!packageData) {
    return null;
  }

  const title =
    packageData?.title ||
    "Competitive Exam Package";

  const tag =
    packageData?.tag ||
    "";

  const description =
    packageData?.description ||
    "";

  const imageUrl =
    packageData?.imageUrl ||
    "";

  const price =
    packageData?.price;

  const aboutDescription =
    getAboutDescription(
      description
    );

  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[30px]
        border
        border-[#d9e8f7]
        bg-gradient-to-br
        from-[#edf7ff]
        via-[#f8fcff]
        to-[#e7f4ff]
        shadow-[0_22px_60px_rgba(22,79,165,0.10)]
      "
    >
      {/* GRID */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.035]
          [background-image:linear-gradient(#164fa5_1px,transparent_1px),linear-gradient(90deg,#164fa5_1px,transparent_1px)]
          [background-size:36px_36px]
        "
      />

      {/* BLUE GLOW */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-24
          -top-24
          h-[340px]
          w-[340px]
          rounded-full
          bg-[#00b5e8]/20
          blur-[110px]
        "
      />

      {/* PINK GLOW */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -bottom-24
          left-[30%]
          h-[280px]
          w-[280px]
          rounded-full
          bg-[#f13873]/10
          blur-[100px]
        "
      />

      {/* CONTENT */}

      <div
        className="
          relative
          z-10
          grid
          gap-8
          px-6
          py-8
          sm:px-8
          lg:grid-cols-[1.35fr_0.65fr]
          lg:items-center
          lg:px-10
          lg:py-12
        "
      >
        {/* =================================================
            LEFT
        ================================================= */}

        <div>
          {/* BADGES */}

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-2
            "
          >
            {price?.current && (
              <span
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-[#f13873]
                  px-4
                  py-2
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.12em]
                  text-white
                  shadow-[0_8px_20px_rgba(241,56,115,0.25)]
                "
              >
                <Sparkles
                  size={14}
                />

                Starting From ₹
                {price.current}
              </span>
            )}

            {tag &&
              tag !== title && (
                <span
                  className="
                    rounded-full
                    border
                    border-[#d8e7f5]
                    bg-white/80
                    px-4
                    py-2
                    text-[10px]
                    font-bold
                    text-[#164fa5]
                  "
                >
                  {tag}
                </span>
              )}
          </div>

          {/* TITLE */}

          <h1
            className="
              mt-5
              max-w-3xl
              text-3xl
              font-black
              leading-tight
              tracking-[-0.04em]
              text-[#0b216c]
              sm:text-4xl
              lg:text-[46px]
            "
          >
            {title}
          </h1>

          {/* ABOUT */}

          {aboutDescription && (
            <div
              className="
                mt-6
                max-w-3xl
                rounded-[20px]
                border
                border-white/80
                bg-white/80
                p-5
                shadow-[0_8px_25px_rgba(15,58,110,0.06)]
                backdrop-blur-sm
                sm:p-6
              "
            >
              <p
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.14em]
                  text-[#f13873]
                "
              >
                About This Package
              </p>

              <p
                className="
                  mt-3
                  text-[14px]
                  leading-7
                  text-[#526581]
                  sm:text-[15px]
                "
              >
                {aboutDescription}
              </p>
            </div>
          )}

          {/* SMALL FEATURES */}

          <div
            className="
              mt-6
              flex
              flex-wrap
              gap-3
            "
          >
            <Feature
              icon={
                <BookOpenCheck
                  size={16}
                />
              }
              text="Structured Learning"
            />

            <Feature
              icon={
                <GraduationCap
                  size={16}
                />
              }
              text="PSC Preparation"
            />

            <Feature
              icon={
                <Sparkles
                  size={16}
                />
              }
              text="Latest Updates"
            />
          </div>
        </div>

        {/* =================================================
            RIGHT IMAGE
        ================================================= */}

        {imageUrl && (
          <div
            className="
              relative
              mx-auto
              flex
              w-full
              max-w-[360px]
              items-center
              justify-center
            "
          >
            <div
              aria-hidden="true"
              className="
                absolute
                h-[230px]
                w-[230px]
                rounded-full
                bg-[#164fa5]/10
                blur-[40px]
              "
            />

            <div
              className="
                relative
                h-[300px]
                w-full
              "
            >
              <Image
                src={imageUrl}
                alt={title}
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 360px"
                className="
                  object-contain
                "
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   FEATURE
========================================================= */

function Feature({
  icon,
  text,
}) {
  return (
    <div
      className="
        inline-flex
        items-center
        gap-2
        rounded-[14px]
        border
        border-white/80
        bg-white/80
        px-4
        py-3
        text-[11px]
        font-bold
        text-[#29456d]
        shadow-sm
        backdrop-blur-sm
      "
    >
      <span className="text-[#1688dd]">
        {icon}
      </span>

      {text}
    </div>
  );
}