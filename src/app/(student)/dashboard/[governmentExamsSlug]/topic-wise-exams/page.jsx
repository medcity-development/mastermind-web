import { notFound } from "next/navigation";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import {
  getTopicWiseExams,
} from "@/lib/topicWiseExamHelper";

import TopicWiseHero from "./components/TopicWiseHero";
import TopicWiseExamList from "./components/TopicWiseExamList";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { governmentExamsSlug } = await params;

  const config = getGovernmentExamConfig(
    governmentExamsSlug
  );

  return config
    ? {
      title:
        `${config.name} Topic Wise Exams | MasterMind Academy`,
      description:
        `Practice topic-wise ${config.name} questions with MasterMind Academy.`,
    }
    : {};
}

export default async function TopicWiseExamsPage({
  params,
  searchParams,
}) {
  const { governmentExamsSlug } = await params;
  const query = await searchParams;

  const config = getGovernmentExamConfig(
    governmentExamsSlug
  );

  if (!config) notFound();

  const session = await getStudentSession();
  const uid = Number(session?.uid) || 0;

  const basePath =
    `${uid > 0 ? "/dashboard" : "/government-exams-coaching"}` +
    `/${governmentExamsSlug}/topic-wise-exams`;

  const result = await getTopicWiseExams({
    uid,
    cid: config.cid,
    type: "twe",
  });

  if (result?.status === false) {
    return (
      <p role="alert" className="p-6 text-red-700">
        Unable to load topics. Refresh and try again.
      </p>
    );
  }

  const allTopics = Array.isArray(result?.data)
    ? result.data
    : [];

  const totalPages = Math.max(
    1,
    Math.ceil(allTopics.length / 10)
  );

  const requested = Number(query?.page);

  const currentPage = Math.min(
    totalPages,
    Number.isSafeInteger(requested) && requested > 0
      ? requested
      : 1
  );

  return (
    <main className="min-h-screen bg-[#f5f9ff]">
      <div className="mx-auto max-w-[1450px] px-4 py-6 sm:px-6 lg:px-8">
        <TopicWiseHero
          examName={config.name}
          shortName={config.shortName}
        />

        <TopicWiseExamList
          topics={allTopics.slice(
            (currentPage - 1) * 10,
            currentPage * 10
          )}
          cid={config.cid}
          uid={uid}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={allTopics.length}
          itemsPerPage={10}
          governmentExamsSlug={governmentExamsSlug}
          examName={config.name}
          basePath={basePath}
        />
      </div>
    </main>
  );
}