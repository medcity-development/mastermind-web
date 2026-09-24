import {
    BookOpenCheck,
    Download,
    FileText,
  } from "lucide-react";
  
  export default function StudyMaterialsHero({
    total = 0,
    courseName = "Kerala PSC",
  }) {
    return (
      <section
        className="
          relative
          mt-20
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
          lg:py-10
        "
      >
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
  
        <div
          className="
            relative
            z-10
            grid
            gap-8
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
              <BookOpenCheck
                size={14}
              />
  
              {courseName} Resources
            </div>
  
            <h1
              className="
                mt-5
                text-3xl
                font-black
                sm:text-4xl
              "
            >
              Study Materials
            </h1>
  
            <p
              className="
                mt-3
                max-w-2xl
                text-sm
                leading-7
                text-blue-100
              "
            >
              Download helpful PDF
              resources for {courseName}{" "}
              preparation and keep your
              important study materials
              ready for revision.
            </p>
  
            <div
              className="
                mt-6
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-white/10
                px-4
                py-2
                text-xs
                font-bold
              "
            >
              <FileText
                size={15}
              />
  
              {total}{" "}
              {total === 1
                ? "Material"
                : "Materials"}{" "}
              Available
            </div>
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
              lg:flex
            "
          >
            <Download
              size={32}
            />
          </div>
        </div>
      </section>
    );
  }