/* =========================================================
   BASE URL
========================================================= */

function cleanBaseUrl(
  value = ""
) {
  return String(value)
    .trim()
    .replace(/\/+$/, "");
}

/* =========================================================
   SAFE JSON
========================================================= */

async function readJsonResponse(
  response
) {
  const raw =
    await response.text();

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/* =========================================================
   MOCK EXAM NAME
========================================================= */

export async function getMockExamName({
  cid,
  uid,
  examId,
} = {}) {
  try {
    const safeCid =
      Number(cid);

    const safeUid =
      Number(uid);

    const safeExamId =
      Number(examId);

    if (
      !Number.isFinite(safeCid) ||
      safeCid <= 0 ||
      !Number.isFinite(safeUid) ||
      safeUid <= 0 ||
      !Number.isFinite(safeExamId) ||
      safeExamId <= 0
    ) {
      return "";
    }

    const apiBaseUrl =
      cleanBaseUrl(
        process.env
          .PSC_API_BASE_URL
      );

    const apiKey =
      process.env
        .PSC_API_KEY;

    if (
      !apiBaseUrl ||
      !apiKey
    ) {
      return "";
    }

    const formData =
      new FormData();

    formData.append(
      "api",
      apiKey
    );

    formData.append(
      "cid",
      String(safeCid)
    );

    formData.append(
      "uid",
      String(safeUid)
    );

    formData.append(
      "examid",
      String(safeExamId)
    );

    const response =
      await fetch(
        `${apiBaseUrl}/getMockTestDetails`,
        {
          method:
            "POST",

          body:
            formData,

          cache:
            "no-store",

          headers: {
            Accept:
              "application/json",
          },
        }
      );

    if (!response.ok) {
      return "";
    }

    const result =
      await readJsonResponse(
        response
      );

    const exam =
      Array.isArray(
        result?.exam
      )
        ? result.exam[0] ??
          null
        : result?.exam &&
            typeof result.exam ===
              "object"
          ? result.exam
          : null;

    if (!exam) {
      return "";
    }

    return String(
      exam?.exam_name ??
      exam?.examName ??
      exam?.exam_title ??
      exam?.examTitle ??
      exam?.title ??
      exam?.name ??
      ""
    ).trim();
  } catch (error) {
    console.error(
      "GET MOCK EXAM NAME:",
      error
    );

    return "";
  }
}

/* =========================================================
   RESOLVE EXAM NAME

   Central place for history name resolution.

   More types such as pqp/scert/topicwise can be added
   here using their OWN details APIs.
========================================================= */

export async function resolveExamHistoryName({
  cid,
  uid,
  examId,
  examType,
  item,
} = {}) {
  /*
   * First use a real name already returned
   * by the history/database API.
   */
  const existingName =
    String(
      item?.exam_name ??
      item?.examName ??
      item?.exam_title ??
      item?.examTitle ??
      item?.test_name ??
      item?.testName ??
      item?.title ??
      item?.name ??
      ""
    ).trim();

  if (existingName) {
    return existingName;
  }

  const type =
    String(
      examType ?? ""
    )
      .trim()
      .toLowerCase();

  /*
   * Mock attempts currently do not contain
   * their exam name, so resolve it from
   * getMockTestDetails.
   */
  if (type === "mock") {
    return getMockExamName({
      cid,
      uid,
      examId,
    });
  }

  /*
   * Do NOT invent a name.
   *
   * When you add PYQ / SCERT / topicwise,
   * resolve them here using their real
   * details endpoint.
   */
  return "";
}