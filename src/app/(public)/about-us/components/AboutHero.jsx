import AboutHeroContent from "./AboutHeroContent";
import AboutHeroCards from "./AboutHeroCards";

export default function AboutHero() {
  return (
    <section
      id="about"
      className="
        relative
        isolate
        w-full
        overflow-hidden
        bg-[#eef8ff]
        pb-16
        pt-44
      "  data-aos="fade-right"
    >
      {/* soft center glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-0
          -z-10
          h-[460px]
          w-[900px]
          max-w-[95vw]
          -translate-x-1/2
          rounded-full
          bg-white/80
          blur-[100px]
        "
      />

      {/* left glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-40
          top-[30%]
          -z-10
          h-[420px]
          w-[420px]
          rounded-full
          bg-[#d9f1ff]/75
          blur-[100px]
        "
      />

      {/* right glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-40
          top-[20%]
          -z-10
          h-[420px]
          w-[420px]
          rounded-full
          bg-[#fce8f1]/60
          blur-[100px]
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
        <AboutHeroContent />

        <div className="mt-12 sm:mt-14 lg:mt-16">
          <AboutHeroCards />
        </div>
      </div>
    </section>
  );
}