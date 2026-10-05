import {
  notFound,
} from "next/navigation";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import {
  getSubCategories,
} from "@/lib/pscApi";

import {
  createSlug,
} from "@/lib/pscSlug";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import SubExamHero from "./SubExamHero";
import SubExamList from "./SubExamList";

/* =========================================================
   CATEGORY NAME
========================================================= */

function getCategoryName(
  item
) {
  return (
    item?.name ||
    item?.subcourse ||
    item?.sub_category ||
    item?.subcategory ||
    item?.sub_category_name ||
    item?.subcategory_name ||
    item?.exam_name ||
    item?.title ||
    ""
  );
}

/* =========================================================
   CATEGORY ID
========================================================= */

function getCategoryId(
  item
) {
  return (
    item?.id ??
    item?.sub_id ??
    item?.subId ??
    item?.subcategory_id ??
    item?.sub_category_id ??
    null
  );
}

/* =========================================================
   RESOLVE EXAM LEVEL
========================================================= */

async function resolveExamLevel({
  governmentExamsSlug,
  levelSlug,
  uid = 0,
}) {
  /* =======================================================
     GOVERNMENT CONFIG
  ======================================================= */

  const governmentConfig =
    getGovernmentExamConfig(
      governmentExamsSlug
    );

  if (!governmentConfig) {
    return null;
  }

  const cid =
    String(
      governmentConfig.cid
    );

  /* =======================================================
     FETCH ALL LEVELS
  ======================================================= */

  const result =
    await getSubCategories({
      cid,
      uid:
        uid || 0,
    });

  if (
    !result?.status &&
    !result?.categories?.length
  ) {
    console.error(
      "Unable to resolve exam level:",
      result?.message
    );

    return null;
  }

  const categories =
    Array.isArray(
      result?.categories
    )
      ? result.categories
      : [];

  /* =======================================================
     MATCH SEO SLUG
  ======================================================= */

  const normalizedLevelSlug =
    String(
      levelSlug
    )
      .trim()
      .toLowerCase();

  const category =
    categories.find(
      (item) => {
        const name =
          getCategoryName(
            item
          );

        if (!name) {
          return false;
        }

        return (
          createSlug(
            name
          ) ===
          normalizedLevelSlug
        );
      }
    ) || null;

  if (!category) {
    console.error(
      "Exam level slug not found:",
      {
        cid,
        levelSlug,
        available:
          categories.map(
            (item) => ({
              id:
                getCategoryId(
                  item
                ),

              name:
                getCategoryName(
                  item
                ),

              slug:
                createSlug(
                  getCategoryName(
                    item
                  )
                ),
            })
          ),
      }
    );

    return null;
  }

  const subId =
    getCategoryId(
      category
    );

  if (
    subId === null ||
    subId === undefined ||
    subId === ""
  ) {
    return null;
  }

  return {
    governmentConfig,

    category,

    cid,

    subId:
      String(
        subId
      ),

    title:
      getCategoryName(
        category
      ),
  };
}

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  params,
}) {
  const {
    governmentExamsSlug,
    slug,
  } = await params;

  const resolved =
    await resolveExamLevel({
      governmentExamsSlug,

      levelSlug:
        slug,
    });

  if (!resolved) {
    return {
      title:
        "Exam Level | MasterMind Academy",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const {
    governmentConfig,
    title,
  } = resolved;

  return {
    title:
      `${title} | ${governmentConfig.name} Coaching | MasterMind Academy`,

    description:
      `Explore ${title} for ${governmentConfig.name}. Access mock tests, previous questions and exam preparation resources.`,

    alternates: {
      canonical:
        `/dashboard/${governmentExamsSlug}/${slug}`,
    },
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function ExamLevelPage({
  params,
}) {
  const {
    governmentExamsSlug,
    slug,
  } = await params;

  if (
    !governmentExamsSlug ||
    !slug
  ) {
    notFound();
  }

  const session =
    await getStudentSession();

  const resolved =
    await resolveExamLevel({
      governmentExamsSlug,

      levelSlug:
        slug,

      uid:
        session?.uid || "",
    });

  if (!resolved) {
    notFound();
  }

  const {
    governmentConfig,
    cid,
    subId,
    title,
  } = resolved;

  return (
    <main
      className="
        min-h-screen
        bg-[#f4f9ff]
        pb-12
        pt-10
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
        <SubExamHero
          title={
            title
          }
          governmentExamsSlug={
            governmentConfig.slug
          }
          governmentExamName={
            governmentConfig.name
          }
        />

        <SubExamList
          cid={
            cid
          }
          subId={
            subId
          }
          levelSlug={
            slug
          }
          governmentExamsSlug={
            governmentConfig.slug
          }
          uid={
            session?.uid || ""
          }
        />
      </div>
    </main>
  );
}
