"use client";

import { Suspense } from "react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import DashboardSelectedTestNotice from "./DashboardSelectedTestNotice";
import DashboardPremiumPackagesPrompt from "./DashboardPremiumPackagesPrompt";
import PurchasedPackagesModal from "./PurchasedPackagesModal";
import DashboardSearchDetailsModal from "./DashboardSearchDetailsModal";
import DashboardNotificationsModal from "./DashboardNotificationsModal";

export default function DashboardShell({
  config,
  user,
  learningToolGrid = [],
  dashboardOptions = [],
  children,
}) {
  const router = useRouter();
  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);

  const [
    purchasesOpen,
    setPurchasesOpen,
  ] = useState(false);

  const [
    notificationsOpen,
    setNotificationsOpen,
  ] = useState(false);

  const [
    unreadNotificationsCount,
    setUnreadNotificationsCount,
  ] = useState(0);

  const [
    purchasesCount,
    setPurchasesCount,
  ] = useState(null);

  const [
    selectedSearchResult,
    setSelectedSearchResult,
  ] = useState(null);

  const handleTransactionsLoaded = useCallback((transactions) => {
    setPurchasesCount(transactions.length);
  }, []);

  const handleUnreadNotificationsChange = useCallback((count) => {
    setUnreadNotificationsCount(count);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadPurchasesCount() {
      try {
        const response = await fetch("/api/student/transactions", {
          cache: "no-store",
        });
        const result = await response.json();

        if (!response.ok || result?.status !== true) {
          throw new Error(result?.message || "Unable to load purchase count.");
        }

        if (active) {
          setPurchasesCount(Array.isArray(result.data) ? result.data.length : 0);
        }
      } catch (error) {
        console.error("Dashboard purchase count:", error);
      }
    }

    loadPurchasesCount();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadUnreadNotifications() {
      try {
        const response = await fetch(
          `/api/student/notifications?slug=${encodeURIComponent(config.slug)}`,
          { cache: "no-store" }
        );
        const result = await response.json();

        if (!response.ok || result?.status !== true) {
          throw new Error(result?.message || "Unable to load notification count.");
        }

        const notifications = Array.isArray(result.data) ? result.data : [];
        const count = notifications.filter(
          (notification) =>
            String(notification?.nstatus ?? "").trim().toLowerCase() !== "read"
        ).length;

        if (active) setUnreadNotificationsCount(count);
      } catch (error) {
        console.error("Dashboard unread notification count:", error);
      }
    }

    loadUnreadNotifications();

    return () => {
      active = false;
    };
  }, [config.slug]);

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
          onPurchasesClick={() => setPurchasesOpen(true)}
          purchasesCount={purchasesCount}
          unreadNotificationsCount={unreadNotificationsCount}
          onNotificationsClick={() => setNotificationsOpen(true)}
          onSearchResultSelect={(item, href) => {
            setSelectedSearchResult({ item, href });
          }}
        />

        {notificationsOpen ? (
          <DashboardNotificationsModal
            slug={config.slug}
            onClose={() => setNotificationsOpen(false)}
            onUnreadCountChange={handleUnreadNotificationsChange}
          />
        ) : null}

        {selectedSearchResult ? (
          <DashboardSearchDetailsModal
            item={selectedSearchResult.item}
            governmentExamsSlug={config.slug}
            onClose={() => setSelectedSearchResult(null)}
            onOpenFullDetails={() => {
              const { href } = selectedSearchResult;
              setSelectedSearchResult(null);
              router.push(href);
            }}
          />
        ) : null}

        {purchasesOpen ? (
          <PurchasedPackagesModal
            onClose={() => setPurchasesOpen(false)}
            onTransactionsLoaded={handleTransactionsLoaded}
          />
        ) : null}

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