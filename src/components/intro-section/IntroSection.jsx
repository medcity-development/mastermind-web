import IntroContent from "./IntroContent";
import MainCoursesBlock from "./MainCoursesBlock";

export default function IntroSection() {
  return (
    <section
      id="intro"
      data-aos="fade-up"
      className="
        relative
        overflow-hidden
        bg-[#f8fbff]
        py-14
        sm:py-16
        md:py-20
        lg:py-20
        xl:py-24
      "
    >
      {/* Base soft gradient */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(246,250,255,0.96)_42%,rgba(250,252,255,0.98)_100%)]
        "
      />

      {/* Left blue glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-28
          top-12
          h-[340px]
          w-[340px]
          rounded-full
          bg-[#00b5e8]/[0.08]
          blur-[95px]
          sm:h-[420px]
          sm:w-[420px]
        "
      />

      {/* Right deep blue glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-24
          top-[22%]
          h-[360px]
          w-[360px]
          rounded-full
          bg-[#164fa5]/[0.07]
          blur-[110px]
          sm:h-[440px]
          sm:w-[440px]
        "
      />

      {/* Bottom cyan glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-[-140px]
          left-1/2
          h-[300px]
          w-[620px]
          -translate-x-1/2
          rounded-full
          bg-[#00b5e8]/[0.05]
          blur-[110px]
        "
      />

      {/* Decorative top-left shape */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-20
          -top-24
          h-[210px]
          w-[210px]
          rounded-full
          border
          border-[#017cc0]/[0.08]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-10
          -top-14
          h-[130px]
          w-[130px]
          rounded-full
          border
          border-[#00b5e8]/[0.08]
        "
      />

      {/* Right subtle dot field */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          right-6
          top-12
          hidden
          h-[130px]
          w-[130px]
          opacity-30
          lg:block
          [background-image:radial-gradient(circle,#017cc0_1.2px,transparent_1.2px)]
          [background-size:14px_14px]
        "
      />

      {/* Bottom soft divider light */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-0
          left-1/2
          h-px
          w-[88%]
          -translate-x-1/2
          bg-gradient-to-r
          from-transparent
          via-[#164fa5]/10
          to-transparent
        "
      />

      <div
        className="
          relative
          z-10
          mx-auto
          max-w-9xl px-5 sm:px-6
          md:px-10
          lg:px-16
          xl:px-20" data-aos="fade-up"
      >
        <div
          className="
            grid
            grid-cols-1
            items-center
            gap-14
            lg:gap-16
            xl:grid-cols-[0.8fr_1.2fr]
            xl:gap-12
            2xl:grid-cols-[0.78fr_1.22fr]
            2xl:gap-16
          "
        >
          <IntroContent />

          <MainCoursesBlock />
        </div>
      </div>
    </section>
  );
}