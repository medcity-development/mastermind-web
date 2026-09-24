// components/WhyChooseUs.jsx

"use client";

import FeatureCard from "./FeatureCard";
import cardsData from "./featurecardData";

export default function WhyChooseUs() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* subtle background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#fafafa] via-[#fafafa] to-[#fbfbfb]" />

      <div className="relative z-10 mx-auto max-w-9xl px-5 sm:px-6
          md:px-10
          lg:px-16
          xl:px-20 py-15" data-aos="fade-up">
        <SectionHeader />

        <FeatureGrid cards={cardsData} />
      </div>
    </section>
  );
}

const SectionHeader = () => {
  return (
    <div className="mb-8 sm:mb-10">
      <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.03em] text-blue-600 sm:text-xs">
        Why Choose Us
      </p>

      <h2 className="text-[25px] font-extrabold leading-tight tracking-tight text-[#08154f] sm:text-3xl lg:text-[34px]">
        What Makes MasterMind the{" "}
        <span className="text-blue-600">Best Choice?</span>
      </h2>
    </div>
  );
};

const FeatureGrid = ({ cards }) => {
  return (
    <div
      className="
        grid
        grid-cols-1
        gap-x-5
        gap-y-5
        sm:grid-cols-2
        md:grid-cols-3
        lg:grid-cols-3
        xl:grid-cols-3
        xl:gap-x-7
        xl:gap-y-10
      "
    >
      {cards.map((card, index) => (
        <FeatureCard
          key={card.title}
          {...card}
          index={index}
        />
      ))}
    </div>
  );
};