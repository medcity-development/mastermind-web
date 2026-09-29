// src/app/(student)/dashboard/common-components/quick-actions/dashboardLearningToolsHelper.js

import {
    DEFAULT_LEARNING_TOOL_META,
    getLearningToolMeta,
  } from "./learningToolsData";
  
  /* =========================================================
     DASHBOARD BASE PATH
  ========================================================= */
  
  function buildDashboardBasePath(
    governmentExamsSlug
  ) {
    if (!governmentExamsSlug) {
      return "";
    }
  
    return `/dashboard/${governmentExamsSlug}`;
  }
  
  /* =========================================================
     PREPARE ONE DASHBOARD TOOL
  ========================================================= */
  
  function prepareDashboardLearningTool({
    item,
    governmentExamsSlug,
  }) {
    const title = String(
      item?.title ?? ""
    ).trim();
  
    if (!title) {
      return null;
    }
  
    const matchedMeta =
      getLearningToolMeta(title);
  
    const meta =
      matchedMeta ||
      DEFAULT_LEARNING_TOOL_META;
  
    const dashboardBasePath =
      buildDashboardBasePath(
        governmentExamsSlug
      );
  
    /*
     * IMPORTANT:
     * These are PRIVATE dashboard routes.
     *
     * /dashboard/kerala-psc/mock-tests
     * /dashboard/rrb-ssc/mock-tests
     */
  
    const href =
      meta.route
        ? `${dashboardBasePath}/${meta.route}`
        : dashboardBasePath;
  
    return {
      ...item,
  
      title,
  
      subtitle:
        meta.subtitle,
  
      route:
        meta.route,
  
      href,
  
      icon:
        meta.icon,
  
      iconColor:
        meta.iconColor,
  
      iconBg:
        meta.iconBg,
  
      hasRegisteredRoute:
        Boolean(
          matchedMeta?.route
        ),
    };
  }
  
  /* =========================================================
     PREPARE ALL DASHBOARD TOOLS
  ========================================================= */
  
  export function prepareDashboardLearningTools({
    grid,
    governmentExamsSlug,
  }) {
    if (!Array.isArray(grid)) {
      return [];
    }
  
    return grid
      .filter((item) => {
        return (
          String(
            item?.status ?? "1"
          ) === "1"
        );
      })
      .sort((a, b) => {
        return (
          Number(a?.order ?? 0) -
          Number(b?.order ?? 0)
        );
      })
      .map((item) => {
        return prepareDashboardLearningTool({
          item,
          governmentExamsSlug,
        });
      })
      .filter(Boolean);
  }