"use client";

import { Suspense } from "react";
import {
  useState,
} from "react";

import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import DashboardSelectedTestNotice from "./DashboardSelectedTestNotice";
import DashboardPremiumPackagesPrompt from "./DashboardPremiumPackagesPrompt";

export default function DashboardShell({
  config,
  user,
  learningToolGrid = [],
  dashboardOptions = [],
  children,
}) {
  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);

  /* =========================================================
     OPEN MOBILE SIDEBAR
  ========================================================= */

  function handleOpenSidebar() {
    setSidebarOpen(
      true
    );
  }

  /* =========================================================
     CLOSE MOBILE SIDEBAR
  ========================================================= */

  function handleCloseSidebar() {
    setSidebarOpen(
      false
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      className="
        min-h-screen
        bg-[#f4f7fc]
      "
    >
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <DashboardSidebar
        config={config}
        user={user}
        learningToolGrid={learningToolGrid}
        mobileOpen={
          sidebarOpen
        }
        onMobileClose={
          handleCloseSidebar
        }
      />

      {/* =====================================================
          MAIN CONTENT AREA
      ===================================================== */}

      <div
        className="
          min-h-screen

          transition-all
          duration-300

          xl:pl-[270px]
        "
      >
        {/* HEADER */}

        <DashboardHeader
          config={config}
          user={user}
          dashboardOptions={dashboardOptions}
          onMenuClick={
            handleOpenSidebar
          }
        />

        {/* PAGE CONTENT */}

        <main
          className="
            min-h-[calc(100vh-88px)]

            px-4
            py-5

            sm:px-5
            md:px-6
            lg:px-7
            xl:px-8
          "
        >
          <div
            className="
              dashboard-content-frame
              mx-auto
              w-full
              max-w-[1500px]
            "
          >
            <Suspense fallback={null}>
              <DashboardSelectedTestNotice />
              <DashboardPremiumPackagesPrompt
                governmentExamsSlug={config.slug}
                cid={config.cid}
              />
            </Suspense>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}