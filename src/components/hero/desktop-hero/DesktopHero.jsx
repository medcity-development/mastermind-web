import HeroCenter from "./HeroCenter";
import RightSidebar from "./RightSidebar";

export default function DesktopHero() {
  return (
    <section
      id="hero"
      className="
        relative
        w-full
        overflow-hidden
        pt-5
      "
    >
      <div
        className="
          mx-auto
          grid
          w-full
          max-w-[1600px]
          grid-cols-1
          items-stretch
          gap-4
          px-3
          pb-4

          sm:px-4

          lg:h-[calc(100dvh-140px)]
          lg:min-h-[620px]
          lg:max-h-[790px]
          lg:grid-cols-[minmax(0,1fr)_310px]
          lg:gap-4
          lg:px-6
          lg:pb-6

          xl:grid-cols-[minmax(0,1fr)_340px]
          xl:px-8
        "
      >
        {/* =========================================
            MAIN HERO
        ========================================= */}

        <div
          className="
            h-full
            min-h-0
            min-w-0
          "
        >
          <HeroCenter />
        </div>

        {/* =========================================
            RIGHT LEARNING HUB
        ========================================= */}

        <div
          className="
            hidden
            h-full
            min-h-0
            min-w-0
            lg:block
          "
        >
          <RightSidebar />
        </div>
      </div>
    </section>
  );
}