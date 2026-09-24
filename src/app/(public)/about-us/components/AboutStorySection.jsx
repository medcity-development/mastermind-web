// components/about-story/AboutStorySection.jsx

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  Eye,
  Gem,
  GraduationCap,
  Quote,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";

const featureItems = [
  {
    icon: GraduationCap,
    label: "Quality Education",
  },
  {
    icon: Users,
    label: "Student First",
  },
  {
    icon: ShieldCheck,
    label: "Trusted & Reliable",
  },
];

const cards = [
  {
    eyebrow: "Our Mission",
    title: "Make Government Jobs Within Everyone's Reach",
    description:
      "To provide affordable, high-quality PSC, SSC and RRB coaching through structured preparation, innovative learning methods and continuous support.",
    icon: Target,
    tone: "blue",
  },
  {
    eyebrow: "Our Vision",
    title: "To Be the Most Trusted Learning Platform",
    description:
      "To become a trusted destination for competitive exam preparation, recognised for academic excellence, accessibility and student success.",
    icon: Eye,
    tone: "pink",
  },
  {
    eyebrow: "Our Values",
    title: "Integrity. Excellence. Student Success.",
    description:
      "We believe in honest guidance, academic excellence and a learner-first approach in everything we do.",
    icon: Gem,
    tone: "green",
  },
];

const toneClasses = {
  blue: {
    card: "from-[#eef7ff] via-[#f8fcff] to-[#e7f3ff]",
    iconWrap: "bg-[#dcecff]",
    icon: "text-[#1475e5]",
    eyebrow: "text-[#2870cf]",
    glow: "bg-[#7fc6ff]/20",
    line: "from-[#1475e5]/50 to-transparent",
  },

  pink: {
    card: "from-[#fff3f8] via-[#fff9fc] to-[#fdebf3]",
    iconWrap: "bg-[#ffe0ec]",
    icon: "text-[#e81262]",
    eyebrow: "text-[#df4d7f]",
    glow: "bg-[#f59bbb]/20",
    line: "from-[#e81262]/50 to-transparent",
  },

  green: {
    card: "from-[#effbf6] via-[#f8fefb] to-[#e8f8f1]",
    iconWrap: "bg-[#d9f5e8]",
    icon: "text-[#10ad79]",
    eyebrow: "text-[#269a73]",
    glow: "bg-[#7adcb2]/20",
    line: "from-[#10ad79]/50 to-transparent",
  },
};

