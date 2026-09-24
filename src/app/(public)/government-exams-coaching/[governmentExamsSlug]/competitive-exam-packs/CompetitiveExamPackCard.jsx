// CompetitiveExamPackCard.jsx

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
} from "lucide-react";

export default function CompetitiveExamPackCard({
  item,
  cid,
  examName,
  governmentExamsSlug,
}) {
  if (!item) {
    return null;
  }

  const title =
    item?.package ||
    item?.title ||
    "Competitive Exam Pack";

  const tag =
    item?.tag ||
    "";

  const image =
    item?.imageUrl ||
    "/assets/package-placeholder.webp";

  const href =
    `/government-exams-coaching/${governmentExamsSlug}` +
    `/competitive-exam-packs/${item?.slug}`;

  return (
    <article
      data-aos="fade-up"
      className="
        group
        relative
        overflow-hidden
        rounded-[20px]
        border
        border-[#e4edf7]
        bg-white
        p-3
        shadow-[0_8px_24px_rgba(15,58,110,0.05)]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-[#cfe1f3]
        hover:shadow-[0_16px_34px_rgba(15,58,110,0.10)]
        sm:p-4
      "
    >
      <div
        className="
          grid
          gap-4
          sm:grid-cols-[190px_minmax(0,1fr)]
          sm:items-center
        "
      >
        <div
          className="
            relative
            min-h-[170px]
            overflow-hidden
            rounded-[15px]
            bg-slate-100
            sm:min-h-[150px]
          "
        >
          <Image
            src={
              image
            }
            alt={
              title
            }
            fill
            sizes="
              (max-width: 640px) 100vw,
              200px
            "
            className="
              object-cover
              transition-transform
              duration-500
              group-hover:scale-[1.03]
            "
          />
        </div>

        <div
          className="
            flex
            min-w-0
            flex-col
            justify-center
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
            {examName}
          </p>

          <h3
            className="
              mt-1
              text-[18px]
              font-black
              leading-[1.2]
              tracking-[-0.025em]
              text-[#164fa5]
              lg:text-[20px]
            "
          >
            {title}
          </h3>

          {tag && (
            <p
              className="
                mt-2
                text-[12px]
                font-medium
                text-[#53617e]
              "
            >
              {tag}
            </p>
          )}

          <Link
            href={
              href
            }
            className="
              group/link
              mt-5
              inline-flex
              w-fit
              items-center
              gap-3
              rounded-full
              border
              border-[#f13873]
              bg-white
              px-5
              py-2.5
              text-[11px]
              font-bold
              text-[#f13873]
              transition-all
              duration-300
              hover:bg-[#f13873]
              hover:text-white
            "
          >
            View Details

            <ArrowRight
              className="
                h-4
                w-4
                transition-transform
                duration-300
                group-hover/link:translate-x-1
              "
            />
          </Link>
        </div>
      </div>
    </article>
  );
}