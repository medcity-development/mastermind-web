import "server-only";

/* =========================================================
   API CONFIG
========================================================= */

function getApiConfig() {
  const apiBaseUrl =
    process.env.PSC_API_BASE_URL;

  const apiKey =
    process.env.PSC_API_KEY;

  if (!apiBaseUrl) {
    throw new Error(
      "PSC_API_BASE_URL is missing."
    );
  }

  if (!apiKey) {
    throw new Error(
      "PSC_API_KEY is missing."
    );
  }

  return {
    apiBaseUrl: String(
      apiBaseUrl
    )
      .trim()
      .replace(/\/+$/, ""),

    apiKey: String(
      apiKey
    ).trim(),
  };
}

/* =========================================================
   VALIDATE CID
========================================================= */

function requireCid(cid) {
  if (
    cid === undefined ||
    cid === null ||
    cid === ""
  ) {
    throw new Error(
      "Course ID is required."
    );
  }

  return String(cid);
}

/* =========================================================
   COMMON POST REQUEST
========================================================= */

async function postRequest({
  endpoint,
  fields = {},
  revalidate = 3600,
  cache,
}) {
  const {
    apiBaseUrl,
    apiKey,
  } = getApiConfig();

  const formData =
    new FormData();

  formData.append(
    "api",
    apiKey
  );

  Object.entries(
    fields
  ).forEach(
    ([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return;
      }

      formData.append(
        key,
        String(value)
      );
    }
  );

  const fetchOptions = {
    method: "POST",
    body: formData,
  };

  if (cache) {
    fetchOptions.cache =
      cache;
  } else {
    fetchOptions.next = {
      revalidate,
    };
  }

  const response =
    await fetch(
      `${apiBaseUrl}/${endpoint}`,
      fetchOptions
    );

  const text =
    await response.text();

  let result = {};

  try {
    result =
      text
        ? JSON.parse(text)
        : {};
  } catch (error) {
    console.error(
      "PSC API INVALID JSON:",
      {
        endpoint,

        status:
          response.status,

        contentType:
          response.headers.get(
            "content-type"
          ),

        fields,

        responseText:
          text.slice(
            0,
            1000
          ),
      }
    );

    throw new Error(
      `${endpoint} returned invalid JSON.`
    );
  }

  if (!response.ok) {
    throw new Error(
      result?.message ||
        `${endpoint} failed with status ${response.status}`
    );
  }

  return result;
}

/* =========================================================
   GET MAIN COURSES
========================================================= */

export async function getMainCourses() {
  const result =
    await postRequest({
      endpoint:
        "getCourses",
    });

  return {
    status:
      result?.status !==
      false,

    filePath:
      String(
        result?.file_path ??
          result?.icon_path ??
          ""
      ),

    courses:
      Array.isArray(
        result?.data
      )
        ? result.data
        : [],

    raw:
      result,
  };
}

/* =========================================================
   GET HOME RESPONSES
========================================================= */

export async function getHomeResponses({
  cid,
  uid = 0,
} = {}) {
  const safeCid =
    requireCid(cid);

  const result =
    await postRequest({
      endpoint:
        "getHomeResponses",

      fields: {
        uid,
        cid:
          safeCid,
      },
    });

  return {
    status:
      result?.status !==
      false,

    gridIconPath:
      String(
        result?.grid_icon_path ??
          ""
      ),

    categoryIconPath:
      String(
        result?.category_icon_path ??
          ""
      ),

    subcategoryIconPath:
      String(
        result?.subcategory_icon_path ??
          ""
      ),

    sliderImagePath:
      String(
        result?.slider_image_path ??
          ""
      ),

    subjectIconPath:
      String(
        result?.subject_icon_path ??
          ""
      ),

    packageIconPath:
      String(
        result?.package_icon_path ??
          ""
      ),

    subexamIconPath:
      String(
        result?.subexam_icon_path ??
          ""
      ),

    rankfilePath:
      String(
        result?.rankfile_path ??
          ""
      ),

    grid:
      Array.isArray(
        result?.grid
      )
        ? result.grid
        : [],

    raw:
      result,
  };
}

/* =========================================================
   GET SUB CATEGORIES

   Dynamic by cid

   cid = 1
   -> Kerala PSC categories

   cid = 2
   -> RRB / SSC categories
========================================================= */

