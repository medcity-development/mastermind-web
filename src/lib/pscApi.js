
import "server-only";

import {
  createSlug,
  normalizeCourseSlug,
} from "@/lib/pscSlug";

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
    apiBaseUrl:
      String(apiBaseUrl)
        .trim()
        .replace(/\/+$/, ""),

    apiKey:
      String(apiKey)
        .trim(),
  };
}


function requireCid(
  cid
) {
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

async function postRequest({
  endpoint,
  fields = {},
  cache,
  revalidate = 3600,
} = {}) {
  const {
    apiBaseUrl,
    apiKey,
  } = getApiConfig();

  if (!endpoint) {
    throw new Error(
      "API endpoint is required."
    );
  }

    const cleanEndpoint =
    String(endpoint)
      .trim()
      .replace(/^\/+/, "");

  const url =
    `${apiBaseUrl}/${cleanEndpoint}`;

  
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

    body:
      formData,

    headers: {
      Accept:
        "application/json",
    },

    redirect:
      "follow",
  };


  if (cache) {
    fetchOptions.cache =
      cache;
  } else {
    fetchOptions.next = {
      revalidate,
    };
  }


  let response;

  try {
    response =
      await fetch(
        url,
        fetchOptions
      );
  } catch (error) {
    console.error(
      "PSC API FETCH ERROR:",
      {
        endpoint:
          cleanEndpoint,

        url,

        fields,

        error,
      }
    );

    throw new Error(
      `${cleanEndpoint} request failed.`
    );
  }


  const text =
    await response.text();

  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

 
  if (!text.trim()) {
    console.error(
      "PSC API EMPTY RESPONSE:",
      {
        endpoint:
          cleanEndpoint,

        requestUrl:
          url,

        responseUrl:
          response.url,

        status:
          response.status,

        contentType,

        fields,
      }
    );

    throw new Error(
      `${cleanEndpoint} returned an empty response.`
    );
  }

  
  let result;

  try {
    result =
      JSON.parse(text);
  } catch (error) {
    const preview =
      text.slice(
        0,
        1500
      );

    console.error(
      "PSC API INVALID JSON:",
      {
        endpoint:
          cleanEndpoint,

        requestUrl:
          url,

        responseUrl:
          response.url,

        status:
          response.status,

        statusText:
          response.statusText,

        redirected:
          response.redirected,

        contentType,

        fields,

        responseText:
          preview,
      }
    );

    const normalizedText =
      text
        .trim()
        .toLowerCase();

    const isHtml =
      normalizedText.startsWith(
        "<!doctype"
      ) ||
      normalizedText.startsWith(
        "<html"
      );

    if (isHtml) {
      throw new Error(
        `${cleanEndpoint} returned HTML instead of JSON.`
      );
    }

    throw new Error(
      `${cleanEndpoint} returned invalid JSON.`
    );
  }

 
  if (!response.ok) {
    console.error(
      "PSC API HTTP ERROR:",
      {
        endpoint:
          cleanEndpoint,

        status:
          response.status,

        result,
      }
    );

    throw new Error(
      result?.message ||
        `${cleanEndpoint} failed with status ${response.status}.`
    );
  }

  return result;
}


export async function getMainCourses() {
  try {
    const result =
      await postRequest({
        endpoint:
          "getCourses",

        revalidate:
          3600,
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

      message:
        result?.message ??
        "",

      raw:
        result,
    };
  } catch (error) {
    console.error(
      "getMainCourses:",
      error
    );

    return {
      status: false,

      filePath: "",

      courses: [],

      message:
        error?.message ||
        "Unable to load main courses.",

      raw: null,
    };
  }
}


export async function getHomeResponses({
  cid,
  uid = 0,
} = {}) {
  try {
    const safeCid =
      requireCid(cid);

    const result =
      await postRequest({
        endpoint:
          "getHomeResponses",

        fields: {
          uid:
            String(
              uid ?? 0
            ),

          cid:
            safeCid,
        },

        revalidate:
          3600,
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

      message:
        result?.message ??
        "",

      raw:
        result,
    };
  } catch (error) {
    console.error(
      "getHomeResponses:",
      error
    );

    return {
      status: false,

      gridIconPath: "",
      categoryIconPath: "",
      subcategoryIconPath: "",
      sliderImagePath: "",
      subjectIconPath: "",
      packageIconPath: "",
      subexamIconPath: "",
      rankfilePath: "",

      grid: [],

      message:
        error?.message ||
        "Unable to load home responses.",

      raw: null,
    };
  }
}

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

          uid:
            String(
              uid ?? 0
            ),
        },

        cache:
          "no-store",
      });

   
    const rawCategories =
      Array.isArray(
        result?.data
      )
        ? result.data
        : Array.isArray(
            result?.categories
          )
          ? result.categories
          : [];


    const categories =
      rawCategories.filter(
        (item) => {
          const status =
            String(
              item?.status ??
                "1"
            )
              .trim()
              .toLowerCase();

          return (
            status === "1" ||
            status === "active"
          );
        }
      );

    return {
      status:
        result?.status !==
        false,

      filePath:
        String(
          result?.file_path ??
            result?.filePath ??
            result?.icon_path ??
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

      raw: null,
    };
  }
}


export async function getSubExams({
  cid,
  uid = 0,
  subId,
} = {}) {
  try {
    const safeCid =
      requireCid(cid);

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

        raw: null,
      };
    }

       const result =
      await postRequest({
        endpoint:
          "getSubExamsList",

        fields: {
          cid:
            safeCid,

          uid:
            String(
              uid ?? 0
            ),

          /*
           * IMPORTANT:
           * backend expects sub_id,
           * not subId.
           */
          sub_id:
            String(
              subId
            ),
        },

        cache:
          "no-store",
      });

   
    const rawExams =
      Array.isArray(
        result?.data
      )
        ? result.data
        : Array.isArray(
            result?.exams
          )
          ? result.exams
          : [];

       const exams =
      rawExams.filter(
        (item) => {
          const status =
            String(
              item?.status ??
                "1"
            )
              .trim()
              .toLowerCase();

          return (
            status === "1" ||
            status === "active"
          );
        }
      );

    return {
      status:
        result?.status !==
        false,

      iconPath:
        String(
          result?.icon_path ??
            result?.file_path ??
            result?.filePath ??
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

      raw: null,
    };
  }
}

export async function getMockExamSubCategories({
  cid,
  uid = 0,
  subId = 2,
} = {}) {
  try {
    const safeCid =
      requireCid(cid);

    if (
      subId === undefined ||
      subId === null ||
      subId === ""
    ) {
      return {
        status: false,

        categories: [],

        message:
          "subId is required.",

        raw: null,
      };
    }

       const result =
      await postRequest({
        endpoint:
          "getMockExamSubcategories",

        fields: {
          cid:
            safeCid,

          uid:
            String(
              uid ?? 0
            ),

          /*
           * Backend expects:
           * subid
           */
          subid:
            String(
              subId
            ),
        },

        cache:
          "no-store",
      });

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
        result?.status !==
        false,

      categories,

      message:
        result?.message ??
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

      raw: null,
    };
  }
}

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
          uid:
            String(
              uid ?? 0
            ),

          cid:
            safeCid,

          offset:
            String(
              offset ?? 0
            ),
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

      raw: null,
    };
  }
}

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
          uid:
            String(
              uid ?? 0
            ),

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

      raw: null,
    };
  }
}

export {
  createSlug,
  normalizeCourseSlug,
};