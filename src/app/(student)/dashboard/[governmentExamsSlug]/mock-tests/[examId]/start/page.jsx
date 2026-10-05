import Link from "next/link";

import {
  notFound,
  redirect,
} from "next/navigation";

import {
  ArrowLeft,
} from "lucide-react";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import MockTestQuestions from "./components/MockTestQuestions";

export const dynamic =
  "force-dynamic";

/* =========================================================
   METADATA
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
      `${config.name} Mock Test Exam | Student Dashboard | MasterMind Academy`,

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

  /* =======================================================
     CONFIG
  ======================================================= */

  const config =
    getGovernmentExamConfig(
      governmentExamsSlug
    );

  if (!config) {
    notFound();
  }

  const cid =
    Number(
      config?.cid
    );

  if (
    !Number.isFinite(cid) ||
    cid <= 0
  ) {
    notFound();
  }

  /* =======================================================
     SESSION
  ======================================================= */

  const session =
    await getStudentSession();

  const uid =
    Number(
      session?.uid
    );

  if (
    !Number.isFinite(uid) ||
    uid <= 0
  ) {
    const redirectUrl =
      `/dashboard/${governmentExamsSlug}/mock-tests/${examId}/start`;

    redirect(
      `/login?redirect=${encodeURIComponent(
        redirectUrl
      )}`
    );
  }

  /* =======================================================
     EXAM TITLE

     Comes from the real selected mock exam.
  ======================================================= */

  const examTitle =
    String(
      query?.title ??
      ""
    ).trim();

  /* =======================================================
     DETAILS PATH
  ======================================================= */

  const detailsPath =
    `/dashboard/${governmentExamsSlug}/mock-tests/${examId}`;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main
      className="
        min-h-screen
        bg-[#f4f7fc]
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
        "
      >
        <div
          className="
            mb-5

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

                query:
                  examTitle
                    ? {
                        title:
                          examTitle,
                      }
                    : {},
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

                transition-all

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
              Answer the{" "}
              {examTitle ||
                config.name}{" "}
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
          examName={
            config.name
          }
          shortName={
            config.shortName
          }
          examTitle={
            examTitle
          }
          governmentExamsSlug={
            governmentExamsSlug
          }
        />
      </div>
    </main>
  );
}