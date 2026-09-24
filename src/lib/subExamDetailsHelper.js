// src/lib/subExamDetailsHelper.js

import "server-only";

const API_BASE_URL =
  process.env.PSC_API_BASE_URL;

const API_KEY =
  process.env.PSC_API_KEY;

/* =========================================================
   REQUEST
========================================================= */

async function postRequest(
  endpoint,
  fields = {}
) {
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

  const baseUrl =
    String(
      API_BASE_URL
    ).replace(
      /\/+$/,
      ""
    );

  const formData =
    new FormData();

  formData.append(
    "api",
    API_KEY
  );

  Object.entries(
    fields
  ).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        formData.append(
          key,
          String(value)
        );
      }
    }
  );

  const response =
    await fetch(
      `${baseUrl}/${endpoint}`,
      {
        method: "POST",

        body:
          formData,

        cache:
          "no-store",
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
    throw new Error(
      `${endpoint} returned invalid JSON.`
    );
  }

  if (!response.ok) {
    throw new Error(
      result?.message ||
        `${endpoint} failed with ${response.status}`
    );
  }

  return result;
}

/* =========================================================
   SUB EXAM DETAILS
========================================================= */

export async function getSubExamDetails({
  uid = 0,
  cid,
  subExamId,
  type = "mock",
  offset = 0,
} = {}) {
  try {
    if (
      cid === undefined ||
      cid === null ||
      cid === ""
    ) {
      return {
        status: false,
        data: null,
        items: [],
        iconPath: "",
        subjectPath: "",
        view: "",
        viewType: "",
        message:
          "cid is required.",
      };
    }

    if (!subExamId) {
      return {
        status: false,
        data: null,
        items: [],
        iconPath: "",
        subjectPath: "",
        view: "",
        viewType: "",
        message:
          "subExamId is required.",
      };
    }

    const result =
      await postRequest(
        "getSubExamDetailsLatest",
        {
          uid,

          cid,

          subexamid:
            subExamId,

          type,

          offset,
        }
      );

    return {
      status:
        result?.status ===
        true,

      data:
        result?.data ??
        null,

      items:
        Array.isArray(
          result?.items
        )
          ? result.items
          : [],

      iconPath:
        result?.icon_path ??
        "",

      subjectPath:
        result?.subject_path ??
        "",

      view:
        result?.view ??
        "",

      viewType:
        result?.viewtype ??
        "",

      message:
        result?.message ??
        "",
    };
  } catch (error) {
    console.error(
      "getSubExamDetails:",
      error
    );

    return {
      status: false,
      data: null,
      items: [],
      iconPath: "",
      subjectPath: "",
      view: "",
      viewType: "",
      message:
        error?.message ||
        "Unable to load exam details.",
    };
  }
}