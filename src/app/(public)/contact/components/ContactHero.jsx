import Link from "next/link";
import {
  MessageCircle,
  PhoneCall,
} from "lucide-react";

export default function ContactHero() {
  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[28px]
        border
        border-[#dbe9f7]
        bg-gradient-to-br
        from-[#f8fcff]
        via-[#eef7ff]
        to-[#f7f2ff]
        px-5
        py-8
        sm:px-7
        lg:px-9
        lg:py-10
      " data-aos="fade-right"
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-20
          -top-20
          h-72
          w-72
          rounded-full
          bg-[#38bdf8]/15
          blur-3xl
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          right-[18%]
          top-[20%]
          h-52
          w-52
          rounded-full
          bg-[#8b5cf6]/10
          blur-3xl
        "
      />

      <div className="relative z-10">
        <nav
          aria-label="Breadcrumb"
          className="
            mb-4
            flex
            items-center
            gap-2
            text-xs
            font-semibold
            text-[#17418f]
            sm:text-sm
          "
        >
          <Link href="/">
            Home
          </Link>

          <span className="text-slate-400">
            ›
          </span>

          <span>
            Contact Us
          </span>
        </nav>

        <div
          className="
            flex
            flex-col
            gap-8
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          <div className="max-w-3xl">
            <h1
              className="
                text-3xl
                font-black
                leading-[1.02]
                tracking-[-0.035em]
                text-[#082b7a]
                sm:text-4xl
                lg:text-5xl
              "
            >
              Get in Touch
              <span
                className="
                  block
                  bg-gradient-to-r
                  from-[#06a9f4]
                  to-[#087ee9]
                  bg-clip-text
                  text-transparent
                "
              >
                We&apos;re Here to Help
              </span>
            </h1>

            <p
              className="
                mt-3
                max-w-2xl
                text-sm
                leading-6
                text-[#667ca8]
                sm:text-base
              "
            >
              Have questions about our courses,
              test series or admissions? Our team
              is always ready to assist you on
              your PSC journey.
            </p>
          </div>

          <div
            className="
              hidden
              min-w-[280px]
              items-center
              justify-end
              gap-4
              lg:flex
            "
          >
            <div
              className="
                rotate-[-8deg]
                text-right
                font-black
                italic
                leading-tight
                text-[#173e9d]
              "
            >
              <p className="text-lg">
                Let&apos;s
              </p>
              <p className="text-xl">
                Build Your
              </p>
              <p className="text-xl">
                Success Together
              </p>

              <div
                className="
                  ml-auto
                  mt-2
                  h-[3px]
                  w-24
                  rounded-full
                  bg-[#ff3b91]
                "
              />
            </div>

            <div
              className="
                flex
                h-24
                w-24
                items-center
                justify-center
                rounded-[28px]
                bg-gradient-to-br
                from-[#eef7ff]
                to-[#dbefff]
                text-[#087ee9]
                shadow-[0_15px_35px_rgba(8,126,233,0.16)]
              "
            >
              <PhoneCall className="h-11 w-11" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}