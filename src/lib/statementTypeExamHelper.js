const API_BASE_URL =
  process.env.PSC_API_BASE_URL;

const API_KEY =
  process.env.PSC_API_KEY;

/* =========================================================
   COMMON POST REQUEST
========================================================= */

async function postStatementTypeRequest(
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

  Object.entries(fields).forEach(
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

        body:
          formData,

        cache:
          "no-store",
      }
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    console.error(
      `STATEMENT TYPE API ERROR ${endpoint}:`,
      errorText
    );

    throw new Error(
      `${endpoint} failed with ${response.status}`
    );
  }

  return response.json();
}

/* =========================================================
   GET ONE TOPIC PAGE
========================================================= */

async function getStatementTypeTopicPage({
  uid = 0,
  cid = 1,
  offset = 0,
  type = "tst",
} = {}) {
  const result =
    await postStatementTypeRequest(
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
   GET ALL STATEMENT TYPE TOPICS
========================================================= */

export async function getStatementTypeTopics({
  uid = 0,
  cid = 1,
  type = "tst",
} = {}) {
  try {
    const allTopics = [];

    let offset = 0;

    const visitedOffsets =
      new Set();

    while (true) {
      if (
        visitedOffsets.has(
          offset
        )
      ) {
        console.warn(
          "Repeated statement topic offset:",
          offset
        );

        break;
      }

      visitedOffsets.add(
        offset
      );

      const result =
        await getStatementTypeTopicPage({
          uid,
          cid,
          offset,
          type,
        });

      if (!result.status) {
        break;
      }

      allTopics.push(
        ...result.data
      );

      console.log(
        "STATEMENT TOPIC PAGE:",
        {
          offset,
          received:
            result.data.length,
          nextOffset:
            result.nextOffset,
          collected:
            allTopics.length,
        }
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
        console.warn(
          "Invalid topic nextoffset:",
          nextOffset
        );

        break;
      }

      offset =
        parsedOffset;
    }

    /* =====================================================
       REMOVE DUPLICATES
    ===================================================== */

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

    /* =====================================================
       ACTIVE ONLY
    ===================================================== */

    const activeTopics =
      uniqueTopics.filter(
        (item) =>
          String(
            item?.status
          ) === "1"
      );

    /* =====================================================
       SORT
    ===================================================== */

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
      "getStatementTypeTopics:",
      error
    );

    return {
      status: false,

      data: [],

      total: 0,

      message:
        error?.message ||
        "Unable to load statement type topics",
    };
  }
}

/* =========================================================
   GET ONE EXAM PAGE
========================================================= */

async function getStatementTypeExamPage({
  uid = 0,
  cid,
  topicId,
  offset = 0,
  type = "tst",
} = {}) {
  if (!cid) {
    return {
      status: false,
      data: [],
      nextOffset: null,
      message:
        "cid is required",
    };
  }

  if (!topicId) {
    return {
      status: false,
      data: [],
      nextOffset: null,
      message:
        "topicId is required",
    };
  }

  const result =
    await postStatementTypeRequest(
      "getTopicwiseTestListbyOffset",
      {
        uid,

        cid,

        // Backend expects topicid
        topicid:
          topicId,

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
      result?.nextOffset ??
      null,
  };
}
/* =========================================================
   GET ALL EXAMS FOR SELECTED TOPIC
========================================================= */

/* =========================================================
   GET ALL EXAMS FOR SELECTED TOPIC
========================================================= */

export async function getStatementTypeExamsByTopic({
  uid = 0,
  cid,
  topicId,
  type = "tst",
} = {}) {
  try {
    /* =====================================================
       VALIDATE CID
    ===================================================== */

    if (
      cid === undefined ||
      cid === null ||
      cid === ""
    ) {
      return {
        status: false,
        data: [],
        total: 0,
        message:
          "cid is required",
      };
    }

    /* =====================================================
       VALIDATE TOPIC
    ===================================================== */

    if (
      topicId === undefined ||
      topicId === null ||
      topicId === ""
    ) {
      return {
        status: false,
        data: [],
        total: 0,
        message:
          "topicId is required",
      };
    }

    const allExams = [];

    let offset = 0;

    const visitedOffsets =
      new Set();

    /* =====================================================
       LOAD ALL PAGES
    ===================================================== */

    while (true) {
      if (
        visitedOffsets.has(
          offset
        )
      ) {
        console.warn(
          "Repeated statement exam offset:",
          offset
        );

        break;
      }

      visitedOffsets.add(
        offset
      );

      const result =
        await getStatementTypeExamPage({
          uid,

          // IMPORTANT
          cid,

          topicId,
          offset,
          type,
        });

      if (!result.status) {
        console.warn(
          "Statement exam page failed:",
          {
            cid,
            topicId,
            offset,
            type,
            message:
              result?.message,
          }
        );

        break;
      }

      allExams.push(
        ...result.data
      );

      console.log(
        "STATEMENT EXAM PAGE:",
        {
          cid,
          topicId,
          offset,

          received:
            result.data.length,

          nextOffset:
            result.nextOffset,

          collected:
            allExams.length,
        }
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
        console.warn(
          "Invalid statement exam nextoffset:",
          nextOffset
        );

        break;
      }

      offset =
        parsedOffset;
    }

    /* =====================================================
       REMOVE DUPLICATES
    ===================================================== */

    const uniqueExams =
      Array.from(
        new Map(
          allExams.map(
            (item) => [
              String(
                item?.id
              ),
              item,
            ]
          )
        ).values()
      );

    /* =====================================================
       RETURN
    ===================================================== */

    return {
      status: true,

      data:
        uniqueExams,

      total:
        uniqueExams.length,
    };
  } catch (error) {
    console.error(
      "getStatementTypeExamsByTopic:",
      error
    );

    return {
      status: false,

      data: [],

      total: 0,

      message:
        error?.message ||
        "Unable to load statement type exams",
    };
  }
}
/* =========================================================
   STATEMENT TYPE EXAM DETAILS
========================================================= */

export async function getStatementTypeExamDetails({
    uid = 0,
    cid = 1,
    examId,
    type = "tst",
    offset = 0,
  } = {}) {
    try {
      if (!examId) {
        return {
          status: false,
          exam: null,
          instructions: [],
        };
      }
  
      const result =
        await postStatementTypeRequest(
          "getMockTestDetails",
          {
            uid,
            cid,
            offset,
            type,
  
            // API field name
            examid: examId,
          }
        );
  
      const exam =
        Array.isArray(result?.exam)
          ? result.exam[0] ?? null
          : result?.exam ?? null;
  
      return {
        status:
          Boolean(result?.status),
  
        exam,
  
        instructions:
          Array.isArray(result?.data)
            ? result.data
            : [],
      };
    } catch (error) {
      console.error(
        "getStatementTypeExamDetails:",
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
     STATEMENT TYPE QUESTIONS
  ========================================================= */
  
  export async function getStatementTypeExamQuestions({
    uid = 0,
    cid = 1,
    examId,
    examType = "tst",
  } = {}) {
    try {
      if (!examId) {
        return {
          status: false,
          data: [],
          imagePath: "",
        };
      }
  
      const result =
        await postStatementTypeRequest(
          "getMockTestQuestions",
          {
            uid,
            cid,
  
            // EXACT API FIELD NAMES
            examid: examId,
            examtype: examType,
          }
        );
  
      return {
        status:
          Boolean(result?.status),
  
        data:
          Array.isArray(result?.data)
            ? result.data
            : [],
  
        imagePath:
          result?.img_path ||
          "",
      };
    } catch (error) {
      console.error(
        "getStatementTypeExamQuestions:",
        error
      );
  
      return {
        status: false,
        data: [],
        imagePath: "",
        message:
          error?.message ||
          "Unable to load exam questions",
      };
    }
  }