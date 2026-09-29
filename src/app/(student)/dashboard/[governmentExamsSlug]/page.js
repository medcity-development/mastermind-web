import {
  notFound,
} from "next/navigation";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import DashboardHero from "../common-components/DashboardHero";
import DashboardStats from "../common-components/DashboardStats";
import LearningToolsGrid from "./learning-tools-grid/LearningToolsGrid";

export default async function DashboardPage({
  params,
}) {
  const {
    governmentExamsSlug,
  } = await params;

  const config =
    getGovernmentExamConfig(
      governmentExamsSlug
    );

  if (!config) {
    notFound();
  }

  const uid = 37515;

  return (
    <main
      className="
        px-4
        py-6
        sm:px-6
        lg:px-8
      "
    >
      <div
        className="
          mx-auto
          max-w-[1500px]
          space-y-5
        "
      >
        <DashboardHero
          config={config}
        />

        <DashboardStats
          config={config}
        />

        <LearningToolsGrid
          config={config}
          uid={uid}
        />
      </div>
    </main>
  );
}
