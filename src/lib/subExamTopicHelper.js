const API_BASE_URL =
  process.env.PSC_API_BASE_URL;

const API_KEY =
  process.env.PSC_API_KEY;

/* =========================================================
   COMMON POST REQUEST
========================================================= */

async function postRequest(
  endpoint,
  fields = {}
) {
  if (!API_BASE_URL) {
    throw new Error(
      "PSC_API_BASE_URL is missing"
    );
  }

  if (!API_KEY) {
    throw new Error(
      "PSC_API_KEY is missing"
    );
  }

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

  const baseUrl =
    API_BASE_URL.replace(
      /\/+$/,
      ""
    );

  const response =
    await fetch(
      `${baseUrl}/${endpoint}`,
      {
        method: "POST",
        body: formData,
        cache: "no-store",
      }
    );

  if (!response.ok) {
    const text =
      await response.text();

    console.error(
      `${endpoint}:`,
      text
    );

    throw new Error(
      `${endpoint} failed: ${response.status}`
    );
  }

  return response.json();
}

/* =========================================================
   TOPICS
========================================================= */

export async function getSubExamTopicList({
  uid = 0,
  cid = 1,
  subId,
  subExamId,
} = {}) {
  try {
    if (!subId) {
      return {
        status: false,
        data: [],
        message:
          "subId is required.",
      };
    }

    if (!subExamId) {
      return {
        status: false,
        data: [],
        message:
          "subExamId is required.",
      };
    }

    const result =
      await postRequest(
        "getTopicListNew",
        {
          uid,
          cid,

          subid:
            subId,

          subexamid:
            subExamId,
        }
      );

    return {
      status:
        Boolean(
          result?.status
        ),

      data:
        Array.isArray(
          result?.data
        )
          ? result.data
          : [],

      message:
        result?.message ||
        "",
    };
  } catch (error) {
    console.error(
      "getSubExamTopicList:",
      error
    );

    return {
      status: false,
      data: [],
      message:
        error?.message ||
        "Unable to load topics.",
    };
  }
}

/* =========================================================
   VIDEOS / CHAPTERS
========================================================= */

export async function getSubExamTopicChapters({
  uid = 0,
  cid = 1,
  topicId,
  offset = 0,
} = {}) {
  try {
    if (!topicId) {
      return {
        status: false,
        data: [],
        nextOffset: null,
        view: "",
        thumbnailPath: "",
        notePath: "",
        message:
          "topicId is required.",
      };
    }

    const result =
      await postRequest(
        "getChaptersList",
        {
          uid,
          cid,

          topicid:
            topicId,

          offset,
        }
      );

    const nextOffset =
      result?.nextOffset ??
      result?.nextoffset ??
      result?.next_offset ??
      null;

    return {
      status:
        Boolean(
          result?.status
        ),

      view:
        result?.view ||
        "",

      thumbnailPath:
        result?.thumbnail_path ||
        result?.thumbnailPath ||
        "",

      notePath:
        result?.note_path ||
        result?.notePath ||
        "",

      data:
        Array.isArray(
          result?.data
        )
          ? result.data
          : [],

      nextOffset,

      message:
        result?.message ||
        "",
    };
  } catch (error) {
    console.error(
      "getSubExamTopicChapters:",
      error
    );

    return {
      status: false,
      data: [],
      nextOffset: null,
      view: "",
      thumbnailPath: "",
      notePath: "",
      message:
        error?.message ||
        "Unable to load videos.",
    };
  }
}