"use client";

import {
  usePathname,
} from "next/navigation";

import {
  getSidebarItems,
} from "./sidebar/sidebarData";

import SidebarBackdrop from "./sidebar/SidebarBackdrop";
import SidebarExamIdentity from "./sidebar/SidebarExamIdentity";
import SidebarNavigation from "./sidebar/SidebarNavigation";
import SidebarLogout from "./sidebar/SidebarLogout";
import SidebarCloseButton from "./sidebar/SidebarCloseButton";

export default function DashboardSidebar({
  config,
  mobileOpen = false,
  onMobileClose,
}) {
  const pathname =
    usePathname();

  if (!config) {
    return null;
  }

  const {
    dashboardPath,
    mainItems,
    accountItems,
  } = getSidebarItems({
    config,
  });

  function isActive(
    href
  ) {
    if (
      href ===
      dashboardPath
    ) {
      return (
        pathname ===
        dashboardPath
      );
    }

    return pathname.startsWith(
      href
    );
  }

  function closeMobile() {
    if (
      typeof onMobileClose ===
      "function"
    ) {
      onMobileClose();
    }
  }

  return (
    <>
      <SidebarBackdrop
        open={mobileOpen}
        onClose={closeMobile}
      />

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50

          flex
          w-[84px]
          flex-col

          overflow-hidden

          border-r
          border-white/[0.06]

          bg-gradient-to-b
          from-[#090b12]
          via-[#070a12]
          to-[#03050a]

          shadow-[18px_0_60px_rgba(0,0,0,0.45)]

          transition-transform
          duration-300
          ease-out

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          xl:w-[270px]
          xl:translate-x-0
        `}
      >
        {/* Background glow */}

        <div
          className="
            pointer-events-none
            absolute
            -left-[90px]
            -top-[100px]

            h-[300px]
            w-[300px]

            rounded-full

            bg-blue-600/[0.08]

            blur-[100px]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-[120px]
            -right-[100px]

            h-[320px]
            w-[320px]

            rounded-full

            bg-violet-600/[0.06]

            blur-[110px]
          "
        />

        <SidebarExamIdentity
          config={config}
        />

        <SidebarNavigation
          mainItems={
            mainItems
          }
          accountItems={
            accountItems
          }
          isActive={
            isActive
          }
          onNavigate={
            closeMobile
          }
        />

        <SidebarLogout />
      </aside>

      <SidebarCloseButton
        open={mobileOpen}
        onClose={closeMobile}
      />
    </>
  );
}