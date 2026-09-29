// src/components/footer/Footer.jsx

import FooterBrand from "./FooterBrand";
import FooterColumn from "./FooterColumn";
import FooterContact from "./FooterContact";
import FooterBottom from "./FooterBottom";

import {
  courseLinks,
  quickLinks,
  resourceLinks,
} from "./footerData";

export default function Footer() {
  return (
    <footer
      data-aos="fade-up"
      className="
        relative
        w-full
        overflow-hidden
        !bg-[#020b18]
        !text-white
      "
    >
      {/* =====================================================
          DARK BACKGROUND
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          !bg-gradient-to-br
          !from-[#020814]
          !via-[#041426]
          !to-[#020914]
        "
      />

      {/* =====================================================
          SUBTLE BACKGROUND IMAGE
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[url('/assets/mastermind-footer-bg.webp')]
          bg-cover
          bg-center
          bg-no-repeat
          opacity-[0.04]
        "
      />

      {/* =====================================================
          CYAN GLOW - LEFT
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -bottom-40
          -left-40
          h-[420px]
          w-[420px]
          rounded-full
          bg-[#017dc0]/15
          blur-[120px]
        "
      />

      {/* =====================================================
          BLUE GLOW - RIGHT
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-40
          -top-40
          h-[420px]
          w-[420px]
          rounded-full
          bg-[#164fa5]/15
          blur-[120px]
        "
      />

      {/* =====================================================
          TOP LINE
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          absolute
          left-0
          right-0
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-[#00b5e8]/50
          to-transparent
        "
      />

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-[1450px]
          px-5
          pt-10
          sm:px-6
          lg:px-8
          lg:pt-12
        "
      >
        {/* =================================================
            MAIN GRID
        ================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-9

            sm:grid-cols-2

            lg:grid-cols-5
            lg:gap-8

            xl:gap-10
          "
        >
          {/* BRAND */}

          <div
            className="
              sm:col-span-2
              lg:col-span-1
            "
          >
            <FooterBrand />
          </div>

          {/* QUICK LINKS */}

          <div>
            <FooterColumn
              title="Quick Links"
              links={quickLinks}
            />
          </div>

          {/* COURSES */}

          <div>
            <FooterColumn
              title="Courses"
              links={courseLinks}
            />
          </div>

          {/* RESOURCES */}

          <div>
            <FooterColumn
              title="Resources"
              links={resourceLinks}
            />
          </div>

          {/* CONTACT */}

          <div>
            <FooterContact />
          </div>
        </div>

        {/* =================================================
            BOTTOM
        ================================================== */}

        <FooterBottom />
      </div>
    </footer>
  );
}