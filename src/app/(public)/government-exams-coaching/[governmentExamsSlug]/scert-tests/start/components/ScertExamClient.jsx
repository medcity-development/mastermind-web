"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import ScertExamHeader from "./ScertExamHeader";
import ScertQuestionList from "./ScertQuestionList";
import ScertPagination from "./ScertPagination";
import ScertExamActions from "./ScertExamActions";
import ScertPauseModal from "./ScertPauseModal";
import ScertPauseLoginModal from "./ScertPauseLoginModal";
import ScertFinishModal from "./ScertFinishModal";
import ScertLoginResultModal from "./ScertLoginResultModal";

const DEFAULT_DURATION_MINUTES =
  90;

export default function ScertExamClient({
  exam,
  questions = [],
  imagePath = "",
  uid = 0,
  cid = 1,
  classId,
  testSlug,
  examType = "scert",
  lastPosition = "scert",
  durationMinutes = DEFAULT_DURATION_MINUTES,
  questionsPerPage = 10,
  mode = "new",
  initialPauseId = null,
}) {
  const router =
    useRouter();

  /* =========================================================
     BASIC VALUES
  ========================================================= */

  const totalQuestions =
    questions.length;

  const safeDurationMinutes =
    Number(
      durationMinutes
    ) ||
    DEFAULT_DURATION_MINUTES;

  const fullDurationSeconds =
    safeDurationMinutes *
    60;

  const isGuest =
    !uid ||
    Number(uid) === 0;

  /* =========================================================
     STATE
  ========================================================= */

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [
    answers,
    setAnswers,
  ] = useState({});

  const [
    remainingSeconds,
    setRemainingSeconds,
  ] = useState(
    fullDurationSeconds
  );

  const [
    pauseId,
    setPauseId,
  ] = useState(
    initialPauseId ||
      null
  );

  const [
    paused,
    setPaused,
  ] = useState(false);

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    saveError,
    setSaveError,
  ] = useState("");

  /*
   * Logged-in pause confirmation.
   */
  const [
    showPauseModal,
    setShowPauseModal,
  ] = useState(false);

  /*
   * Guest pause -> login modal.
   */
  const [
    showPauseLoginModal,
    setShowPauseLoginModal,
  ] = useState(false);

  const [
    showFinishModal,
    setShowFinishModal,
  ] = useState(false);

  const [
    showLoginModal,
    setShowLoginModal,
  ] = useState(false);

  const [
    resultMessage,
    setResultMessage,
  ] = useState(
    "Login to view your result."
  );

  /*
   * Prevent duplicate automatic
   * submission when timer reaches 0.
   */

  const timeoutHandledRef =
    useRef(false);

  const submitInProgressRef =
    useRef(false);

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalQuestions /
          questionsPerPage
      )
    );

  const startIndex =
    (currentPage - 1) *
    questionsPerPage;

  const endIndex =
    Math.min(
      startIndex +
        questionsPerPage,
      totalQuestions
    );

  const visibleQuestions =
    questions.slice(
      startIndex,
      endIndex
    );

  /* =========================================================
     ANSWER HELPERS
  ========================================================= */

  const getSelectedAnswer = (
    question
  ) => {
    return (
      answers[
        String(
          question?.id
        )
      ] || ""
    );
  };

  const handleAnswer = (
    questionId,
    answer
  ) => {
    if (
      submitted ||
      paused ||
      saving
    ) {
      return;
    }

    setAnswers(
      (previous) => ({
        ...previous,

        [String(
          questionId
        )]: answer,
      })
    );
  };

  /* =========================================================
     CORRECT ANSWERS
  ========================================================= */

  const correctAnswers =
    useMemo(() => {
      return questions.map(
        (question) =>
          question?.answerkey ||
          question?.answer ||
          ""
      );
    }, [questions]);

  /* =========================================================
     USER ANSWERS
  ========================================================= */

  const userAnswersArray =
    useMemo(() => {
      return questions.map(
        (question) => {
          const value =
            answers[
              String(
                question?.id
              )
            ];

          return value || 0;
        }
      );
    }, [
      questions,
      answers,
    ]);

  /* =========================================================
     RESULT STATS
  ========================================================= */

  const resultStats =
    useMemo(() => {
      let attempted = 0;
      let correct = 0;
      let wrong = 0;

      questions.forEach(
        (question) => {
          const userAnswer =
            answers[
              String(
                question?.id
              )
            ];

          if (!userAnswer) {
            return;
          }

          attempted += 1;

          const correctAnswer =
            String(
              question?.answerkey ||
                question?.answer ||
                ""
            )
              .trim()
              .toUpperCase();

          const selected =
            String(
              userAnswer
            )
              .trim()
              .toUpperCase();

          if (
            selected ===
            correctAnswer
          ) {
            correct += 1;
          } else {
            wrong += 1;
          }
        }
      );

      return {
        attempted,
        correct,
        wrong,
      };
    }, [
      questions,
      answers,
    ]);

  /* =========================================================
     FORMAT BACKEND ARRAY
  ========================================================= */

  function formatBackendArray(
    values
  ) {
    return `[${values.join(
      ", "
    )}]`;
  }

  /* =========================================================
     ATTEMPT PAYLOAD
  ========================================================= */

  const createAttemptPayload =
    useCallback(
      ({
        status,
        pausedTime,
      }) => {
        return {
          cid:
            String(cid),

          uid:
            String(uid),

          exam_status:
            status,

          lastposition:
            lastPosition,

          exam_id:
            String(
              exam?.id
            ),

          exam_type:
            examType,

          total_questions:
            String(
              totalQuestions
            ),

          paused_time:
            String(
              pausedTime
            ),

          total_mark:
            String(
              exam?.total_mark ||
                ""
            ),

          user_score:
            String(
              resultStats.correct
            ),

          minus_mark:
            "",

          answer_array:
            formatBackendArray(
              correctAnswers
            ),

          user_answers:
            formatBackendArray(
              userAnswersArray
            ),
        };
      },
      [
        cid,
        uid,
        lastPosition,
        exam,
        examType,
        totalQuestions,
        resultStats.correct,
        correctAnswers,
        userAnswersArray,
      ]
    );

  /* =========================================================
     SAVE ATTEMPT

     create:
     /api/exam-attempt/create

     update:
     /api/exam-attempt/update
  ========================================================= */

  const saveExamAttempt =
    useCallback(
      async ({
        status,
        pausedTime,
      }) => {
        const payload =
          createAttemptPayload({
            status,
            pausedTime,
          });

        const shouldUpdate =
          Boolean(
            pauseId
          );

        const endpoint =
          shouldUpdate
            ? "/api/exam-attempt/update"
            : "/api/exam-attempt/create";

        const finalPayload =
          shouldUpdate
            ? {
                ...payload,

                pauseid:
                  pauseId,

                total_wrong:
                  String(
                    resultStats.wrong
                  ),

                total_correct:
                  String(
                    resultStats.correct
                  ),

                total_attempted:
                  String(
                    resultStats.attempted
                  ),
              }
            : payload;

        const response =
          await fetch(
            endpoint,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  finalPayload
                ),
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          result?.status ===
            false
        ) {
          throw new Error(
            result?.message ||
              "Unable to save exam."
          );
        }

        const newPauseId =
          result?.pauseid ||
          result?.pause_id ||
          result?.id ||
          null;

        if (
          newPauseId &&
          !pauseId
        ) {
          setPauseId(
            newPauseId
          );
        }

        return result;
      },
      [
        createAttemptPayload,
        pauseId,
        resultStats,
      ]
    );

  /* =========================================================
     PAUSE BUTTON CLICK

     Guest:
       show login modal

     Logged user:
       show pause confirmation
  ========================================================= */

  const handlePauseClick =
    useCallback(() => {
      if (
        saving ||
        submitted ||
        paused ||
        submitInProgressRef.current
      ) {
        return;
      }

      setSaveError("");

      /*
       * Guest must login before
       * progress can be saved.
       */
      if (isGuest) {
        setShowPauseLoginModal(
          true
        );

        return;
      }

      /*
       * Logged-in user can proceed
       * to normal pause confirmation.
       */
      setShowPauseModal(
        true
      );
    }, [
      saving,
      submitted,
      paused,
      isGuest,
    ]);

  /* =========================================================
     PAUSE & EXIT

     This function actually saves
     the pause attempt.

     Extra uid protection is kept
     here so a guest can never reach
     the save API accidentally.
  ========================================================= */

  const handlePauseAndExit =
    useCallback(
      async () => {
        if (
          saving ||
          submitted ||
          paused ||
          submitInProgressRef.current
        ) {
          return;
        }

        /*
         * Safety check.
         */
        if (
          !uid ||
          Number(uid) === 0
        ) {
          setShowPauseModal(
            false
          );

          setShowPauseLoginModal(
            true
          );

          return;
        }

        try {
          submitInProgressRef.current =
            true;

          setSaving(true);
          setSaveError("");

          await saveExamAttempt({
            status:
              "pause",

            pausedTime:
              remainingSeconds,
          });

          setPaused(true);

          setShowPauseModal(
            false
          );

          /*
           * Return to selected
           * SCERT class.
           */
          router.push(
            `/government-exams-coaching/kerala-psc/scert-tests/classes/${classId}`
          );

          router.refresh();
        } catch (error) {
          console.error(
            "Pause SCERT exam:",
            error
          );

          setSaveError(
            error?.message ||
              "Unable to pause exam."
          );
        } finally {
          setSaving(false);

          submitInProgressRef.current =
            false;
        }
      },
      [
        uid,
        saving,
        submitted,
        paused,
        saveExamAttempt,
        remainingSeconds,
        router,
        classId,
      ]
    );

  /* =========================================================
     COMPLETE EXAM
  ========================================================= */

  const completeExam =
    useCallback(
      async ({
        reason =
          "manual",
      } = {}) => {
        if (
          submitted ||
          submitInProgressRef.current
        ) {
          return;
        }

        try {
          submitInProgressRef.current =
            true;

          setSaving(true);
          setSaveError("");

          await saveExamAttempt({
            status:
              "complete",

            pausedTime:
              reason ===
              "timeout"
                ? 0
                : remainingSeconds,
          });

          setSubmitted(true);

          setShowFinishModal(
            false
          );

          if (
            reason ===
            "timeout"
          ) {
            setResultMessage(
              "Time is up. Login to view your result."
            );
          } else {
            setResultMessage(
              "Your exam has been completed. Login to view your result."
            );
          }

          setShowLoginModal(
            true
          );
        } catch (error) {
          console.error(
            "Complete SCERT exam:",
            error
          );

          setSaveError(
            error?.message ||
              "Unable to complete exam."
          );
        } finally {
          setSaving(false);

          submitInProgressRef.current =
            false;
        }
      },
      [
        submitted,
        saveExamAttempt,
        remainingSeconds,
      ]
    );

  /* =========================================================
     TIMER
  ========================================================= */

  useEffect(() => {
    if (
      paused ||
      submitted ||
      remainingSeconds <= 0
    ) {
      return;
    }

    const timer =
      window.setInterval(
        () => {
          setRemainingSeconds(
            (previous) =>
              Math.max(
                previous - 1,
                0
              )
          );
        },
        1000
      );

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [
    paused,
    submitted,
    remainingSeconds,
  ]);

  /* =========================================================
     TIMER EXPIRED
  ========================================================= */

  useEffect(() => {
    if (
      remainingSeconds !==
        0 ||
      submitted ||
      timeoutHandledRef.current
    ) {
      return;
    }

    timeoutHandledRef.current =
      true;

    completeExam({
      reason:
        "timeout",
    });
  }, [
    remainingSeconds,
    submitted,
    completeExam,
  ]);

  /* =========================================================
     PAGE CHANGE
  ========================================================= */

  function handlePageChange(
    page
  ) {
    if (
      page < 1 ||
      page > totalPages ||
      saving ||
      submitted ||
      paused
    ) {
      return;
    }

    setCurrentPage(
      page
    );

    window.scrollTo({
      top: 0,
      behavior:
        "smooth",
    });
  }

  /* =========================================================
     RESULT LOGIN
  ========================================================= */

  function handleResultLogin() {
    const redirectPath =
      `/government-exams-coaching/kerala-psc/scert-tests/tests/${testSlug}` +
      `?classId=${encodeURIComponent(
        String(classId || "")
      )}` +
      `&examId=${encodeURIComponent(
        String(
          exam?.id || ""
        )
      )}`;

    router.push(
      `/login?redirect=${encodeURIComponent(
        redirectPath
      )}`
    );
  }

  /* =========================================================
     PAUSE LOGIN

     Return to EXACT current exam
     start page after login.
  ========================================================= */

  function handlePauseLogin() {
    const redirectPath =
      window.location.pathname +
      window.location.search;

    router.push(
      `/login?redirect=${encodeURIComponent(
        redirectPath
      )}`
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main
      className="
        min-h-screen
        bg-[#f5f9ff]
        py-6
        sm:py-8
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-[1200px]
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <ScertExamHeader
          exam={exam}
          remainingSeconds={
            remainingSeconds
          }
          totalQuestions={
            totalQuestions
          }
          answeredCount={
            resultStats.attempted
          }
          currentPage={
            currentPage
          }
          totalPages={
            totalPages
          }
        />

        {/* =====================================================
            SAVE ERROR
        ===================================================== */}

        {saveError ? (
          <div
            className="
              mt-5
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              font-medium
              text-red-700
            "
          >
            {saveError}
          </div>
        ) : null}

        {/* =====================================================
            QUESTIONS CARD
        ===================================================== */}

        <div
          className="
            mt-6
            rounded-[24px]
            border
            border-[#dce8f7]
            bg-white
            p-5
            shadow-[0_12px_35px_rgba(22,79,165,0.06)]
            sm:p-7
          "
        >
          {/* QUESTION RANGE */}

          <div
            className="
              mb-5
              flex
              flex-wrap
              items-center
              justify-between
              gap-3
            "
          >
            <div>
              <p
                className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.16em]
                  text-[#017dc0]
                "
              >
                Questions
              </p>

              <h2
                className="
                  mt-1
                  text-xl
                  font-black
                  text-[#071f55]
                "
              >
                {startIndex + 1}
                {" - "}
                {endIndex}
                {" of "}
                {totalQuestions}
              </h2>
            </div>

            <div
              className="
                rounded-full
                bg-blue-50
                px-4
                py-2
                text-xs
                font-bold
                text-[#075fc8]
              "
            >
              {
                resultStats.attempted
              }{" "}
              answered
            </div>
          </div>

          {/* =================================================
              QUESTIONS
          ================================================= */}

          <ScertQuestionList
            questions={
              visibleQuestions
            }
            imagePath={
              imagePath
            }
            getSelectedAnswer={
              getSelectedAnswer
            }
            onAnswer={
              handleAnswer
            }
            disabled={
              saving ||
              submitted ||
              paused
            }
            startIndex={
              startIndex
            }
          />

          {/* =================================================
              PAGINATION
          ================================================= */}

          <ScertPagination
            currentPage={
              currentPage
            }
            totalPages={
              totalPages
            }
            onPageChange={
              handlePageChange
            }
            disabled={
              saving ||
              submitted ||
              paused
            }
          />

          {/* =================================================
              ACTIONS
          ================================================= */}

          <ScertExamActions
            saving={
              saving
            }
            submitted={
              submitted
            }

            /*
             * IMPORTANT:
             * Don't directly open
             * ScertPauseModal here.
             */
            onPause={
              handlePauseClick
            }

            onFinish={() =>
              setShowFinishModal(
                true
              )
            }
          />
        </div>
      </div>

      {/* =====================================================
          LOGGED-IN PAUSE CONFIRMATION
      ===================================================== */}

      <ScertPauseModal
        open={
          showPauseModal
        }
        saving={
          saving
        }
        onClose={() => {
          if (!saving) {
            setShowPauseModal(
              false
            );
          }
        }}
        onConfirm={
          handlePauseAndExit
        }
      />

      {/* =====================================================
          GUEST PAUSE LOGIN
      ===================================================== */}

      <ScertPauseLoginModal
        open={
          showPauseLoginModal
        }
        onClose={() =>
          setShowPauseLoginModal(
            false
          )
        }
        onLogin={
          handlePauseLogin
        }
      />

      {/* =====================================================
          FINISH CONFIRMATION
      ===================================================== */}

      <ScertFinishModal
        open={
          showFinishModal
        }
        saving={
          saving
        }
        attempted={
          resultStats.attempted
        }
        totalQuestions={
          totalQuestions
        }
        onClose={() => {
          if (!saving) {
            setShowFinishModal(
              false
            );
          }
        }}
        onConfirm={() =>
          completeExam({
            reason:
              "manual",
          })
        }
      />

      {/* =====================================================
          RESULT LOGIN
      ===================================================== */}

      <ScertLoginResultModal
        open={
          showLoginModal
        }
        message={
          resultMessage
        }
        onClose={() =>
          setShowLoginModal(
            false
          )
        }
        onLogin={
          handleResultLogin
        }
      />
    </main>
  );
}