"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Brain,
  LoaderCircle,
} from "lucide-react";

import CurrentAffairsQuizTabs from "./CurrentAffairsQuizTabs";
import CurrentAffairsQuizQuestions from "./CurrentAffairsQuizQuestions";

export default function CurrentAffairsQuizList({
  selectedMonth,
  uid = 21,
}) {
  const [
    quizzes,
    setQuizzes,
  ] = useState([]);

  const [
    selectedQuiz,
    setSelectedQuiz,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const quizListCid =
    selectedMonth?.quizListCid;

  useEffect(() => {
    if (!quizListCid) {
      setQuizzes([]);
      setSelectedQuiz(null);
      setLoading(false);

      return;
    }

    let active = true;

    async function loadQuizzes() {
      try {
        setLoading(true);
        setError("");

        setSelectedQuiz(
          null
        );

        const response =
          await fetch(
            `/api/current-affairs-quiz/list?cid=${encodeURIComponent(
              quizListCid
            )}&uid=${encodeURIComponent(
              uid
            )}`,
            {
              cache:
                "no-store",
            }
          );

        const result =
          await response.json();

        console.log(
          "MONTH QUIZ LIST:",
          result
        );

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Unable to load quizzes."
          );
        }

        if (!active) {
          return;
        }

        const quizData =
          Array.isArray(
            result?.data
          )
            ? result.data
            : [];

        setQuizzes(
          quizData
        );

        /*
          Automatically open
          Quiz 1.
        */

        setSelectedQuiz(
          quizData[0] ||
            null
        );
      } catch (error) {
        console.error(
          "Quiz list error:",
          error
        );

        if (active) {
          setQuizzes([]);

          setSelectedQuiz(
            null
          );

          setError(
            "Unable to load quizzes for this month."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadQuizzes();

    return () => {
      active = false;
    };
  }, [
    quizListCid,
    uid,
  ]);

  return (
    <section
      className="
        mt-5
        rounded-[28px]
        border
        border-[#dce8f7]
        bg-white
        p-5
        shadow-[0_12px_35px_rgba(11,33,108,0.05)]
        sm:p-6
      "
    >
      <div
        className="
          mb-6
          flex
          flex-wrap
          items-center
          justify-between
          gap-4
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-[14px]
              bg-gradient-to-br
              from-[#087bea]
              to-[#164fa5]
              text-white
            "
          >
            <Brain
              size={19}
            />
          </div>

          <div>
            <p
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[0.15em]
                text-[#087bea]
              "
            >
              Quiz Practice
            </p>

            <h2
              className="
                text-xl
                font-black
                text-[#102c5c]
              "
            >
              {
                selectedMonth?.month
              }{" "}
              {
                selectedMonth?.year
              }
            </h2>
          </div>
        </div>

        {!loading &&
          !error &&
          quizzes.length >
            0 && (
            <span
              className="
                rounded-full
                bg-[#eef6ff]
                px-4
                py-2
                text-[11px]
                font-black
                text-[#164fa5]
              "
            >
              {
                quizzes.length
              }{" "}
              {quizzes.length ===
              1
                ? "Quiz"
                : "Quizzes"}
            </span>
          )}
      </div>

      {loading && (
        <div
          className="
            flex
            min-h-[180px]
            items-center
            justify-center
          "
        >
          <LoaderCircle
            size={27}
            className="
              animate-spin
              text-[#087bea]
            "
          />
        </div>
      )}

      {!loading &&
        error && (
          <div
            className="
              rounded-[20px]
              border
              border-red-100
              bg-red-50
              p-8
              text-center
              text-sm
              font-semibold
              text-red-500
            "
          >
            {error}
          </div>
        )}

      {!loading &&
        !error &&
        quizzes.length ===
          0 && (
          <div
            className="
              rounded-[20px]
              bg-slate-50
              p-10
              text-center
              text-sm
              font-semibold
              text-slate-500
            "
          >
            No quizzes
            available for this
            month.
          </div>
        )}

      {!loading &&
        !error &&
        quizzes.length >
          0 && (
          <>
            <CurrentAffairsQuizTabs
              quizzes={
                quizzes
              }
              selectedQuiz={
                selectedQuiz
              }
              onSelect={
                setSelectedQuiz
              }
            />

            <CurrentAffairsQuizQuestions
              quiz={
                selectedQuiz
              }
              uid={uid}
            />
          </>
        )}
    </section>
  );
}