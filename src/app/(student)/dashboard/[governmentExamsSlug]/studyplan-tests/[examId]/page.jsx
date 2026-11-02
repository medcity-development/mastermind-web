import { notFound } from "next/navigation";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";
import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";
import StudyPlanTestDetails from "../components/StudyPlanTestDetails";

export const dynamic = "force-dynamic";

export default async function StudyPlanTestDetailsPage({
  params,
  searchParams,
}) {
  const {
    governmentExamsSlug,
    examId,
  } = await params;
  const query = await searchParams;
  const config = getGovernmentExamConfig(governmentExamsSlug);
  const id = Number(examId);

  if (
    !config ||
    !Number.isSafeInteger(id) ||
    id <= 0
  ) {
    notFound();
  }

  const session = await getStudentSession();

  return (
    <StudyPlanTestDetails
      examId={id}
      cid={Number(config.cid)}
      uid={Number(session?.uid) || 0}
      governmentExamsSlug={governmentExamsSlug}
      title={String(query?.title ?? "")}
      basePath={`/dashboard/${governmentExamsSlug}/studyplan-tests`}
    />
  );
}
