"use client";

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
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  function closeModal() {
    router.replace(pathname, { scroll: false });
  }

  return (
    <PremiumPackagesModal
      open={searchParams.get("showPackages") === "1"}
      cid={cid}
      preferredPackage={{
        id: searchParams.get("packageId"),
        name: searchParams.get("packageName"),
        courseId: searchParams.get("packageCourseId"),
        courseName: searchParams.get("packageCourseName"),
        testName: searchParams.get("packageTestName"),
      }}
      governmentExamsSlug={governmentExamsSlug}
      onClose={closeModal}
    />
  );
}
