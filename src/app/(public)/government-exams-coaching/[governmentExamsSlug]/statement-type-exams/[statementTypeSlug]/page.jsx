import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  ArrowLeft,
} from "lucide-react";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import {
  getStatementTypeTopics,
  getStatementTypeExamsByTopic,
} from "@/lib/statementTypeExamHelper";

import StatementExamList from "./components/StatementExamList";

import {
  createSlug,
} from "@/lib/slugHelper";

/* =========================================================
   FORMAT SLUG
========================================================= */

function formatSlug(
  value = ""
) {
  return String(value)
    .split("-")
    .filter(Boolean)
    .map(
      (word) =>
        word
          .charAt(0)
          .toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  params,
}) {
  const {
    governmentExamsSlug,
    statementTypeSlug,
  } = await params;

  const config =
    getGovernmentExamConfig(
      governmentExamsSlug
    );

  if (!config) {
    return {};
  }

  const topicName =
    formatSlug(
      statementTypeSlug
    );

  const canonical =
    `/government-exams-coaching/${governmentExamsSlug}/statement-type-exams/${statementTypeSlug}`;

  return {
    title:
      `${topicName} Statement Type Exams | ${config.name} | MasterMind Academy`,

    description:
      `Practice ${topicName} statement type exams for ${config.name}.`,

    alternates: {
      canonical,
    },
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function StatementTypeTopicPage({
  params,
}) {
  const {
    governmentExamsSlug,
    statementTypeSlug,
  } = await params;

  /* =======================================================
     GET MAIN COURSE CONFIG
  ======================================================= */

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

  const uid = 0;

  const type =
    "tst";

  /* =======================================================
     FETCH TOPICS FOR CURRENT CID
  ======================================================= */

  const topicsResult =
    await getStatementTypeTopics({
      uid,
      cid,
      type,
    });

  const topics =
    Array.isArray(
      topicsResult?.data
    )
      ? topicsResult.data
      : [];

  /* =======================================================
     FIND SELECTED TOPIC
  ======================================================= */

  const selectedTopic =
    topics.find(
      (item) =>
        createSlug(
          item?.subject
        ) ===
        statementTypeSlug
    );

  if (!selectedTopic) {
    notFound();
  }

  const topicId =
    selectedTopic.id;

  const topicName =
    selectedTopic?.subject ||
    formatSlug(
      statementTypeSlug
    );

  /* =======================================================
     FETCH EXAMS

     cid is now dynamic:
     Kerala PSC -> 1
     RRB & SSC -> 2
  ======================================================= */

  const examsResult =
    await getStatementTypeExamsByTopic({
      uid,
      cid,
      topicId,
      type,
    });

  const exams =
    Array.isArray(
      examsResult?.data
    )
      ? examsResult.data
      : [];

  /* =======================================================
     BASE PATH
  ======================================================= */

  const statementBasePath =
    `/government-exams-coaching/${governmentExamsSlug}/statement-type-exams`;

  return (
    <main
      className="
        min-h-screen
        bg-[#f8fafc]
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
        {/* BACK */}

        <Link
          href={
            statementBasePath
          }
          className="
            mb-5
            mt-20
            inline-flex
            items-center
            gap-2
            text-sm
            font-bold
            text-[#075fc8]
            transition-colors
            hover:text-[#071f55]
          "
        >
          <ArrowLeft
            size={16}
          />

          Back to Topics
        </Link>

        {/* HERO */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[28px]
            bg-gradient-to-r
            from-[#071f55]
            via-[#075fc8]
            to-[#7c3aed]
            px-6
            py-8
            text-white
            sm:px-8
          "
        >
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-0
              opacity-[0.06]
              [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
              [background-size:34px_34px]
            "
          />

          <div
            className="
              relative
              z-10
            "
          >
            <p
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[0.16em]
                text-blue-100
              "
            >
              {name} Statement Type
            </p>

            <h1
              className="
                mt-2
                text-2xl
                font-black
                sm:text-3xl
              "
            >
              {topicName}
            </h1>

            {selectedTopic?.subject_mal ? (
              <p
                className="
                  mt-2
                  text-sm
                  text-blue-100
                "
              >
                {
                  selectedTopic.subject_mal
                }
              </p>
            ) : null}

            <p
              className="
                mt-4
                max-w-2xl
                text-sm
                leading-6
                text-blue-100
              "
            >
              Select an available
              statement type exam and
              start practicing this
              topic for {name}.
            </p>
          </div>
        </section>

        {/* EXAMS */}

        <StatementExamList
          exams={exams}
          topicName={
            topicName
          }
          statementTypeSlug={
            statementTypeSlug
          }
          cid={cid}
          uid={uid}
          type={type}
          examName={name}
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