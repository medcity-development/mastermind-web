import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import {
  getMainCourses,
  getSubCategories,
} from "@/lib/pscApi";

import {
  createSlug,
} from "@/lib/pscSlug";

import SubCategoryCourses from "./components/SubCategoryCourses";

const PAGE_COURSE_SLUG =
  "kerala-psc";

/* =========================================================
   IMAGE URL
========================================================= */

function buildImageUrl(
  filePath,
  image
) {
  if (
    !filePath ||
    !image
  ) {
    return "";
  }

  return `${String(
    filePath
  ).replace(/\/+$/, "")}/${String(
    image
  ).replace(/^\/+/, "")}`;
}

/* =========================================================
   KERALA PSC COURSE
========================================================= */

async function resolveKeralaPscCourse() {
  try {
    const {
      courses,
    } =
      await getMainCourses();

    return (
      courses.find(
        (course) =>
          createSlug(
            course?.exam ||
              ""
          ) ===
          PAGE_COURSE_SLUG
      ) || null
    );
  } catch (error) {
    console.error(
      "Unable to resolve Kerala PSC:",
      error
    );

    return null;
  }
}

/* =========================================================
   SUB CATEGORY / LEVEL
========================================================= */

async function resolveSubCategory(
  subCategorySlug
) {
  const course =
    await resolveKeralaPscCourse();

  if (!course?.id) {
    return null;
  }

  try {
    const {
      categories,
      filePath,
    } =
      await getSubCategories({
        cid:
          course.id,

        uid: 0,
      });

    const subCategory =
      categories.find(
        (item) =>
          createSlug(
            item?.name ||
              ""
          ) ===
          createSlug(
            subCategorySlug
          )
      ) || null;

    if (!subCategory) {
      return null;
    }

    return {
      course,
      subCategory,
      filePath,
    };
  } catch (error) {
    console.error(
      "Unable to resolve PSC subcategory:",
      error
    );

    return null;
  }
}

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  params,
}) {
  const {
    subCategorySlug,
  } = await params;

  const resolved =
    await resolveSubCategory(
      subCategorySlug
    );

  if (!resolved) {
    return {
      title:
        "Exam Level Not Found",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title =
    resolved
      ?.subCategory
      ?.name ||
    "Kerala PSC";

  return {
    title:
      `${title} Courses | MasterMind Academy`,

    description:
      `Explore Kerala PSC courses available under ${title}.`,

    alternates: {
      canonical:
        `/government-exams-coaching/kerala-psc/sub-courses/${createSlug(
          title
        )}`,
    },
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function SubCategoryPage({
  params,
}) {
  const {
    subCategorySlug,
  } = await params;

  const resolved =
    await resolveSubCategory(
      subCategorySlug
    );

  if (!resolved) {
    notFound();
  }

  const {
    course,
    subCategory,
    filePath,
  } = resolved;

  /*
   * THIS is the level/subcategory ID.
   *
   * Example:
   * 10th Level -> id 3
   *
   * This ID is what your sub-exam/course API needs.
   */
  const subCategoryId =
    subCategory.id;

  const imageUrl =
    buildImageUrl(
      filePath,
      subCategory?.icon_large ||
        subCategory?.icon
    );

  return (
    <main
      className="
        min-h-screen
        bg-[#f4f9ff]
        pb-14
        pt-[100px]
        lg:pt-[115px]
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-[1450px]
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* BACK */}

        <Link
          href="/government-exams-coaching/kerala-psc"
          className="
            inline-flex
            items-center
            gap-2
            text-[12px]
            font-bold
            text-[#164fa5]
            transition
            hover:text-[#017cc0]
          "
        >
          <ArrowLeft
            size={16}
          />

          Back to Kerala PSC
        </Link>

        {/* ===============================================
            HERO
        =============================================== */}

        <section
          className="
            relative
            mt-5
            min-h-[300px]
            overflow-hidden
            rounded-[28px]
            bg-gradient-to-r
            from-[#071f55]
            via-[#075fc8]
            to-[#7c3aed]
            shadow-[0_20px_55px_rgba(11,33,108,0.15)]
          "
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={
                subCategory?.name ||
                "Kerala PSC"
              }
              fill
              priority
              sizes="100vw"
              className="
                object-cover
                opacity-35
              "
              unoptimized
            />
          ) : null}

          <div
            aria-hidden="true"
            className="
              absolute
              inset-0
              bg-gradient-to-r
              from-[#071f55]/95
              via-[#075fc8]/80
              to-[#7c3aed]/65
            "
          />

          <div
            aria-hidden="true"
            className="
              absolute
              inset-0
              opacity-[0.06]
              [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
              [background-size:34px_34px]
            "
          />

          <div
            className="
              relative
              z-10
              flex
              min-h-[300px]
              max-w-3xl
              flex-col
              justify-center
              px-6
              py-10
              sm:px-10
              lg:px-14
            "
          >
            <p
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[0.18em]
                text-[#8ee8ff]
              "
            >
              {course?.exam ||
                "Kerala PSC"}
            </p>

            <h1
              className="
                mt-3
                text-3xl
                font-black
                tracking-[-0.03em]
                text-white
                sm:text-4xl
                lg:text-5xl
              "
            >
              {subCategory.name}
            </h1>

            {subCategory
              ?.name_mal ? (
              <p
                className="
                  mt-2
                  text-sm
                  text-white/70
                "
              >
                {
                  subCategory
                    .name_mal
                }
              </p>
            ) : null}

            <p
              className="
                mt-5
                max-w-xl
                text-sm
                leading-7
                text-white/75
              "
            >
              Choose a course under{" "}
              {subCategory.name}{" "}
              and access video
              classes, mock tests,
              previous questions and
              SCERT practice.
            </p>
          </div>
        </section>

        {/* ===============================================
            COURSES UNDER THIS LEVEL
        =============================================== */}

        <SubCategoryCourses
          cid={
            course.id
          }
          subId={
            subCategoryId
          }
          subCategorySlug={
            subCategorySlug
          }
        />
      </div>
    </main>
  );
}