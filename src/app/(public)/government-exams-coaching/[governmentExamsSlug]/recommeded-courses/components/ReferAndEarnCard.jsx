import Link from "next/link";

import {
  ArrowRight,
  Megaphone,
} from "lucide-react";

export default function ReferAndEarnCard() {
  return (
    <section
      data-aos="fade-right"
      className="
        relative
        overflow-hidden
        rounded-[22px]
        border
        border-[#cfe9fb]
        bg-gradient-to-r
        from-[#dcf5ff]
        via-[#edfaff]
        to-[#d9f3ff]
        px-5
        py-5
        shadow-[0_10px_28px_rgba(15,58,110,0.05)]

        sm:px-7
      "
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-16
          -top-16
          h-44
          w-44
          rounded-full
          bg-[#00b5e8]/10
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

          md:flex-row
          md:items-center
          md:justify-between
        "
      >
        <div
          className="
            flex
            items-center
            gap-4
          "
        >
          <div
            className="
              flex
              h-16
              w-16
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-gradient-to-br
              from-[#f13873]
              via-[#017cc0]
              to-[#164fa5]
              text-white
              shadow-[0_12px_26px_rgba(22,79,165,0.15)]
            "
          >
            <Megaphone
              className="h-8 w-8"
            />
          </div>

          <div>
            <h3
              className="
                text-2xl
                font-black
                tracking-[-0.035em]
                text-[#0b216c]
              "
            >
              Refer and Earn
            </h3>

            <p
              className="
                mt-1
                text-[13px]
                text-[#516b97]
              "
            >
              Refer a friend and get
              exciting rewards!
            </p>
          </div>
        </div>

        <Link
          href="/refer-and-earn"
          className="
            group
            inline-flex
            w-fit
            items-center
            gap-3
            rounded-full
            bg-gradient-to-r
            from-[#164fa5]
            to-[#087bea]
            px-6
            py-3
            text-[11px]
            font-bold
            text-white
            shadow-[0_10px_22px_rgba(22,79,165,0.18)]
            transition-all
            duration-300

            hover:-translate-y-0.5
          "
        >
          Know More

          <ArrowRight
            className="
              h-4
              w-4
              transition-transform
              duration-300
              group-hover:translate-x-1
            "
          />
        </Link>
      </div>
    </section>
  );
}