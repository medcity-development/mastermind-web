import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
} from "lucide-react";

const posts = [
  {
    title:
      "How to Ace LDC Exam in 3 Months",
    image:
      "/assets/preparing-exam.png",
    date: "10 April 2025",
    time: "8 min read",
    href: "/blogs/ace-ldc-exam",
  },
  {
    title:
      "Previous Year Questions – Why They Matter",
    image:
      "/assets/previous-questions-practicing.png",
    date: "08 April 2025",
    time: "6 min read",
    href: "/blogs/previous-year-questions",
  },
  {
    title:
      "A Day in the Life of a PSC Aspirant",
    image:
      "/assets/psc-aspirant-studying.png",
    date: "05 April 2025",
    time: "5 min read",
    href: "/blogs/psc-aspirant-life",
  },
];

export default function RecentPosts() {
  return (
    <section
      className="
        rounded-[20px]
        border
        border-[#dce9f7]
        bg-white
        p-4
        shadow-[0_10px_30px_rgba(20,72,125,0.05)]
      "
    >
      <div
        className="
          mb-3
          flex
          items-center
          justify-between
          gap-2
        "
      >
        <h3
          className="
            text-base
            font-black
            text-[#082b7a]
          "
        >
          Recent Posts
        </h3>

        <Link
          href="/blogs"
          className="
            flex
            items-center
            gap-1
            text-[11px]
            font-bold
            text-[#0767dd]
          "
        >
          View All
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="divide-y divide-[#edf2f8]">
        {posts.map((post) => (
          <Link
            href={post.href}
            key={post.title}
            className="
              group
              flex
              gap-3
              py-3
              first:pt-0
              last:pb-0
            "
          >
            <div
              className="
                relative
                h-[58px]
                w-[72px]
                shrink-0
                overflow-hidden
                rounded-xl
              "
            >
              <Image
                src={post.image}
                alt={post.title}
                fill
                sizes="72px"
                className="
                  object-cover
                  transition
                  duration-300
                  group-hover:scale-105
                "
              />
            </div>

            <div className="min-w-0">
              <h4
                className="
                  line-clamp-2
                  text-xs
                  font-bold
                  leading-4
                  text-[#0a317f]
                "
              >
                {post.title}
              </h4>

              <div
                className="
                  mt-2
                  flex
                  flex-wrap
                  gap-2
                  text-[9px]
                  text-[#7287ab]
                "
              >
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {post.date}
                </span>

                <span className="flex items-center gap-1">
                  <Clock3 className="h-3 w-3" />
                  {post.time}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}