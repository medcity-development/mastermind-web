import {
    FileCheck2,
    ListChecks,
  } from "lucide-react";
  
  export default function StatementTypeHero() {
    return (
      <section
        className="
          relative
          overflow-hidden
          rounded-[28px]
          bg-gradient-to-r
          from-[#071f55]
          via-[#075fc8]
          to-[#7c3aed]
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
            pointer-events-none
            absolute
            inset-0
            opacity-[0.06]
            [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
            [background-size:34px_34px]
          "
        />
  
        {/* GLOW */}
  
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-20
            -top-20
            h-64
            w-64
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
            gap-7
            lg:grid-cols-[1fr_auto]
            lg:items-center
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
                font-black
                uppercase
                tracking-[0.14em]
                text-blue-100
              "
            >
              <FileCheck2
                size={14}
              />
  
              Kerala PSC Preparation
            </div>
  
            <h1
              className="
                mt-5
                text-3xl
                font-black
                sm:text-4xl
              "
            >
              Statement Type Exams
            </h1>
  
            <p
              className="
                mt-3
                max-w-2xl
                text-sm
                leading-7
                text-blue-100
                sm:text-[15px]
              "
            >
              Practice topic-wise
              statement type questions
              and improve accuracy in
              Kerala PSC examinations.
            </p>
          </div>
  
          <div
            className="
              hidden
              h-20
              w-20
              items-center
              justify-center
              rounded-[24px]
              border
              border-white/15
              bg-white/10
              backdrop-blur-sm
              lg:flex
            "
          >
            <ListChecks
              size={34}
            />
          </div>
        </div>
      </section>
    );
  }