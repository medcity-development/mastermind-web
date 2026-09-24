import Link from "next/link";

import {
  ChevronRight,
  Folder,
} from "lucide-react";

function createMonthSlug(
  month,
  year
) {
  return `${String(
    month
  )
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )}-${year}`;
}

export default function CurrentAffairsFolderCard({
  item,
  index,
}) {
  const slug =
    createMonthSlug(
      item?.month,
      item?.year
    );

  const href =
    `/government-exams-coaching/kerala-psc/current-affairs/${slug}?cid=${item?.id}`;

  return (
    <Link
      href={href}
      className="
        group
        flex
        min-h-[82px]
        items-center
        gap-4
        rounded-[18px]
        border
        border-[#e5edf8]
        bg-white
        px-5
        py-4
        shadow-[0_6px_20px_rgba(25,70,130,0.04)]
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:border-[#087bea]/20
        hover:shadow-[0_12px_28px_rgba(25,70,130,0.08)]
      "
    >
      <span
        className="
          flex
          h-12
          w-12
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-gradient-to-br
          from-[#fff8df]
          to-[#ffefb6]
          text-[#ffad0a]
        "
      >
        <Folder
          size={27}
          fill="currentColor"
          strokeWidth={1.5}
        />
      </span>

      <div
        className="
          min-w-0
          flex-1
        "
      >
        <div
          className="
            flex
            items-center
            gap-2
          "
        >
          <h3
            className="
              text-sm
              font-bold
              text-[#102c5c]
            "
          >
            {item?.month}{" "}
            {item?.year}
          </h3>

          {index === 0 && (
            <span
              className="
                rounded-full
                bg-emerald-50
                px-2
                py-1
                text-[8px]
                font-bold
                text-emerald-600
              "
            >
              Latest
            </span>
          )}
        </div>

        <p
          className="
            mt-1
            text-[10px]
            text-slate-500
          "
        >
          Daily Current Affairs
        </p>
      </div>

      <span
        className="
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-full
          bg-[#edf6ff]
          text-[#087bea]
          transition-all
          duration-300
          group-hover:bg-[#087bea]
          group-hover:text-white
        "
      >
        <ChevronRight
          size={16}
        />
      </span>
    </Link>
  );
}