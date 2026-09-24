/* =========================================================
   ENVIRONMENT
========================================================= */

const API_BASE_URL =
  process.env.PSC_API_BASE_URL;

const API_KEY =
  process.env.PSC_API_KEY;

/* =========================================================
   COMMON HELPERS
========================================================= */

function cleanBaseUrl(value = "") {
  return String(value).replace(
    /\/+$/,
    ""
  );
}

function appendFormValue(
  formData,
  key,
  value
) {
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

/* =========================================================
   COMMON SCERT REQUEST
========================================================= */

async function postScertRequest(
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
      appendFormValue(
        formData,
        key,
        value
      );
    }
  );

  const url =
    `${cleanBaseUrl(
      API_BASE_URL
    )}/${endpoint}`;

  console.log(
    "SCERT REQUEST:",
    url
  );

  console.log(
    "SCERT REQUEST DATA:",
    Object.fromEntries(
      formData.entries()
    )
  );

  const response =
    await fetch(url, {
      method: "POST",

      headers: {
        Accept:
          "application/json",
      },

      body: formData,

      cache: "no-store",
    });

  if (!response.ok) {
    const errorText =
      await response.text();

    console.error(
      `SCERT ${endpoint} ERROR:`,
      {
        status:
          response.status,

        response:
          errorText,
      }
    );

    throw new Error(
      `${endpoint} failed: ${response.status}`
    );
  }

  return response.json();
}

/* =========================================================
   1. GET SCERT CLASS LIST

   API:
   getScertListbyOffset

   Here cid=1 is the Kerala PSC/course cid.

   Response:
   [
     {
       id: 1,
       class: "CLASS 5"
     },
     {
       id: 2,
       class: "CLASS 6"
     }
   ]
========================================================= */

export async function getScertFolders({
  uid = 0,
  cid = 1,
  offset = 0,
} = {}) {
  try {
    const result =
      await postScertRequest(
        "getScertListbyOffset",
        {
          uid,
          cid,
          offset,
        }
      );

    const folders =
      Array.isArray(
        result?.data
      )
        ? result.data
        : [];

    const activeFolders =
      folders
        .filter(
          (item) =>
            String(
              item?.status
            ) === "1"
        )
        .sort(
          (a, b) =>
            Number(
              a?.order || 0
            ) -
            Number(
              b?.order || 0
            )
        );

    return {
      status:
        Boolean(
          result?.status
        ),

      data:
        activeFolders,

      nextOffset:
        result?.nextoffset ??
        null,
    };
  } catch (error) {
    console.error(
      "getScertFolders:",
      error
    );

    return {
      status: false,
      data: [],
      nextOffset: null,
    };
  }
}

/* =========================================================
   2. GET ONE PAGE OF TESTS FOR SELECTED CLASS

   API:
   getScertTestListbyFolder

   IMPORTANT:

   For THIS endpoint:

   cid = selected SCERT class id

   CLASS 5 -> cid=1
   CLASS 6 -> cid=2
   CLASS 7 -> cid=3

   filter = 0
   offset = API pagination offset

   DO NOT send:
   id: classId
========================================================= */

