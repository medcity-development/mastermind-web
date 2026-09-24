"use client";

import {
  BookOpenText,
  Home,
  Info,
  Mail,
  Menu,
  MessageSquareText,
  X,
} from "lucide-react";

import { usePathname } from "next/navigation";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import NavbarLinks from "./NavbarLinks";
import ExamDropdown from "./ExamDropdown";
import NavbarCTA from "./NavbarCTA";
import NavbarBrand from "./NavbarBrand";
import MobileNavbar from "./MobileNavbar";

/* =========================================================
   NAV ITEMS
========================================================= */

const NAV_ITEMS = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "About",
    href: "/about-us",
    icon: Info,
  },
  {
    label: "Testimonials",
    href: "/testimonials",
    icon: MessageSquareText,
  },
  {
    label: "Blogs",
    href: "/blogs",
    icon: BookOpenText,
  },
  {
    label: "Contact",
    href: "/contact",
    icon: Mail,
  },
];

/* =========================================================
   GOVERNMENT EXAMS
========================================================= */

const GOVERNMENT_EXAMS = [
  {
    label: "Kerala PSC",
    description:
      "Kerala PSC exam preparation",
    href:
      "/government-exams-coaching/kerala-psc",
  },
  {
    label: "RRB & SSC",
    description:
      "Railway & SSC exam preparation",
    href:
      "/government-exams-coaching/rrb-ssc",
  },
];

/* =========================================================
   NAVBAR
========================================================= */

export default function Navbar() {
  const pathname =
    usePathname();

  const dropdownRef =
    useRef(null);

  const [
    examOpen,
    setExamOpen,
  ] = useState(false);

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  /* =======================================================
     CLOSE DROPDOWN ON OUTSIDE CLICK
  ======================================================= */

  useEffect(() => {
    function handleOutside(
      event
    ) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target
        )
      ) {
        setExamOpen(false);
      }
    }

    function handleEscape(
      event
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        setExamOpen(false);
        setMobileOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutside
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutside
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  /* =======================================================
     CLOSE MENU AFTER ROUTE CHANGE
  ======================================================= */

  useEffect(() => {
    setExamOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* ===================================================
          NAVBAR SPACER
      =================================================== */}

      <div
        className="
          h-[72px]
          sm:h-[74px]
        "
        aria-hidden="true"
      />

      {/* ===================================================
          FULL WIDTH NAVBAR
      =================================================== */}

    <header
  className="
    fixed
    left-0
    right-0
    top-0
    z-[9999]
    w-full
    bg-white
    
  "
>
        <nav
          className="
            relative

            flex
            h-[72px]
            w-full

            items-center
            justify-between

            overflow-visible

            px-4
            sm:px-6
            lg:px-10
            xl:px-14
          "
        >
          {/* ===============================================
              BACKGROUND DECORATION
          =============================================== */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-0
              overflow-hidden
            "
          >
            {/* GRID PATTERN */}

            <div
              className="
                absolute
                inset-0

                opacity-[0.025]

                [background-image:linear-gradient(to_right,#164fa5_1px,transparent_1px),linear-gradient(to_bottom,#164fa5_1px,transparent_1px)]

                [background-size:28px_28px]
              "
            />

            {/* LEFT BLUE GLOW */}

            <div
              className="
                absolute
                -left-24
                -top-28

                h-[220px]
                w-[400px]

                rounded-full

                bg-[#38bdf8]/15

                blur-[85px]
              "
            />

            {/* CENTER BLUE/PURPLE GLOW */}

            <div
              className="
                absolute
                left-[38%]
                -top-[130px]

                h-[220px]
                w-[500px]

                rounded-full

                bg-[#818cf8]/10

                blur-[100px]
              "
            />

            {/* RIGHT PURPLE GLOW */}

            <div
              className="
                absolute
                -right-24
                -top-28

                h-[220px]
                w-[420px]

                rounded-full

                bg-[#c084fc]/10

                blur-[90px]
              "
            />
          </div>

          {/* ===============================================
              TOP GRADIENT LINE
          =============================================== */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none

              absolute
              left-0
              right-0
              top-0

              h-px

              bg-gradient-to-r
              from-[#38bdf8]/30
              via-[#818cf8]/30
              to-[#c084fc]/30
            "
          />

          {/* ===============================================
              BRAND
          =============================================== */}

          <div
            className="
              relative
              z-10
              shrink-0
            "
          >
            <NavbarBrand />
          </div>

          {/* ===============================================
              DESKTOP NAVIGATION
          =============================================== */}

          <div
            className="
              relative
              z-10

              hidden
              flex-1

              items-center
              justify-center

              gap-1

              xl:flex
            "
          >
            <NavbarLinks
              items={
                NAV_ITEMS
              }
              pathname={
                pathname
              }
            />

            <ExamDropdown
              open={
                examOpen
              }
              setOpen={
                setExamOpen
              }
              dropdownRef={
                dropdownRef
              }
              pathname={
                pathname
              }
              exams={
                GOVERNMENT_EXAMS
              }
            />
          </div>

          {/* ===============================================
              RIGHT ACTIONS
          =============================================== */}

          <div
            className="
              relative
              z-10

              flex
              shrink-0

              items-center

              gap-2
            "
          >
            <NavbarCTA />

            {/* =============================================
                MOBILE MENU BUTTON
            ============================================= */}

            <button
              type="button"
              aria-label="Toggle navigation"
              aria-expanded={
                mobileOpen
              }
              onClick={() =>
                setMobileOpen(
                  (value) =>
                    !value
                )
              }
              className="
                inline-flex

                h-[42px]
                w-[42px]

                items-center
                justify-center

                rounded-[12px]

                border
                border-[#d4e2f2]

                bg-white/70

                text-[#102c5c]

                shadow-[0_4px_15px_rgba(15,58,110,0.06)]

                backdrop-blur-md

                transition-all
                duration-300

                hover:-translate-y-0.5

                hover:border-[#bfd4ed]

                hover:bg-white

                hover:text-[#075fc8]

                hover:shadow-[0_7px_20px_rgba(15,58,110,0.10)]

                xl:hidden
              "
            >
              {mobileOpen ? (
                <X
                  size={
                    20
                  }
                />
              ) : (
                <Menu
                  size={
                    20
                  }
                />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* ===================================================
          MOBILE NAVIGATION
      =================================================== */}

      <MobileNavbar
        open={
          mobileOpen
        }
        setOpen={
          setMobileOpen
        }
        items={
          NAV_ITEMS
        }
        exams={
          GOVERNMENT_EXAMS
        }
        pathname={
          pathname
        }
      />
    </>
  );
}