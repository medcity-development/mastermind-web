// src/components/footer/FooterColumn.jsx

import Link from "next/link";

import {
  ChevronRight,
} from "lucide-react";

export default function FooterColumn({
  title,
  links = [],
}) {
  return (
    <div>
      {/* TITLE */}

      <div>
        <h3
          className="
            text-[13px]
            font-bold
            text-white
          "
        >
          {title}
        </h3>

        <div
          className="
            mt-2
            h-[3px]
            w-7
            rounded-full
            bg-[#00b5e8]
          "
        />
      </div>

      {/* LINKS */}

      <div
        className="
          mt-5
          flex
          flex-col
          gap-3
        "
      >
        {links.map(
          (item) => (
            <Link
              key={item.href}
              href={item.href}
              className="
                group
                flex
                w-fit
                items-center
                gap-2
                text-[11px]
                font-medium
                text-white/65
                transition-all
                duration-300
                hover:translate-x-1
                hover:text-white
              "
            >
              <ChevronRight
                className="
                  h-3.5
                  w-3.5
                  text-[#00b5e8]
                  transition-transform
                  duration-300
                  group-hover:translate-x-0.5
                "
                strokeWidth={2.5}
              />

              {item.label}
            </Link>
          )
        )}
      </div>
    </div>
  );
}