export async function getScertTestsPage({
  uid = 0,
  classId,
  filter = 0,
  offset = 0,
} = {}) {
  if (
    classId === undefined ||
    classId === null ||
    classId === ""
  ) {
    return {
      status: false,
      view: "",
      data: [],
      nextOffset: null,
    };
  }

  try {
    const result =
      await postScertRequest(
        "getScertTestListbyFolder",
        {
          uid,

          // Selected SCERT class id
          cid:
            classId,

          filter,

          offset,
        }
      );

    const tests =
      Array.isArray(
        result?.data
      )
        ? result.data
        : [];

    console.log(
      "SCERT TEST PAGE:",
      {
        classId,
        backendCid:
          classId,
        filter,
        offset,

        nextOffset:
          result?.nextoffset ??
          null,

        testsCount:
          tests.length,
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
        tests,

      nextOffset:
        result?.nextoffset ??
        null,
    };
  } catch (error) {
    console.error(
      "getScertTestsPage:",
      error
    );

    return {
      status: false,
      view: "",
      data: [],
      nextOffset: null,
    };
  }
}

/* =========================================================
   3. GET ALL TESTS FOR SELECTED CLASS

   Automatically follows nextoffset.

   Example:

   CLASS 7
   first:
   cid=3
   filter=0
   offset=0

   API gives:
   nextoffset=50

   second:
   cid=3
   filter=0
   offset=50
========================================================= */

export async function getScertTestsByClassId({
  uid = 0,
  classId,
  filter = 0,
} = {}) {
  if (
    classId === undefined ||
    classId === null ||
    classId === ""
  ) {
    return {
      status: false,
      view: "",
      data: [],
      nextOffset: null,
    };
  }

  try {
    const allTests = [];

    const visitedOffsets =
      new Set();

    let offset = 0;

    let view = "";

    let safetyCount = 0;

    let requestSucceeded =
      false;

    while (
      safetyCount < 100
    ) {
      /*
        Prevent accidental infinite loops
        if backend repeats an offset.
      */

      const offsetKey =
        String(offset);

      if (
        visitedOffsets.has(
          offsetKey
        )
      ) {
        break;
      }

      visitedOffsets.add(
        offsetKey
      );

      const result =
        await getScertTestsPage({
          uid,

          classId,

          filter,

          offset,
        });

      if (!result?.status) {
        break;
      }

      requestSucceeded =
        true;

      if (
        !view &&
        result?.view
      ) {
        view =
          result.view;
      }

      const pageTests =
        Array.isArray(
          result?.data
        )
          ? result.data
          : [];

      allTests.push(
        ...pageTests
      );

      const nextOffset =
        result?.nextOffset;

      /*
        No more backend pages.
      */

      if (
        nextOffset === null ||
        nextOffset === undefined ||
        nextOffset === ""
      ) {
        break;
      }

      /*
        Backend returned same offset.
      */

      if (
        String(nextOffset) ===
        String(offset)
      ) {
        break;
      }

      offset =
        Number(nextOffset);

      if (
        Number.isNaN(offset)
      ) {
        break;
      }

      safetyCount += 1;
    }

    /*
      Remove duplicate exams
      in case API pages overlap.
    */

    const uniqueTests =
      Array.from(
        new Map(
          allTests
            .filter(
              (test) =>
                test?.id !==
                  undefined &&
                test?.id !==
                  null
            )
            .map(
              (test) => [
                String(
                  test.id
                ),
                test,
              ]
            )
        ).values()
      );

    console.log(
      "SCERT CLASS TESTS:",
      {
        classId,

        backendCid:
          classId,

        filter,

        total:
          uniqueTests.length,

        exams:
          uniqueTests.map(
            (test) => ({
              id:
                test?.id,

              examName:
                test?.exam_name,
            })
          ),
      }
    );

    return {
      status:
        requestSucceeded,

      view,

      data:
        uniqueTests,

      nextOffset: null,
    };
  } catch (error) {
    console.error(
      "getScertTestsByClassId:",
      error
    );

    return {
      status: false,
      view: "",
      data: [],
      nextOffset: null,
    };
  }
}

/* =========================================================
   4. GET SCERT EXAM DETAILS + INSTRUCTIONS

   API:
   getMockTestDetails

   NOTE:
   Here cid remains Kerala PSC/course cid = 1.

   Fields:
   uid
   cid
   offset
   type=scert
   examid
========================================================= */

export async function getScertExamDetails({
  uid = 0,
  cid = 1,
  examId,
  offset = 0,
} = {}) {
  if (!examId) {
    return {
      status: false,
      view: "",
      exam: null,
      instructions: [],
    };
  }

  try {
    const result =
      await postScertRequest(
        "getMockTestDetails",
        {
          uid,
          cid,
          offset,

          type:
            "scert",

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
        : result?.exam ||
          null;

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
      "getScertExamDetails:",
      error
    );

    return {
      status: false,
      view: "",
      exam: null,
      instructions: [],
    };
  }
}

/* =========================================================
   5. GET SCERT QUESTIONS

   API:
   getMockTestQuestions

   NOTE:
   Here cid remains Kerala PSC/course cid = 1.

   Fields:
   uid
   cid
   examid
   examtype=scert
========================================================= */

export async function getScertQuestions({
  uid = 0,
  cid = 1,
  examId,
} = {}) {
  if (!examId) {
    return {
      status: false,
      imagePath: "",
      data: [],
    };
  }

  try {
    const result =
      await postScertRequest(
        "getMockTestQuestions",
        {
          uid,
          cid,

          examid:
            examId,

          examtype:
            "scert",
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
      "getScertQuestions:",
      error
    );

    return {
      status: false,
      imagePath: "",
      data: [],
    };
  }
}

/* =========================================================
   COMMON EXAM ATTEMPT REQUEST
========================================================= */

async function sendExamAttempt(
  endpoint,
  payload = {}
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
    payload
  ).forEach(
    ([key, value]) => {
      appendFormValue(
        formData,
        key,
        value
      );
    }
  );

  const url =
    `${cleanBaseUrl(
      API_BASE_URL
    )}/${endpoint}`;

  const response =
    await fetch(url, {
      method: "POST",

      body:
        formData,

      cache:
        "no-store",
    });

  if (!response.ok) {
    const errorText =
      await response.text();

    console.error(
      `${endpoint} ERROR:`,
      {
        status:
          response.status,

        response:
          errorText,
      }
    );

    throw new Error(
      `${endpoint} failed: ${response.status}`
    );
  }

  return response.json();
}

/* =========================================================
   CREATE FIRST EXAM ATTEMPT

   API:
   setNewUserExams
========================================================= */

export async function createUserExamAttempt(
  payload
) {
  try {
    return await sendExamAttempt(
      "setNewUserExams",
      payload
    );
  } catch (error) {
    console.error(
      "createUserExamAttempt:",
      error
    );

    return {
      status: false,

      message:
        "Unable to save exam",
    };
  }
}

/* =========================================================
   UPDATE EXISTING EXAM ATTEMPT

   API:
   setUpdateUserExams
========================================================= */

export async function updateUserExamAttempt(
  payload
) {
  try {
    return await sendExamAttempt(
      "setUpdateUserExams",
      payload
    );
  } catch (error) {
    console.error(
      "updateUserExamAttempt:",
      error
    );

    return {
      status: false,

      message:
        "Unable to update exam",
    };
  }
}