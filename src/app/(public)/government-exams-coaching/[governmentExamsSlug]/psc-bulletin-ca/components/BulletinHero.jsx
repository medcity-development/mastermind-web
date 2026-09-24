import {
    BookOpenText,
    CalendarDays,
    Sparkles,
  } from "lucide-react";
  
  export default function BulletinHero() {
    return (
      <section
        className="
          relative
          overflow-hidden
          rounded-[28px]
          bg-gradient-to-r
          from-[#071936]
          via-[#164fa5]
          to-[#017cc0]
          px-6
          py-8
          text-white
          sm:px-8
          lg:px-10
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
            <Sparkles
              size={12}
            />
  
            PSC Study Bulletin
          </span>
  
          <h1
            className="
              mt-4
              text-3xl
              font-black
              sm:text-4xl
            "
          >
            Monthly PSC Bulletin
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
            Browse monthly
            bulletin collections
            and access organized
            Kerala PSC study
            content.
          </p>
  
          <div
            className="
              mt-5
              flex
              flex-wrap
              gap-2
            "
          >
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
              <CalendarDays
                size={13}
              />
  
              Monthly Updates
            </span>
  
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
              <BookOpenText
                size={13}
              />
  
              Study Focused
            </span>
          </div>
        </div>
      </section>
    );
  }