
"use client";

import {
  Suspense,
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

/* =========================================================
   NOTIFICATION REQUEST CACHE
========================================================= */

const notificationCache = new Map();
const notificationRequests = new Map();

const NOTIFICATION_TTL = 60000;

/* =========================================================
   HELPERS
========================================================= */

function countUnreadNotifications(data) {
  if (!Array.isArray(data)) {
    return 0;
  }

  return data.filter((notification) => {
    const status = String(
      notification?.nstatus ?? ""
    )
      .trim()
      .toLowerCase();

    return status !== "read";
  }).length;
}

async function requestNotifications(slug) {
  const cached =
    notificationCache.get(slug);

  if (
    cached &&
    cached.expiresAt > Date.now()
  ) {
    return cached.count;
  }

  if (
    notificationRequests.has(slug)
  ) {
    return notificationRequests.get(slug);
  }

  const request = (async () => {
    const response = await fetch(
      `/api/student/notifications?slug=${encodeURIComponent(
        slug
      )}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Notifications request failed: ${response.status}`
      );
    }

    const result =
      await response.json();

    if (result?.status !== true) {
      throw new Error(
        result?.message ||
        "Notifications unavailable."
      );
    }

    const count =
      countUnreadNotifications(
        result?.data
      );

    notificationCache.set(slug, {
      count,
      expiresAt:
        Date.now() + NOTIFICATION_TTL,
    });

    return count;
  })();

  notificationRequests.set(
    slug,
    request
  );

  const cleanup = () => {
    if (
      notificationRequests.get(slug) ===
      request
    ) {
      notificationRequests.delete(slug);
    }
  };

  request.then(cleanup, cleanup);

  return request;
}

/* =========================================================
   DASHBOARD SHELL
========================================================= */

export default function DashboardShell({
  config,
  user,
  learningToolGrid = [],
  dashboardOptions = [],
  children,
}) {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [purchasesOpen, setPurchasesOpen] =
    useState(false);

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

  const slug = String(
    config?.slug ?? ""
  );

  const cid = config?.cid;

  /* =======================================================
     PURCHASES

     Do not automatically fetch all transactions
     on every dashboard mount.

     PurchasedPackagesModal loads transactions
     when the user opens it.
  ======================================================= */

  const handleTransactionsLoaded =
    useCallback((transactions) => {
      if (!Array.isArray(transactions)) {
        return;
      }

      setPurchasesCount(
        transactions.length
      );
    }, []);

  const handleOpenPurchases =
    useCallback(() => {
      setPurchasesOpen(true);
    }, []);

  const handleClosePurchases =
    useCallback(() => {
      setPurchasesOpen(false);
    }, []);

  /* =======================================================
     NOTIFICATIONS
  ======================================================= */

  useEffect(() => {
    if (!slug) {
      setUnreadNotificationsCount(0);
      return;
    }

    let cancelled = false;

    async function loadUnreadCount() {
      try {
        const count =
          await requestNotifications(
            slug
          );

        if (!cancelled) {
          setUnreadNotificationsCount(
            count
          );
        }
      } catch (error) {
        if (
          process.env.NODE_ENV ===
          "development"
        ) {
          console.warn(
            "Notification count unavailable:",
            error?.message
          );
        }
      }
    }

    loadUnreadCount();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleUnreadNotificationsChange =
    useCallback(
      (count) => {
        const number = Number(count);

        const safeCount =
          Number.isFinite(number)
            ? Math.max(
                0,
                Math.floor(number)
              )
            : 0;

        setUnreadNotificationsCount(
          safeCount
        );

        if (slug) {
          notificationCache.set(
            slug,
            {
              count: safeCount,
              expiresAt:
                Date.now() +
                NOTIFICATION_TTL,
            }
          );
        }
      },
      [slug]
    );

  /* =======================================================
     SIDEBAR
  ======================================================= */

  const handleOpenSidebar =
    useCallback(() => {
      setSidebarOpen(true);
    }, []);

  const handleCloseSidebar =
    useCallback(() => {
      setSidebarOpen(false);
    }, []);

  /* =======================================================
     SEARCH
  ======================================================= */

  const handleSearchResultSelect =
    useCallback((item, href) => {
      setSelectedSearchResult({
        item,
        href,
      });
    }, []);

  const handleOpenFullDetails =
    useCallback(() => {
      const href =
        selectedSearchResult?.href;

      setSelectedSearchResult(null);

      if (
        typeof href === "string" &&
        href.startsWith("/") &&
        !href.startsWith("//")
      ) {
        router.push(href);
      }
    }, [
      router,
      selectedSearchResult,
    ]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#f4f7fc]">
      <DashboardSidebar
        config={config}
        user={user}
        learningToolGrid={
          learningToolGrid
        }
        mobileOpen={sidebarOpen}
        onMobileClose={
          handleCloseSidebar
        }
      />

      <div
        className="
          min-h-screen
          transition-all
          duration-300
          xl:pl-[270px]
        "
      >
        <DashboardHeader
          config={config}
          user={user}
          dashboardOptions={
            dashboardOptions
          }
          onMenuClick={
            handleOpenSidebar
          }
          onPurchasesClick={
            handleOpenPurchases
          }
          purchasesCount={
            purchasesCount
          }
          unreadNotificationsCount={
            unreadNotificationsCount
          }
          onNotificationsClick={() =>
            setNotificationsOpen(true)
          }
          onSearchResultSelect={
            handleSearchResultSelect
          }
        />

        {notificationsOpen && (
          <DashboardNotificationsModal
            slug={slug}
            onClose={() =>
              setNotificationsOpen(
                false
              )
            }
            onUnreadCountChange={
              handleUnreadNotificationsChange
            }
          />
        )}

        {selectedSearchResult && (
          <DashboardSearchDetailsModal
            item={
              selectedSearchResult.item
            }
            governmentExamsSlug={
              slug
            }
            onClose={() =>
              setSelectedSearchResult(
                null
              )
            }
            onOpenFullDetails={
              handleOpenFullDetails
            }
          />
        )}

        {purchasesOpen && (
          <PurchasedPackagesModal
            onClose={
              handleClosePurchases
            }
            onTransactionsLoaded={
              handleTransactionsLoaded
            }
          />
        )}

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
                governmentExamsSlug={
                  slug
                }
                cid={cid}
              />
            </Suspense>

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
