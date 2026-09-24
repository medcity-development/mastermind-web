"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Brain,
  Layers3,
  LoaderCircle,
  Sparkles,
} from "lucide-react";

import CurrentAffairsQuizQuestions from "./CurrentAffairsQuizQuestions";

export default function CurrentAffairsQuizTabs({
  monthId,
  uid = 0,
}) {
  const [quizzes, setQuizzes] =
    useState([]);

  const [
    selectedQuiz,
    setSelectedQuiz,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!monthId) {
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
        setQuizzes([]);
        setSelectedQuiz(null);

        const response =
          await fetch(
            `/api/current-affairs-quiz/list?cid=${encodeURIComponent(
              monthId
            )}&uid=${encodeURIComponent(
              uid
            )}`,
            {
              cache: "no-store",
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Unable to load quizzes."
          );
        }

        if (!active) {
          return;
        }

        const data =
          Array.isArray(
            result?.data
          )
            ? result.data
            : [];

        const monthQuizzes =
          data.filter(
            (quiz) =>
              String(
                quiz?.c_id
              ) ===
              String(
                monthId
              )
          );

        setQuizzes(
          monthQuizzes
        );

        setSelectedQuiz(
          monthQuizzes[0] ||
            null
        );
      } catch (error) {
        console.error(
          "Quiz list error:",
          error
        );

        if (active) {
          setError(
            error?.message ||
              "Unable to load quizzes."
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
  }, [monthId, uid]);

  if (loading) {
    return (
      <div
        className="
          flex
          min-h-[280px]
          items-center
          justify-center
        "
      >
        <div
          className="
            flex
            flex-col
            items-center
            gap-3
          "
        >
          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-[18px]
              bg-[#eef6ff]
            "
          >
            <LoaderCircle
              size={26}
              className="
                animate-spin
                text-[#087bea]
              "
            />
          </div>

          <p
            className="
              text-[11px]
              font-bold
              text-slate-400
            "
          >
            Loading quizzes...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="
          m-6
          rounded-[22px]
          border
          border-red-100
          bg-red-50
          px-6
          py-10
          text-center
          text-sm
          font-bold
          text-red-500
        "
      >
        {error}
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div
        className="
          m-6
          rounded-[24px]
          border
          border-dashed
          border-slate-200
          bg-slate-50
          p-12
          text-center
        "
      >
        <Brain
          size={32}
          className="
            mx-auto
            text-slate-300
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
          No quizzes available
          for this month.
        </p>
      </div>
    );
  }

  return (
    <div
      className="
        p-5
        sm:p-6
        lg:p-7
      "
    >
      {/* =================================
          QUIZ HEADER
      ================================= */}

      <div
        className="
          relative
          mb-6
          overflow-hidden
          rounded-[24px]
          border
          border-[#dce8f7]
          bg-gradient-to-r
          from-[#f5faff]
          via-white
          to-[#faf7ff]
          p-5
          sm:p-6
        "
      >
        <div
          aria-hidden="true"
          className="
            absolute
            -right-16
            -top-16
            h-44
            w-44
            rounded-full
            bg-[#087bea]/5
            blur-2xl
          "
        />

        <div
          className="
            relative
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div
            className="
              flex
              items-center
              gap-4
            "
          >
            <div
              className="
                relative
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-[16px]
                bg-gradient-to-br
                from-[#087bea]
                to-[#164fa5]
                text-white
                shadow-[0_10px_24px_rgba(8,123,234,0.24)]
              "
            >
              <Layers3
                size={20}
              />

              <span
                className="
                  absolute
                  -right-1
                  -top-1
                  flex
                  h-4
                  w-4
                  items-center
                  justify-center
                  rounded-full
                  bg-[#f13873]
                "
              >
                <Sparkles
                  size={8}
                />
              </span>
            </div>

            <div>
              <p
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.18em]
                  text-[#087bea]
                "
              >
                Available Quizzes
              </p>

              <h3
                className="
                  mt-1
                  text-lg
                  font-black
                  text-[#102c5c]
                  sm:text-xl
                "
              >
                Choose a Quiz
              </h3>

              <p
                className="
                  mt-1
                  text-[11px]
                  text-slate-500
                "
              >
                Select a quiz tab
                to start practicing.
              </p>
            </div>
          </div>

          <div
            className="
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-full
              border
              border-[#dce8f7]
              bg-white
              px-4
              py-2
              text-[10px]
              font-black
              text-[#164fa5]
              shadow-sm
            "
          >
            <Brain
              size={13}
            />

            {quizzes.length}{" "}
            {quizzes.length === 1
              ? "Quiz"
              : "Quizzes"}
          </div>
        </div>
      </div>

      {/* =================================
          TABS
      ================================= */}

      <div
        className="
          overflow-x-auto
          pb-2
        "
      >
        <div
          className="
            flex
            min-w-max
            items-center
            gap-2
          "
        >
          {quizzes.map(
            (quiz, index) => {
              const isActive =
                String(
                  selectedQuiz?.id
                ) ===
                String(
                  quiz?.id
                );

              return (
                <button
                  key={
                    quiz?.id
                  }
                  type="button"
                  onClick={() =>
                    setSelectedQuiz(
                      quiz
                    )
                  }
                  className={`
                    relative
                    inline-flex
                    min-h-[44px]
                    items-center
                    justify-center
                    gap-2
                    rounded-[14px]
                    border
                    px-5
                    py-2.5
                    text-[11px]
                    font-black
                    transition-all
                    duration-300 cursor-pointer

                    ${
                      isActive
                        ? `
                          border-transparent
                          bg-gradient-to-r
                          from-[#087bea]
                          to-[#164fa5]
                          text-white
                          shadow-[0_10px_26px_rgba(8,123,234,0.25)]
                        `
                        : `
                          border-[#dce8f7]
                          bg-white
                          text-[#164fa5]
                          hover:-translate-y-0.5
                          hover:border-[#087bea]/30
                          hover:bg-[#f4f9ff]
                          hover:shadow-sm
                        `
                    }
                  `}
                >
                  <span
                    className={`
                      flex
                      h-6
                      w-6
                      items-center
                      justify-center
                      rounded-full
                      text-[9px]
                      font-black

                      ${
                        isActive
                          ? "bg-white/15 text-white"
                          : "bg-[#eef6ff] text-[#087bea]"
                      }
                    `}
                  >
                    {index + 1}
                  </span>

                  {quiz?.name ||
                    `Quiz ${
                      index + 1
                    }`}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* =================================
          QUESTIONS
      ================================= */}

      {selectedQuiz && (
        <CurrentAffairsQuizQuestions
          key={selectedQuiz.id}
          quiz={selectedQuiz}
          monthId={monthId}
          uid={uid}
        />
      )}
    </div>
  );
}