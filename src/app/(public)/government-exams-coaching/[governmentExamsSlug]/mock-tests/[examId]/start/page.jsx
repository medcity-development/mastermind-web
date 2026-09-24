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

import MockTestQuestions from "../components/MockTestQuestions";

function getNumberParam(
  value,
  fallback = 0
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return fallback;
  }

  const parsed =
    Number(value);

  return Number.isFinite(
    parsed
  )
    ? parsed
    : fallback;
}

/* =========================================================
   SEO
========================================================= */

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
      `${config.name} Mock Test Exam | MasterMind Academy`,

    robots: {
      index: false,
      follow: false,
    },
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function MockExamStartPage({
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
    getNumberParam(
      query?.uid,
      0
    );

  const title =
    String(
      query?.title ??
        ""
    );

  const detailsPath =
    `/government-exams-coaching/${governmentExamsSlug}/mock-tests/${examId}`;

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
        <div
          className="
            mb-6
            mt-20
            flex
            flex-col
            gap-3
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
            <Link
              href={{
                pathname:
                  detailsPath,

                query: {
                  uid:
                    String(
                      uid
                    ),

                  title,
                },
              }}
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-blue-200
                bg-blue-50
                px-4
                py-2
                text-[11px]
                font-bold
                text-[#164fa5]
                transition
                hover:border-blue-300
                hover:bg-blue-100
              "
            >
              <ArrowLeft
                size={14}
              />

              Back to Instructions
            </Link>

            <p
              className="
                mt-3
                text-[11px]
                text-slate-500
              "
            >
              Answer the {name}
              questions before the
              timer expires.
            </p>
          </div>
        </div>

        <MockTestQuestions
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
            title
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