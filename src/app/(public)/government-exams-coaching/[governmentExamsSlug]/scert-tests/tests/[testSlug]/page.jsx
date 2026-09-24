import {
  notFound,
} from "next/navigation";

import {
  getScertExamDetails,
} from "@/lib/scertHelper";

import ScertInstructions from "./components/ScertInstructions";

export const metadata = {
  title:
    "SCERT Test | MasterMind Academy",

  description:
    "Practice Kerala PSC SCERT questions with MasterMind Academy.",
};

/* =========================================================
   SCERT TEST DETAILS
========================================================= */

export default async function ScertExamDetailsPage({
  params,
  searchParams,
}) {
  const {
    testSlug,
  } = await params;

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
    !testSlug ||
    !examId ||
    !classId
  ) {
    notFound();
  }

  /* =======================================================
     DETAILS API

     IMPORTANT:
     getMockTestDetails expects course cid = 1.
     classId is NOT the cid here.
  ======================================================= */

  const detailsResult =
    await getScertExamDetails({
      uid: 0,

      cid: 1,

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
/>
      </div>
    </main>
  );
}