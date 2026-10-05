import {
  notFound,
} from "next/navigation";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import DashboardHero from "../common-components/DashboardHero";
import DashboardStats from "../common-components/DashboardStats";
import LearningToolsGrid from "./learning-tools-grid/LearningToolsGrid";
import ExamCategorySection from "./exam-category-section/ExamCategorySection";

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

  const session =
    await getStudentSession();

  const uid =
    session?.uid;

  const course = {
    id:
      config.cid,

    exam:
      config.name,
  };

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

        <ExamCategorySection
          course={course}
          uid={uid}
          governmentExamsSlug={
            config.slug
          }
        />
      </div>
    </main>
  );
}
