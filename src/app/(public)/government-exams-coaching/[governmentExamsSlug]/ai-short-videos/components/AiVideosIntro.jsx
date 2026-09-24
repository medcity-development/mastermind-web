import {
    Bot,
    Play,
    Sparkles,
    Zap,
  } from "lucide-react";
  
  export default function AiVideosIntro() {
    return (
      <section
        className="
          relative
          mb-7
          overflow-hidden
          rounded-[24px]
          border
          border-[#164fa5]/10
          bg-gradient-to-r
          from-[#f3f8ff]
          via-white
          to-[#fff2f7]
          px-5
          py-6
          sm:px-7
          lg:px-8
        "
      >
        {/* Grid pattern */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            opacity-[0.035]
            [background-image:linear-gradient(#164fa5_1px,transparent_1px),linear-gradient(90deg,#164fa5_1px,transparent_1px)]
            [background-size:28px_28px]
          "
        />
  
        {/* Blue glow */}
        <div
          aria-hidden="true"
          className="
            absolute
            -left-16
            -top-16
            h-40
            w-40
            rounded-full
            bg-[#00b5e8]/10
            blur-3xl
          "
        />
  
        {/* Pink glow */}
        <div
          aria-hidden="true"
          className="
            absolute
            -bottom-16
            right-10
            h-40
            w-40
            rounded-full
            bg-[#f13873]/10
            blur-3xl
          "
        />
  
        <div
          className="
            relative
            z-10
            flex
            flex-col
            gap-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          {/* Content */}
          <div className="max-w-3xl">
            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-[#164fa5]/10
                bg-white/80
                px-3
                py-1.5
                text-[10px]
                font-extrabold
                uppercase
                tracking-[0.14em]
                text-[#164fa5]
                shadow-sm
              "
            >
              <Sparkles className="h-3.5 w-3.5 text-[#f13873]" />
              Learn Smarter with AI
            </div>
  
            <h1
              className="
                mt-3
                text-2xl
                font-black
                tracking-[-0.04em]
                text-[#0b216c]
                sm:text-3xl
              "
            >
              AI Short Videos for
              <span className="text-[#f13873]">
                {" "}Kerala PSC
              </span>
            </h1>
  
            <p
              className="
                mt-2
                max-w-2xl
                text-[13px]
                leading-6
                text-[#61708a]
                sm:text-sm
              "
            >
              Learn important Kerala PSC topics through quick,
              easy-to-understand AI-powered videos. Revise key
              concepts, strengthen your preparation, and learn
              anytime in just a few minutes.
            </p>
          </div>
  
          {/* Icon */}
          <div
            className="
              hidden
              shrink-0
              items-center
              gap-3
              lg:flex
            "
          >
            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-[#164fa5]
                text-white
                shadow-[0_12px_30px_rgba(22,79,165,0.20)]
              "
            >
              <Bot className="h-6 w-6" />
            </div>
  
            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-[#f13873]
                text-white
              "
            >
              <Play className="h-5 w-5 fill-current" />
            </div>
  
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                bg-[#00b5e8]/10
                text-[#017cc0]
              "
            >
              <Zap className="h-4 w-4" />
            </div>
          </div>
        </div>
      </section>
    );
  }