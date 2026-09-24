import { notFound } from "next/navigation";

import {
  getPackageDetails,
  getPackagesList,
} from "@/lib/packagesHelper";

import PackageHero from "./PackageHero";
import PackagePriceSection from "./PackagePriceSection";
import PackageIncludesSection from "./PackageIncludesSection";
import PackageCoursesSection from "./PackageCoursesSection";
import PackageFAQ from "./PackageFAQ";

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  params,
}) {
  const { slug } = await params;

  const packages =
    await getPackagesList({
      uid: 0,
      cid: 1,
    });

  const selectedPackage =
    packages.find(
      (item) =>
        String(item?.slug) ===
        String(slug)
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
    selectedPackage?.title ||
    selectedPackage?.package ||
    "Competitive Exam Package";

  return {
    title:
      `${title} | MasterMind Academy`,

    description:
      `Explore ${title}, pricing, validity, benefits and included courses.`,

    alternates: {
      canonical:
        `/government-exams-coaching/kerala-psc/competitive-exam-packs/${slug}`,
    },
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function PackageDetailsPage({
  params,
}) {
  const { slug } = await params;

  /* =======================================================
     GET PACKAGE LIST
  ======================================================= */

  const packages =
    await getPackagesList({
      uid: 0,
      cid: 1,
    });

  /* =======================================================
     FIND SELECTED PACKAGE
  ======================================================= */

  const selectedPackage =
    packages.find(
      (item) =>
        String(item?.slug) ===
        String(slug)
    );

  if (!selectedPackage?.id) {
    notFound();
  }

  /* =======================================================
     GET PACKAGE DETAILS
  ======================================================= */

  const packageData =
    await getPackageDetails({
      uid: 0,
      cid: 1,
      pid:
        selectedPackage.id,
    });

  if (!packageData) {
    notFound();
  }

  /* =======================================================
     DEBUG - TEMPORARY
  ======================================================= */

  console.log(
    "PACKAGE DETAILS:",
    packageData
  );

  console.log(
    "DESCRIPTION:",
    packageData?.description
  );

  console.log(
    "PRICE:",
    packageData?.price
  );

  console.log(
    "FEATURES:",
    packageData?.features
  );

  console.log(
    "COURSES:",
    packageData?.courses
  );

  /* =======================================================
     PAGE
  ======================================================= */

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
        {/* ===============================================
            PACKAGE HERO
        =============================================== */}

        <PackageHero
          packageData={
            packageData
          }
        />

        {/* ===============================================
            PRICE DETAILS
        =============================================== */}

        <PackagePriceSection
          price={
            packageData?.price
          }
        />

        {/* ===============================================
            WHAT'S INCLUDED
        =============================================== */}

        <PackageIncludesSection
          features={
            packageData?.features
          }
        />

        {/* ===============================================
            INCLUDED COURSES
        =============================================== */}

        <PackageCoursesSection
          courses={
            packageData?.courses ||
            []
          }
        />

        {/* ===============================================
            FAQ
        =============================================== */}

        <PackageFAQ
          packageData={
            packageData
          }
        />
      </div>
    </main>
  );
}