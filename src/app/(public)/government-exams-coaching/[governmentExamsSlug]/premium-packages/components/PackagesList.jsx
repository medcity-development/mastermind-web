import {
    getPackagesList,
  } from "@/lib/packagesHelper";
  
  import PackageCard from "./PackageCard";
  import PackagesEmpty from "./PackagesEmpty";
  
  export default async function PackagesList() {
    const packages =
      await getPackagesList({
        uid: 0,
        cid: 1,
      });
  
    if (
      packages.length === 0
    ) {
      return (
        <PackagesEmpty />
      );
    }
  
    return (
      <section className="mt-6">
        <div
          className="
            mb-5
            flex
            items-end
            justify-between
            gap-4
          "
        >
          <div>
            <p
              className="
                text-[9px]
                font-black
                uppercase
                tracking-[0.14em]
                text-[#017dc0]
              "
            >
              Premium Plans
            </p>
  
            <h2
              className="
                mt-1
                text-2xl
                font-black
                text-[#05176A]
              "
            >
              Available Packages
            </h2>
          </div>
  
          <span
            className="
              rounded-full
              bg-[#eaf5ff]
              px-4
              py-2
              text-[10px]
              font-black
              text-[#017dc0]
            "
          >
            {packages.length} Plans
          </span>
        </div>
  
        <div
          className="
            grid
            grid-cols-1
            gap-5
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {packages.map(
            (item) => (
              <PackageCard
                key={item.id}
                item={item}
              />
            )
          )}
        </div>
      </section>
    );
  }