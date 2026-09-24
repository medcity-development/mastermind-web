import Link from "next/link";

export default function BlogHero() {
  return (
    <section
      className="
        relative
        mt-24
        overflow-hidden
        rounded-[28px]
        border
        border-white/10
        bg-gradient-to-br
        from-[#030818]
        via-[#071b38]
        to-[#1a0b31]
        px-5
        py-7
        shadow-[0_24px_70px_rgba(32,50,120,0.16)]
        sm:px-7
        sm:py-8
        lg:px-9
        lg:py-10
      " data-aos="fade-right"
    >
      {/* ================================================
          GRID PATTERN
      ================================================= */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-40
          [background-image:linear-gradient(to_right,rgba(125,211,252,0.09)_1px,transparent_1px),linear-gradient(to_bottom,rgba(125,211,252,0.09)_1px,transparent_1px)]
          [background-size:32px_32px]
        "
      />

      {/* ================================================
          DECORATIVE COLOR GLOWS
      ================================================= */}

      {/* Left violet glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-28
          -top-32
          h-[360px]
          w-[360px]
          rounded-full
          bg-[#6d28d9]/25
          blur-[115px]
        "
      />

      {/* Upper blue glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-[28%]
          -top-44
          h-[340px]
          w-[420px]
          rounded-full
          bg-[#2563eb]/20
          blur-[120px]
        "
      />

      {/* Right pink glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-24
          -top-24
          h-[340px]
          w-[340px]
          rounded-full
          bg-[#db2777]/22
          blur-[115px]
        "
      />

      {/* Bottom cyan glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-[-200px]
          left-[45%]
          h-[360px]
          w-[620px]
          -translate-x-1/2
          rounded-full
          bg-[#0284c7]/20
          blur-[120px]
        "
      />

      {/* Bottom-right violet glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -bottom-40
          -right-20
          h-[300px]
          w-[360px]
          rounded-full
          bg-[#9333ea]/16
          blur-[110px]
        "
      />

      {/* ================================================
          COLOR WASH
      ================================================= */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-r
          from-[#6d28d9]/10
          via-[#0284c7]/5
          to-[#db2777]/10
        "
      />

      {/* ================================================
          TOP BORDER GLOW
      ================================================= */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-[#7dd3fc]/50
          to-transparent
        "
      />

      {/* ================================================
          BOTTOM BORDER GLOW
      ================================================= */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-[#a855f7]/30
          to-transparent
        "
      />

      {/* ================================================
          CONTENT
      ================================================= */}
      <div className="relative z-10">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="
            mb-5
            flex
            items-center
            gap-2
            text-xs
            font-semibold
            sm:text-sm
          "
        >
          <Link
            href="/"
            className="
              text-[#7dd3fc]
              transition-colors
              duration-200
              hover:text-white
            "
          >
            Home
          </Link>

          <span
            aria-hidden="true"
            className="text-white/30"
          >
            /
          </span>

          <span className="text-white/60">
            Blogs
          </span>
        </nav>

        <div
          className="
            flex
            flex-col
            gap-6
            md:flex-row
            md:items-end
            md:justify-between
          "
        >
          {/* ================================================
              LEFT CONTENT
          ================================================= */}
          <div className="max-w-4xl">
            <h1
              className="
                text-3xl
                font-black
                leading-[1.05]
                tracking-[-0.035em]
                text-white
                sm:text-4xl
                lg:text-5xl
              "
            >
              Latest from{" "}
              <span
                className="
                  bg-gradient-to-r
                  from-[#7dd3fc]
                  via-[#38bdf8]
                  to-[#c4b5fd]
                  bg-clip-text
                  text-transparent
                "
              >
                Our Blog
              </span>
            </h1>

            <p
              className="
                mt-3
                max-w-3xl
                text-sm
                leading-6
                text-white/65
                sm:text-base
                sm:leading-7
              "
            >
              Expert insights, study strategies,
              exam updates and motivation to help
              you move forward confidently in your
              PSC preparation journey.
            </p>
          </div>

          {/* ================================================
              LEARN / PLAN / ACHIEVE
          ================================================= */}
          <div
            className="
              hidden
              shrink-0
              rotate-[-6deg]
              pr-5
              text-right
              font-black
              italic
              leading-[0.95]
              text-white
              xl:block
            "
          >
            <p className="text-2xl">
              Learn
            </p>

            <p className="text-2xl">
              Plan
            </p>

            <p className="text-2xl">
              Achieve
            </p>

            {/* Decorative underline */}
            <div
              className="
                ml-auto
                mt-3
                h-[3px]
                w-16
                rotate-[-8deg]
                rounded-full
                bg-gradient-to-r
                from-[#ff3b91]
                to-[#a855f7]
                shadow-[0_0_16px_rgba(255,59,145,0.45)]
              "
            />
          </div>
        </div>
      </div>
    </section>
  );
}