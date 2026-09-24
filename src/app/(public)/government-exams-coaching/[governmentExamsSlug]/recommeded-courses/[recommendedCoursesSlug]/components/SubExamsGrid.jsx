"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowUpRight,
  UserPlus,
} from "lucide-react";

import SubExamCard from "./SubExamCard";

const COURSE_ID = 1;
const USER_ID = 0;
const MAX_EXAMS = 7;

/* =========================================================
   CREATE SLUG
========================================================= */

function createSlug(
  value = ""
) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
}

/* =========================================================
   GET CATEGORY NAME
========================================================= */

function getCategoryName(
  category
) {
  return (
    category?.name ||
    category?.exam ||
    category?.title ||
    category?.category ||
    category?.subcourse ||
    ""
  );
}

/* =========================================================
   IMAGE URL
========================================================= */

function buildImageUrl(
  iconPath,
  icon
) {
  if (
    !iconPath ||
    !icon
  ) {
    return "";
  }

  if (
    String(icon).startsWith(
      "http"
    )
  ) {
    return String(icon);
  }

  const cleanPath =
    String(
      iconPath
    ).replace(
      /\/+$/,
      ""
    );

  const cleanIcon =
    String(
      icon
    ).replace(
      /^\/+/,
      ""
    );

  return `${cleanPath}/${cleanIcon}`;
}

/* =========================================================
   SUB EXAMS GRID
========================================================= */

