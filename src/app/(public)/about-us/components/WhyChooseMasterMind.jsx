import Link from "next/link";
import Image from "next/image";

import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  FileText,
  Laptop,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Expert Faculty",
    description: "Learn from experienced subject experts.",
    tone: "blue",
  },
  {
    icon: BookOpen,
    title: "Structured Learning",
    description: "Well-planned syllabus and study materials.",
    tone: "pink",
  },
  {
    icon: FileText,
    title: "Mock Tests",
    description: "Practice with real exam patterns.",
    tone: "green",
  },
  {
    icon: CalendarDays,
    title: "Current Affairs",
    description: "Stay updated with daily news & analysis.",
    tone: "purple",
  },
  {
    icon: Laptop,
    title: "Flexible Learning",
    description: "Learn anytime, anywhere.",
    tone: "yellow",
  },
];

const toneClasses = {
  blue: {
    wrap: "bg-[#e9f3ff]",
    icon: "text-[#1676df]",
  },
  pink: {
    wrap: "bg-[#ffe7f1]",
    icon: "text-[#e81262]",
  },
  green: {
    wrap: "bg-[#e6f8ef]",
    icon: "text-[#0fb078]",
  },
  purple: {
    wrap: "bg-[#eee9ff]",
    icon: "text-[#7357e8]",
  },
  yellow: {
    wrap: "bg-[#fff4d5]",
    icon: "text-[#f2a900]",
  },
};

export default function WhyChooseMasterMind() {
  return (
    <section
      className="
        relative
        overflow-hidden
        bg-[#f8fcff]
        py-16
        sm:py-20
        lg:py-24
      "  data-aos="fade-right"
    >
      {/* background accents */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-24
          top-0
          h-52
          w-52
          rounded-full
          bg-[#dff2ff]
          blur-[75px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-20
          top-24
          h-56
          w-56
          rounded-full
          bg-[#e9f5ff]
          blur-[80px]
        "
      />

      <div
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-[1450px]
          px-4
          sm:px-6
          lg:px-8
          xl:px-10
        "  data-aos="fade-right"
      >
        {/* ==============================
            HEADING
        =============================== */}
        <div
          className="
            flex
            flex-col
            gap-6
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <div>
            <p
              className="
                text-[9px]
                font-black
                uppercase
                tracking-[0.28em]
                text-[#275ea8]
              "
            >
              Why Choose MasterMind
            </p>

            <h2
              className="
                mt-3
                max-w-[760px]
                text-[32px]
                font-black
                leading-[1.03]
                tracking-[-0.04em]
                text-[#081f5c]
                sm:text-[40px]
                lg:text-[46px]
              "
            >
              More Than Just Coaching.
              <span className="block">
                A Complete Learning Ecosystem.
              </span>
            </h2>
          </div>

          <p
            className="
              max-w-[390px]
              text-[12px]
              leading-6
              text-[#62708a]
              sm:text-[13px]
              lg:text-right
            "
          >
            We provide everything you need to learn, practice and
            succeed — all in one place.
          </p>
        </div>

        {/* ==============================
            FEATURES
        =============================== */}
        <div
          className="
            mt-10
            grid
            grid-cols-1
            gap-5
            sm:grid-cols-2
            lg:grid-cols-5
            lg:gap-0
          "
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const tone = toneClasses[feature.tone];

            return (
              <div
                key={feature.title}
                className="
                  relative
                  flex
                  flex-col
                  items-center
                  px-5
                  py-4
                  text-center
                "
              >
                {index !== features.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="
                      absolute
                      right-0
                      top-1/2
                      hidden
                      h-16
                      w-px
                      -translate-y-1/2
                      bg-[#164fa5]/10
                      lg:block
                    "
                  />
                )}

                <div
                  className={`
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    ${tone.wrap}
                  `}
                >
                  <Icon
                    size={22}
                    strokeWidth={2}
                    className={tone.icon}
                  />
                </div>

                <h3
                  className="
                    mt-4
                    text-[13px]
                    font-black
                    text-[#081f5c]
                    sm:text-[14px]
                  "
                >
                  {feature.title}
                </h3>

                <p
                  className="
                    mt-2
                    max-w-[180px]
                    text-[11px]
                    leading-5
                    text-[#61708b]
                  "
                >
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* ==============================
            CTA BANNER
        =============================== */}
        <div
          className="
            relative
            mt-12
            overflow-hidden
            rounded-[28px]
            bg-gradient-to-r
            from-[#0756b8]
            via-[#0878d1]
            to-[#64c9f2]
            px-6
            py-8
            shadow-[0_24px_55px_rgba(8,88,190,0.2)]
            sm:px-8
            lg:px-10
            lg:py-9
          "  data-aos="fade-right"
        >
          {/* subtle glow */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -left-12
              -top-16
              h-48
              w-48
              rounded-full
              bg-white/10
              blur-[60px]
            "
          />

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              right-[20%]
              top-1/2
              h-40
              w-40
              -translate-y-1/2
              rounded-full
              bg-[#8fe3ff]/15
              blur-[60px]
            "
          />

          <div
            className="
              relative
              z-10
              grid
              items-center
              gap-8
              lg:grid-cols-[1.15fr_0.7fr_0.9fr]
            "
          >
            {/* CTA text */}
            <div>
              <p
                className="
                  text-[8px]
                  font-black
                  uppercase
                  tracking-[0.28em]
                  text-[#bdeaff]
                "
              >
                Ready to Start?
              </p>

              <h3
                className="
                  mt-3
                  max-w-[520px]
                  text-[28px]
                  font-black
                  leading-[1.06]
                  tracking-[-0.03em]
                  text-white
                  sm:text-[32px]
                  lg:text-[36px]
                "
              >
                Take the First Step Towards
                <span className="block">
                  Your Government Job Dream.
                </span>
              </h3>

              <p
                className="
                  mt-4
                  max-w-[560px]
                  text-[11px]
                  leading-6
                  text-white/80
                  sm:text-[12px]
                "
              >
                Join MasterMind Academy today and get access to
                expert classes, study materials, mock tests and more.
              </p>
            </div>

            {/* CTA buttons */}
            <div
              className="
                flex
                flex-col
                gap-3
              "
            >
              <Link
                href="/main-courses"
                className="
                  group
                  inline-flex
                  h-[46px]
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-white
                  px-6
                  text-[10px]
                  font-bold
                  text-[#1261bd]
                  shadow-[0_10px_24px_rgba(4,49,110,0.15)]
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:shadow-[0_14px_30px_rgba(4,49,110,0.2)]
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

              <Link
                href="/contact"
                className="
                  inline-flex
                  h-[46px]
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/60
                  bg-transparent
                  px-6
                  text-[10px]
                  font-bold
                  text-white
                  transition-all
                  duration-300
                  hover:bg-white/10
                "
              >
                Contact Us
              </Link>
            </div>

            {/* CTA visual */}
            <div
              className="
                relative
                min-h-[170px]
                overflow-hidden
                rounded-[20px]
                lg:min-h-[190px]
              "
            >
              <Image
                src="/assets/mastermind-mobile-app.webp"
                alt="MasterMind Academy learning platform"
                fill
                sizes="(max-width: 1024px) 100vw, 30vw"
                className="
                  object-contain
                  object-center
                "
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}