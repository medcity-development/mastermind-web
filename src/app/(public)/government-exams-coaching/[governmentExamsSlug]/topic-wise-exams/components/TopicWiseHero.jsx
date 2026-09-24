import {
    BookOpenCheck,
    Layers3,
  } from "lucide-react";
  
  export default function TopicWiseHero() {
    return (
      <section
        className="
          relative
          overflow-hidden
          rounded-[28px]
          bg-gradient-to-r
          from-[#2f71d3]
          via-[#075fc8]
          to-[#b30b97]
          px-6
          py-8
          text-white
          sm:px-8
          lg:px-10
          lg:py-10 mt-20
        "
      >
        {/* GRID */}
  
        <div
          aria-hidden="true"
          className="
            absolute
            inset-0
            opacity-[0.07]
            [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
            [background-size:34px_34px]
          "
        />
  
        {/* GLOW */}
  
        <div
          aria-hidden="true"
          className="
            absolute
            -right-24
            -top-24
            h-72
            w-72
            rounded-full
            bg-white/10
            blur-3xl
          "
        />
  
        <div
          className="
            relative
            z-10
            flex
            flex-col
            gap-8
            md:flex-row
            md:items-center
            md:justify-between
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
                border-white/15
                bg-white/10
                px-4
                py-2
                text-[10px]
                font-bold
                uppercase
                tracking-[0.14em]
                backdrop-blur
              "
            >
              <BookOpenCheck
                size={14}
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
              Topic Wise Exams
            </h1>
  
            <p
              className="
                mt-4
                max-w-2xl
                text-sm
                leading-7
                text-blue-100
                sm:text-[15px]
              "
            >
              Practice Kerala PSC
              questions subject by
              subject and strengthen
              every important topic
              individually.
            </p>
          </div>
  
          <div
            className="
              hidden
              h-20
              w-20
              shrink-0
              items-center
              justify-center
              rounded-[22px]
              border
              border-white/15
              bg-white/10
              backdrop-blur
              md:flex
            "
          >
            <Layers3
              size={34}
            />
          </div>
        </div>
      </section>
    );
  }