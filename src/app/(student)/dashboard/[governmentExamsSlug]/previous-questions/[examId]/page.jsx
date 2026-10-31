import { cache } from "react";
import {
  notFound,
  redirect,
} from "next/navigation";

import {
  getPyqExamDetails,
} from "@/lib/pyqDetailsHelper";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";
import {
  checkPremiumExamAccess,
} from "@/lib/premiumExamAccess";

import ExamHero from "./components/ExamHero";
import ExamInstructions from "./components/ExamInstructions";
import ExamLoadError from "./components/ExamLoadError";

/* =========================================================
   PARAM HELPERS
========================================================= */

const loadDetails = cache((uid, cid, examId) =>
  getPyqExamDetails({ uid, cid, examId, type: "pqp" })
);

function getQueryValues(_query, { uid, cid }) {
  return { uid: Number(uid) || 0, cid: Number(cid), type: "pqp" };
}

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  params,
  searchParams,
}) {
  const {
    examId,
    governmentExamsSlug,
  } =
    await params;

  const config =
    getGovernmentExamConfig(
      governmentExamsSlug
    );

  if (!config || !Number.isSafeInteger(Number(examId)) || Number(examId) <= 0) {
    return {};
  }

  const session =
    await getStudentSession();

  const query =
    await searchParams;

  const {
    uid,
    cid,
    type,
  } = getQueryValues(
    query,
    {
      uid:
        session?.uid,
      cid:
        config.cid,
    }
  );

  const result =
    await loadDetails(uid, cid, examId);

  if (!result?.exam) {
    return {
      title:
        "Previous Question Paper | MasterMind Academy",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title:
      `${result.exam.exam_name} | MasterMind Academy`,

    description:
      "Kerala PSC previous question paper exam details and instructions.",
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function PyqDetailsPage({
  params,
  searchParams,
}) {
  const {
    examId,
    governmentExamsSlug,
  } =
    await params;

  const config =
    getGovernmentExamConfig(
      governmentExamsSlug
    );

  if (!config || !Number.isSafeInteger(Number(examId)) || Number(examId) <= 0) {
    notFound();
  }

  const session =
    await getStudentSession();

  const query =
    await searchParams;

  const {
    uid,
    cid,
    type,
  } = getQueryValues(
    query,
    {
      uid:
        session?.uid,
      cid:
        config.cid,
    }
  );

  const result =
    await loadDetails(uid, cid, examId);

  if (!result?.exam) {
    if (result?.httpStatus === 404) notFound();
    return <ExamLoadError retryAfter={result?.retryAfter} />;
  }

  {
    let access;
    try {
      access = await checkPremiumExamAccess({
        uid,
        cid,
        examId,
        type,
        exam: result.exam,
      });
    } catch (error) {
      return <ExamLoadError retryAfter={error?.retryAfter} />;
    }

    if (!access.hasAccess) {
      redirect(
        `/dashboard/${governmentExamsSlug}?showPackages=1`
      );
    }
  }

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
        "
      >
        <ExamHero
          exam={
            result.exam
          }
          governmentExamsSlug={
            governmentExamsSlug
          }
          examName={
            config.name
          }
        />

        <div className="mt-6">
          <ExamInstructions
            exam={
              result.exam
            }
            instructions={
              result.instructions
            }
            examId={
              examId
            }
            uid={
              uid
            }
            cid={
              cid
            }
            type={
              type
            }
            view={
              result.view
            }
            governmentExamsSlug={
              governmentExamsSlug
            }
          />
        </div>
      </div>
    </main>
  );
}
