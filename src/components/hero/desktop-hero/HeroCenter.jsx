import HeroTopBar from "./HeroTopBar";
import HeroContent from "./HeroContent";
import HeroStats from "./HeroStats";

export default function HeroCenter() {
  return (
    <main
      className="
        h-full
        min-h-0
        w-full
      "
    >
      <div
        className="
          relative
          flex
          h-full
          min-h-0
          flex-col
          overflow-hidden
          rounded-[26px]
          border
          border-[#dce9f8]
          bg-white
          shadow-[0_18px_45px_rgba(22,79,165,0.08)]
        "
      >
        {/* =========================================
            XL BACKGROUND
        ========================================= */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            hidden
            bg-cover
            bg-right-bottom
            bg-no-repeat
            lg:block
            2xl:hidden
          "
          style={{
            backgroundImage:
              "url('/assets/sampleBg1.png')",
          }}
        />

        {/* =========================================
            2XL BACKGROUND
        ========================================= */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            hidden
            bg-cover
            bg-right-bottom
            bg-no-repeat
            2xl:block
          "
          style={{
            backgroundImage:
              "url('/assets/sampleBg2.png')",
          }}
        />

        {/* =========================================
            SOFT DECORATIVE LIGHT
        ========================================= */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -left-24
            -top-24
            h-72
            w-72
            rounded-full
            bg-[#00b5e8]/10
            blur-[100px]
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -bottom-20
            right-[18%]
            h-64
            w-64
            rounded-full
            bg-violet-300/10
            blur-[100px]
          "
        />

        {/* =========================================
            TOP BAR
        ========================================= */}

        <div
          className="
            relative
            z-20
            shrink-0
          "
        >
          <HeroTopBar />
        </div>

        {/* =========================================
            CONTENT AREA
        ========================================= */}

        <div
          className="
            relative
            z-10
            min-h-0
            flex-1
            overflow-hidden
          "
        >
          <HeroContent />
        </div>

        {/* =========================================
            STATS
        ========================================= */}

        <div
          className="
            relative
            z-20
            shrink-0
          "
        >
          <HeroStats />
        </div>
      </div>
    </main>
  );
}