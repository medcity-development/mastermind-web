import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
} from "lucide-react";

import {
  createSlug,
} from "@/lib/pscSlug";

function buildImageUrl(
  filePath,
  image
) {
  if (
    !filePath ||
    !image
  ) {
    return "";
  }

  const cleanPath =
    String(filePath).replace(
      /\/+$/,
      ""
    );

  const cleanImage =
    String(image).replace(
      /^\/+/,
      ""
    );

  return `${cleanPath}/${cleanImage}`;
}

export default function ExamCategoryCard({
  item,
  filePath,
  courseId,
}) {
  const title =
    item?.name ||
    "Exam";

  const slug =
    createSlug(title);

  /*
   * Example:
   *
   * courseId = 1
   * item.id   = 3
   *
   * /government-exams-coaching/kerala-psc/10th-level-exams?cid=1&subId=3
   */
  const href =
    `/government-exams-coaching/kerala-psc/${slug}` +
    `?cid=${encodeURIComponent(
      courseId
    )}` +
    `&subId=${encodeURIComponent(
      item?.id
    )}`;

  const imageUrl =
    buildImageUrl(
      filePath,
      item?.icon_large ||
        item?.icon
    );

  return (
    <Link
      href={href}
      data-category-id={
        item?.id
      }
      className="
        group
        relative
        block
        min-h-[170px]
        overflow-hidden
        rounded-[20px]
        border
        border-white/70
        bg-[#164fa5]
        shadow-[0_10px_28px_rgba(15,58,110,0.10)]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-[0_18px_40px_rgba(15,58,110,0.18)]
        sm:min-h-[180px]
      "
    >
      {/* IMAGE */}
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={`${title} preparation`}
          fill
          sizes="
            (max-width: 640px) 100vw,
            50vw
          "
          className="
            object-cover
            transition-transform
            duration-500
            group-hover:scale-[1.04]
          "
          unoptimized
        />
      )}

      {/* DARK OVERLAY */}
      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          bg-gradient-to-t
          from-black/90
          via-[#061a3a]/70
          to-transparent
        "
      />

      {/* BLUE TINT */}
      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          bg-gradient-to-r
          from-[#164fa5]/15
          to-transparent
        "
      />

      {/* CONTENT */}
      <div
        className="
          absolute
          inset-x-0
          bottom-0
          z-10
          flex
          items-end
          justify-between
          gap-3
          p-4
          sm:p-5
        "
      >
        <div className="min-w-0">
          <h3
            className="
              text-[17px]
              font-bold
              leading-tight
              tracking-[-0.02em]
              text-white
              sm:text-[19px]
            "
          >
            {title}
          </h3>

          {item?.name_mal && (
            <p
              className="
                mt-1
                line-clamp-1
                text-[10px]
                text-white/65
              "
            >
              {item.name_mal}
            </p>
          )}
        </div>

        <span
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-white
            text-[#0b216c]
            shadow-[0_8px_18px_rgba(0,0,0,0.15)]
            transition-all
            duration-300
            group-hover:translate-x-1
            group-hover:scale-105
          "
        >
          <ArrowRight
            size={16}
            strokeWidth={2.4}
          />
        </span>
      </div>
    </Link>
  );
}