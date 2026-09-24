import {
    Crown,
    Sparkles,
    Target,
  } from "lucide-react";
  
  export default function PackagesHero() {
    return (
      <section
        className="
          relative
          overflow-hidden
          rounded-[28px]
          bg-gradient-to-r
          from-[#01727f]
          via-[#164fa5]
          to-[#01727f]
          px-6
          py-8
          text-white
          sm:px-8
          lg:px-10 mt-20
        "
      >
        <div
          aria-hidden="true"
          className="
            absolute
            inset-0
            opacity-[0.06]
            [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
            [background-size:34px_34px]
          "
        />
  
        <div
          className="
            relative
            z-10
            max-w-3xl
          "
        >
          <span
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-white/15
              bg-white/10
              px-3
              py-1.5
              text-[9px]
              font-black
              uppercase
              tracking-[0.14em]
            "
          >
            <Sparkles size={12} />
  
            Premium Learning
          </span>
  
          <h1
            className="
              mt-4
              text-3xl
              font-black
              sm:text-4xl
            "
          >
            Choose Your Preparation Plan
          </h1>
  
          <p
            className="
              mt-3
              max-w-2xl
              text-[13px]
              leading-6
              text-blue-100
            "
          >
            Unlock structured courses,
            premium mock tests, study
            materials and exam-focused
            preparation plans.
          </p>
  
          <div
            className="
              mt-5
              flex
              flex-wrap
              gap-2
            "
          >
            <Feature
              icon={Crown}
              text="Premium Access"
            />
  
            <Feature
              icon={Target}
              text="Exam Focused"
            />
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
      <span
        className="
          inline-flex
          items-center
          gap-2
          rounded-full
          bg-white/10
          px-3
          py-2
          text-[10px]
          font-bold
        "
      >
        <Icon size={13} />
  
        {text}
      </span>
    );
  }