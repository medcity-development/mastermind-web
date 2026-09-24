const API_BASE_URL =
  process.env.PSC_API_BASE_URL;

const API_KEY =
  process.env.PSC_API_KEY;

/* =========================================================
   COMMON POST REQUEST
========================================================= */

async function postCurrentAffairsApi(
  endpoint,
  fields = {}
) {
  if (!API_BASE_URL) {
    throw new Error(
      "PSC_API_BASE_URL is not defined."
    );
  }

  if (!API_KEY) {
    throw new Error(
      "PSC_API_KEY is not defined."
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

  const response =
    await fetch(
      `${API_BASE_URL}/${endpoint}`,
      {
        method: "POST",
        body: formData,

        cache: "no-store",
      }
    );

  const text =
    await response.text();

  if (!response.ok) {
    console.error(
      `${endpoint} API error:`,
      {
        status:
          response.status,

        response:
          text,
      }
    );

    throw new Error(
      `${endpoint} failed with status ${response.status}`
    );
  }

  try {
    return JSON.parse(
      text
    );
  } catch {
    throw new Error(
      `${endpoint} returned invalid JSON.`
    );
  }
}

/* =========================================================
   GET ALL CURRENT AFFAIR MONTHS

   API returns 15 items per request.
   We keep requesting using nextoffset until finished.
========================================================= */

export async function getCurrentAffairMonths({
  uid = 0,
  cid = 1,
} = {}) {
  try {
    let offset = 0;

    let allMonths =
      [];

    const usedOffsets =
      new Set();

    /*
     * Safety limit prevents
     * accidental infinite loops.
     */
    for (
      let page = 0;
      page < 20;
      page++
    ) {
      if (
        usedOffsets.has(
          offset
        )
      ) {
        break;
      }

      usedOffsets.add(
        offset
      );

      const result =
        await postCurrentAffairsApi(
          "getCurrentAffairMonthsCid",
          {
            uid,
            cid,
            offset,
          }
        );

      const months =
        Array.isArray(
          result?.months
        )
          ? result.months
          : [];

      allMonths.push(
        ...months
      );

      const nextOffset =
        Number(
          result?.nextoffset
        );

      /*
       * No results means
       * pagination is finished.
       */
      if (
        months.length === 0
      ) {
        break;
      }

      /*
       * If backend does not send
       * a valid next offset,
       * stop.
       */
      if (
        !Number.isFinite(
          nextOffset
        ) ||
        nextOffset <= offset
      ) {
        break;
      }

      offset =
        nextOffset;
    }

    /* =============================================
       REMOVE DUPLICATES
    ============================================= */

    const uniqueMonths =
      Array.from(
        new Map(
          allMonths.map(
            (item) => [
              item?.id ??
                `${item?.month}-${item?.year}`,
              item,
            ]
          )
        ).values()
      );

    /* =============================================
       SORT LATEST FIRST
    ============================================= */

    uniqueMonths.sort(
      (a, b) => {
        const yearDiff =
          Number(
            b?.year
          ) -
          Number(
            a?.year
          );

        if (yearDiff !== 0) {
          return yearDiff;
        }

        return (
          Number(
            b?.monthorder
          ) -
          Number(
            a?.monthorder
          )
        );
      }
    );

    /* =============================================
       BUILD YEARS
    ============================================= */

    const years =
      [
        ...new Set(
          uniqueMonths
            .map(
              (item) =>
                Number(
                  item?.year
                )
            )
            .filter(
              Boolean
            )
        ),
      ].sort(
        (a, b) =>
          b - a
      );

    return {
      status: true,

      months:
        uniqueMonths,

      years,
    };
  } catch (error) {
    console.error(
      "Current affairs months failed:",
      error
    );

    return {
      status: false,
      months: [],
      years: [],
    };
  }
}

/* =========================================================
   GET DATES FOR SELECTED MONTH

   cid = current affair month id
========================================================= */

export async function getCurrentAffairDates({
  uid = 0,
  cid,
} = {}) {
  try {
    if (!cid) {
      return [];
    }

    const result =
      await postCurrentAffairsApi(
        "getCurrentAffairDate",
        {
          uid,
          cid,
        }
      );

    return Array.isArray(
      result?.date
    )
      ? result.date
      : [];
  } catch (error) {
    console.error(
      "Current affair dates failed:",
      error
    );

    return [];
  }
}

/* =========================================================
   GET CONTENT FOR SELECTED DATE
========================================================= */

export async function getCurrentAffairData({
  uid = 0,
  cid,
  date,
} = {}) {
  try {
    if (
      !cid ||
      !date
    ) {
      return {
        data: [],
        filePath: "",
      };
    }

    const result =
      await postCurrentAffairsApi(
        "getCurrentAffairData",
        {
          uid,
          cid,
          date,
        }
      );

    return {
      data:
        Array.isArray(
          result?.data
        )
          ? result.data
          : [],

      filePath:
        String(
          result?.file_path ??
            ""
        ),
    };
  } catch (error) {
    console.error(
      "Current affair data failed:",
      error
    );

    return {
      data: [],
      filePath: "",
    };
  }
}