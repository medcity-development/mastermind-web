import { notFound, redirect } from "next/navigation";
import { getGovernmentExamConfig } from "@/lib/governmentExamConfig";
import { getStudentSession } from "@/lib/auth/getStudentSession";
import PausedExamsClient from "./PausedExamsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Paused Exams | MasterMind Academy", robots: { index: false, follow: false } };

export default async function PausedExamsPage({ params }) {
  const { governmentExamsSlug } = await params;
  const config = getGovernmentExamConfig(governmentExamsSlug);
  if (!config) notFound();
  const session = await getStudentSession();
  if (!session?.uid) redirect(`/login?redirect=${encodeURIComponent(`/dashboard/${governmentExamsSlug}/paused-exams`)}`);
  return <PausedExamsClient key={`${session.uid}-${config.cid}`} cid={Number(config.cid)} governmentExamsSlug={governmentExamsSlug} examName={config.name} />;
}
