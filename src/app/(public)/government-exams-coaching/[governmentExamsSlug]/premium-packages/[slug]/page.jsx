import {
    notFound,
  } from "next/navigation";
  
  import {
    getPackageDetails,
    getPackagesList,
  } from "@/lib/packagesHelper";
  
  import PackageDetails from "./components/PackageDetails";
  
  async function resolvePackage(
    slug
  ) {
    const packages =
      await getPackagesList({
        uid: 0,
        cid: 1,
      });
  
    return (
      packages.find(
        (item) =>
          item?.slug === slug
      ) || null
    );
  }
  
  export async function generateMetadata({
    params,
  }) {
    const { slug } =
      await params;
  
    const selectedPackage =
      await resolvePackage(
        slug
      );
  
    if (!selectedPackage) {
      return {
        title:
          "Plan Not Found | MasterMind Academy",
  
        robots: {
          index: false,
          follow: false,
        },
      };
    }
  
    return {
      title:
        `${selectedPackage.package} | MasterMind Academy`,
  
      description:
        selectedPackage?.tag ||
        `Explore ${selectedPackage.package} premium Kerala PSC preparation plan.`,
    };
  }
  
  export default async function PackageDetailsPage({
    params,
  }) {
    const { slug } =
      await params;
  
    const selectedPackage =
      await resolvePackage(
        slug
      );
  
    if (!selectedPackage) {
      notFound();
    }
  
    const details =
      await getPackageDetails({
        pid:
          selectedPackage.id,
  
        uid: 0,
        cid: 1,
      });
  
    if (!details) {
      notFound();
    }
  
    return (
      <main
        className="
          min-h-screen
          bg-[#f5f9ff]
        "
      >
        <div
          className="
            mx-auto
            w-full
            max-w-[1450px]
            px-4
            py-6
            sm:px-6
            lg:px-8
            lg:py-8
          "
        >
          <PackageDetails
            details={details}
          />
        </div>
      </main>
    );
  }