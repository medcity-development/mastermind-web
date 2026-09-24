import {
    Brain,
    CheckCircle2,
    Sparkles,
    Trophy,
  } from "lucide-react";
  
  export default function CurrentAffairsQuizHero() {
    return (
      <section
        className="
          relative
          overflow-hidden
          rounded-[28px]
          bg-gradient-to-r
          from-[#071f59]
          via-[#0b4ba5]
          to-[#087bea]
          px-6
          py-8
          text-white
          sm:px-8
          lg:px-12
          lg:py-10 mt-20
        "
      >
        {/* Grid pattern */}
  
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            opacity-[0.07]
            [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
            [background-size:32px_32px]
          "
        />
  
        <div
          aria-hidden="true"
          className="
            absolute
            -right-16
            -top-20
            h-72
            w-72
            rounded-full
            bg-cyan-300/10
            blur-3xl
          "
        />
  
        <div
          className="
            relative
            z-10
            grid
            items-center
            gap-8
            lg:grid-cols-[1fr_380px]
          "
        >
          {/* LEFT */}
  
          <div>
            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-white/20
                bg-white/10
                px-3
                py-1.5
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-cyan-100
                backdrop-blur-md
              "
            >
              <Sparkles size={13} />
  
              Test Your Knowledge
            </div>
  
            <h1
              className="
                mt-5
                max-w-[700px]
                text-3xl
                font-black
                leading-[1.05]
                tracking-[-0.03em]
                sm:text-4xl
                lg:text-5xl
              "
            >
              Current Affairs
              <span
                className="
                  ml-2
                  bg-gradient-to-r
                  from-cyan-200
                  to-white
                  bg-clip-text
                  text-transparent
                "
              >
                Quiz
              </span>
            </h1>
  
            <p
              className="
                mt-4
                max-w-[650px]
                text-sm
                leading-6
                text-white/75
              "
            >
              Practice regularly updated
              Kerala PSC current affairs
              quizzes and strengthen your
              exam preparation.
            </p>
  
            <div
              className="
                mt-6
                flex
                flex-wrap
                gap-3
              "
            >
              <Feature
                icon={Brain}
                text="Daily Practice"
              />
  
              <Feature
                icon={CheckCircle2}
                text="PSC Focused"
              />
  
              <Feature
                icon={Trophy}
                text="Improve Score"
              />
            </div>
          </div>
  
          {/* RIGHT */}
  
          <div
            className="
              hidden
              rounded-[24px]
              border
              border-white/15
              bg-white/10
              p-5
              backdrop-blur-md
              lg:block
            "
          >
            <div
              className="
                flex
                h-[170px]
                items-center
                justify-center
                rounded-[20px]
                border
                border-white/10
                bg-white/[0.08]
              "
            >
              <div className="text-center">
                <div
                  className="
                    mx-auto
                    flex
                    h-20
                    w-20
                    items-center
                    justify-center
                    rounded-full
                    bg-white
                    text-[#164fa5]
                    shadow-xl
                  "
                >
                  <Brain size={36} />
                </div>
  
                <p
                  className="
                    mt-4
                    text-sm
                    font-bold
                  "
                >
                  Learn • Practice • Improve
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  function Feature({
    icon: Icon,
    text,
  }) {
    return (
      <div
        className="
          flex
          items-center
          gap-2
          rounded-full
          border
          border-white/15
          bg-white/[0.08]
          px-3
          py-2
          text-xs
          font-semibold
          text-white/90
        "
      >
        <Icon size={14} />
  
        {text}
      </div>
    );
  }