
import Link from "next/link";

import {
  notFound,
  redirect,
} from "next/navigation";

import { ArrowLeft } from "lucide-react";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import {
  checkPremiumExamAccess,
} from "@/lib/premiumExamAccess";

import MockTestQuestions from "../components/MockTestQuestions";

function positiveId(value) {
  if (value == null || String(value).trim() === "") {
    return null;
  }

  const number = Number(value);

  return Number.isSafeInteger(number) && number > 0
    ? number
    : null;
}

export async function generateMetadata({ params }) {
  const { governmentExamsSlug } = await params;

  const config = getGovernmentExamConfig(
    governmentExamsSlug
  );

  if (!config) return {};

  return {
    title:
      `${config.name} Mock Test Exam | MasterMind Academy`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function MockExamStartPage({
  params,
  searchParams,
}) {
  const {
    governmentExamsSlug,
    examId,
  } = await params;

  const query = await searchParams;

  const config = getGovernmentExamConfig(
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

  const session = await getStudentSession();
  const uid = positiveId(session?.uid) ?? 0;

  const title = String(query?.title ?? "");

  const selectedExamId = positiveId(
    query?.examId ?? examId
  );

  const detailsPath =
    `/government-exams-coaching/` +
    `${governmentExamsSlug}/mock-tests/${examId}`;

  if (!selectedExamId) {
    redirect(detailsPath);
  }

  const examType =
    String(query?.type || "mock").toLowerCase() ===
    "studyplan"
      ? "studyplan"
      : "mock";

  const guestAction =
    ["pause", "submit"].includes(query?.guestAction)
      ? query.guestAction
      : "";

  const access = await checkPremiumExamAccess({
    uid,
    cid,
    examId: selectedExamId,
    type: examType,
  });

  if (access.isPremium && !access.hasAccess) {
    const packagesPath =
      `/dashboard/${governmentExamsSlug}` +
      `?showPackages=1`;

    if (uid <= 0) {
      redirect(
        `/login?redirect=${encodeURIComponent(packagesPath)}`
      );
    }

    redirect(packagesPath);
  }

  // Use the shared signed-in flow, including guest actions returning from login.
  if (uid > 0) {
    const destinationQuery = new URLSearchParams({
      examId: String(selectedExamId),
      type: examType,
      ...(title ? { title } : {}),
      ...(guestAction ? { guestAction } : {}),
    });
    redirect(`/dashboard/${governmentExamsSlug}/mock-tests/${examId}/start?${destinationQuery}`);
  }

  return (
    <main className="min-h-screen bg-[#f5f9ff]">
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
            mb-6 mt-10
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
                pathname: detailsPath,
                query: {
                  uid: String(uid),
                  title,
                  examId: String(selectedExamId),
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
                hover:bg-blue-100
              "
            >
              <ArrowLeft size={14} />
              Back to Instructions
            </Link>

            <p className="mt-3 text-[11px] text-slate-500">
              Answer the {name} questions before the
              timer expires.
            </p>
          </div>
        </div>

        <MockTestQuestions
          examId={selectedExamId}
          uid={uid}
          cid={cid}
          examTitle={title}
          examName={name}
          shortName={shortName}
          governmentExamsSlug={governmentExamsSlug}
          guestAction={guestAction}
        />
      </div>
    </main>
  );
}
