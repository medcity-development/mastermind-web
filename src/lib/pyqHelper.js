// src/lib/pyqHelper.js

export async function getPreviousQuestions({
  uid = 0,
  cid,
  subId,
  offset = 0,
  type = "pqp",
  filter = 0,
} = {}) {
  try {
    const formData =
      new FormData();

    formData.append(
      "api",
      process.env.PSC_API_KEY
    );

    formData.append(
      "uid",
      String(uid)
    );

    if (cid != null) {
      formData.append(
        "cid",
        String(cid)
      );
    }

    if (subId != null) {
      formData.append(
        "subid",
        String(subId)
      );
    }

    formData.append(
      "offset",
      String(offset)
    );

    formData.append(
      "type",
      String(type)
    );

    formData.append(
      "filter",
      String(filter)
    );

    const response =
      await fetch(
        `${process.env.PSC_API_BASE_URL}/getPQPTestListbyOffset`,
        {
          method: "POST",
          body: formData,
          cache: "no-store",
        }
      );

    if (!response.ok) {
      throw new Error(
        `PQP API failed: ${response.status}`
      );
    }

    const result =
      await response.json();

    return {
      status:
        result?.status ??
        false,

      view:
        result?.view ??
        "",

      nextOffset:
        result?.nextoffset ??
        result?.nextOffset ??
        null,

      data:
        Array.isArray(
          result?.data
        )
          ? result.data
          : [],
    };
  } catch (error) {
    console.error(
      "getPreviousQuestions:",
      error
    );

    return {
      status: false,
      view: "",
      nextOffset: null,
      data: [],
    };
  }
}