"use client";

import { useState } from "react";

import MockQuestionPagination from "./MockQuestionPagination";
import MockQuestionsSection from "./MockQuestionsSection";
import ExamResultModal from "@/components/ExamResultModal";
import ExamPauseConfirmModal from "@/components/ExamPauseConfirmModal";
import MockTestActions from "./MockTestActions";
import MockTestEmpty from "./MockTestEmpty";
import MockTestError from "./MockTestError";
import MockTestLoading from "./MockTestLoading";
import MockTestMessages from "./MockTestMessages";
import MockTestStats from "./MockTestStats";

import MockTestHeader from "../../components/MockTestHeader";

import useMockTestExam from "../hooks/useMockTestExam";

export default function MockTestQuestions({
  examId,
  uid,
  cid,

  examName = "",
  shortName = "",
  examTitle = "",
  examType = "mock",

  governmentExamsSlug = "",
  guestAction = "",
}) {
  const [showPauseConfirmation, setShowPauseConfirmation] =
    useState(false);

  const {
    exam,
    questions,
    imagePath,
    answers,

    loading,
    error,

    currentPage,
    totalPages,
    pageNumbers,
    startIndex,
    visibleQuestions,

    answeredCount,
    unansweredCount,

    saving,
    submitted,
    isPaused,

    remainingSeconds,

    saveMessage,
    saveError,

    resultModalOpen,
    submittedResult,
    resultLoading,

    dashboardDetailsPath,

    handleAnswer,
    handlePageChange,
    handlePause,
    handleSubmit,
    handleResultClose,
    handleViewAnalysis,

    timeEnded,
    interactionDisabled,
  } = useMockTestExam({
    examId,
    uid,
    cid,

    examTitle,
    examType,

    governmentExamsSlug,
    guestAction,
  });

  if (loading) {
    return (
      <MockTestLoading />
    );
  }

  if (error) {
    return (
      <MockTestError
        message={
          error
        }
      />
    );
  }

  if (
    !questions.length
  ) {
    return (
      <MockTestEmpty />
    );
  }

  const resolvedExamTitle =
    exam?.exam_name ??
    exam?.examName ??
    exam?.exam_title ??
    exam?.examTitle ??
    exam?.title ??
    exam?.name ??
    examTitle ??
    "";

  return (
    <>
      <section
        className="
          overflow-hidden
          rounded-[26px]
          border
          border-[#dce8f7]
          bg-white
          shadow-[0_18px_50px_rgba(15,23,42,0.06)]
        "
      >
        <MockTestHeader
          exam={
            exam
          }
          examName={
            examName
          }
          shortName={
            shortName
          }
          remainingSeconds={
            remainingSeconds
          }
          backHref={
            dashboardDetailsPath
          }
        />

        <MockTestStats
          questionsCount={
            questions.length
          }
          totalMark={
            exam?.total_mark ??
            exam?.totalMark ??
            questions.length
          }
          answeredCount={
            answeredCount
          }
          unansweredCount={
            unansweredCount
          }
        />

        <MockQuestionsSection
          questions={
            visibleQuestions
          }
          startIndex={
            startIndex
          }
          answers={
            answers
          }
          imagePath={
            imagePath
          }
          disabled={
            interactionDisabled
          }
          onAnswer={
            handleAnswer
          }
        />

        <MockQuestionPagination
          currentPage={
            currentPage
          }
          totalPages={
            totalPages
          }
          pages={
            pageNumbers
          }
          onPageChange={
            handlePageChange
          }
        />

        <MockTestActions
          onPause={() => {
            if (isPaused) {
              handlePause();
            } else {
              setShowPauseConfirmation(true);
            }
          }}
          onSubmit={
            handleSubmit
          }
          saving={
            saving
          }
          resultLoading={
            resultLoading
          }
          submitted={
            submitted
          }
          isPaused={
            isPaused
          }
          timeEnded={
            timeEnded
          }
        />

        <MockTestMessages
          success={
            saveMessage
          }
          error={
            saveError
          }
        />
      </section>

      <ExamResultModal
        open={
          resultModalOpen
        }
        result={
          submittedResult
        }
        examTitle={
          resolvedExamTitle
        }
        onClose={
          handleResultClose
        }
        onViewAnalysis={
          handleViewAnalysis
        }
      />

      <ExamPauseConfirmModal
        open={showPauseConfirmation}
        saving={saving}
        onClose={() => setShowPauseConfirmation(false)}
        onConfirm={() => {
          handlePause();
          setShowPauseConfirmation(false);
        }}
      />
    </>
  );
}