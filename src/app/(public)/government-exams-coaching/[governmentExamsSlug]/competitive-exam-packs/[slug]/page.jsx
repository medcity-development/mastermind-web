import {
  notFound,
} from "next/navigation";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import {
  getPackageDetails,
  getPackagesList,
} from "@/lib/packagesHelper";

import PackageHero from "./PackageHero";
import PackagePriceSection from "./PackagePriceSection";
import PackageIncludesSection from "./PackageIncludesSection";
import PackageCoursesSection from "./PackageCoursesSection";
import PackageFAQ from "./PackageFAQ";
import PackageDescriptionSection from "./PackageDescriptionSection";

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  params,
}) {
  const {
    governmentExamsSlug,
    slug,
  } = await params;

  const config =
    getGovernmentExamConfig(
      governmentExamsSlug
    );

  if (!config) {
    return {
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const packages =
    await getPackagesList({
      uid: 0,
      cid:
        config.cid,
    });

  const selectedPackage =
    packages.find(
      (item) =>
        String(
          item?.slug
        ) ===
        String(
          slug
        )
    );

  if (!selectedPackage) {
    return {
      title:
        "Package Not Found",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title =
    selectedPackage?.package ||
    selectedPackage?.title ||
    "Competitive Exam Package";

  const canonical =
    `/government-exams-coaching/${governmentExamsSlug}` +
    `/competitive-exam-packs/${slug}`;

  return {
    title:
      `${title} | ${config.name} | MasterMind Academy`,

    description:
      `Explore ${title} for ${config.name}, including pricing, validity, included courses and package benefits.`,

    alternates: {
      canonical,
    },
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function PackageDetailsPage({
  params,
}) {
  const {
    governmentExamsSlug,
    slug,
  } = await params;

  /* =====================================================
     ROUTE CONFIG
  ===================================================== */

  const config =
    getGovernmentExamConfig(
      governmentExamsSlug
    );

  if (!config) {
    notFound();
  }

  const cid =
    Number(
      config.cid
    );

  const examName =
    config.name;

  const shortName =
    config.shortName;

  /* =====================================================
     GET PACKAGES FOR CORRECT EXAM
  ===================================================== */

  const packages =
    await getPackagesList({
      uid: 0,
      cid,
    });

  /* =====================================================
     FIND PACKAGE
  ===================================================== */

  const selectedPackage =
    packages.find(
      (item) =>
        String(
          item?.slug
        ) ===
        String(
          slug
        )
    );

  if (
    !selectedPackage?.id
  ) {
    notFound();
  }

  /* =====================================================
     DETAILS
  ===================================================== */

  const packageData =
    await getPackageDetails({
      uid: 0,
      cid,
      pid:
        selectedPackage.id,
    });

  if (!packageData) {
    notFound();
  }

  return (
    <main
      className="
        min-h-screen
        bg-[#f6faff]
        px-4
        py-8
        sm:px-6
        lg:px-8
        lg:py-12
      "
    >
      <div
        className="
          mx-auto
          mt-12
          max-w-7xl
        "
      >
        <PackageHero
          packageData={
            packageData
          }
          examName={
            examName
          }
          shortName={
            shortName
          }
          governmentExamsSlug={
            governmentExamsSlug
          }
        />

        <PackageDescriptionSection
          description={
            packageData?.description ||
            ""
          }
        />

        <PackagePriceSection
          price={
            packageData?.price
          }
        />

        <PackageIncludesSection
          features={
            packageData?.features ||
            []
          }
        />

        <PackageCoursesSection
          courses={
            packageData?.courses ||
            []
          }
          examName={
            examName
          }
        />

        <PackageFAQ
          packageData={
            packageData
          }
          examName={
            examName
          }
        />
      </div>
    </main>
  );
}