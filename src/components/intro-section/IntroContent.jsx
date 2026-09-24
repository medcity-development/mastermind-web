import Link from "next/link";

import {
  ArrowRight,
  BookOpenCheck,
  BrainCircuit,
  Trophy,
} from "lucide-react";

import IntroFeatureItem from "./IntroFeatureItem";

const features = [
  {
    icon: BookOpenCheck,
    title: "Expert Guidance",
  },
  {
    icon: BrainCircuit,
    title: "Quality Content",
  },
  {
    icon: Trophy,
    title: "Proven Strategies",
  },
];

export default function IntroContent() {
  return (
    <div
      className="
        mx-auto
        w-full
        max-w-[620px]
        text-center

        xl:mx-0
        xl:max-w-[520px]
        xl:text-left
      "
    >
      {/* Badge */}
      <div
        className="
          inline-flex
          items-center
          gap-2
          rounded-full
          border
          border-[#017cc0]/10
          bg-[#edf8ff]
          px-4
          py-2
          text-[10px]
          font-bold
          uppercase
          tracking-[0.18em]
          text-[#017cc0]
        "
      >
        <span
          className="
            h-2
            w-2
            rounded-full
            bg-[#00b5e8]
          "
        />

        Your Preparation Partner
      </div>

      {/* Heading */}
      <h2
        className="
          mt-5
          text-[34px]
          font-bold
          leading-[1.08]
          tracking-[-0.04em]
          text-[#081f5c]

          sm:text-[42px]
          md:text-[46px]

          xl:text-[48px]
        "
      >
        Smarter Preparation.

        <span
          className="
            mt-1
            block
            bg-gradient-to-r
            from-[#164fa5]
            via-[#017cc0]
            to-[#00b5e8]
            bg-clip-text
            text-transparent
          "
        >
          Better Results.
        </span>
      </h2>

      {/* Accent */}
      <div
        className="
          mt-6
          flex
          items-center
          justify-center
          gap-2

          xl:justify-start
        "
      >
        <span
          className="
            h-[4px]
            w-12
            rounded-full
            bg-gradient-to-r
            from-[#164fa5]
            to-[#00b5e8]
          "
        />

        <span
          className="
            h-[4px]
            w-2
            rounded-full
            bg-[#00b5e8]/30
          "
        />
      </div>

      {/* Description */}
      <p
        className="
          mx-auto
          mt-6
          max-w-[560px]
          text-[14px]
          leading-7
          text-slate-500

          sm:text-[15px]

          xl:mx-0
          xl:max-w-[500px]
        "
      >
        MasterMind helps competitive exam aspirants prepare
        with focused learning, quality study materials,
        smart practice tools and expert guidance — all in
        one place.
      </p>

      {/* Features */}
      <div
        className="
          mx-auto
          mt-8
          grid
          max-w-[460px]
          grid-cols-3
          gap-4

          xl:mx-0
        "
      >
        {features.map((feature) => (
          <IntroFeatureItem
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
          />
        ))}
      </div>

      {/* CTA */}
      <div
        className="
          mt-8
          flex
          flex-wrap
          items-center
          justify-center
          gap-4

          xl:justify-start
        "
      >
        <Link
          href="/register"
          className="
            group
            inline-flex
            h-12
            items-center
            justify-center
            gap-2
            rounded-full
            bg-gradient-to-r
            from-[#164fa5]
            to-[#017cc0]
            px-6
            text-[12px]
            font-semibold
            text-white
            shadow-[0_10px_25px_rgba(22,79,165,0.18)]
            transition-all
            duration-300
            hover:-translate-y-0.5
            hover:shadow-[0_14px_30px_rgba(22,79,165,0.24)]
          "
        >
          Get Started Today

          <ArrowRight
            size={15}
            className="
              transition-transform
              duration-300
              group-hover:translate-x-1
            "
          />
        </Link>

        <Link
          href="/about"
          className="
            text-[12px]
            font-semibold
            text-[#164fa5]
            underline
            decoration-[#00b5e8]/40
            decoration-2
            underline-offset-4
            transition-colors
            hover:text-[#017cc0]
          "
        >
          Learn More
        </Link>
      </div>
    </div>
  );
}