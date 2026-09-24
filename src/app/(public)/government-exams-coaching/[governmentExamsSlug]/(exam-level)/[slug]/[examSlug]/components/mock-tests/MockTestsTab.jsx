"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";

import LevelMockTestCard from "./LevelMockTestCard";
import PremiumLoginModal from "./PremiumLoginModal";

const PAGE_SIZE = 10;

export default function MockTestsTab({
  cid = 1,
  uid = 0,
  examId,
  subId,
}) {
  const [
    exams,
    setExams,
  ] =
    useState([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    offset,
    setOffset,
  ] =
    useState(0);

  const [
    nextOffset,
    setNextOffset,
  ] =
    useState(null);

  const [
    history,
    setHistory,
  ] =
    useState([]);

  const [
    selectedPremiumExam,
    setSelectedPremiumExam,
  ] =
    useState(null);

  useEffect(() => {
    console.log(
      "MOCK TAB PROPS:",
      {
        cid,
        uid,
        examId,
        subId,
      }
    );
  }, [
    cid,
    uid,
    examId,
    subId,
  ]);

  useEffect(() => {
    if (!subId) {
      setLoading(
        false
      );

      setExams([]);

      setError(
        "Level ID is missing."
      );

      return;
    }

    const controller =
      new AbortController();

    async function loadMockTests() {
      try {
        setLoading(
          true
        );

        setError(
          ""
        );

        const params =
          new URLSearchParams(
            {
              cid:
                String(
                  cid
                ),

              uid:
                String(
                  uid
                ),

              offset:
                String(
                  offset
                ),

              type:
                "mock",

              subId:
                String(
                  subId
                ),

              filter:
                String(
                  subId
                ),
            }
          );

        const url =
          `/api/exam-level-mock-tests?${params.toString()}`;

        console.log(
          "MOCK TEST REQUEST:",
          url
        );

        const response =
          await fetch(
            url,
            {
              cache:
                "no-store",

              signal:
                controller.signal,
            }
          );

        const text =
          await response.text();

        let result;

        try {
          result =
            text
              ? JSON.parse(
                  text
                )
              : {};
        } catch {
          console.error(
            "INVALID MOCK RESPONSE:",
            text
          );

          throw new Error(
            "Mock test API returned invalid JSON."
          );
        }

        console.log(
          "MOCK TEST RESPONSE:",
          result
        );

        if (
          !response.ok
        ) {
          throw new Error(
            result?.message ||
              `Unable to load mock tests (${response.status}).`
          );
        }

        const data =
          Array.isArray(
            result?.data
          )
            ? result.data
            : [];

        setExams(
          data
        );

        setNextOffset(
          result?.nextoffset ??
            result?.nextOffset ??
            null
        );
      } catch (error) {
        if (
          error?.name ===
          "AbortError"
        ) {
          return;
        }

        console.error(
          "LEVEL MOCK TEST ERROR:",
          error
        );

        setExams([]);

        setNextOffset(
          null
        );

        setError(
          error?.message ||
            "Unable to load mock tests."
        );
      } finally {
        if (
          !controller
            .signal
            .aborted
        ) {
          setLoading(
            false
          );
        }
      }
    }

    loadMockTests();

    return () => {
      controller.abort();
    };
  }, [
    cid,
    uid,
    subId,
    offset,
  ]);

  // reset when level changes
  useEffect(() => {
    setOffset(0);

    setHistory(
      []
    );

    setSelectedPremiumExam(
      null
    );
  }, [
    subId,
  ]);

  function handleNext() {
    if (
      nextOffset ===
        null ||
      nextOffset ===
        undefined ||
      nextOffset ===
        ""
    ) {
      return;
    }

    setHistory(
      (current) => [
        ...current,
        offset,
      ]
    );

    setOffset(
      Number(
        nextOffset
      )
    );
  }

  function handlePrevious() {
    if (
      history.length ===
      0
    ) {
      return;
    }

    const previous =
      history[
        history.length -
          1
      ];

    setHistory(
      (current) =>
        current.slice(
          0,
          -1
        )
    );

    setOffset(
      previous
    );
  }

  const currentPage =
    Math.floor(
      Number(
        offset
      ) /
        PAGE_SIZE
    ) + 1;

  return (
    <>
      <section
        className="
          rounded-[24px]
          border
          border-[#dce8f7]
          bg-white
          p-5
          shadow-[0_12px_35px_rgba(22,79,165,0.05)]
          sm:p-6
        "
      >
        {/* HEADER */}
        <div>
          <p
            className="
              text-[10px]
              font-black
              uppercase
              tracking-[0.14em]
              text-[#075fc8]
            "
          >
            Practice Tests
          </p>

          <h2
            className="
              mt-1
              text-xl
              font-black
              text-[#0b216c]
            "
          >
            Mock Tests
          </h2>

          <p
            className="
              mt-1
              text-[12px]
              text-slate-500
            "
          >
            Mock tests
            available for
            this exam
            level.
          </p>
        </div>

        {/* LOADING */}
        {loading ? (
          <div
            className="
              mt-6
              flex
              min-h-[260px]
              items-center
              justify-center
              rounded-[20px]
              border
              border-dashed
              border-slate-200
            "
          >
            <div
              className="
                text-center
              "
            >
              <LoaderCircle
                size={
                  28
                }
                className="
                  mx-auto
                  animate-spin
                  text-[#075fc8]
                "
              />

              <p
                className="
                  mt-3
                  text-[11px]
                  font-semibold
                  text-slate-500
                "
              >
                Loading
                mock
                tests...
              </p>
            </div>
          </div>
        ) : error ? (
          /* ERROR */
          <div
            className="
              mt-6
              rounded-[18px]
              border
              border-red-100
              bg-red-50
              px-5
              py-8
              text-center
            "
          >
            <p
              className="
                text-[12px]
                font-bold
                text-red-600
              "
            >
              {error}
            </p>

            <div
              className="
                mt-3
                text-[10px]
                text-red-400
              "
            >
              cid:{" "}
              {String(
                cid
              )}{" "}
              | subId:{" "}
              {String(
                subId ||
                  "missing"
              )}
            </div>
          </div>
        ) : exams.length ===
          0 ? (
          /* EMPTY */
          <div
            className="
              mt-6
              rounded-[20px]
              border
              border-dashed
              border-slate-300
              bg-[#fbfdff]
              px-5
              py-14
              text-center
            "
          >
            <h3
              className="
                text-sm
                font-black
                text-[#071f55]
              "
            >
              No mock tests
              available
            </h3>

            <p
              className="
                mt-2
                text-[11px]
                text-slate-500
              "
            >
              There are
              currently no
              mock tests for
              this exam
              level.
            </p>
          </div>
        ) : (
          <>
            {/* CARDS */}
            <div
              className="
                mt-6
                grid
                gap-5
                md:grid-cols-2
                xl:grid-cols-3
              "
            >
              {exams.map(
                (
                  exam,
                  index
                ) => (
                  <LevelMockTestCard
                    key={
                      exam?.id ??
                      index
                    }
                    exam={
                      exam
                    }
                    cid={
                      cid
                    }
                    uid={
                      uid
                    }
                    onPremiumClick={(
                      selectedExam
                    ) => {
                      console.log(
                        "OPEN PREMIUM MODAL:",
                        selectedExam
                      );

                      setSelectedPremiumExam(
                        selectedExam
                      );
                    }}
                  />
                )
              )}
            </div>

            {/* PAGINATION */}
            {(history.length >
              0 ||
              nextOffset !==
                null) && (
              <div
                className="
                  mt-7
                  flex
                  items-center
                  justify-center
                  gap-3
                "
              >
                <button
                  type="button"
                  onClick={
                    handlePrevious
                  }
                  disabled={
                    history.length ===
                    0
                  }
                  className="
                    inline-flex
                    h-10
                    items-center
                    gap-1
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    text-[11px]
                    font-bold
                    text-slate-600
                    disabled:opacity-40
                  "
                >
                  <ChevronLeft
                    size={
                      14
                    }
                  />

                  Previous
                </button>

                <span
                  className="
                    flex
                    h-10
                    min-w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#164fa5]
                    px-3
                    text-[11px]
                    font-black
                    text-white
                  "
                >
                  {
                    currentPage
                  }
                </span>

                <button
                  type="button"
                  onClick={
                    handleNext
                  }
                  disabled={
                    nextOffset ===
                      null ||
                    nextOffset ===
                      undefined ||
                    nextOffset ===
                      ""
                  }
                  className="
                    inline-flex
                    h-10
                    items-center
                    gap-1
                    rounded-xl
                    bg-gradient-to-r
                    from-[#164fa5]
                    to-[#017dc0]
                    px-4
                    text-[11px]
                    font-bold
                    text-white
                    disabled:opacity-40
                  "
                >
                  Next

                  <ChevronRight
                    size={
                      14
                    }
                  />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* PREMIUM MODAL */}
      <PremiumLoginModal
        open={
          Boolean(
            selectedPremiumExam
          )
        }
        exam={
          selectedPremiumExam
        }
        onClose={() =>
          setSelectedPremiumExam(
            null
          )
        }
      />
    </>
  );
}