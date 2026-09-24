// src/lib/subCategoriesHelper.js

export async function getSubCategories({
  cid,
  uid = 0,
} = {}) {
  if (cid == null) {
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