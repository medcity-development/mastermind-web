import PackageCoursesSection from "./PackageCoursesSection";
import PackageHero from "./PackageHero";
import PackageIncludesSection from "./PackageIncludesSection";
import PackagePriceSection from "./PackagePriceSection";


export default function PackageDetails({
  details,
}) {
  if (!details) {
    return null;
  }

  return (
    <div className="space-y-5">
      <PackageHero
        title={details?.title}
        tag={details?.tag}
        description={
          details?.description
        }
        imageUrl={
          details?.imageUrl
        }
      />

      <PackagePriceSection
        price={
          details?.price
        }
        purchaseAvailable={
          details?.purchaseAvailable
        }
      />

      <PackageIncludesSection
        features={
          details?.features || []
        }
      />

      <PackageCoursesSection
        courses={
          details?.courses || []
        }
      />
    </div>
  );
}