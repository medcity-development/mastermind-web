import {
  notFound,
} from "next/navigation";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import {
  getStatementTypeTopics,
} from "@/lib/statementTypeExamHelper";

import StatementTypeHero from "./components/StatementTypeHero";
import StatementTypeList from "./components/StatementTypeList";

const ITEMS_PER_PAGE =
  10;

function getPageNumber(
  value
) {
  const page =
    Number(value);

  if (
    !Number.isInteger(
      page
    ) ||
    page < 1
  ) {
    return 1;
  }

  return page;
}

export async function generateMetadata({
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
    return {};
  }

  return {
    title:
      `${config.name} Statement Type Exams | MasterMind Academy`,

    description:
      `Practice ${config.name} topic-wise statement type questions.`,

    alternates: {
      canonical:
        `/government-exams-coaching/${governmentExamsSlug}/statement-type-exams`,
    },
  };
}

export default async function StatementTypeExamsPage({
  params,
  searchParams,
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

  const {
    cid,
    name,
    shortName,
  } = config;

  const query =
    await searchParams;

  const requestedPage =
    getPageNumber(
      query?.page
    );

  const result =
    await getStatementTypeTopics({
      uid: 0,
      cid,
      type: "tst",
    });

  const allTopics =
    Array.isArray(
      result?.data
    )
      ? result.data
      : [];

  const totalItems =
    allTopics.length;

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalItems /
          ITEMS_PER_PAGE
      )
    );

  const currentPage =
    Math.min(
      requestedPage,
      totalPages
    );

  const startIndex =
    (currentPage - 1) *
    ITEMS_PER_PAGE;

  const topics =
    allTopics.slice(
      startIndex,
      startIndex +
        ITEMS_PER_PAGE
    );

  return (
    <main className="min-h-screen bg-[#f8fafc]">
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
        <StatementTypeHero
          examName={name}
          shortName={
            shortName
          }
        />

        <StatementTypeList
  topics={topics}
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={totalItems}
  itemsPerPage={ITEMS_PER_PAGE}
  cid={cid}
  uid={0}
  type="tst"
  examName={name}
  governmentExamsSlug={
    governmentExamsSlug
  }
/>
      </div>
    </main>
  );
}