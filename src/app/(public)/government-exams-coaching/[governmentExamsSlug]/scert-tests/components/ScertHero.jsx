import {
    BookOpenCheck,
    GraduationCap,
    Layers3,
  } from "lucide-react";
  
  export default function ScertHero() {
    return (
      <section
        className="
          relative
          overflow-hidden
          rounded-[28px]
          bg-gradient-to-r
          from-pink-600
          via-[#075fc8]
          to-violetBlue
          px-6
          py-9
          text-white
          sm:px-8
          lg:px-12
          lg:py-12 mt-20
        "
      >
        <div
          aria-hidden="true"
          className="
            absolute
            inset-0
            opacity-[0.08]
            [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
            [background-size:34px_34px]
          "
        />
  
        <div
          aria-hidden="true"
          className="
            absolute
            -right-24
            -top-24
            h-80
            w-80
            rounded-full
            bg-white/10
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
            lg:grid-cols-[1.35fr_0.65fr]
          "
        >
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
                px-4
                py-2
                text-xs
                font-bold
                backdrop-blur
              "
            >
              <GraduationCap
                size={16}
              />
  
              Kerala PSC Preparation
            </div>
  
            <h1
              className="
                mt-5
                max-w-3xl
                text-3xl
                font-black
                leading-tight
                sm:text-4xl
                lg:text-5xl
              "
            >
              Master SCERT Through
              Class-wise Practice Tests
            </h1>
  
            <p
              className="
                mt-4
                max-w-2xl
                text-sm
                leading-7
                text-blue-50
                sm:text-base
              "
            >
              Select your class,
              practice available SCERT
              exams and strengthen your
              Kerala PSC preparation.
            </p>
          </div>
  
          <div
            className="
              grid
              grid-cols-2
              gap-3
            "
          >
            <HeroFeature
              icon={
                BookOpenCheck
              }
              title="Practice"
              text="Class-wise tests"
            />
  
            <HeroFeature
              icon={Layers3}
              title="SCERT"
              text="Focused learning"
            />
          </div>
        </div>
      </section>
    );
  }
  
  function HeroFeature({
    icon: Icon,
    title,
    text,
  }) {
    return (
      <div
        className="
          rounded-[22px]
          border
          border-white/15
          bg-white/10
          p-5
          backdrop-blur
        "
      >
        <div
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            bg-white/15
          "
        >
          <Icon size={21} />
        </div>
  
        <p className="mt-4 font-black">
          {title}
        </p>
  
        <p className="mt-1 text-xs text-blue-100">
          {text}
        </p>
      </div>
    );
  }