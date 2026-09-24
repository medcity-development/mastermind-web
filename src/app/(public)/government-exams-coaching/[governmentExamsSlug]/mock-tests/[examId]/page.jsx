import {
  notFound,
} from "next/navigation";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import MockTestDetails from "./components/MockTestDetails";

export async function generateMetadata({
  params,
  searchParams,
}) {
  const {
    governmentExamsSlug,
  } = await params;

  const query =
    await searchParams;

  const config =
    getGovernmentExamConfig(
      governmentExamsSlug
    );

  if (!config) {
    return {};
  }

  const examTitle =
    query?.title ||
    `${config.name} Mock Test`;

  return {
    title:
      `${examTitle} | MasterMind Academy`,

    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function MockTestDetailsPage({
  params,
  searchParams,
}) {
  const {
    governmentExamsSlug,
    examId,
  } = await params;

  const query =
    await searchParams;

  const config =
    getGovernmentExamConfig(
      governmentExamsSlug
    );

  if (!config) {
    notFound();
  }

  const {
    cid,
    name,
    shortName,
  } = config;

  const uid =
    Number(
      query?.uid ?? 0
    ) || 0;

  const examTitle =
    String(
      query?.title ??
        ""
    );

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
        <MockTestDetails
          examId={
            examId
          }
          uid={
            uid
          }
          cid={
            cid
          }
          examTitle={
            examTitle
          }
          examName={
            name
          }
          shortName={
            shortName
          }
          governmentExamsSlug={
            governmentExamsSlug
          }
        />
      </div>
    </main>
  );
}