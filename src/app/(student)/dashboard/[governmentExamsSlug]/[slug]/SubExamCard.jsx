import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
} from "lucide-react";

import {
  createSlug,
} from "@/lib/pscSlug";

export default function SubExamCard({
  exam,
  iconPath = "",
  levelSlug,
  governmentExamsSlug,
}) {
  if (!exam) {
    return null;
  }

  /* =========================================
     EXAM NAME
  ========================================= */

  const examName =
    exam?.exam_name ||
    exam?.exam ||
    exam?.name ||
    exam?.title ||
    "Exam";

  /* =========================================
     SEO SLUG
  ========================================= */

  const examSlug =
    createSlug(examName);

  /* =========================================
     IMAGE URL
  ========================================= */

  const imageUrl =
    exam?.icon &&
    iconPath
      ? `${String(
          iconPath
        ).replace(
          /\/+$/,
          ""
        )}/${exam.icon}`
      : null;

  /* =========================================
     SEO URL

     NO cid
     NO subId
     NO examId
     NO type
  ========================================= */

  const href =
    `/dashboard/` +
    `${governmentExamsSlug}/` +
    `${levelSlug}/` +
    `${examSlug}`;

  return (
    <article
      className="
        group
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-[24px]
        border
        border-[#dce8f7]
        bg-white
        shadow-[0_12px_35px_rgba(22,79,165,0.06)]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-[0_22px_45px_rgba(22,79,165,0.12)]
      "
    >
      {/* IMAGE */}

      <div
        className="
          relative
          h-[200px]
          w-full
          overflow-hidden
          bg-[#edf6ff]
        "
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={examName}
            fill
            sizes="
              (max-width: 768px) 100vw,
              (max-width: 1280px) 50vw,
              33vw
            "
            className="
              object-contain
              p-3
              transition-transform
              duration-300
              group-hover:scale-[1.03]
            "
          />
        ) : (
          <div
            className="
              flex
              h-full
              items-center
              justify-center
              text-sm
              font-semibold
              text-slate-400
            "
          >
            No image
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
        <span
          className="
            text-[10px]
            font-bold
            uppercase
            tracking-[0.14em]
            text-[#087bea]
          "
        >
          Exam Preparation
        </span>

        <h3
          className="
            mt-2
            line-clamp-2
            text-[17px]
            font-black
            leading-6
            text-[#071f55]
          "
        >
          {examName}
        </h3>

        {exam?.course && (
          <p
            className="
              mt-2
              text-[11px]
              text-slate-500
            "
          >
            {exam.course}
          </p>
        )}

        <div
          className="
            mt-auto
            pt-5
          "
        >
          <div
            className="
              border-t
              border-[#e8eef7]
              pt-4
            "
          >
            <Link
              href={href}
              aria-label={`Explore ${examName}`}
              className="
                flex
                items-center
                justify-between
                text-[12px]
                font-bold
                text-[#075fc8]
              "
            >
              Explore Exam

              <span
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-gradient-to-r
                  from-[#087bea]
                  to-[#164fa5]
                  text-white
                  transition-transform
                  group-hover:translate-x-1
                "
              >
                <ArrowRight
                  size={16}
                />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
