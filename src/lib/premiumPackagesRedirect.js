export function getDashboardPackagesPath(pathname, packageContext = {}) {
  const match = String(pathname || "").match(
    /^\/(?:government-exams-coaching|dashboard)\/([^/]+)/
  );

  if (!match) {
    return "";
  }

  const params = new URLSearchParams({ showPackages: "1" });

  for (const [key, value] of Object.entries(packageContext)) {
    if (value !== undefined && value !== null && String(value).trim()) {
      params.set(key, String(value).trim());
    }
  }

  return `/dashboard/${encodeURIComponent(match[1])}?${params.toString()}`;
}

export async function continueToPremiumPackages(
  router,
  pathname,
  packageContext = {}
) {
  const packagesPath = getDashboardPackagesPath(pathname, packageContext);

  if (!packagesPath) {
    return false;
  }

  if (String(pathname).startsWith("/dashboard/")) {
    router.push(packagesPath);
    return true;
  }

  const slug = String(pathname).match(
    /^\/government-exams-coaching\/([^/]+)/
  )?.[1];

  const cid = slug === "rrb-ssc" ? 2 : 1;
  try {
    const response = await fetch(`/api/packages?cid=${cid}`, {
      cache: "no-store",
    });
    const result = await response.json();

    if (!response.ok || result?.status !== true) {
      throw new Error(result?.message || "Unable to verify your login.");
    }

    if (result.authenticated && result.profileCompleted) {
      router.push(packagesPath);
    } else if (result.authenticated) {
      router.push(
        `/profile-setup?redirect=${encodeURIComponent(packagesPath)}`
      );
    } else {
      router.push(
        `/login?redirect=${encodeURIComponent(packagesPath)}`
      );
    }
  } catch (error) {
    console.error("Unable to verify session before premium purchase:", error);
    router.push(
      `/login?redirect=${encodeURIComponent(packagesPath)}`
    );
  }

  return true;
}
