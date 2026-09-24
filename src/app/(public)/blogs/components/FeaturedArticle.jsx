import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
} from "lucide-react";


export default function FeaturedArticle() {
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
          Featured Article
        </h2>

       
      </div>

      <article
        className="
          overflow-hidden
          rounded-[22px]
          border
          border-[#dbe8f7]
          bg-white
          shadow-[0_15px_45px_rgba(21,78,145,0.08)]
        " data-aos="fade-up"
      >
        <div
          className="
            grid
            min-h-[300px]
            lg:grid-cols-[0.8fr_1.2fr]
          "
        >
          <div
            className="
              order-2
              flex
              flex-col
              justify-center
              p-5
              sm:p-6
              lg:order-1
              lg:p-7
            "
          >
            <span
              className="
                w-fit
                rounded-full
                bg-[#0d87f4]
                px-4
                py-2
                text-xs
                font-bold
                text-white
                shadow-[0_7px_18px_rgba(13,135,244,0.2)]
              "
            >
              Study Strategy
            </span>

            <h3
              className="
                mt-4
                max-w-lg
                text-2xl
                font-black
                leading-[1.08]
                tracking-[-0.02em]
                text-[#082b7a]
                sm:text-3xl
              "
            >
              How to Plan Your PSC Preparation –
              A Complete Roadmap
            </h3>

            <p
              className="
                mt-3
                max-w-lg
                text-sm
                leading-6
                text-[#667ba7]
              "
            >
              A step-by-step guide to help you
              plan, prepare and stay consistent
              in your PSC journey.
            </p>

            <div
              className="
                mt-5
                flex
                flex-wrap
                items-center
                gap-x-4
                gap-y-2
                text-xs
                text-[#58719e]
              "
            >
              <span className="font-semibold text-[#173e8a]">
                By Anjali Nair
              </span>

              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                12 April 2025
              </span>

              <span className="flex items-center gap-1">
                <Clock3 className="h-3.5 w-3.5" />
                8 min read
              </span>
            </div>

            <Link
              href="/blogs/psc-preparation-roadmap"
              className="
                mt-5
                inline-flex
                w-fit
                items-center
                gap-2
                rounded-full
                bg-gradient-to-r
                from-[#076be8]
                to-[#0054d9]
                px-5
                py-3
                text-sm
                font-bold
                text-white
                shadow-[0_10px_24px_rgba(0,84,217,0.24)]
                transition
                hover:-translate-y-0.5
              "
            >
              Read Full Article
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div
  className="
    relative
    order-1
    min-h-[240px]
    overflow-hidden
    lg:order-2
    lg:min-h-full
  "
>
  <Image
    src="/assets/student-learning.webp"
    alt="PSC aspirant studying with laptop"
    fill
    sizes="
      (max-width: 640px) 100vw,
      (max-width: 1024px) 100vw,
      (max-width: 1280px) 55vw,
      760px
    "
    className="
      object-cover
      object-center
    "
  />

  <div
    aria-hidden="true"
    className="
      pointer-events-none
      absolute
      inset-0
      bg-gradient-to-r
      from-white/10
      via-transparent
      to-transparent
    "
  />
</div>
        </div>
      </article>
    </section>
  );
}