export default function AboutStorySection() {
  return (
    <section
      className="
        relative
        isolate
        overflow-hidden
        bg-[#f8fcff]
        py-16
        sm:py-20
        lg:py-24
      "  data-aos="fade-up"
    >
      {/* Background */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          -z-20
          bg-[radial-gradient(circle_at_top_left,rgba(219,242,255,0.8),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(251,226,239,0.55),transparent_34%)]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-20
          -z-10
          h-[420px]
          w-[850px]
          max-w-[90vw]
          -translate-x-1/2
          rounded-full
          bg-white/70
          blur-[95px]
        "
      />

      <div
        className="
          mx-auto
          w-full
          max-w-[1450px]
          px-4
          sm:px-6
          lg:px-8
          xl:px-10
        "
      >
        {/* =====================================================
            TOP STORY BLOCK
        ====================================================== */}
        <div
          className="
            grid
            items-center
            gap-10
            rounded-[30px]
            border
            border-white/90
            bg-white/70
            p-6
            shadow-[0_24px_70px_rgba(8,31,92,0.08)]
            backdrop-blur-xl
            sm:p-8
            lg:grid-cols-[1.02fr_0.72fr_1fr]
            lg:gap-10
            lg:p-10
          "
        >
          {/* Story content */}
          <div>
            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-[#164fa5]/10
                bg-[#f4f9ff]
                px-3
                py-1.5
              "
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#1475e5]" />

              <span
                className="
                  text-[8px]
                  font-black
                  uppercase
                  tracking-[0.25em]
                  text-[#275ea8]
                "
              >
                Our Story
              </span>
            </div>

            <h2
              className="
                mt-5
                max-w-[550px]
                text-[32px]
                font-black
                leading-[1.04]
                tracking-[-0.04em]
                text-[#081f5c]
                sm:text-[40px]
                lg:text-[46px]
              "
            >
              A Journey to

              <span
                className="
                  mt-1
                  block
                  bg-gradient-to-r
                  from-[#164fa5]
                  via-[#087fcb]
                  to-[#00b5e8]
                  bg-clip-text
                  text-transparent
                "
              >
                Empower Every Aspirant
              </span>
            </h2>

            <p
              className="
                mt-5
                max-w-[560px]
                text-[12px]
                leading-6
                text-[#5d6c83]
                sm:text-[13px]
                sm:leading-7
              "
            >
              MasterMind Academy was founded with a simple yet powerful
              vision — to make quality Kerala PSC, SSC and RRB coaching
              accessible to every learner. We understand the challenges
              aspirants face and provide the guidance, resources and
              motivation needed to move forward with confidence.
            </p>

            <Link
              href="/main-courses"
              className="
                group
                mt-6
                inline-flex
                h-[44px]
                items-center
                justify-center
                gap-2
                rounded-full
                bg-gradient-to-r
                from-[#1764d9]
                via-[#098acb]
                to-[#00aee7]
                px-6
                text-[10px]
                font-bold
                text-white
                shadow-[0_12px_26px_rgba(23,100,217,0.2)]
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:shadow-[0_16px_34px_rgba(23,100,217,0.26)]
              "
            >
              Explore Our Courses

              <ArrowRight
                size={13}
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              />
            </Link>
          </div>

          {/* Quote card */}
          <div
            className="
              relative
              mx-auto
              w-full
              max-w-[360px]
              rounded-[24px]
              border
              border-[#164fa5]/8
              bg-gradient-to-br
              from-white
              via-[#fbfdff]
              to-[#f3f8ff]
              p-6
              shadow-[0_18px_45px_rgba(22,79,165,0.08)]
            "
          >
            <div
              className="
                absolute
                -left-4
                -top-4
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-gradient-to-br
                from-[#1764d9]
                to-[#00aee7]
                text-white
                shadow-[0_8px_20px_rgba(21,116,230,0.22)]
              "
            >
              <Quote size={16} fill="currentColor" />
            </div>

            <div
              aria-hidden="true"
              className="
                absolute
                right-4
                top-4
                text-[54px]
                font-black
                leading-none
                text-[#1475e5]/5
              "
            >
              “
            </div>

            <p
              className="
                relative
                text-[16px]
                font-medium
                italic
                leading-7
                text-[#33466c]
              "
            >
              “Education is the foundation for opportunity, confidence
              and a better future.”
            </p>

            <div className="mt-5 h-px w-full bg-[#164fa5]/8" />

            <p
              className="
                mt-4
                text-[9px]
                font-bold
                uppercase
                tracking-[0.14em]
                text-[#175cbe]
              "
            >
              MasterMind Academy
            </p>
          </div>

          {/* Government exam visual */}
          <div
            className="
              relative
              min-h-[300px]
              overflow-hidden
              rounded-[26px]
              border
              border-white
              bg-[#eef7ff]
              shadow-[0_18px_45px_rgba(8,31,92,0.08)]
              sm:min-h-[340px]
            "
          >
            <Image
              src="/assets/kerala-government-exam-board.png"
              alt="Kerala government examination building"
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="
                object-cover
                object-center
              "
            />

            {/* Image overlays */}
            <div
              aria-hidden="true"
              className="
                absolute
                inset-0
                bg-gradient-to-t
                from-[#071f5d]/30
                via-transparent
                to-white/5
              "
            />

            <div
              className="
                absolute
                left-5
                top-5
                rounded-full
                border
                border-white/30
                bg-white/80
                px-3
                py-1.5
                text-[8px]
                font-black
                uppercase
                tracking-[0.2em]
                text-[#164fa5]
                shadow-sm
                backdrop-blur-md
              "
            >
              Kerala • Government Exams
            </div>

            <div
              className="
                absolute
                bottom-5
                left-5
                right-5
                rounded-[18px]
                border
                border-white/20
                bg-violetBlue
                p-4
                text-white
                backdrop-blur-md
              "
            >
              <p
                className="
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.19em]
                  text-[#8ddfff]
                "
              >
                For a Better Kerala
              </p>

              <p
                className="
                  mt-1
                  text-[15px]
                  font-bold
                  leading-5
                "
              >
                Preparing aspirants for meaningful public service careers.
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            TRUST FEATURES
        ====================================================== */}
        <div
          className="
            mx-auto
            mt-7
            grid
            max-w-[700px]
            grid-cols-1
            gap-3
            sm:grid-cols-3
          "  data-aos="fade-left"
        >
          {featureItems.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="
                flex
                items-center
                justify-center
                gap-3
                rounded-[16px]
                border
                border-white/90
                bg-white/75
                px-4
                py-3
                shadow-[0_10px_28px_rgba(8,31,92,0.05)]
                backdrop-blur
              "
            >
              <div
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  bg-[#eaf4ff]
                  text-[#175fc4]
                "
              >
                <Icon size={15} strokeWidth={2} />
              </div>

              <span
                className="
                  text-[10px]
                  font-semibold
                  text-[#2e4167]
                "
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* =====================================================
            MISSION / VISION / VALUES
        ====================================================== */}
        <div
          className="
            mt-12
            grid
            grid-cols-1
            gap-5
            md:grid-cols-3
          "  data-aos="fade-right"
        >
          {cards.map((card, index) => {
            const tone = toneClasses[card.tone];
            const Icon = card.icon;

            return (
              <article
                key={card.eyebrow}
                className={`
                  group
                  relative
                  min-h-[285px]
                  overflow-hidden
                  rounded-[26px]
                  border
                  border-white/90
                  bg-gradient-to-br
                  ${tone.card}
                  p-6
                  shadow-[0_18px_45px_rgba(8,31,92,0.07)]
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-[0_24px_55px_rgba(8,31,92,0.1)]
                  sm:p-7
                `}
              >
                {/* decorative glow */}
                <div
                  aria-hidden="true"
                  className={`
                    absolute
                    -right-16
                    -top-16
                    h-44
                    w-44
                    rounded-full
                    blur-[45px]
                    ${tone.glow}
                  `}
                />

                {/* number */}
                <span
                  aria-hidden="true"
                  className="
                    absolute
                    right-5
                    top-4
                    text-[44px]
                    font-black
                    leading-none
                    text-[#081f5c]/[0.035]
                  "
                >
                  0{index + 1}
                </span>

                <div className="relative z-10">
                  <div
                    className={`
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-[16px]
                      ${tone.iconWrap}
                    `}
                  >
                    <Icon
                      size={21}
                      strokeWidth={2}
                      className={tone.icon}
                    />
                  </div>

                  <div
                    className={`
                      mt-5
                      h-px
                      w-14
                      bg-gradient-to-r
                      ${tone.line}
                    `}
                  />

                  <p
                    className={`
                      mt-4
                      text-[8px]
                      font-black
                      uppercase
                      tracking-[0.24em]
                      ${tone.eyebrow}
                    `}
                  >
                    {card.eyebrow}
                  </p>

                  <h3
                    className="
                      mt-2
                      max-w-[300px]
                      text-[19px]
                      font-black
                      leading-[1.17]
                      tracking-[-0.025em]
                      text-[#081f5c]
                      sm:text-[20px]
                    "
                  >
                    {card.title}
                  </h3>

                  <p
                    className="
                      mt-4
                      max-w-[330px]
                      text-[11px]
                      leading-6
                      text-[#607087]
                      sm:text-[12px]
                    "
                  >
                    {card.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}