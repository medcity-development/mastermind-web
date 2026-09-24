import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
} from "lucide-react";

import {
  createSlug,
} from "@/lib/pscSlug";

/* =========================================================
   IMAGE URL
========================================================= */

function buildImageUrl(
  filePath,
  image
) {
  if (!image) {
    return "";
  }

  if (
    String(image).startsWith(
      "http"
    )
  ) {
    return image;
  }

  if (!filePath) {
    return "";
  }

  return `${String(
    filePath
  ).replace(/\/+$/, "")}/${String(
    image
  ).replace(/^\/+/, "")}`;
}

/* =========================================================
   CARD
========================================================= */

export default function SubCategoryCourseCard({
  course,
  cid,
  subId,
  subCategorySlug,
  filePath = "",
}) {
  if (!course?.id) {
    return null;
  }

  const title =
    course?.exam ||
    course?.name ||
    course?.subcourse ||
    "Kerala PSC Course";

  const courseSlug =
    createSlug(title);

  const imageUrl =
    buildImageUrl(
      filePath,
      course?.icon_large ||
        course?.icon
    );

  /* =======================================================
     DETAILS URL

     examId = selected course/sub-exam id
     subId  = selected level/category id
  ======================================================= */

  const href = {
    pathname:
      `/government-exams-coaching/kerala-psc/sub-courses/${subCategorySlug}/${courseSlug}`,

    query: {
      cid:
        String(
          cid || 1
        ),

      subId:
        String(
          subId || ""
        ),

      examId:
        String(
          course.id
        ),
    },
  };

  return (
    <Link
      href={href}
      className="
        group
        relative
        flex
        min-h-[250px]
        flex-col
        overflow-hidden
        rounded-[24px]
        border
        border-[#dce8f7]
        bg-white
        shadow-[0_10px_30px_rgba(15,23,42,0.05)]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-[#017dc0]/30
        hover:shadow-[0_20px_45px_rgba(22,79,165,0.11)]
      "
    >
      {/* IMAGE */}

      <div
        className="
          relative
          flex
          h-[155px]
          items-center
          justify-center
          overflow-hidden
          bg-gradient-to-br
          from-[#eef7ff]
          via-[#f7fbff]
          to-[#e3f4ff]
          p-4
        "
      >
        {imageUrl ? (
          <div
            className="
              relative
              h-full
              w-full
              overflow-hidden
              rounded-[16px]
            "
          >
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="
                (max-width: 640px) 100vw,
                (max-width: 1024px) 50vw,
                25vw
              "
              className="
                object-contain
              "
              unoptimized
            />
          </div>
        ) : (
          <div
            className="
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-[18px]
              bg-white
              text-[#087bea]
              shadow-sm
            "
          >
            <BookOpen
              size={27}
            />
          </div>
        )}
      </div>

      {/* CONTENT */}

      <div
        className="
          flex
          flex-1
          flex-col
          p-5
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
          Kerala PSC Course
        </p>

        <h3
          className="
            mt-2
            line-clamp-2
            text-[16px]
            font-black
            leading-6
            text-[#071f55]
          "
        >
          {title}
        </h3>

        {course?.name_mal ? (
          <p
            className="
              mt-1
              line-clamp-1
              text-[11px]
              text-slate-500
            "
          >
            {course.name_mal}
          </p>
        ) : null}

        <div
          className="
            mt-auto
            flex
            items-center
            justify-between
            border-t
            border-[#e8eef7]
            pt-4
          "
        >
          <span
            className="
              text-[11px]
              font-bold
              text-[#075fc8]
            "
          >
            Explore Course
          </span>

          <span
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              bg-[#edf7ff]
              text-[#075fc8]
              transition-all
              group-hover:bg-[#075fc8]
              group-hover:text-white
            "
          >
            <ArrowRight
              size={15}
            />
          </span>
        </div>
      </div>
    </Link>
  );
}