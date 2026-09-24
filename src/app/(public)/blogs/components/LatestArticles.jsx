import Link from "next/link";
import { ArrowRight } from "lucide-react";
import BlogCard from "./BlogCard";

const articles = [
  {
    category: "Current Affairs",
    title:
      "Important Kerala Current Affairs for PSC Exams – March 2025",
    description:
      "A quick revision guide to the most important events in Kerala for your upcoming exams.",
    image:
      "/assets/kerala-government.png",
    date: "10 April 2025",
    readTime: "5 min read",
    href: "/blogs/kerala-current-affairs",
  },
  {
    category: "Exam Tips",
    title:
      "Top 10 Study Tips from PSC Toppers",
    description:
      "Learn proven study strategies and practical tips from successful candidates.",
    image:
      "/assets/success.png",
    date: "08 April 2025",
    readTime: "6 min read",
    href: "/blogs/psc-study-tips",
  },
  {
    category: "Motivation",
    title:
      "Stay Motivated in Your PSC Journey",
    description:
      "Simple yet powerful ways to stay focused, positive and consistent.",
    image:
      "/assets/exam-motivation.png",
    date: "05 April 2025",
    readTime: "4 min read",
    href: "/blogs/psc-motivation",
  },
];

export default function LatestArticles() {
  return (
    <section className="mt-8">
      <div
        className="
          mb-3
          flex
          items-center
          justify-between
          gap-4
        " data-aos="fade-up"
      >
        <h2
          className="
            text-lg
            font-black
            text-[#0b2b7f]
            sm:text-xl
          "
        >
          Latest Articles
        </h2>

        <Link
          href="/blogs"
          className="
            flex
            items-center
            gap-1
            text-xs
            font-bold
            text-[#086ee4]
            transition
            hover:gap-2
            sm:text-sm
          "
        >
          View All Posts
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div
        className="
          grid
          gap-4
          sm:grid-cols-2
          lg:grid-cols-3
        " data-aos="fade-up"
      >
        {articles.map((article) => (
          <BlogCard
            key={article.title}
            {...article}
          />
        ))}
      </div>
    </section>
  );
}