export async function getSubCategories({
  cid,
  uid = 0,
} = {}) {
  try {
    const safeCid =
      requireCid(cid);

    const result =
      await postRequest({
        endpoint:
          "getSubCategoriesNew",

        fields: {
          cid:
            safeCid,

          uid,
        },

        cache:
          "no-store",
      });

    const categories =
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
        result?.status !==
        false,

      filePath:
        String(
          result?.file_path ??
            result?.filePath ??
            ""
        ),

      categories,

      message:
        result?.message ??
        "",

      raw:
        result,
    };
  } catch (error) {
    console.error(
      "getSubCategories:",
      error
    );

    return {
      status: false,
      filePath: "",
      categories: [],
      message:
        error?.message ||
        "Unable to load exam categories.",
    };
  }
}
/* =========================================================
   GET SUB EXAMS

   Fully dynamic:

   cid
   -> Main course ID

   subId
   -> Selected category / level ID

   uid
   -> User ID, default 0

   Examples:

   cid = 1
   subId = 3
   -> Kerala PSC
   -> 10th Level exams

   cid = 2
   subId = 4
   -> RRB & SSC
   -> corresponding exams

   No course ID is hardcoded here.
========================================================= */

export async function getSubExams({
  cid,
  uid = 0,
  subId,
} = {}) {
  try {
    /* =====================================================
       VALIDATE CID
    ===================================================== */

    const safeCid =
      requireCid(cid);

    /* =====================================================
       VALIDATE SUB CATEGORY
    ===================================================== */

    if (
      subId === undefined ||
      subId === null ||
      subId === ""
    ) {
      return {
        status: false,
        iconPath: "",
        exams: [],
        message:
          "Sub category ID is required.",
      };
    }

    /* =====================================================
       REQUEST

       IMPORTANT:

       Backend expects:
       sub_id

       not:
       subId
    ===================================================== */

    const result =
      await postRequest({
        endpoint:
          "getSubExamsList",

        fields: {
          cid:
            safeCid,

          uid,

          sub_id:
            subId,
        },

        cache:
          "no-store",
      });

    /* =====================================================
       NORMALIZE RESPONSE
    ===================================================== */

    const exams =
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
        result?.status !==
        false,

      iconPath:
        String(
          result?.icon_path ??
            result?.file_path ??
            ""
        ),

      exams,

      message:
        result?.message ??
        "",

      raw:
        result,
    };
  } catch (error) {
    console.error(
      "getSubExams:",
      error
    );

    return {
      status: false,

      iconPath: "",

      exams: [],

      message:
        error?.message ||
        "Unable to load sub exams.",
    };
  }
}

