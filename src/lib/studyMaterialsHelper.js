// src/lib/studyMaterialsHelper.js

import "server-only";

const API_BASE_URL =
  process.env.PSC_API_BASE_URL;

const API_KEY =
  process.env.PSC_API_KEY;

/* =========================================================
   VALIDATE
========================================================= */

function getApiConfig() {
  if (!API_BASE_URL) {
    throw new Error(
      "PSC_API_BASE_URL is missing."
    );
  }

  if (!API_KEY) {
    throw new Error(
      "PSC_API_KEY is missing."
    );
  }

  return {
    baseUrl:
      String(
        API_BASE_URL
      ).replace(
        /\/+$/,
        ""
      ),

    apiKey:
      String(
        API_KEY
      ).trim(),
  };
}

/* =========================================================
   GET STUDY MATERIALS
========================================================= */

export async function getStudyMaterials({
  uid = 0,
  cid,
} = {}) {
  try {
    if (
      cid === undefined ||
      cid === null ||
      cid === ""
    ) {
      throw new Error(
        "cid is required."
      );
    }

    const {
      baseUrl,
      apiKey,
    } =
      getApiConfig();

    const formData =
      new FormData();

    formData.append(
      "api",
      apiKey
    );

    formData.append(
      "uid",
      String(uid)
    );

    formData.append(
      "cid",
      String(cid)
    );

    const response =
      await fetch(
        `${baseUrl}/getPDFfiles`,
        {
          method: "POST",

          body:
            formData,

          /*
           * Cache briefly instead of
           * hammering the upstream API.
           */
          next: {
            revalidate: 300,
          },
        }
      );

    const text =
      await response.text();

    let result = {};

    try {
      result =
        text
          ? JSON.parse(
              text
            )
          : {};
    } catch {
      console.error(
        "getPDFfiles invalid response:",
        {
          status:
            response.status,

          text:
            text.slice(
              0,
              1000
            ),
        }
      );

      throw new Error(
        `getPDFfiles returned invalid JSON (${response.status}).`
      );
    }

    if (!response.ok) {
      throw new Error(
        result?.message ||
          `getPDFfiles failed with ${response.status}`
      );
    }

    const filePath =
      String(
        result?.file_path ??
        ""
      ).replace(
        /\/+$/,
        ""
      );

    const rawData =
      Array.isArray(
        result?.data
      )
        ? result.data
        : [];

    const data =
      rawData
        .filter(
          (item) =>
            String(
              item?.status ??
              "1"
            ) === "1"
        )
        .map(
          (item) => {
            const pdfPath =
              String(
                item?.pdf_path ??
                ""
              ).replace(
                /^\/+/,
                ""
              );

            return {
              ...item,

              pdfUrl:
                filePath &&
                pdfPath
                  ? `${filePath}/${pdfPath}`
                  : "",
            };
          }
        );

    return {
      status:
        result?.status !==
        false,

      filePath,

      data,

      total:
        data.length,

      message:
        result?.message ??
        "",
    };
  } catch (error) {
    console.error(
      "getStudyMaterials:",
      error
    );

    return {
      status: false,

      filePath: "",

      data: [],

      total: 0,

      message:
        error?.message ||
        "Unable to load study materials.",
    };
  }
}