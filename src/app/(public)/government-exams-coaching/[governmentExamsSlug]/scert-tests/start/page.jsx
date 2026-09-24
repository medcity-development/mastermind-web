import {
    notFound,
  } from "next/navigation";
  
  import {
    getScertExamDetails,
    getScertQuestions,
  } from "@/lib/scertHelper";
  
  import ScertExamClient from "../../../start/components/ScertExamClient";
  
  export const metadata = {
    title:
      "SCERT Exam | MasterMind Academy",
  
    robots: {
      index: false,
      follow: false,
    },
  };
  
  /* =========================================================
     SCERT START PAGE
  ========================================================= */
  
  export default async function ScertStartPage({
    params,
    searchParams,
  }) {
    const {
      testSlug,
    } = await params;
  
    const query =
      await searchParams;
  
    const examId =
      query?.examId;
  
    const classId =
      query?.classId;
  
    const mode =
      query?.mode === "resume"
        ? "resume"
        : "new";
  
    const initialPauseId =
      query?.pauseId ||
      null;
  
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
       LOAD DETAILS + QUESTIONS
  
       IMPORTANT:
       BOTH APIs use Kerala PSC cid = 1.
    ======================================================= */
  
    const [
      detailsResult,
      questionsResult,
    ] = await Promise.all([
      getScertExamDetails({
        uid: 0,
        cid: 1,
        examId,
      }),
  
      getScertQuestions({
        uid: 0,
        cid: 1,
        examId,
      }),
    ]);
  
    const exam =
      detailsResult?.exam;
  
    const questions =
      Array.isArray(
        questionsResult?.data
      )
        ? questionsResult.data
        : [];
  
    if (
      !exam ||
      questions.length === 0
    ) {
      notFound();
    }
  
    return (
      <ScertExamClient
        exam={exam}
        questions={
          questions
        }
        imagePath={
          questionsResult
            ?.imagePath || ""
        }
        uid={0}
  
        /* PSC course cid */
        cid={1}
  
        /* SCERT class id */
        classId={
          classId
        }
  
        testSlug={
          testSlug
        }
        examType="scert"
        lastPosition="scert"
  
        durationMinutes={
          Number(
            exam?.total_minutes
          ) || 90
        }
  
        questionsPerPage={
          10
        }
  
        mode={mode}
  
        initialPauseId={
          initialPauseId
        }
      />
    );
  }