"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  createPortal,
} from "react-dom";

import Link from "next/link";

import {
  ArrowRight,
  GraduationCap,
  X,
} from "lucide-react";

import NavbarCTA from "./NavbarCTA";

export default function MobileNavbar({
  open,
  setOpen,
  items = [],
  exams = [],
  pathname = "",
}) {
  const [mounted, setMounted] =
    useState(false);

  /* =========================================================
     MOUNT
  ========================================================= */

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  /* =========================================================
     LOCK BODY SCROLL
  ========================================================= */

  useEffect(() => {
    if (!open) {
      return;
    }

    const oldOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        oldOverflow;
    };
  }, [open]);

  /* =========================================================
     ESCAPE
  ========================================================= */

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [open, setOpen]);

  /* =========================================================
     ACTIVE
  ========================================================= */

  function isActive(href) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(
      href
    );
  }

  if (!mounted || !open) {
    return null;
  }

  /* =========================================================
     MOBILE MENU
  ========================================================= */

  return createPortal(
    <div
      className="
        fixed
        inset-0
        z-[99999]
        xl:hidden
      "
    >
      {/* BACKDROP */}

      <button
        type="button"
        aria-label="Close navigation"
        onClick={() =>
          setOpen(false)
        }
        className="
          absolute
          inset-0
          bg-black
          backdrop-blur-[2px]
        "
      />

      {/* =====================================================
          OUTER PADDING
      ===================================================== */}

      <div
        className="
          absolute
          inset-x-0
          top-[76px]
          z-10
          px-3
          sm:px-5
        "
      >
        {/* ===================================================
            MENU BLOCK
        =================================================== */}

        <aside
          className="
            mx-auto
            max-h-[calc(100dvh-90px)]
            w-full
            max-w-[720px]
            overflow-y-auto

            rounded-[24px]

            bg-white

            p-3

            shadow-[0_30px_80px_rgba(7,31,85,0.28)]
          "
        >
          {/* =================================================
              MENU HEADER
          ================================================= */}

          <div
            className="
              flex
              items-center
              justify-between

              rounded-[17px]

              bg-gradient-to-r
              from-[#f2f8ff]
              via-[#f6f5ff]
              to-[#f3f0ff]

              px-4
              py-3
            "
          >
            <div>
              <p
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.18em]
                  text-[#087bea]
                "
              >
                Navigation
              </p>

              <p
                className="
                  mt-0.5
                  text-[14px]
                  font-extrabold
                  text-[#102c5c]
                "
              >
                Explore MasterMind
              </p>
            </div>

            {/* CLOSE */}

            <button
              type="button"
              aria-label="Close menu"
              onClick={() =>
                setOpen(false)
              }
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center

                rounded-[11px]

                bg-white

                text-[#102c5c]

                shadow-[0_5px_15px_rgba(15,58,110,0.10)]

                transition-all
                duration-200

                hover:bg-[#075fc8]
                hover:text-white
              "
            >
              <X
                size={17}
                strokeWidth={2.4}
              />
            </button>
          </div>

          {/* =================================================
              NAVIGATION LINKS
          ================================================= */}

          <div
            className="
              mt-3
              grid
              gap-1.5
            "
          >
            {items.map((item) => {
              const Icon =
                item.icon;

              const active =
                isActive(
                  item.href
                );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() =>
                    setOpen(false)
                  }
                  className={`
                    group
                    flex
                    items-center
                    justify-between

                    rounded-[14px]

                    px-3
                    py-2.5

                    transition-all
                    duration-200

                    ${
                      active
                        ? `
                            bg-[#edf7ff]
                            text-[#075fc8]
                          `
                        : `
                            bg-white
                            text-[#102c5c]
                            hover:bg-[#f7faff]
                          `
                    }
                  `}
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >
                    {/* ICON BLOCK */}

                    <span
                      className={`
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center

                        rounded-[11px]

                        transition-all
                        duration-200

                        ${
                          active
                            ? `
                                bg-white
                                text-[#087bea]
                                shadow-[0_4px_12px_rgba(7,95,200,0.10)]
                              `
                            : `
                                bg-[#f3f7fc]
                                text-[#17376a]
                                group-hover:bg-white
                              `
                        }
                      `}
                    >
                      {Icon && (
                        <Icon
                          size={16}
                          strokeWidth={2.2}
                        />
                      )}
                    </span>

                    <span
                      className="
                        text-[13px]
                        font-extrabold
                      "
                    >
                      {item.label}
                    </span>
                  </div>

                  <ArrowRight
                    size={14}
                    strokeWidth={2}
                    className="
                      opacity-40
                      transition-all
                      duration-200

                      group-hover:translate-x-1
                      group-hover:opacity-100
                    "
                  />
                </Link>
              );
            })}
          </div>

          {/* =================================================
              EXAMS BLOCK
          ================================================= */}

          <div
            className="
              mt-3

              rounded-[18px]

              bg-gradient-to-br
              from-[#f2f8ff]
              via-[#f8f8ff]
              to-[#f6f1ff]

              p-3
            "
          >
            {/* TITLE */}

            <div
              className="
                flex
                items-center
                gap-2.5
                px-1
                pb-2.5
              "
            >
              <span
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center

                  rounded-[10px]

                  bg-gradient-to-br
                  from-[#075fc8]
                  to-[#7c3aed]

                  text-white

                  shadow-[0_6px_15px_rgba(7,95,200,0.18)]
                "
              >
                <GraduationCap
                  size={15}
                />
              </span>

              <div>
                <p
                  className="
                    text-[9px]
                    font-black
                    uppercase
                    tracking-[0.15em]
                    text-[#087bea]
                  "
                >
                  Government Exams
                </p>

                <p
                  className="
                    mt-0.5
                    text-[10px]
                    text-slate-500
                  "
                >
                  Choose your preparation
                </p>
              </div>
            </div>

            {/* EXAMS */}

            <div
              className="
                flex
                flex-col
                gap-1.5
              "
            >
              {exams.map((exam) => {
                const active =
                  isActive(
                    exam.href
                  );

                return (
                  <Link
                    key={exam.href}
                    href={exam.href}
                    onClick={() =>
                      setOpen(false)
                    }
                    className={`
                      group
                      flex
                      items-center
                      justify-between

                      rounded-[13px]

                      px-4
                      py-3

                      transition-all
                      duration-200

                      ${
                        active
                          ? `
                              bg-gradient-to-r
                              from-[#071f55]
                              via-[#075fc8]
                              to-[#087bea]

                              text-white

                              shadow-[0_8px_20px_rgba(7,95,200,0.20)]
                            `
                          : `
                              bg-white
                              text-[#102c5c]

                              shadow-[0_4px_14px_rgba(15,58,110,0.05)]

                              hover:-translate-y-[1px]
                              hover:shadow-[0_7px_18px_rgba(15,58,110,0.10)]
                            `
                      }
                    `}
                  >
                    <div>
                      <p
                        className="
                          text-[12px]
                          font-extrabold
                        "
                      >
                        {exam.label}
                      </p>

                      <p
                        className={`
                          mt-0.5
                          text-[9px]

                          ${
                            active
                              ? "text-white/70"
                              : "text-slate-400"
                          }
                        `}
                      >
                        {
                          exam.description
                        }
                      </p>
                    </div>

                    <span
                      className={`
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center

                        rounded-full

                        transition-all
                        duration-200

                        group-hover:translate-x-0.5

                        ${
                          active
                            ? "bg-white/15"
                            : "bg-[#f2f7ff] text-[#075fc8]"
                        }
                      `}
                    >
                      <ArrowRight
                        size={13}
                      />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* =================================================
              CTA
          ================================================= */}

          <div
            className="
              mt-3

              rounded-[17px]

              bg-[#f8fbff]

              p-2.5
            "
          >
            <NavbarCTA
              mobile
              onNavigate={() =>
                setOpen(false)
              }
            />
          </div>
        </aside>
      </div>
    </div>,
    document.body
  );
}