"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  AlertCircle,
  Loader2,
} from "lucide-react";

import MockLoginModal from "./MockLoginModal";
import MockPauseButton from "./MockPauseButton";
import MockQuestionCard from "./MockQuestionCard";
import MockQuestionPagination from "./MockQuestionPagination";
import MockSubmitButton from "./MockSubmitButton";
import MockTestHeader from "./MockTestHeader";

const QUESTIONS_PER_PAGE = 10;

export default function MockTestQuestions({
  examId,
  uid = 0,
  cid = 1,
  examTitle = "",
}) {
  const router = useRouter();

  const [exam, setExam] =
    useState(null);

  const [questions, setQuestions] =
    useState([]);

  const [imagePath, setImagePath] =
    useState("");

  const [answers, setAnswers] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [
    remainingSeconds,
    setRemainingSeconds,
  ] = useState(0);

  const [
    timerStarted,
    setTimerStarted,
  ] = useState(false);

  const [
    loginModalOpen,
    setLoginModalOpen,
  ] = useState(false);

  const [
    modalReason,
    setModalReason,
  ] = useState("submit");

  const timeoutHandled =
    useRef(false);

  /* =========================================================
     LOAD EXAM DETAILS + QUESTIONS
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadExam() {
      try {
        setLoading(true);
        setError("");
        setTimerStarted(false);

        timeoutHandled.current =
          false;

        /* =========================
           EXAM DETAILS
        ========================= */

        const detailsParams =
          new URLSearchParams({
            uid: String(uid),
            cid: String(cid),
            examid:
              String(examId),
            offset: "0",
            type: "mock",
          });

        const detailsResponse =
          await fetch(
            `/api/mock-tests/details?${detailsParams.toString()}`,
            {
              cache:
                "no-store",
            }
          );

        const detailsResult =
          await detailsResponse.json();

        if (!detailsResponse.ok) {
          throw new Error(
            detailsResult?.message ||
              "Unable to load exam details."
          );
        }

        let examData = null;

        if (
          Array.isArray(
            detailsResult?.exam
          )
        ) {
          examData =
            detailsResult.exam[0] ||
            null;
        } else if (
          detailsResult?.exam &&
          typeof detailsResult.exam ===
            "object"
        ) {
          examData =
            detailsResult.exam;
        } else if (
          Array.isArray(
            detailsResult?.data
          )
        ) {
          examData =
            detailsResult.data[0] ||
            null;
        }

        /* =========================
           QUESTIONS
        ========================= */

        const questionParams =
          new URLSearchParams({
            uid: String(uid),
            cid: String(cid),

            // Backend expects this exact key
            examid:
              String(examId),

            // Backend expects this exact key
            examtype:
              "mock",
          });

        const questionsResponse =
          await fetch(
            `/api/mock-tests/questions?${questionParams.toString()}`,
            {
              cache:
                "no-store",
            }
          );

        const questionsResult =
          await questionsResponse.json();

        if (
          !questionsResponse.ok
        ) {
          throw new Error(
            questionsResult?.message ||
              "Unable to load exam questions."
          );
        }

        const questionList =
          Array.isArray(
            questionsResult?.data
          )
            ? questionsResult.data
            : [];

        if (cancelled) {
          return;
        }

        setExam(
          examData
        );

        setQuestions(
          questionList
        );

        setImagePath(
          questionsResult?.img_path ||
            questionsResult?.imagePath ||
            ""
        );

        /* =========================
           TIMER FROM API

           Your mock exam response has:
           total_minutes
        ========================= */

        const duration =
          Number(
            examData?.total_minutes
          );

        const validDuration =
          Number.isFinite(
            duration
          ) &&
          duration > 0
            ? duration
            : 90;

        setRemainingSeconds(
          validDuration * 60
        );

        setTimerStarted(
          true
        );
      } catch (err) {
        console.error(
          "MockTestQuestions:",
          err
        );

        if (!cancelled) {
          setError(
            err?.message ||
              "Unable to load mock test."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (examId) {
      loadExam();
    }

    return () => {
      cancelled = true;
    };
  }, [
    examId,
    uid,
    cid,
  ]);

  /* =========================================================
     TIMER
  ========================================================= */

  useEffect(() => {
    if (!timerStarted) {
      return;
    }

    if (
      loginModalOpen
    ) {
      return;
    }

    if (
      remainingSeconds <= 0
    ) {
      return;
    }

    const interval =
      window.setInterval(
        () => {
          setRemainingSeconds(
            (previous) => {
              if (
                previous <= 1
              ) {
                return 0;
              }

              return (
                previous - 1
              );
            }
          );
        },
        1000
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    timerStarted,
    loginModalOpen,
    remainingSeconds,
  ]);

  /* =========================================================
     TIMER EXPIRED
  ========================================================= */

  useEffect(() => {
    if (!timerStarted) {
      return;
    }

    if (
      remainingSeconds !== 0
    ) {
      return;
    }

    if (
      timeoutHandled.current
    ) {
      return;
    }

    timeoutHandled.current =
      true;

    setModalReason(
      "timeout"
    );

    setLoginModalOpen(
      true
    );
  }, [
    timerStarted,
    remainingSeconds,
  ]);

  /* =========================================================
     ANSWERS
  ========================================================= */

  function handleAnswer(
    questionId,
    answer
  ) {
    if (
      remainingSeconds <= 0
    ) {
      return;
    }

    setAnswers(
      (previous) => ({
        ...previous,
        [questionId]:
          answer,
      })
    );
  }

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        questions.length /
          QUESTIONS_PER_PAGE
      )
    );

  const startIndex =
    (currentPage - 1) *
    QUESTIONS_PER_PAGE;

  const endIndex =
    startIndex +
    QUESTIONS_PER_PAGE;

  const visibleQuestions =
    questions.slice(
      startIndex,
      endIndex
    );

  const pageNumbers =
    useMemo(() => {
      return Array.from(
        {
          length:
            totalPages,
        },
        (_, index) =>
          index + 1
      );
    }, [totalPages]);

  function handlePageChange(
    page
  ) {
    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior:
        "smooth",
    });
  }

  /* =========================================================
     COUNTS
  ========================================================= */

  const answeredCount =
    Object.keys(
      answers
    ).length;

  const unansweredCount =
    Math.max(
      0,
      questions.length -
        answeredCount
    );

  /* =========================================================
     PAUSE
  ========================================================= */

  function handlePause() {
    setModalReason(
      "pause"
    );

    setLoginModalOpen(
      true
    );
  }

  /* =========================================================
     SUBMIT
  ========================================================= */

  function handleSubmit() {
    setModalReason(
      "submit"
    );

    setLoginModalOpen(
      true
    );
  }

  /* =========================================================
     LOGIN
  ========================================================= */

  function handleLogin() {
    const redirectUrl =
      `/government-exams-coaching/kerala-psc/mock-tests/${examId}/start` +
      `?uid=${encodeURIComponent(
        String(uid)
      )}` +
      `&cid=${encodeURIComponent(
        String(cid)
      )}` +
      `&title=${encodeURIComponent(
        examTitle ||
          exam?.exam_name ||
          ""
      )}`;

    router.push(
      `/login?redirect=${encodeURIComponent(
        redirectUrl
      )}`
    );
  }

  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  function handleCloseModal() {
    // Cannot continue after time expires
    if (
      modalReason ===
      "timeout"
    ) {
      return;
    }

    setLoginModalOpen(
      false
    );
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div
        className="
          flex
          min-h-[420px]
          items-center
          justify-center
          rounded-[24px]
          border
          border-slate-200
          bg-white
        "
      >
        <div className="text-center">
          <Loader2
            size={30}
            className="
              mx-auto
              animate-spin
              text-[#164fa5]
            "
          />

          <p
            className="
              mt-3
              text-sm
              font-bold
              text-slate-500
            "
          >
            Loading mock test...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <div
        className="
          rounded-[24px]
          border
          border-rose-200
          bg-rose-50
          px-6
          py-14
          text-center
        "
      >
        <AlertCircle
          size={28}
          className="
            mx-auto
            text-rose-500
          "
        />

        <p
          className="
            mt-3
            text-sm
            font-bold
            text-rose-600
          "
        >
          {error}
        </p>
      </div>
    );
  }

  /* =========================================================
     NO QUESTIONS
  ========================================================= */

  if (
    questions.length === 0
  ) {
    return (
      <div
        className="
          rounded-[24px]
          border
          border-slate-200
          bg-white
          px-6
          py-14
          text-center
        "
      >
        <AlertCircle
          size={28}
          className="
            mx-auto
            text-slate-400
          "
        />

        <p
          className="
            mt-3
            text-sm
            font-bold
            text-slate-500
          "
        >
          No questions available
          for this exam.
        </p>
      </div>
    );
  }

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
          examTitle={
            examTitle
          }
          remainingSeconds={
            remainingSeconds
          }
        />

        {/* =========================
            EXAM STATS
        ========================= */}

        <div
          className="
            grid
            grid-cols-2
            gap-3
            border-b
            border-slate-100
            bg-[#f8fbff]
            px-5
            py-4
            sm:grid-cols-4
            sm:px-7
          "
        >
          <StatBox
            label="Questions"
            value={
              questions.length
            }
          />

          <StatBox
            label="Marks"
            value={
              exam?.total_mark ??
              "-"
            }
          />

          <StatBox
            label="Answered"
            value={
              answeredCount
            }
          />

          <StatBox
            label="Remaining"
            value={
              unansweredCount
            }
          />
        </div>

        {/* =========================
            QUESTIONS
        ========================= */}

        <div
          className="
            space-y-5
            px-5
            py-7
            sm:px-7
          "
        >
          {visibleQuestions.map(
            (
              question,
              index
            ) => {
              const questionNumber =
                startIndex +
                index +
                1;

              const questionId =
                question?.id ??
                questionNumber;

              return (
                <MockQuestionCard
                  key={
                    questionId
                  }
                  question={
                    question
                  }
                  questionNumber={
                    questionNumber
                  }
                  selectedAnswer={
                    answers[
                      questionId
                    ]
                  }
                  imagePath={
                    imagePath
                  }
                  onAnswer={(
                    answer
                  ) =>
                    handleAnswer(
                      questionId,
                      answer
                    )
                  }
                />
              );
            }
          )}
        </div>

        {/* =========================
            PAGINATION
        ========================= */}

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

        {/* =========================
            ACTIONS
        ========================= */}

        <div
          className="
            flex
            flex-col
            gap-3
            border-t
            border-slate-100
            bg-[#f8fbff]
            px-5
            py-5
            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:px-7
          "
        >
          <MockPauseButton
            onPause={
              handlePause
            }
            saving={
              saving
            }
          />

          <MockSubmitButton
            onSubmit={
              handleSubmit
            }
            saving={
              saving
            }
            disabled={
              remainingSeconds <=
              0
            }
          />
        </div>
      </section>

      {/* =========================
          LOGIN MODAL
      ========================= */}

      <MockLoginModal
        open={
          loginModalOpen
        }
        reason={
          modalReason
        }
        onClose={
          handleCloseModal
        }
        onLogin={
          handleLogin
        }
      />
    </>
  );
}

function StatBox({
  label,
  value,
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-slate-100
        bg-white
        px-4
        py-3
      "
    >
      <p
        className="
          text-[17px]
          font-black
          text-[#071f55]
        "
      >
        {value}
      </p>

      <p
        className="
          mt-1
          text-[9px]
          font-bold
          uppercase
          tracking-[0.06em]
          text-slate-400
        "
      >
        {label}
      </p>
    </div>
  );
}