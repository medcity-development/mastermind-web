import Link from "next/link";

import {
  LogIn,
  Menu,
  X,
} from "lucide-react";

import NavLogo from "./NavLogo";
import MobileLearningHub from "./MobileLearningHub";

export default function MobileStickyNav({
  leftMenu,
  mobileMenuOpen,
  setMobileMenuOpen,
  learningHubOpen,
  setLearningHubOpen,
  onLearningItemClick,
}) {
  return (
    <>
      <header
        className="
          fixed
          inset-x-0
          top-0
          z-[9999]
          border-b
          border-[#164fa5]/10
          bg-white/95
          shadow-[0_8px_28px_rgba(8,31,92,0.08)]
          backdrop-blur-2xl
          lg:hidden
        "
      >
        <div
          className="
            mx-auto
            flex
            h-[68px]
            items-center
            justify-between
            px-4
            sm:h-[74px]
            sm:px-6
          "
        >
          <NavLogo
            mobile
            onClick={() =>
              setMobileMenuOpen(
                false
              )
            }
          />

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(
                (previous) =>
                  !previous
              )
            }
            className="
              flex
              h-11
              w-11
              cursor-pointer
              items-center
              justify-center
              rounded-[13px]
              border
              border-[#164fa5]/10
              bg-[#edf7ff]
              text-[#0755b9]
            "
          >
            {mobileMenuOpen ? (
              <X size={23} />
            ) : (
              <Menu size={24} />
            )}
          </button>
        </div>

        <div
          className={`
            absolute
            left-0
            right-0
            top-full
            overflow-hidden
            border-t
            bg-white
            transition-all
            duration-300

            ${
              mobileMenuOpen
                ? `
                    visible
                    max-h-[calc(100vh-68px)]
                    opacity-100
                  `
                : `
                    invisible
                    max-h-0
                    opacity-0
                  `
            }
          `}
        >
          <nav
            className="
              max-h-[calc(100vh-68px)]
              overflow-y-auto
              px-4
              pb-5
              pt-3
            "
          >
            <div
              className="
                flex
                flex-col
                gap-1
              "
            >
              {leftMenu.map(
                (item) => {
                  const hasChildren =
                    Array.isArray(
                      item.children
                    );

                  if (
                    hasChildren
                  ) {
                    return (
                      <MobileLearningHub
                        key={
                          item.label
                        }
                        item={item}
                        isOpen={
                          learningHubOpen
                        }
                        onToggle={() =>
                          setLearningHubOpen(
                            (previous) =>
                              !previous
                          )
                        }
                        onItemClick={
                          onLearningItemClick
                        }
                      />
                    );
                  }

                  return (
                    <Link
                      key={
                        item.label
                      }
                      href={
                        item.href
                      }
                      onClick={() =>
                        setMobileMenuOpen(
                          false
                        )
                      }
                      className="
                        flex
                        min-h-[54px]
                        cursor-pointer
                        items-center
                        gap-3
                        rounded-xl
                        px-3
                        text-[14px]
                        font-semibold
                        text-[#1f3158]
                        hover:bg-[#f4f9ff]
                      "
                    >
                      <span
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-[10px]
                          bg-[#f1f7ff]
                          text-[#164fa5]
                        "
                      >
                        {item.icon}
                      </span>

                      <span>
                        {item.label}
                      </span>
                    </Link>
                  );
                }
              )}
            </div>

            <Link
              href="/login"
              onClick={() =>
                setMobileMenuOpen(
                  false
                )
              }
              className="
                mt-4
                flex
                min-h-[52px]
                cursor-pointer
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-gradient-to-r
                from-[#1878f2]
                to-[#034cc4]
                px-5
                text-[14px]
                font-semibold
                text-white
              "
            >
              <LogIn size={18} />

              Login
            </Link>
          </nav>
        </div>
      </header>

      <button
        type="button"
        aria-label="Close navigation"
        onClick={() =>
          setMobileMenuOpen(
            false
          )
        }
        className={`
          fixed
          inset-0
          z-[9997]
          cursor-pointer
          bg-[#06194b]/20
          backdrop-blur-[2px]
          transition-opacity
          duration-300
          lg:hidden

          ${
            mobileMenuOpen
              ? `
                  visible
                  opacity-100
                  pointer-events-auto
                `
              : `
                  invisible
                  opacity-0
                  pointer-events-none
                `
          }
        `}
      />
    </>
  );
}