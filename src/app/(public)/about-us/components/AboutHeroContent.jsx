import AboutHeroActions from "./AboutHeroActions";

export default function AboutHeroContent() {
  return (
    <div
      className="
        mx-auto
        w-full
        max-w-[950px]
        text-center
      "
    >
      {/* eyebrow */}
      <div className="flex items-center justify-center gap-3">
        <span
          className="
            hidden
            h-px
            w-12
            bg-gradient-to-r
            from-transparent
            to-[#164fa5]/20
            sm:block
          "
        />

        <div
          className="
            inline-flex
            items-center
            gap-2.5
            rounded-full
            border
            border-[#164fa5]/10
            bg-white/80
            px-4
            py-2
            text-[8px]
            font-extrabold
            uppercase
            tracking-[0.24em]
            text-[#17366f]
            shadow-[0_6px_20px_rgba(22,79,165,0.06)]
            backdrop-blur-md
          "
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#1676e8]" />

          Learn

          <span className="h-1 w-1 rounded-full bg-[#9bb7dc]" />

          Practice

          <span className="h-1 w-1 rounded-full bg-[#e91263]" />

          Succeed

          <span className="h-1.5 w-1.5 rounded-full bg-[#00b5e8]" />
        </div>

        <span
          className="
            hidden
            h-px
            w-12
            bg-gradient-to-r
            from-[#164fa5]/20
            to-transparent
            sm:block
          "
        />
      </div>

      {/* heading */}
      <h1
        className="
          mx-auto
          mt-6
          max-w-[920px]
          text-[34px]
          font-black
          leading-[1.03]
          tracking-[-0.045em]
          text-[#081f5c]
          sm:text-[44px]
          md:text-[52px]
          lg:text-[60px]
          xl:text-[64px]
        "
      >
        Empowering Aspirants.

        <span
          className="
            mt-1
            block
            bg-gradient-to-r
            from-[#165fd1]
            via-[#078bcc]
            to-[#00b5e8]
            bg-clip-text
            text-transparent
          "
        >
          Building Brighter Futures.
        </span>
      </h1>

      {/* description */}
      <p
        className="
          mx-auto
          mt-5
          max-w-[730px]
          text-[12px]
          font-medium
          leading-6
          text-[#62708a]
          sm:text-[13px]
          md:text-[14px]
          md:leading-7
        "
      >
        MasterMind Academy supports Kerala PSC, SSC and RRB aspirants
        with expert faculty, structured learning, focused practice and
        quality study resources designed for steady progress.
      </p>

      <AboutHeroActions />
    </div>
  );
}