import Link from "next/link";

import {
  LogIn,
} from "lucide-react";

import NavLogo from "./NavLogo";
import DesktopMenuItem from "./DesktopMenuItem";
import DesktopLearningHub from "./DesktopLearningHub";

export default function DesktopStickyNav({
  leftMenu,
  isActiveLink,
  isLearningHubActive,
  onLearningItemClick,
}) {
  return (
    <header
      className="
        fixed
        left-0
        right-0
        top-0
        z-[9999]
        hidden
        px-5
        lg:block
        xl:px-8
      "
    >
      <div
        className="
          mx-auto
          flex
          h-[82px]
          w-full
          max-w-[1540px]
          items-center
          rounded-[24px]
          border
          border-white/80
          bg-white/95
          px-5
          shadow-[0_14px_45px_rgba(22,79,165,0.10)]
          backdrop-blur-2xl
          xl:px-7
        "
      >
        <NavLogo />

        <nav
          className="
            flex
            min-w-0
            flex-1
            items-center
            justify-center
          "
        >
          <div
            className="
              flex
              items-center
              justify-center
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
                    <DesktopLearningHub
                      key={
                        item.label
                      }
                      item={item}
                      active={isLearningHubActive(
                        item
                      )}
                      onItemClick={
                        onLearningItemClick
                      }
                    />
                  );
                }

                return (
                  <DesktopMenuItem
                    key={
                      item.label
                    }
                    item={item}
                    active={isActiveLink(
                      item.href
                    )}
                  />
                );
              }
            )}
          </div>
        </nav>

        <div
          className="
            ml-3
            flex
            min-w-[150px]
            shrink-0
            justify-end
          "
        >
          <Link
            href="/login"
            className="
              group
              flex
              min-h-[52px]
              min-w-[135px]
              cursor-pointer
              items-center
              justify-center
              gap-2
              rounded-[17px]
              bg-gradient-to-r
              from-[#1878f2]
              via-[#0965df]
              to-[#034cc4]
              px-5
              text-[14px]
              font-semibold
              text-white
              shadow-[0_12px_28px_rgba(3,76,196,0.22)]
              transition-all
              duration-300
              hover:-translate-y-0.5
            "
          >
            <LogIn
              size={18}
            />

            Login
          </Link>
        </div>
      </div>
    </header>
  );
}