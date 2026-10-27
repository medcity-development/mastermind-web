
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

function normalizeTransactions(data) {
  return Array.isArray(data) ? data : [];
}

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

async function fetchJson(url, signal) {
  const response = await fetch(url, {
    cache: "no-store",
    signal,
  });

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "The server returned an invalid response."
    );
  }

  return {
    response,
    result,
  };
}

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
    purchasesLoading,
    setPurchasesLoading,
  ] = useState(false);

  const [
    selectedSearchResult,
    setSelectedSearchResult,
  ] = useState(null);

  const slug = String(config?.slug ?? "");
  const cid = config?.cid;

  /* =========================================================
     PURCHASE COUNT
  ========================================================= */

  const loadPurchasesCount = useCallback(
    async (signal) => {
      setPurchasesLoading(true);

      try {
        const { response, result } =
          await fetchJson(
            "/api/student/transactions",
            signal
          );

        if (
          !response.ok ||
          result?.status !== true
        ) {
          // Do not incorrectly show zero purchases
          // when the backend is unavailable.
          setPurchasesCount(null);

          if (process.env.NODE_ENV === "development") {
            console.warn(
              "Purchase count unavailable:",
              {
                httpStatus: response.status,
                reason:
                  result?.reason ?? null,
                message:
                  result?.message ||
                  "Transaction service unavailable.",
              }
            );
          }

          return;
        }

        const transactions =
          normalizeTransactions(result?.data);

        setPurchasesCount(
          transactions.length
        );
      } catch (error) {
        if (error?.name === "AbortError") {
          return;
        }

        setPurchasesCount(null);

        if (process.env.NODE_ENV === "development") {
          console.warn(
            "Purchase count request failed:",
            error?.message
          );
        }
      } finally {
        if (!signal?.aborted) {
          setPurchasesLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    const controller = new AbortController();

    loadPurchasesCount(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadPurchasesCount]);

  const handleTransactionsLoaded = useCallback(
    (transactions) => {
      if (!Array.isArray(transactions)) {
        return;
      }

      setPurchasesCount(
        transactions.length
      );
    },
    []
  );

  const handleOpenPurchases = useCallback(
    () => {
      setPurchasesOpen(true);
    },
    []
  );

  const handleClosePurchases = useCallback(
    () => {
      setPurchasesOpen(false);
    },
    []
  );

  /* =========================================================
     UNREAD NOTIFICATIONS
  ========================================================= */

  useEffect(() => {
    if (!slug) {
      setUnreadNotificationsCount(0);
      return;
    }

    const controller =
      new AbortController();

    async function loadUnreadNotifications() {
      try {
        const { response, result } =
          await fetchJson(
            `/api/student/notifications?slug=${encodeURIComponent(slug)}`,
            controller.signal
          );

        if (
          !response.ok ||
          result?.status !== true
        ) {
          return;
        }

        if (!controller.signal.aborted) {
          setUnreadNotificationsCount(
            countUnreadNotifications(
              result?.data
            )
          );
        }
      } catch (error) {
        if (error?.name === "AbortError") {
          return;
        }

        if (process.env.NODE_ENV === "development") {
          console.warn(
            "Unread notification count unavailable:",
            error?.message
          );
        }
      }
    }

    loadUnreadNotifications();

    return () => {
      controller.abort();
    };
  }, [slug]);

  const handleUnreadNotificationsChange =
    useCallback((count) => {
      const value = Number(count);

      setUnreadNotificationsCount(
        Number.isFinite(value)
          ? Math.max(0, Math.floor(value))
          : 0
      );
    }, []);

  /* =========================================================
     SIDEBAR
  ========================================================= */

  const handleOpenSidebar = useCallback(
    () => setSidebarOpen(true),
    []
  );

  const handleCloseSidebar = useCallback(
    () => setSidebarOpen(false),
    []
  );

  /* =========================================================
     SEARCH
  ========================================================= */

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
    }, [router, selectedSearchResult]);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#f4f7fc]">
      <DashboardSidebar
        config={config}
        user={user}
        learningToolGrid={learningToolGrid}
        mobileOpen={sidebarOpen}
        onMobileClose={handleCloseSidebar}
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
          dashboardOptions={dashboardOptions}
          onMenuClick={handleOpenSidebar}
          onPurchasesClick={handleOpenPurchases}
          purchasesCount={purchasesCount}
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
              setNotificationsOpen(false)
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
            governmentExamsSlug={slug}
            onClose={() =>
              setSelectedSearchResult(null)
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
                governmentExamsSlug={slug}
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
