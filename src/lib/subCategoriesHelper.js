// src/lib/subCategoriesHelper.js

import "server-only";

import {
  createSlug,
} from "@/lib/pscSlug";

/* =========================================================
   GET SUB CATEGORIES
========================================================= */

export async function getSubCategories({
  cid,
  uid = 0,
} = {}) {
  if (
    cid === undefined ||
    cid === null ||
    cid === ""
  ) {
    return {
      status: false,
      filePath: "",
      data: [],
    };
  }

  try {
    const formData =
      new FormData();

    formData.append(
      "api",
      process.env.PSC_API_KEY
    );

    formData.append(
      "cid",
      String(cid)
    );

    formData.append(
      "uid",
      String(uid)
    );

    const response =
      await fetch(
        `${process.env.PSC_API_BASE_URL}/getSubCategoriesNew`,
        {
          method: "POST",
          body: formData,
          cache: "no-store",
        }
      );

    if (!response.ok) {
      throw new Error(
        `getSubCategoriesNew failed: ${response.status}`
      );
    }

    const result =
      await response.json();

    const data =
      Array.isArray(
        result?.data
      )
        ? result.data.filter(
            (item) =>
              String(
                item?.status ??
                  "1"
              ) === "1"
          )
        : [];

    return {
      status:
        result?.status ??
        false,

      filePath:
        result?.file_path ??
        "",

      data,
    };
  } catch (error) {
    console.error(
      "getSubCategories:",
      error
    );

    return {
      status: false,
      filePath: "",
      data: [],
    };
  }
}

/* =========================================================
   GET SUB CATEGORY NAME

   Supports possible API field variations.
========================================================= */

export function getSubCategoryName(
  item
) {
  return (
    item?.sub_category ||
    item?.subcategory ||
    item?.sub_category_name ||
    item?.subcategory_name ||
    item?.category_name ||
    item?.exam_name ||
    item?.name ||
    item?.title ||
    ""
  );
}

/* =========================================================
   GET SUB CATEGORY ID
========================================================= */

export function getSubCategoryId(
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
   RESOLVE SUB CATEGORY FROM SEO SLUG
========================================================= */

export async function resolveSubCategory({
  cid,
  levelSlug,
  uid = 0,
} = {}) {
  if (
    !cid ||
    !levelSlug
  ) {
    return null;
  }

  const result =
    await getSubCategories({
      cid,
      uid,
    });

  const categories =
    Array.isArray(
      result?.data
    )
      ? result.data
      : [];

  const category =
    categories.find(
      (item) => {
        const name =
          getSubCategoryName(
            item
          );

        return (
          createSlug(name) ===
          String(
            levelSlug
          ).toLowerCase()
        );
      }
    ) || null;

  if (!category) {
    return null;
  }

  const subId =
    getSubCategoryId(
      category
    );

  if (
    subId === undefined ||
    subId === null ||
    subId === ""
  ) {
    return null;
  }

  return {
    category,
    subId:
      String(subId),

    name:
      getSubCategoryName(
        category
      ),

    filePath:
      result?.filePath ||
      "",
  };
}