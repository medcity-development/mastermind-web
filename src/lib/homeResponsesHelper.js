import "server-only";

const API_BASE_URL =
  process.env.PSC_API_BASE_URL;

const API_KEY =
  process.env.PSC_API_KEY;

/* =========================================================
   API CONFIG
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
    apiBaseUrl:
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
   EXAM ICON BASE PATH

   API:
   http://psc.../public/api

   IMAGE:
   http://psc.../public/images/examicon/
========================================================= */

function getExamIconBaseUrl(
  apiBaseUrl
) {
  return String(
    apiBaseUrl
  )
    .replace(
      /\/api\/?$/i,
      ""
    )
    .replace(
      /\/+$/,
      ""
    )
    .concat(
      "/images/examicon"
    );
}

/* =========================================================
   BUILD IMAGE URL
========================================================= */

function buildImageUrl(
  baseUrl,
  icon
) {
  if (!icon) {
    return "";
  }

  const value =
    String(
      icon
    ).trim();

  if (
    /^https?:\/\//i.test(
      value
    )
  ) {
    return value;
  }

  const cleanBase =
    String(
      baseUrl
    ).replace(
      /\/+$/,
      ""
    );

  const cleanIcon =
    value.replace(
      /^\/+/,
      ""
    );

  return `${cleanBase}/${cleanIcon}`;
}

/* =========================================================
   GET HOME RESPONSES
========================================================= */

export async function getHomeResponses({
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
      apiBaseUrl,
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
        `${apiBaseUrl}/getHomeResponses`,
        {
          method:
            "POST",

          body:
            formData,

          next: {
            revalidate:
              300,
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
        "getHomeResponses invalid JSON:",
        text.slice(
          0,
          500
        )
      );

      throw new Error(
        "getHomeResponses returned invalid JSON."
      );
    }

    if (!response.ok) {
      throw new Error(
        result?.message ||
          `getHomeResponses failed with ${response.status}`
      );
    }

    /* =====================================================
       IMAGE BASE
    ===================================================== */

    const examIconBaseUrl =
      getExamIconBaseUrl(
        apiBaseUrl
      );

    /* =====================================================
       SUB EXAMS
    ===================================================== */

    const rawSubExams =
      Array.isArray(
        result?.subexams
      )
        ? result.subexams
        : [];

    const subExams =
      rawSubExams
        .filter(
          (item) =>
            String(
              item?.status ??
                "1"
            ) === "1"
        )

        /* IMPORTANT:
           prevent KPSC data
           appearing on RRB page
        */
        .filter(
          (item) =>
            Number(
              item?.cid
            ) ===
            Number(cid)
        )

        .map(
          (item) => ({
            ...item,

            imageUrl:
              buildImageUrl(
                examIconBaseUrl,

                /*
                 * Use icon first.
                 *
                 * Your screenshot proves
                 * icon works with:
                 * /images/examicon/
                 */
                item?.icon ??
                  ""
              ),
          })
        )

        .sort(
          (a, b) =>
            Number(
              a?.order ??
                999
            ) -
            Number(
              b?.order ??
                999
            )
        );

    return {
      status:
        Boolean(
          result?.status
        ),

      examIconBaseUrl,

      subExams,

      total:
        subExams.length,

      message:
        result?.message ??
        "",
    };
  } catch (error) {
    console.error(
      "getHomeResponses:",
      error
    );

    return {
      status: false,

      examIconBaseUrl:
        "",

      subExams: [],

      total: 0,

      message:
        error?.message ||
        "Unable to load recommended courses.",
    };
  }
}