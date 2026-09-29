export default function SidebarExamIdentity({
    config,
  }) {
    return (
      <div
        className="
          relative
          z-10
          shrink-0
  
          border-b
          border-white/[0.06]
  
          px-2
          py-5
  
          xl:px-5
          xl:py-6
        "
      >
        {/* =========================================
            MOBILE / TABLET
        ========================================== */}
  
        <div
          className="
            flex
            flex-col
            items-center
            justify-center
            text-center
  
            xl:hidden
          "
        >
          <span
            className="
              text-[6px]
              font-extrabold
              uppercase
              tracking-[0.16em]
  
              text-cyan-200/60
            "
          >
            Preparing
          </span>
  
          <span
            className="
              mt-1
  
              max-w-[68px]
  
              bg-gradient-to-r
              from-[#67e8f9]
              via-[#22d3ee]
              to-[#a78bfa]
  
              bg-clip-text
  
              text-[8px]
              font-black
              uppercase
              leading-[1.15]
  
              text-transparent
  
              drop-shadow-[0_0_8px_rgba(34,211,238,0.25)]
            "
          >
            {config.shortName}
          </span>
  
          <span
            className="
              mt-2
              h-[2px]
              w-7
  
              rounded-full
  
              bg-gradient-to-r
              from-transparent
              via-cyan-400
              to-transparent
  
              shadow-[0_0_8px_rgba(34,211,238,0.55)]
            "
          />
        </div>
  
        {/* =========================================
            DESKTOP
        ========================================== */}
  
        <div className="hidden xl:block">
          <p
            className="
              text-[8px]
              font-extrabold
              uppercase
              tracking-[0.22em]
  
              text-[#7dd3fc]/65
            "
          >
            Preparing for
          </p>
  
          <h3
            className="
              mt-2
  
              bg-gradient-to-r
              from-[#67e8f9]
              via-[#22d3ee]
              to-[#a78bfa]
  
              bg-clip-text
  
              text-[20px]
              font-black
              leading-none
              tracking-[-0.035em]
  
              text-transparent
  
              drop-shadow-[0_0_12px_rgba(34,211,238,0.18)]
            "
          >
            {config.name}
          </h3>
  
          <p
            className="
              mt-2
  
              text-[9px]
              font-medium
              tracking-[0.01em]
  
              text-slate-400
            "
          >
            Personalized exam preparation
          </p>
  
          <div
            className="
              mt-4
  
              flex
              items-center
              gap-1
            "
          >
            <span
              className="
                h-[3px]
                w-[42px]
  
                rounded-full
  
                bg-gradient-to-r
                from-[#22d3ee]
                via-[#60a5fa]
                to-[#a78bfa]
  
                shadow-[0_0_10px_rgba(34,211,238,0.40)]
              "
            />
  
            <span
              className="
                h-[3px]
                w-[7px]
  
                rounded-full
  
                bg-violet-400/60
              "
            />
  
            <span
              className="
                h-[3px]
                w-[3px]
  
                rounded-full
  
                bg-pink-400/60
              "
            />
          </div>
        </div>
      </div>
    );
  }