export default function SubExamsGrid({
  recommendedCoursesSlug = "",
}) {
  const [
    subExams,
    setSubExams,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /* =========================================================
     LOAD EXAMS
  ========================================================= */

  useEffect(() => {
    let active = true;

    async function loadSubExams() {
      try {
        setLoading(true);
        setError("");

        /* =====================================================
           STEP 1
           GET PSC LEVELS / CATEGORIES
        ===================================================== */

        const categoryParams =
          new URLSearchParams({
            cid: String(
              COURSE_ID
            ),

            uid: String(
              USER_ID
            ),
          });

        const categoryResponse =
          await fetch(
            `/api/exam-category-section?${categoryParams.toString()}`,
            {
              method: "GET",
              cache:
                "no-store",
            }
          );

        const categoryResult =
          await categoryResponse.json();

        console.log(
          "CATEGORY RESPONSE:",
          categoryResult
        );

        if (
          !categoryResponse.ok
        ) {
          throw new Error(
            categoryResult?.message ||
              "Unable to load exam categories."
          );
        }

        const categories =
          Array.isArray(
            categoryResult?.data
          )
            ? categoryResult.data
            : [];

        if (
          categories.length ===
          0
        ) {
          if (active) {
            setSubExams([]);
          }

          return;
        }

        /* =====================================================
           STEP 2
           CHECK WHETHER WE ARE ON A DYNAMIC CATEGORY PAGE
        ===================================================== */

        const hasSelectedCategory =
          Boolean(
            recommendedCoursesSlug
          );

        let categoriesToLoad =
          categories;

        /* =====================================================
           DYNAMIC PAGE

           Example:
           slug = "10th-level"

           Find:
           {
             id: 3,
             name: "10th Level"
           }
        ===================================================== */

        if (
          hasSelectedCategory
        ) {
          const selectedCategory =
            categories.find(
              (category) => {
                const name =
                  getCategoryName(
                    category
                  );

                return (
                  createSlug(
                    name
                  ) ===
                  createSlug(
                    recommendedCoursesSlug
                  )
                );
              }
            );

          console.log(
            "SELECTED CATEGORY:",
            selectedCategory
          );

          if (
            !selectedCategory
          ) {
            if (active) {
              setSubExams([]);

              setError(
                "The selected course could not be found."
              );
            }

            return;
          }

          categoriesToLoad = [
            selectedCategory,
          ];
        }

        /* =====================================================
           STEP 3
           FETCH SUB EXAMS

           Root page:
           → fetch all categories

           Dynamic page:
           → fetch selected category only
        ===================================================== */

        const requests =
          categoriesToLoad.map(
            async (
              category
            ) => {
              try {
                const categoryId =
                  category?.id;

                if (
                  !categoryId
                ) {
                  return [];
                }

                const params =
                  new URLSearchParams(
                    {
                      cid: String(
                        COURSE_ID
                      ),

                      subId:
                        String(
                          categoryId
                        ),

                      uid: String(
                        USER_ID
                      ),
                    }
                  );

                const response =
                  await fetch(
                    `/api/sub-exams?${params.toString()}`,
                    {
                      method:
                        "GET",

                      cache:
                        "no-store",
                    }
                  );

                const result =
                  await response.json();

                console.log(
                  `SUB EXAMS CATEGORY ${categoryId}:`,
                  result
                );

                if (
                  !response.ok
                ) {
                  return [];
                }

                const exams =
                  Array.isArray(
                    result?.data
                  )
                    ? result.data
                    : [];

                const iconPath =
                  result?.icon_path ||
                  result?.iconPath ||
                  "";

                const categoryName =
                  getCategoryName(
                    category
                  );

                /* =============================================
                   NORMALIZE EXAMS
                ============================================= */

                return exams.map(
                  (exam) => ({
                    ...exam,

                    /* Main PSC course */

                    cid:
                      COURSE_ID,

                    /* Category / level */

                    categoryId:
                      categoryId,

                    categoryName:
                      categoryName,

                    categorySlug:
                      createSlug(
                        categoryName
                      ),

                    categoryNameMal:
                      category?.name_mal ||
                      category
                        ?.exam_mal ||
                      "",

                    /* Preserve backend sub id */

                    sub_id:
                      exam?.sub_id ||
                      categoryId,

                    /* Image */

                    imageUrl:
                      buildImageUrl(
                        iconPath,

                        exam?.icon ||
                          exam?.newicon ||
                          exam?.icon_large
                      ),
                  })
                );
              } catch (
                error
              ) {
                console.error(
                  `Unable to load exams for category ${category?.id}:`,
                  error
                );

                return [];
              }
            }
          );

        /* =====================================================
           STEP 4
           WAIT FOR REQUESTS
        ===================================================== */

        const results =
          await Promise.all(
            requests
          );

        if (!active) {
          return;
        }

        /* =====================================================
           STEP 5
           COMBINE
        ===================================================== */

        const allExams =
          results.flat();

        /* =====================================================
           STEP 6
           REMOVE DUPLICATES
        ===================================================== */

        const uniqueExams =
          Array.from(
            new Map(
              allExams.map(
                (exam) => [
                  `${exam?.categoryId}-${exam?.id}`,

                  exam,
                ]
              )
            ).values()
          );

        /* =====================================================
           STEP 7
           ROOT PAGE VS CATEGORY PAGE

           Root:
           only show recommendations

           Category page:
           show all exams in selected category
        ===================================================== */

        const finalExams =
          hasSelectedCategory
            ? uniqueExams
            : uniqueExams.slice(
                0,
                MAX_EXAMS
              );

        console.log(
          "FINAL EXAMS:",
          finalExams
        );

        setSubExams(
          finalExams
        );
      } catch (
        error
      ) {
        console.error(
          "Recommended exams fetch error:",
          error
        );

        if (active) {
          setSubExams([]);

          setError(
            error?.message ||
              "Unable to load exams."
          );
        }
      } finally {
        if (active) {
          setLoading(
            false
          );
        }
      }
    }

    loadSubExams();

    return () => {
      active = false;
    };
  }, [
    recommendedCoursesSlug,
  ]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div
        className="
          grid
          auto-rows-[160px]
          grid-cols-1
          gap-3
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
        "
      >
        {Array.from({
          length: 8,
        }).map(
          (_, index) => (
            <div
              key={index}
              className="
                h-full
                animate-pulse
                rounded-[20px]
                border
                border-[#164fa5]/5
                bg-slate-100
              "
            />
          )
        )}
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
          rounded-[18px]
          border
          border-red-100
          bg-red-50
          px-5
          py-4
          text-sm
          text-red-600
        "
      >
        {error}
      </div>
    );
  }

  /* =========================================================
     EMPTY
  ========================================================= */

  if (
    subExams.length ===
    0
  ) {
    return (
      <div
        className="
          rounded-[18px]
          border
          border-[#dce8f7]
          bg-white
          px-5
          py-8
          text-center
        "
      >
        <p
          className="
            text-sm
            font-bold
            text-[#0b216c]
          "
        >
          No exams available
        </p>

        <p
          className="
            mt-1
            text-[12px]
            text-slate-500
          "
        >
          No exams are
          currently available
          for this course.
        </p>
      </div>
    );
  }

  /* =========================================================
     GRID
  ========================================================= */

  return (
    <div
      className="
        grid
        auto-rows-[160px]
        grid-cols-1
        gap-3
        sm:grid-cols-2
        md:grid-cols-3
        lg:grid-cols-4
      "
    >
      {/* =====================================================
          EXAM CARDS
      ===================================================== */}

      {subExams.map(
        (exam) => (
          <SubExamCard
            key={`${exam?.categoryId}-${exam?.id}`}
            exam={exam}
          />
        )
      )}

      {/* =====================================================
          REGISTER WITH US
      ===================================================== */}

      <Link
        href="/register"
        className="
          group
          relative
          h-full
          min-h-0
          w-full
          overflow-hidden
          rounded-[20px]
          border
          border-white/10
          bg-gradient-to-br
          from-[#164fa5]
          via-[#123f91]
          to-[#0b216c]
          p-4
          shadow-[0_14px_34px_rgba(11,33,108,0.20)]
          transition
          duration-300
          hover:-translate-y-1
          hover:shadow-[0_20px_42px_rgba(11,33,108,0.28)]
        "
      >
        {/* TOP GRADIENT */}

        <div
          aria-hidden="true"
          className="
            absolute
            inset-x-0
            top-0
            z-20
            h-[4px]
            bg-gradient-to-r
            from-[#00b5e8]
            via-white
            to-[#df1768]
          "
        />

        {/* GRID */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            [background-image:linear-gradient(rgba(255,255,255,0.065)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.065)_1px,transparent_1px)]
            [background-size:22px_22px]
          "
        />

        {/* CYAN GLOW */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-12
            -top-12
            h-36
            w-36
            rounded-full
            bg-[#00b5e8]/20
            blur-[45px]
          "
        />

        {/* PINK GLOW */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -bottom-14
            -left-10
            h-32
            w-32
            rounded-full
            bg-[#df1768]/14
            blur-[45px]
          "
        />

        <div
          className="
            relative
            z-10
            flex
            h-full
            min-h-0
            flex-col
          "
        >
          <div
            className="
              flex
              items-start
              justify-between
              gap-3
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                text-pink-400
              "
            >
              <UserPlus
                size={17}
              />
            </div>

            <div
              className="
                flex
                h-7
                w-7
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-white/10
                bg-white/10
                text-white
                transition
                duration-300
                group-hover:-translate-y-0.5
                group-hover:translate-x-0.5
                group-hover:bg-white/20
              "
            >
              <ArrowUpRight
                size={14}
              />
            </div>
          </div>

          <div className="mt-auto">
            <p
              className="
                text-[8px]
                font-extrabold
                uppercase
                tracking-[0.17em]
                text-[#69ddff]
              "
            >
              Start Your Journey
            </p>

            <h3
              className="
                mt-1
                text-[15px]
                font-black
                leading-tight
                tracking-[-0.025em]
                text-white
              "
            >
              Register With Us
            </h3>

            <p
              className="
                mt-1
                line-clamp-2
                text-[9px]
                leading-[1.4]
                text-white/55
              "
            >
              Join Mastermind and
              start your exam
              preparation with expert
              guidance.
            </p>

            <span
              className="
                mt-2
                inline-flex
                items-center
                gap-1
                text-[10px]
                font-semibold
                text-[#7ee6ff]
                transition
                group-hover:text-white
              "
            >
              Register Now

              <ArrowUpRight
                size={12}
              />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}