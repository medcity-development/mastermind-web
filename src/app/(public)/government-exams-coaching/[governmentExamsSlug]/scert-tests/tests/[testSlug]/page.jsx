import {
  notFound,
} from "next/navigation";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import {
  getScertExamDetails,
} from "@/lib/scertHelper";

import ScertInstructions from "./components/ScertInstructions";

export async function generateMetadata({ params }) {
  const { governmentExamsSlug } = await params;
  const config = getGovernmentExamConfig(governmentExamsSlug);

  if (!config) {
    return {};
  }

  return {
    title: `${config.name} SCERT Test | MasterMind Academy`,
    description: `Practice ${config.name} SCERT questions with MasterMind Academy.`,
  };
}

/* =========================================================
   SCERT TEST DETAILS
========================================================= */

export default async function ScertExamDetailsPage({
  params,
  searchParams,
}) {
  const {
    testSlug,
    governmentExamsSlug,
  } = await params;
  const config =
    getGovernmentExamConfig(governmentExamsSlug);

  const search =
    await searchParams;

  const examId =
    search?.examId;

  const classId =
    search?.classId;

  /* =======================================================
     VALIDATION
  ======================================================= */

  if (
    !config ||
    !testSlug ||
    !examId ||
    !classId
  ) {
    notFound();
  }

  /* =======================================================
     DETAILS API

     The course cid identifies the exam catalog;
     classId identifies the SCERT class.
  ======================================================= */

  const detailsResult =
    await getScertExamDetails({
      uid: 0,

      cid: config.cid,

      examId,

      offset: 0,
    });

  if (
    !detailsResult?.status ||
    !detailsResult?.exam
  ) {
    return (
      <main
        className="
          min-h-screen
          bg-[#f5f9ff]
          pt-[120px]
        "
      >
        <div
          className="
            mx-auto
            max-w-[900px]
            px-4
          "
        >
          <div
            className="
              rounded-[24px]
              border
              border-red-100
              bg-white
              p-8
              text-center
            "
          >
            <h1
              className="
                text-xl
                font-black
                text-[#071f55]
              "
            >
              Unable to load SCERT test
            </h1>

            <p
              className="
                mt-2
                text-sm
                text-slate-500
              "
            >
              Please refresh and try again.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const exam =
    detailsResult.exam;

  const instructions =
    Array.isArray(
      detailsResult?.instructions
    )
      ? detailsResult.instructions
      : [];

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
          max-w-[1100px]
          px-4
          py-8
          sm:px-6
          lg:px-8
        "
      >
       <ScertInstructions
  exam={exam}
  instructions={instructions}
  testSlug={testSlug}
  classId={classId}
  examId={examId}
  governmentExamsSlug={governmentExamsSlug}
/>
      </div>
    </main>
  );
}