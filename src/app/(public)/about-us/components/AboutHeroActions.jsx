import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AboutHeroActions() {
  return (
    <div
      className="
        mt-6
        flex
        flex-wrap
        items-center
        justify-center
        gap-3
      "
    >
      <Link
        href="/main-courses"
        className="
          group
          inline-flex
          h-[44px]
          items-center
          justify-center
          gap-2 cursor-pointer
          rounded-full
          bg-gradient-to-r
          from-[#165fd1]
          via-[#078dcc]
          to-[#00b5e8]
          px-6
          text-sm md:text-base
          font-bold
          text-white
          shadow-[0_12px_26px_rgba(22,79,165,0.2)]
          transition-all
          duration-300
          hover:-translate-y-0.5
          hover:shadow-[0_16px_32px_rgba(22,79,165,0.28)]
        "
      >
        Explore Our Courses

        <ArrowRight
          size={13}
          strokeWidth={2.4}
          className="
            transition-transform
            duration-300
            group-hover:translate-x-1
          "
        />
      </Link>

      <Link
        href="/contact"
        className="
          inline-flex
          h-[44px]
          items-center
          justify-center
          rounded-full
          border
          border-[#1676df]/40
          bg-white/80
          px-6
          text-sm md:text-base cursor-pointer
          font-bold
          text-[#125fae]
          shadow-[0_8px_20px_rgba(22,79,165,0.05)]
          backdrop-blur-md
          transition-all
          duration-300
          hover:-translate-y-0.5
          hover:border-[#164fa5]
          hover:bg-white
        "
      >
        Contact Us
      </Link>
    </div>
  );
}