import {
    ArrowRight,
    Headphones,
  } from "lucide-react";
  
  export default function ContactSupportCard() {
    return (
      <section
        className="
          relative
          overflow-hidden
          rounded-[18px]
          border
          border-[#e6def5]
          bg-gradient-to-r
          from-[#fff0fb]
          via-[#f7efff]
          to-[#edf7ff]
          p-4
        " data-aos="fade-up"
      >
        <div
          className="
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[#eadcff]
                text-[#7c3aed]
              "
            >
              <Headphones className="h-5 w-5" />
            </div>
  
            <div>
              <h3
                className="
                  text-sm
                  font-black
                  text-[#082b7a]
                "
              >
                Need Quick Assistance?
              </h3>
  
              <p
                className="
                  mt-0.5
                  text-[10px]
                  text-[#7183a3]
                "
              >
                Chat with our support team
                for instant help.
              </p>
            </div>
          </div>
  
          <button
            type="button"
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-full
              bg-[#e7f3ff]
              px-5
              py-2.5
              text-[11px]
              font-bold
              text-[#087ee9]
              transition
              hover:bg-[#d8ecff]
            "
          >
            Chat Now
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>
    );
  }