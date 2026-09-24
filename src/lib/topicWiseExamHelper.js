const API_BASE_URL =
  process.env.PSC_API_BASE_URL;

const API_KEY =
  process.env.PSC_API_KEY;

/* =========================================================
   COMMON POST REQUEST
========================================================= */

async function postTopicWiseRequest(
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

        headers: {
          Accept:
            "application/json",
        },

        body: formData,

        cache: "no-store",
      }
    );

  if (!response.ok) {
    const text =
      await response.text();

    console.error(
      `${endpoint} ERROR:`,
      text
    );

    throw new Error(
      `${endpoint} failed with status ${response.status}`
    );
  }

  return response.json();
}

/* =========================================================
   1. GET ONE TOPIC PAGE
========================================================= */

async function getTopicWiseTopicPage({
  uid = 0,
  cid = 1,
  offset = 0,
  type = "twe",
} = {}) {
  const result =
    await postTopicWiseRequest(
      "getTopicListbyOffset",
      {
        uid,
        cid,
        offset,
        type,
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

    nextOffset:
      result?.nextoffset ??
      null,
  };
}

/* =========================================================
   2. GET ALL TOPICS
========================================================= */

export async function getTopicWiseExams({
  uid = 0,
  cid = 1,
  type = "twe",
} = {}) {
  try {
    const allTopics = [];

    let offset = 0;

    const visitedOffsets =
      new Set();

    /*
      Extra protection so a bad API
      cannot create an infinite loop.
    */
    let requestCount = 0;

    const MAX_REQUESTS = 100;

    while (
      requestCount <
      MAX_REQUESTS
    ) {
      if (
        visitedOffsets.has(
          offset
        )
      ) {
        break;
      }

      visitedOffsets.add(
        offset
      );

      requestCount += 1;

      const result =
        await getTopicWiseTopicPage(
          {
            uid,
            cid,
            offset,
            type,
          }
        );

      if (!result.status) {
        break;
      }

      allTopics.push(
        ...result.data
      );

      const nextOffset =
        result.nextOffset;

      if (
        nextOffset === null ||
        nextOffset === undefined ||
        nextOffset === ""
      ) {
        break;
      }

      const parsedOffset =
        Number(
          nextOffset
        );

      if (
        !Number.isFinite(
          parsedOffset
        )
      ) {
        break;
      }

      offset =
        parsedOffset;
    }

    /* -----------------------------------------
       REMOVE DUPLICATES
    ----------------------------------------- */

    const uniqueTopics =
      Array.from(
        new Map(
          allTopics.map(
            (item) => [
              String(
                item?.id
              ),
              item,
            ]
          )
        ).values()
      );

    /* -----------------------------------------
       ACTIVE ONLY
    ----------------------------------------- */

    const activeTopics =
      uniqueTopics.filter(
        (item) =>
          item?.status ===
            undefined ||
          item?.status ===
            null ||
          String(
            item.status
          ) === "1"
      );

    /* -----------------------------------------
       SORT
    ----------------------------------------- */

    activeTopics.sort(
      (a, b) =>
        Number(
          a?.order ?? 0
        ) -
        Number(
          b?.order ?? 0
        )
    );

    return {
      status: true,
      data:
        activeTopics,
      total:
        activeTopics.length,
    };
  } catch (error) {
    console.error(
      "getTopicWiseExams:",
      error
    );

    return {
      status: false,
      data: [],
      total: 0,

      message:
        error?.message ||
        "Unable to load topics",
    };
  }
}

/* =========================================================
   3. GET TESTS INSIDE ONE TOPIC
========================================================= */

export async function getTopicWiseTests({
  uid = 0,
  topicId,
  offset = 0,
} = {}) {
  try {
    if (!topicId) {
      return {
        status: false,
        data: [],
        nextOffset: null,
        message:
          "Topic ID is required",
      };
    }

    const result =
      await postTopicWiseRequest(
        "getTopicwiseTestListbyOffset",
        {
          uid,

          topicid:
            topicId,

          offset,
        }
      );

    return {
      status:
        Boolean(
          result?.status
        ),

      view:
        result?.view ||
        "",

      data:
        Array.isArray(
          result?.data
        )
          ? result.data
          : [],

      nextOffset:
        result?.nextoffset ??
        null,
    };
  } catch (error) {
    console.error(
      "getTopicWiseTests:",
      error
    );

    return {
      status: false,
      data: [],
      nextOffset: null,

      message:
        error?.message ||
        "Unable to load topic tests",
    };
  }
}

/* =========================================================
   4. GET ALL TESTS OF A TOPIC
========================================================= */

export async function getAllTopicWiseTests({
  uid = 0,
  topicId,
} = {}) {
  try {
    const allTests = [];

    let offset = 0;

    const visitedOffsets =
      new Set();

    let requestCount = 0;

    const MAX_REQUESTS = 100;

    while (
      requestCount <
      MAX_REQUESTS
    ) {
      if (
        visitedOffsets.has(
          offset
        )
      ) {
        break;
      }

      visitedOffsets.add(
        offset
      );

      requestCount += 1;

      const result =
        await getTopicWiseTests(
          {
            uid,
            topicId,
            offset,
          }
        );

      if (!result.status) {
        break;
      }

      allTests.push(
        ...result.data
      );

      const nextOffset =
        result.nextOffset;

      if (
        nextOffset === null ||
        nextOffset === undefined ||
        nextOffset === ""
      ) {
        break;
      }

      const parsedOffset =
        Number(
          nextOffset
        );

      if (
        !Number.isFinite(
          parsedOffset
        )
      ) {
        break;
      }

      offset =
        parsedOffset;
    }

    const uniqueTests =
      Array.from(
        new Map(
          allTests.map(
            (item) => [
              String(
                item?.id
              ),
              item,
            ]
          )
        ).values()
      );

    return {
      status: true,

      data:
        uniqueTests,

      total:
        uniqueTests.length,
    };
  } catch (error) {
    console.error(
      "getAllTopicWiseTests:",
      error
    );

    return {
      status: false,
      data: [],
      total: 0,

      message:
        error?.message ||
        "Unable to load tests",
    };
  }
}

/* =========================================================
   5. EXAM DETAILS + INSTRUCTIONS
========================================================= */

export async function getTopicWiseExamDetails({
  uid = 0,
  cid = 1,
  examId,
  type = "twe",
  offset = 0,
} = {}) {
  try {
    if (!examId) {
      return {
        status: false,
        exam: null,
        instructions: [],
        message:
          "Exam ID is required",
      };
    }

    const result =
      await postTopicWiseRequest(
        "getMockTestDetails",
        {
          uid,
          cid,
          offset,
          type,

          examid:
            examId,
        }
      );

    const exam =
      Array.isArray(
        result?.exam
      )
        ? result.exam[0] ||
          null
        : null;

    return {
      status:
        Boolean(
          result?.status
        ),

      view:
        result?.view ||
        "",

      exam,

      instructions:
        Array.isArray(
          result?.data
        )
          ? result.data
          : [],
    };
  } catch (error) {
    console.error(
      "getTopicWiseExamDetails:",
      error
    );

    return {
      status: false,
      exam: null,
      instructions: [],

      message:
        error?.message ||
        "Unable to load exam details",
    };
  }
}

/* =========================================================
   6. EXAM QUESTIONS
========================================================= */

export async function getTopicWiseExamQuestions({
  uid = 0,
  cid = 1,
  examId,
  examType = "twe",
} = {}) {
  try {
    if (!examId) {
      return {
        status: false,
        data: [],
        imagePath: "",
        message:
          "Exam ID is required",
      };
    }

    const result =
      await postTopicWiseRequest(
        "getMockTestQuestions",
        {
          uid,
          cid,

          examid:
            examId,

          examtype:
            examType,
        }
      );

    return {
      status:
        Boolean(
          result?.status
        ),

      imagePath:
        result?.img_path ||
        "",

      data:
        Array.isArray(
          result?.data
        )
          ? result.data
          : [],
    };
  } catch (error) {
    console.error(
      "getTopicWiseExamQuestions:",
      error
    );

    return {
      status: false,
      imagePath: "",
      data: [],

      message:
        error?.message ||
        "Unable to load exam questions",
    };
  }
}