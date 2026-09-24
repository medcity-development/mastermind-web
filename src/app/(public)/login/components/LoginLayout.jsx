import AppHeroCard from "./AppHeroCard";
import FeatureGrid from "./FeatureGrid";
import LoginPanel from "./LoginPanel";

export default function LoginLayout() {
  return (
    <main
      className="
        relative
        min-h-[100dvh]
        overflow-hidden
        bg-[#f8fbff]
        px-3
        pb-5
        pt-[86px]

        sm:px-5

        lg:h-[100dvh]
        lg:min-h-0
        lg:px-5

        xl:px-7
      "
    >
      <div
        className="
          relative
          z-10
          mx-auto
          grid
          min-h-[calc(100dvh-106px)]
          w-full
          grid-cols-1
          items-center

          lg:h-full
          lg:min-h-0
          lg:max-w-[1540px]
          lg:grid-cols-[minmax(0,1.82fr)_minmax(360px,0.78fr)]
          lg:items-stretch
          lg:gap-4

          xl:grid-cols-[minmax(0,1.88fr)_minmax(390px,0.72fr)]
        "
      >
        {/* LEFT SIDE */}
        <section
          className="
            hidden
            min-h-0
            gap-3

            lg:grid
            lg:h-full
            lg:grid-rows-[minmax(0,1fr)_175px]
          "
        >
          <AppHeroCard />
          <FeatureGrid />
        </section>

        {/* RIGHT SIDE */}
        <section
          className="
            mx-auto
            w-full
            max-w-[520px]
            min-h-0

            lg:h-full
            lg:max-w-none
          "
        >
          <LoginPanel />
        </section>
      </div>
    </main>
  );
}