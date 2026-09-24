import Image from "next/image";
import Link from "next/link";
import {
  Bookmark,
  CalendarDays,
  Clock3,
} from "lucide-react";

export default function BlogCard({
  category,
  title,
  description,
  image,
  date,
  readTime,
  href,
}) {
  return (
    <article
      className="
        group
        overflow-hidden
        rounded-[18px]
        border
        border-[#dce8f7]
        bg-white
        shadow-[0_10px_30px_rgba(22,72,126,0.06)]
        transition
        duration-300
        hover:-translate-y-1
        hover:shadow-[0_18px_40px_rgba(22,72,126,0.1)]
      "
    >
      <Link href={href}>
        <div
          className="
            relative
            aspect-[1.65/1]
            overflow-hidden
          "
        >
          <Image
            src={image}
            alt={title}
            fill
            sizes="
              (max-width: 768px) 100vw,
              (max-width: 1280px) 50vw,
              33vw
            "
            className="
              object-cover
              transition
              duration-500
              group-hover:scale-[1.04]
            "
          />

          <span
            className="
              absolute
              left-3
              top-3
              rounded-full
              bg-[#087ee9]
              px-3
              py-1.5
              text-[10px]
              font-bold
              text-white
              shadow-sm
            "
          >
            {category}
          </span>
        </div>
      </Link>

      <div className="p-4">
        <div
          className="
            flex
            items-center
            justify-between
            gap-2
            text-[11px]
            text-[#6880a9]
          "
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {date}
            </span>

            <span className="flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              {readTime}
            </span>
          </div>

          <button
            type="button"
            aria-label="Bookmark article"
            className="
              text-[#184799]
              transition
              hover:text-[#0b7ce8]
            "
          >
            <Bookmark className="h-4 w-4" />
          </button>
        </div>

        <Link href={href}>
          <h3
            className="
              mt-3
              text-[16px]
              font-black
              leading-5
              text-[#082b7a]
              transition
              group-hover:text-[#057fe7]
            "
          >
            {title}
          </h3>
        </Link>

        <p
          className="
            mt-2
            text-xs
            leading-5
            text-[#667ca8]
          "
        >
          {description}
        </p>
      </div>
    </article>
  );
}