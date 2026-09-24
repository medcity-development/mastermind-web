import Link from "next/link";
import MobileHeroFeatures from "./MobileHeroFeatures";
import MobileHeroTrust from "./MobileHeroTrust";

export default function MobileHeroContent() {
  return (
    <div
      className="
        relative
        z-10
        mx-auto
        w-full
        max-w-[760px]
        px-5
        pb-14
        pt-10
        sm:px-6
        sm:pb-16
        sm:pt-12 mt-24
      "
    >
      <div className="w-full text-center">
        {/* Badge */}

        <div
          className="
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-white/15
            bg-white/[0.08]
            px-4
            py-2
            text-[10px]
            font-semibold
            tracking-[0.05em]
            text-blue-100
            shadow-[0_10px_30px_rgba(0,0,0,.12)]
            backdrop-blur-xl
            sm:text-xs
          "
        >
          <span
            className="
              flex
              h-5
              w-5
              items-center
              justify-center
              rounded-full
              bg-white/10
              text-[10px]
              text-blue-200
            "
          >
            ✦
          </span>

          KERALA PSC, SSC & RRB COACHING
        </div>

        {/* Heading */}

        <h1
          className="
            mt-6
            text-[clamp(2.65rem,11vw,4rem)]
            font-bold
            leading-[1.03]
            tracking-[-0.045em]
            text-white
          "
        >
          <span className="block">
            Master Your
          </span>

          <span
            className="
              block
              bg-gradient-to-r
              from-[#64c7ff]
              via-[#bb8cff]
              to-[#f18dc8]
              bg-clip-text
              pb-1
              text-transparent
            "
          >
            Competitive Exams
          </span>
        </h1>

        {/* Description */}

        <p
          className="
            mx-auto
            mt-5
            max-w-[570px]
            text-sm
            leading-7
            text-blue-100/75
            sm:text-base
            sm:leading-8
          "
        >
          Prepare smarter for Kerala PSC, SSC and RRB with expert-led
          classes, mock tests, previous year questions, current affairs
          and structured study materials.
        </p>

        {/* Actions */}

        <div
          className="
            mt-7
            flex
            flex-col
            justify-center
            gap-3
            min-[420px]:flex-row
          "
        >
          <Link
            href="/register"
            className="
              group
              inline-flex
              min-h-12
              items-center
              justify-center
              gap-4
              rounded-xl
              bg-gradient-to-r
              from-[#0872ff]
              via-[#3c52ff]
              to-[#7840ee]
              px-7
              py-3
              text-sm
              font-semibold
              text-white
              shadow-[0_12px_35px_rgba(33,72,255,0.28)]
              transition-all
              duration-300
              hover:-translate-y-1
            "
          >
            Register Now

            <span
              className="
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            >
              →
            </span>
          </Link>

          <Link
            href="#courses"
            className="
              group
              inline-flex
              min-h-12
              items-center
              justify-center
              gap-4
              rounded-xl
              border
              border-white/20
              bg-white/[0.08]
              px-7
              py-3
              text-sm
              font-semibold
              text-white
              backdrop-blur-xl
              transition
              hover:bg-white/[0.14]
            "
          >
            Explore Courses

            <span
              className="
                transition-transform
                group-hover:translate-x-1
              "
            >
              →
            </span>
          </Link>
        </div>

        <MobileHeroFeatures />

        <MobileHeroTrust />
      </div>
    </div>
  );
}