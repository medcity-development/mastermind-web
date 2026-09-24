import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Play,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Play,
    label: "Video Classes",
    cardClass:
      "from-[#e8f5ff] via-[#eef9ff] to-[#e6efff]",
    iconClass:
      "from-[#164fa5] via-[#017cc0] to-[#00b5e8]",
    borderClass:
      "border-[#00b5e8]/15",
  },
  {
    icon: BookOpen,
    label: "Previous Questions",
    cardClass:
      "from-[#f2edff] via-[#f6f2ff] to-[#edf0ff]",
    iconClass:
      "from-[#7c4dff] via-[#5d48d8] to-[#164fa5]",
    borderClass:
      "border-[#7c4dff]/15",
  },
  {
    icon: BarChart3,
    label: "Mock Tests",
    cardClass:
      "from-[#fff0f6] via-[#fff4f8] to-[#f6efff]",
    iconClass:
      "from-[#df1768] via-[#be3c98] to-[#7c4dff]",
    borderClass:
      "border-[#df1768]/15",
  },
];

export default function AppHeroCard() {
  return (
    <section
      className="
        relative
        h-full
        min-h-0
        overflow-hidden
        rounded-[28px]
        border
        border-[#164fa5]/10
        bg-gradient-to-br
        from-[#fbfdff]
        via-[#eef8ff]
        to-[#f4efff]
        shadow-[0_20px_55px_rgba(11,33,108,0.09)]
      "
    >
      {/* BACKGROUND COLOR WASH */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-br
          from-[#00b5e8]/[0.04]
          via-transparent
          to-[#7c4dff]/[0.06]
        "
      />

      {/* MEDIUM BLUE GRID */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-y-0
          left-0
          w-[48%]
          opacity-70
          [background-image:linear-gradient(rgba(1,124,192,0.075)_1px,transparent_1px),linear-gradient(90deg,rgba(1,124,192,0.075)_1px,transparent_1px)]
          [background-size:28px_28px]
          [mask-image:linear-gradient(to_right,black_25%,rgba(0,0,0,0.75)_60%,transparent_100%)]
        "
      />

      {/* COLOR GLOWS */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-16
          bottom-[-80px]
          h-64
          w-64
          bg-[#00b5e8]/14
          blur-[80px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-10
          top-[-70px]
          h-64
          w-64
          bg-[#7c4dff]/12
          blur-[85px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-[-80px]
          right-[22%]
          h-52
          w-52
          bg-[#df1768]/10
          blur-[80px]
        "
      />

      {/* CONTENT */}
      <div
        className="
          relative
          z-10
          grid
          h-full
          min-h-0
          grid-cols-1
          items-center
          gap-6
          px-6
          py-6
          md:grid-cols-[0.94fr_1.06fr]
          lg:px-8
          lg:py-7
          xl:px-10
        "
      >
        {/* APP IMAGE LEFT */}
        <div
          className="
            relative
            flex
            h-full
            min-h-0
            items-center
            justify-center
          "
        >
          

          {/* phone shadow */}
          <div
            aria-hidden="true"
            className="
              absolute
              bottom-[7%]
              h-8
              w-[44%]
              rounded-[50%]
              bg-[#0b216c]/20
              blur-xl
            "
          />

          <Image
            src="/assets/mastermind-app.png"
            alt="Mastermind PSC mobile learning application"
            width={620}
            height={1100}
            sizes="
              (max-width: 768px) 55vw,
              (max-width: 1280px) 32vw,
              380px
            "
            className="
              relative
              z-10
              h-auto
              max-h-[315px]
              w-auto
              max-w-[72%]
              -rotate-[3deg]
              object-contain
              drop-shadow-[0_30px_38px_rgba(11,33,108,0.24)]
              sm:max-h-[345px]
              lg:max-h-[380px]
              xl:max-h-[410px]
            "
          />
        </div>

        {/* TEXT RIGHT */}
        <div className="min-w-0">
          {/* TOP LABEL */}
          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-[#164fa5]/10
              bg-white/75
              px-3
              py-1.5
              shadow-[0_6px_18px_rgba(11,33,108,0.05)]
              backdrop-blur
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
                bg-gradient-to-br
                from-[#164fa5]
                to-[#00b5e8]
                text-white
              "
            >
              <Sparkles size={11} />
            </span>

            <span
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-[0.22em]
                text-[#164fa5]/75
                xl:text-[10px]
              "
            >
              Learn • Practice • Succeed
            </span>
          </div>

          {/* HEADING */}
          <h1
            className="
              mt-4
              max-w-[450px]
              text-[30px]
              font-black
              leading-[0.98]
              tracking-[-0.045em]
              text-[#0b216c]
              sm:text-[34px]
              lg:text-[38px]
              xl:text-[42px]
            "
          >
            Your One Stop

            <span
              className="
                mt-1
                block
                bg-gradient-to-r
                from-[#164fa5]
                via-[#017cc0]
                to-[#7c4dff]
                bg-clip-text
                text-transparent
              "
            >
              PSC Learning App
            </span>
          </h1>

          {/* DESCRIPTION */}
          <p
            className="
              mt-4
              max-w-[430px]
              text-[13px]
              leading-6
              text-slate-600
              xl:text-[14px]
            "
          >
            Learn anytime, anywhere with structured courses,
            expert faculty and real exam practice designed for
            serious aspirants.
          </p>

          {/* FEATURE CARDS */}
          <div
            className="
              mt-5
              grid
              gap-2.5
              sm:grid-cols-3
            "
          >
            {features.map(
              ({
                icon: IconComponent,
                label,
                cardClass,
                iconClass,
                borderClass,
              }) => (
                <div
                  key={label}
                  className={`
                    group
                    relative
                    overflow-hidden
                    rounded-[15px]
                    border
                    ${borderClass}
                    bg-gradient-to-br
                    ${cardClass}
                    px-3
                    py-3
                    shadow-[0_8px_22px_rgba(11,33,108,0.05)]
                    transition
                    duration-300
                    hover:-translate-y-0.5
                    hover:shadow-[0_13px_26px_rgba(11,33,108,0.08)]
                  `}
                >
                  <div
                    aria-hidden="true"
                    className="
                      absolute
                      -bottom-8
                      -right-8
                      h-16
                      w-16
                      rounded-full
                      bg-white/50
                    "
                  />

                  <div
                    className={`
                      relative
                      z-10
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-[11px]
                      bg-gradient-to-br
                      ${iconClass}
                      text-white
                      shadow-[0_7px_18px_rgba(22,79,165,0.18)]
                    `}
                  >
                    <IconComponent size={16} />
                  </div>

                  <p
                    className="
                      relative
                      z-10
                      mt-2.5
                      text-[11px]
                      font-black
                      leading-4
                      text-[#0b216c]
                      xl:text-[12px]
                    "
                  >
                    {label}
                  </p>
                </div>
              )
            )}
          </div>

          {/* PAGINATION */}
          <div className="mt-5 flex items-center gap-2">
            <span
              className="
                h-2
                w-7
                rounded-full
                bg-gradient-to-r
                from-[#164fa5]
                via-[#017cc0]
                to-[#00b5e8]
              "
            />

            <span className="h-2 w-2 rounded-full bg-[#7c4dff]/30" />
            <span className="h-2 w-2 rounded-full bg-[#df1768]/30" />
          </div>

          {/* CTA */}
          <Link
            href="#"
            className="
              group
              mt-5
              inline-flex
              min-h-[46px]
              items-center
              justify-center
              gap-3
              rounded-[13px]
              bg-gradient-to-r
              from-[#164fa5]
              via-[#017cc0]
              to-[#00b5e8]
              px-6
              text-[12px]
              font-bold
              text-white
              shadow-[0_14px_32px_rgba(22,79,165,0.25)]
              transition
              duration-300
              hover:-translate-y-0.5
              hover:shadow-[0_18px_38px_rgba(22,79,165,0.32)]
              xl:text-[13px]
            "
          >
            Download App Now

            <span
              className="
                flex
                h-6
                w-6
                items-center
                justify-center
                rounded-full
                bg-white/15
              "
            >
              <ArrowRight
                size={14}
                className="
                  transition
                  duration-300
                  group-hover:translate-x-0.5
                "
              />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}