import Link from "next/link";

import {
  ArrowRight,
} from "lucide-react";

export default function LatestUpdateCard({
  item,
}) {
  const Icon =
    item.icon;

  return (
    <article
      data-aos="fade-up"
      className="
        group
        flex
        min-h-[90px]
        items-center
        gap-4

        rounded-[18px]

        border
        border-[#e7eef7]

        bg-white

        px-4
        py-3

        shadow-[0_8px_22px_rgba(15,58,110,0.04)]

        transition-all
        duration-300

        hover:-translate-y-0.5
        hover:border-[#cfe0f2]
        hover:shadow-[0_14px_30px_rgba(15,58,110,0.09)]
      "
    >
      {/* ICON */}

      <div
        className={`
          flex
          h-12
          w-12
          shrink-0
          items-center
          justify-center
          rounded-full

          ${item.iconBg}
          ${item.iconColor}
        `}
      >
        <Icon
          className="
            h-5
            w-5
          "
          strokeWidth={
            2.2
          }
        />
      </div>

      {/* CONTENT */}

      <div className="min-w-0">
        <h3
          className="
            text-[11px]
            font-black
            leading-[1.3]
            text-[#0b216c]

            sm:text-[12px]
          "
        >
          {item.title}
        </h3>

        <p
          className="
            mt-0.5
            text-[11px]
            font-semibold
            leading-4
            text-[#183c80]
          "
        >
          {item.subtitle}
        </p>

        <Link
          href={
            item.href
          }
          className="
            group/link
            mt-1.5
            inline-flex
            items-center
            gap-2

            text-[10px]
            font-bold

            text-[#075ee7]

            underline
            decoration-[#075ee7]/30
            underline-offset-4
          "
        >
          Read More

          <ArrowRight
            className="
              h-3.5
              w-3.5

              transition-transform
              duration-300

              group-hover/link:translate-x-1
            "
          />
        </Link>
      </div>
    </article>
  );
}