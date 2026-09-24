import PackagesHero from "./components/PackagesHero";
import PackagesList from "./components/PackagesList";

export const metadata = {
  title:
    "Kerala PSC Premium Plans | MasterMind Academy",

  description:
    "Explore Kerala PSC premium preparation plans, study materials, mock tests and courses from MasterMind Academy.",
};

export default function CompetitiveExamPacksPage() {
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
        <PackagesHero />

        <PackagesList />
      </div>
    </main>
  );
}