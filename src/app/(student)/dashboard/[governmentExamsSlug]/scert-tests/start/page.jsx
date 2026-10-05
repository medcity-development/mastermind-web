import {
    notFound,
  } from "next/navigation";
  
  import {
    getScertExamDetails,
    getScertQuestions,
  } from "@/lib/scertHelper";

  import {
    getGovernmentExamConfig,
  } from "@/lib/governmentExamConfig";

  import {
    getStudentSession,
  } from "@/lib/auth/getStudentSession";
  
  import ScertExamClient from "./components/ScertExamClient";
  
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
      governmentExamsSlug,
    } = await params;

    const config =
      getGovernmentExamConfig(
        governmentExamsSlug
      );

    if (!config) {
      notFound();
    }

    const session =
      await getStudentSession();

    const uid =
      session?.uid;
  
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
        uid,
        cid:
          config.cid,
        examId,
      }),
  
      getScertQuestions({
        uid,
        cid:
          config.cid,
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
        uid={uid}
  
        /* PSC course cid */
        cid={
          config.cid
        }
  
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
        governmentExamsSlug={
          governmentExamsSlug
        }
      />
    );
  }
