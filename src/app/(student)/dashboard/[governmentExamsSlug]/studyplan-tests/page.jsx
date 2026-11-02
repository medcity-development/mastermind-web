import { notFound } from "next/navigation";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";
import StudyPlanTestsHome from "./components/StudyPlanTestsHome";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Study Plan Tests | Student Dashboard | MasterMind Academy",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function StudyPlanTestsPage({ params }) {
  const { governmentExamsSlug } = await params;
  const config = getGovernmentExamConfig(governmentExamsSlug);

  if (!config) notFound();

  return (
    <StudyPlanTestsHome
      cid={Number(config.cid)}
      governmentExamsSlug={governmentExamsSlug}
    />
  );
}
