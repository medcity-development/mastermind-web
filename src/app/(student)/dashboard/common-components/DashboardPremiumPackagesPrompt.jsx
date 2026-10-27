"use client";

import {
  useCallback,
  useMemo,
} from "react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import PremiumPackagesModal from "@/components/packages/PremiumPackagesModal";

export default function DashboardPremiumPackagesPrompt({
  governmentExamsSlug,
  cid,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isOpen =
    searchParams.get("showPackages") === "1";

  const preferredPackage = useMemo(
    () => ({
      id: searchParams.get("packageId") || "",
      name: searchParams.get("packageName") || "",
      courseId:
        searchParams.get("packageCourseId") || "",
      courseName:
        searchParams.get("packageCourseName") || "",
      testName:
        searchParams.get("packageTestName") || "",
    }),
    [searchParams]
  );

  const closeModal = useCallback(() => {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    params.delete("showPackages");
    params.delete("packageId");
    params.delete("packageName");
    params.delete("packageCourseId");
    params.delete("packageCourseName");
    params.delete("packageTestName");

    const query = params.toString();

    router.replace(
      query ? `${pathname}?${query}` : pathname,
      { scroll: false }
    );
  }, [pathname, router, searchParams]);

  return (
    <PremiumPackagesModal
      open={isOpen}
      cid={cid}
      preferredPackage={preferredPackage}
      governmentExamsSlug={governmentExamsSlug}
      onClose={closeModal}
    />
  );
}