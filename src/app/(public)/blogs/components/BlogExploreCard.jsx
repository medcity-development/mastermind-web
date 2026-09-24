import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  Lightbulb,
  Newspaper,
  Target,
} from "lucide-react";

const categories = [
  {
    label: "Study Tips",
    href: "/blogs?category=study-tips",
    icon: Lightbulb,
  },
  {
    label: "Current Affairs",
    href: "/blogs?category=current-affairs",
    icon: Newspaper,
  },
  {
    label: "Exam Strategy",
    href: "/blogs?category=exam-strategy",
    icon: Target,
  },
];

export default function BlogExploreCard() {
  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[18px]
        border
        border-[#d9e8f7]
        bg-gradient-to-br
        from-[#f4faff]
        via-white
        to-[#eef5ff]
        p-4
        shadow-[0_8px_24px_rgba(15,58,110,0.06)]
      "
    >
      {/* Decorative blobs */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-10
          -top-10
          h-28
          w-28
          rounded-full
          bg-[#38bdf8]/10
          blur-2xl
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -bottom-12
          -left-10
          h-28
          w-28
          rounded-full
          bg-[#8b5cf6]/10
          blur-2xl
        "
      />

      <div className="relative z-10">
        {/* Heading */}
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-gradient-to-br
              from-[#087ee9]
              to-[#5b42e8]
              text-white
              shadow-[0_6px_16px_rgba(8,126,233,0.22)]
            "
          >
            <BookOpen className="h-5 w-5" />
          </div>

          <div>
            <h3
              className="
                text-base
                font-black
                leading-5
                text-[#082b7a]
              "
            >
              Explore Our Blog
            </h3>

            <p
              className="
                mt-0.5
                text-[11px]
                leading-4
                text-[#7184a6]
              "
            >
              Learn smarter. Prepare better.
            </p>
          </div>
        </div>

       

        {/* All blogs */}
        <Link
          href="/blogs"
          className="
            mt-3
            flex
            items-center
            justify-center
            gap-1.5
            rounded-xl
            px-4
            py-2.5
            text-[11px]
            font-bold
            text-pink-600
            transition-all
            duration-200
            hover:bg-[#0b3c94]
          "
        >
          View All Blogs

          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}