export async function getMockExamSubCategories({
  cid,
  uid = 0,
  subId = 2,
} = {}) {
  try {
    /* =====================================================
       VALIDATE
    ===================================================== */

    if (
      cid === undefined ||
      cid === null ||
      cid === ""
    ) {
      return {
        status: false,
        categories: [],
        message:
          "cid is required.",
      };
    }

    const apiKey =
      process.env.PSC_API_KEY;

    if (!apiKey) {
      return {
        status: false,
        categories: [],
        message:
          "PSC_API_KEY is missing.",
      };
    }

    /*
     * This endpoint was confirmed
     * separately in Postman.
     */

    const apiUrl =
      "http://psc.technocitysolutions.com/public/api/getMockExamSubcategories";

    /* =====================================================
       FORM DATA
    ===================================================== */

    const formData =
      new FormData();

    formData.append(
      "api",
      apiKey
    );

    formData.append(
      "cid",
      String(cid)
    );

    formData.append(
      "uid",
      String(uid)
    );

    /*
     * Backend field is:
     *
     * subid
     *
     * not subId.
     */

    formData.append(
      "subid",
      String(subId)
    );

    /* =====================================================
       REQUEST
    ===================================================== */

    const response =
      await fetch(
        apiUrl,
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

    /* =====================================================
       PARSE
    ===================================================== */

    let result;

    try {
      result =
        text
          ? JSON.parse(
              text
            )
          : {};
    } catch (error) {
      console.error(
        "MOCK CATEGORY INVALID JSON:",
        {
          status:
            response.status,

          responseText:
            text.slice(
              0,
              1000
            ),
        }
      );

      return {
        status: false,
        categories: [],
        message:
          "Mock category API returned invalid JSON.",
      };
    }

    /* =====================================================
       HTTP ERROR
    ===================================================== */

    if (!response.ok) {
      console.error(
        "MOCK CATEGORY API ERROR:",
        result
      );

      return {
        status: false,

        categories: [],

        message:
          result?.message ||
          `Mock category API failed with ${response.status}`,
      };
    }

    /* =====================================================
       NORMALIZE DATA
    ===================================================== */

    const categories =
      Array.isArray(
        result?.data
      )
        ? result.data
            .filter(
              (item) =>
                item?.id !==
                  undefined &&
                item?.id !==
                  null &&
                String(
                  item?.subcourse ??
                    ""
                ).trim()
            )
            .map(
              (item) => ({
                ...item,

                id:
                  Number(
                    item.id
                  ),

                subcourse:
                  String(
                    item.subcourse
                  ).trim(),
              })
            )
        : [];

    return {
      status:
        result?.status ===
        true,

      categories,

      message:
        result?.message ||
        "",

      raw:
        result,
    };
  } catch (error) {
    console.error(
      "getMockExamSubCategories:",
      error
    );

    return {
      status: false,

      categories: [],

      message:
        error?.message ||
        "Unable to load mock exam categories.",
    };
  }
}

/* =========================================================
   GET EXAM NOTIFICATIONS

   Fully dynamic by cid.

   cid = 1
   -> Kerala PSC

   cid = 2
   -> RRB & SSC

   Future courses also work automatically
   if the backend supports that cid.
========================================================= */

/* =========================================================
   GET EXAM NOTIFICATIONS

   Dynamic by cid

   cid = 1
   -> Kerala PSC

   cid = 2
   -> RRB & SSC
========================================================= */

export async function getExamNotifications({
  cid,
  uid = 0,
  offset = 0,
} = {}) {
  try {
    const safeCid =
      requireCid(cid);

    const result =
      await postRequest({
        endpoint:
          "getPscNotificationsCid",

        fields: {
          uid,
          cid:
            safeCid,
          offset,
        },

        cache:
          "no-store",
      });

    return {
      status:
        result?.status !==
        false,

      nextOffset:
        result?.nextoffset ??
        result?.nextOffset ??
        null,

      filePath:
        String(
          result?.file_path ??
            result?.filePath ??
            ""
        ),

      notifications:
        Array.isArray(
          result?.data
        )
          ? result.data
          : [],

      message:
        result?.message ??
        "",

      raw:
        result,
    };
  } catch (error) {
    console.error(
      "getExamNotifications:",
      error
    );

    return {
      status: false,
      nextOffset: null,
      filePath: "",
      notifications: [],
      message:
        error?.message ||
        "Unable to load notifications.",
    };
  }
}

/* =========================================================
   CREATE SLUG
========================================================= */

export function createSlug(
  value = ""
) {
  return String(
    value ?? ""
  )
    .toLowerCase()
    .trim()
    .replace(
      /&/g,
      " and "
    )
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
}

/* =========================================================
   NORMALIZE COURSE SLUG
========================================================= */

export function normalizeCourseSlug(
  value = ""
) {
  return createSlug(
    String(
      value ?? ""
    ).replace(
      /-coaching$/i,
      ""
    )
  );
}
/* =========================================================
   GET EXAM SYLLABUS

   Dynamic by cid

   cid = 1
   -> Kerala PSC

   cid = 2
   -> RRB & SSC
========================================================= */

/* =========================================================
   GET EXAM SYLLABUS

   Dynamic by cid

   cid = 1
   -> Kerala PSC

   cid = 2
   -> RRB & SSC
========================================================= */

/* =========================================================
   GET EXAM SYLLABUS

   Dynamic by cid

   cid = 1
   -> Kerala PSC

   cid = 2
   -> RRB & SSC
========================================================= */

export async function getExamSyllabus({
  cid,
  uid = 0,
} = {}) {
  try {
    const safeCid =
      requireCid(cid);

    const result =
      await postRequest({
        endpoint:
          "getExamSyllabusCid",

        fields: {
          uid,
          cid:
            safeCid,
        },

        cache:
          "no-store",
      });

    return {
      status:
        result?.status !==
        false,

      filePath:
        String(
          result?.file_path ??
            result?.filePath ??
            ""
        ),

      syllabus:
        Array.isArray(
          result?.data
        )
          ? result.data
          : [],

      message:
        result?.message ??
        "",

      raw:
        result,
    };
  } catch (error) {
    console.error(
      "getExamSyllabus:",
      error
    );

    return {
      status: false,

      filePath: "",

      syllabus: [],

      message:
        error?.message ||
        "Unable to load syllabus.",
    };
  }
}