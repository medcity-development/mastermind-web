import { notFound } from "next/navigation";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";
import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";
import StudyPlanExamClient from "@/app/(student)/dashboard/[governmentExamsSlug]/studyplan-tests/components/StudyPlanExamClient";

export const dynamic = "force-dynamic";

export default async function PublicStudyPlanExamStartPage({
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
    <StudyPlanExamClient
      examId={id}
      cid={Number(config.cid)}
      uid={Number(session?.uid) || 0}
      governmentExamsSlug={governmentExamsSlug}
      examTitle={String(query?.title ?? "")}
      basePath={`/government-exams-coaching/${governmentExamsSlug}/studyplan-tests`}
      guestAction={String(query?.guestAction ?? "")}
    />
  );
}
