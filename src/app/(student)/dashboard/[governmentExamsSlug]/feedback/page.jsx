import { notFound, redirect } from "next/navigation";
import { getGovernmentExamConfig } from "@/lib/governmentExamConfig";
import { getStudentSession } from "@/lib/auth/getStudentSession";
import FeedbackClient from "./FeedbackClient";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Feedback | Student Dashboard",
  robots: { index: false, follow: false },
};

export default async function FeedbackPage({ params }) {
  const { governmentExamsSlug } = await params;
  const config = getGovernmentExamConfig(governmentExamsSlug);
  if (!config) notFound();
  const session = await getStudentSession();
  if (!session?.uid) redirect(`/login?redirect=/dashboard/${governmentExamsSlug}/feedback`);

  return (
    <div className="space-y-6">
      <header className="rounded-[28px] bg-gradient-to-br from-[#071b59] via-[#164fa5] to-[#017dc0] px-6 py-8 text-white sm:px-8">
        <p className="text-xs font-bold uppercase tracking-widest text-white/70">{config.name}</p>
        <h1 className="mt-2 text-3xl font-black">Feedback</h1>
        <p className="mt-2 text-sm text-white/80">Help us improve your learning experience.</p>
      </header>
      <FeedbackClient />
    </div>
  );
}
