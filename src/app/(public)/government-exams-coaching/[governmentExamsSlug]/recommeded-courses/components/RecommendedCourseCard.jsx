import Link from "next/link";

import {
  ArrowRight,
  GraduationCap,
} from "lucide-react";

/* =========================================================
   SLUG
========================================================= */

function createSlug(
  value = ""
) {
  return String(
    value ?? ""
  )
    .toLowerCase()
    .trim()
    .replace(
      /&/g,
      " and "
    )
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
}

/* =========================================================
   CARD
========================================================= */

export default function RecommendedCourseCard({
  course,
  cid,
  governmentExamsSlug,
  examName,
}) {
  if (!course) {
    return null;
  }

  /* =====================================================
     SAFETY

     cid=1 courses cannot appear
     inside cid=2 page.
  ===================================================== */

  if (
    Number(
      course?.cid
    ) !==
    Number(cid)
  ) {
    return null;
  }

  /* =====================================================
     DATA
  ===================================================== */

  const title =
    course?.exam ??
    course?.exam_name ??
    "Exam Course";

  const examId =
    course?.id;

  const subId =
    course?.sub_id ??
    "";

  const categoryName =
    course?.name ??
    examName;

  const categorySlug =
    createSlug(
      categoryName
    );

  const examSlug =
    createSlug(
      title
    );

  const imageUrl =
    course?.imageUrl ??
    "";

  /* =====================================================
     ROUTE
  ===================================================== */

  const href =
    `/government-exams-coaching/${governmentExamsSlug}` +
    `/sub-courses/${categorySlug}/${examSlug}` +
    `?subId=${encodeURIComponent(
      subId
    )}` +
    `&examId=${encodeURIComponent(
      examId
    )}`;

  return (
    <article
      className="
        group
        flex
        h-full
        flex-col
        overflow-hidden

        rounded-[22px]

        border
        border-[#dce8f7]

        bg-white

        p-3

        shadow-[0_10px_30px_rgba(15,58,110,0.06)]

        transition-all
        duration-300

        hover:-translate-y-1

        hover:border-[#087bea]/25

        hover:shadow-[0_18px_40px_rgba(15,58,110,0.12)]
      "
    >
      {/* =================================================
          IMAGE
      ================================================= */}

     {/* =================================================
    IMAGE
================================================= */}

<div
  className="
    relative
    flex
    h-[170px]
    items-center
    justify-center
    overflow-hidden
    rounded-[18px]
    bg-gradient-to-br
    from-[#f2f8ff]
    via-[#f8fbff]
    to-[#eef5ff]
    p-3
  "
>
  {imageUrl ? (
    <img
      src={imageUrl}
      alt={title}
      loading="lazy"
      className="
        h-[145px]
        w-auto
        max-w-full
        rounded-[13px]
        object-contain
        shadow-[0_8px_22px_rgba(15,58,110,0.10)]
        transition-transform
        duration-300
        group-hover:scale-[1.03]
      "
    />
  ) : (
    <div
      className="
        flex
        h-14
        w-14
        items-center
        justify-center
        rounded-[18px]
        bg-gradient-to-br
        from-[#075fc8]
        to-[#7c3aed]
        text-white
        shadow-[0_10px_25px_rgba(7,95,200,0.20)]
      "
    >
      <GraduationCap size={25} />
    </div>
  )}
</div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div
        className="
          flex
          flex-1
          flex-col

          px-1
          pb-1
          pt-4
        "
      >
        <p
          className="
            text-[9px]
            font-black
            uppercase

            tracking-[0.14em]

            text-[#087bea]
          "
        >
          {categoryName}
        </p>

        <h3
          className="
            mt-1.5

            line-clamp-2

            text-[15px]
            font-black
            leading-6

            text-[#102c5c]
          "
        >
          {title}
        </h3>

        <p
          className="
            mt-2

            text-[10px]
            font-medium

            text-slate-400
          "
        >
          {examName}
        </p>

        {/* =================================================
            BUTTON
        ================================================= */}

        <Link
          href={
            href
          }
          className="
            group/button

            mt-auto
            pt-5
          "
        >
          <span
            className="
              flex
              min-h-[42px]

              items-center
              justify-between

              rounded-[14px]

              bg-gradient-to-r
              from-[#071f55]
              via-[#075fc8]
              to-[#087bea]

              px-4

              text-[11px]
              font-extrabold
              text-white

              shadow-[0_8px_20px_rgba(7,95,200,0.17)]

              transition-all
              duration-300

              group-hover/button:shadow-[0_12px_28px_rgba(7,95,200,0.26)]
            "
          >
            Explore Course

            <ArrowRight
              size={15}
              className="
                transition-transform
                duration-300

                group-hover/button:translate-x-1
              "
            />
          </span>
        </Link>
      </div>
    </article>
  );
}