import Image from "next/image";
import Link from "next/link";

import {
  createSlug,
} from "@/lib/pscSlug";

export default function SubExamCard({
  exam,
}) {
  if (!exam?.id) {
    return null;
  }

  const examName =
    exam?.exam ||
    exam?.name ||
    "Mastermind PSC Exam";

  const categoryId =
    exam?.categoryId ||
    exam?.sub_id ||
    null;

  const categoryName =
    exam?.categoryName ||
    exam?.subcourse ||
    "";

  if (
    !categoryId ||
    !categoryName
  ) {
    return null;
  }

  const categorySlug =
    createSlug(
      categoryName
    );

  const examSlug =
    createSlug(
      examName
    );

  const href = {
    pathname:
      `/government-exams-coaching/kerala-psc/sub-courses/${categorySlug}/${examSlug}`,

    query: {
      cid:
        String(
          exam?.cid ||
          1
        ),

      subId:
        String(
          categoryId
        ),

      examId:
        String(
          exam.id
        ),
    },
  };

  return (
    <Link
      href={href}
      aria-label={examName}
      className="
        group
        relative
        block
        h-full
        min-h-[160px]
        w-full
        overflow-hidden
        rounded-[20px]
        border
        border-[#164fa5]/10
        bg-gradient-to-br
        from-[#f5fbff]
        via-[#eef8ff]
        to-[#edf4ff]
        shadow-[0_8px_24px_rgba(11,33,108,0.06)]
        transition
        duration-300
        hover:-translate-y-1
        hover:border-[#164fa5]/20
        hover:shadow-[0_16px_34px_rgba(22,79,165,0.12)]
      "
    >
      <div
        aria-hidden="true"
        className="
          absolute
          inset-x-0
          top-0
          z-30
          h-[4px]
          bg-gradient-to-r
          from-[#0b216c]
          via-[#164fa5]
          to-[#00b5e8]
        "
      />

      <div
        className="
          absolute
          bottom-3
          left-1/2
          top-3
          z-20
          w-[52%]
          -translate-x-1/2
          overflow-hidden
          rounded-[16px]
          border
          border-white/80
          bg-white
          shadow-[0_8px_22px_rgba(11,33,108,0.08)]
        "
      >
        {exam?.imageUrl ? (
          <Image
            src={exam.imageUrl}
            alt={examName}
            fill
            unoptimized
            sizes="
              (max-width: 640px) 70vw,
              (max-width: 768px) 45vw,
              (max-width: 1024px) 30vw,
              20vw
            "
            className="
              object-contain
              object-center
              transition-transform
              duration-500
              ease-out
              group-hover:scale-[1.04]
            "
          />
        ) : (
          <div
            className="
              absolute
              inset-0
              bg-gradient-to-br
              from-[#eaf7ff]
              via-[#f7fbff]
              to-[#e7f5ff]
            "
          />
        )}
      </div>

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-t
          from-[#0b216c]/5
          via-transparent
          to-transparent
        "
      />
    </Link>
  );
}