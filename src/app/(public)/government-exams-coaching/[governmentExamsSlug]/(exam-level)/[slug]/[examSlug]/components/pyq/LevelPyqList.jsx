"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  LoaderCircle,
} from "lucide-react";

import LevelPyqCard from "./LevelPyqCard";
import PremiumLoginModal from "./PremiumLoginModal";

export default function LevelPyqList({
  initialExams = [],
  initialNextOffset = null,
  uid = 0,
  cid = 1,
  levelFilter,
}) {
  const [
    exams,
    setExams,
  ] = useState(
    Array.isArray(initialExams)
      ? initialExams
      : []
  );

  const [
    nextOffset,
    setNextOffset,
  ] = useState(
    initialNextOffset
  );

  const [
    loadingMore,
    setLoadingMore,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  // =========================================================
  // PREMIUM MODAL
  // =========================================================

  const [
    premiumExam,
    setPremiumExam,
  ] = useState(null);

  const [
    premiumModalOpen,
    setPremiumModalOpen,
  ] = useState(false);

  // =========================================================
  // SYNC INITIAL DATA
  // =========================================================

  useEffect(() => {
    setExams(
      Array.isArray(initialExams)
        ? initialExams
        : []
    );

    setNextOffset(
      initialNextOffset
    );
  }, [
    initialExams,
    initialNextOffset,
  ]);

  // =========================================================
  // OPEN PREMIUM MODAL
  // =========================================================

  function handlePremiumClick(
    exam
  ) {
    setPremiumExam(exam);
    setPremiumModalOpen(true);
  }

  // =========================================================
  // CLOSE PREMIUM MODAL
  // =========================================================

  function handleClosePremium() {
    setPremiumModalOpen(false);

    // optional:
    // keep exam briefly while closing animation completes.
    // If your modal has no animation, this can also be:
    // setPremiumExam(null);
  }

  // =========================================================
  // LOAD MORE
  // =========================================================

  async function loadMore() {
    if (
      loadingMore ||
      nextOffset === null ||
      nextOffset === undefined ||
      nextOffset === ""
    ) {
      return;
    }

    try {
      setLoadingMore(true);
      setError("");

      const params =
        new URLSearchParams({
          uid: String(uid),
          cid: String(cid),
          offset:
            String(nextOffset),
          type: "pqp",
          filter:
            String(levelFilter),
        });

      const response =
        await fetch(
          `/api/previous-questions?${params.toString()}`,
          {
            cache:
              "no-store",
          }
        );

      const text =
        await response.text();

      let result = {};

      try {
        result = text
          ? JSON.parse(text)
          : {};
      } catch {
        console.error(
          "Invalid PYQ load-more response:",
          text
        );

        throw new Error(
          "PYQ API returned invalid JSON."
        );
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to load more previous questions."
        );
      }

      const newExams =
        Array.isArray(
          result?.data
        )
          ? result.data
          : [];

      setExams(
        (currentExams) => {
          const combined = [
            ...currentExams,
            ...newExams,
          ];

          // avoid duplicate exam cards
          return combined.filter(
            (
              item,
              index,
              array
            ) =>
              index ===
              array.findIndex(
                (entry) =>
                  String(
                    entry?.id
                  ) ===
                  String(
                    item?.id
                  )
              )
          );
        }
      );

      setNextOffset(
        result?.nextOffset ??
          result?.nextoffset ??
          null
      );
    } catch (error) {
      console.error(
        "PYQ load more:",
        error
      );

      setError(
        error?.message ||
          "Unable to load more previous questions."
      );
    } finally {
      setLoadingMore(false);
    }
  }

  // =========================================================
  // EMPTY
  // =========================================================

  if (!exams.length) {
    return null;
  }

  return (
    <>
      <div className="mt-6">
        {/* ===============================================
            PYQ CARDS
        =============================================== */}

        <div
          className="
            grid
            gap-4
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {exams.map(
            (exam) => (
              <LevelPyqCard
                key={
                  exam?.id
                }
                exam={exam}
                uid={uid}
                cid={cid}
                onPremiumClick={
                  handlePremiumClick
                }
              />
            )
          )}
        </div>

        {/* ===============================================
            ERROR
        =============================================== */}

        {error ? (
          <div
            className="
              mt-6
              rounded-[14px]
              border
              border-red-100
              bg-red-50
              px-5
              py-4
              text-center
            "
          >
            <p
              className="
                text-[11px]
                font-bold
                text-red-600
              "
            >
              {error}
            </p>
          </div>
        ) : null}

        {/* ===============================================
            LOAD MORE
        =============================================== */}

        {nextOffset !== null &&
        nextOffset !== undefined &&
        nextOffset !== "" ? (
          <div
            className="
              mt-8
              flex
              justify-center
            "
          >
            <button
              type="button"
              onClick={
                loadMore
              }
              disabled={
                loadingMore
              }
              className="
                inline-flex
                min-w-[160px]
                items-center
                justify-center
                gap-2
                rounded-[14px]
                bg-gradient-to-r
                from-[#164fa5]
                via-[#075fc8]
                to-[#017dc0]
                px-6
                py-3.5
                text-[11px]
                font-black
                text-white
                shadow-[0_10px_25px_rgba(22,79,165,0.18)]
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:shadow-[0_15px_32px_rgba(22,79,165,0.25)]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {loadingMore ? (
                <>
                  <LoaderCircle
                    size={15}
                    className="animate-spin"
                  />

                  Loading...
                </>
              ) : (
                "Load More"
              )}
            </button>
          </div>
        ) : null}
      </div>

      {/* =====================================================
          PREMIUM LOGIN MODAL
      ===================================================== */}

      <PremiumLoginModal
        open={
          premiumModalOpen
        }
        exam={
          premiumExam
        }
        onClose={
          handleClosePremium
        }
      />
    </>
  );
}