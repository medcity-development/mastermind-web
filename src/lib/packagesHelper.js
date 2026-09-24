import "server-only";

const PSC_API_BASE_URL =
  process.env.PSC_API_BASE_URL;

const PSC_API_KEY =
  process.env.PSC_API_KEY;

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
   API CONFIG
========================================================= */

function getApiConfig() {
  if (!PSC_API_BASE_URL) {
    throw new Error(
      "PSC_API_BASE_URL is missing."
    );
  }

  if (!PSC_API_KEY) {
    throw new Error(
      "PSC_API_KEY is missing."
    );
  }

  return {
    apiBaseUrl:
      String(
        PSC_API_BASE_URL
      ).replace(
        /\/+$/,
        ""
      ),

    apiKey:
      String(
        PSC_API_KEY
      ).trim(),
  };
}

/* =========================================================
   VALID CID
========================================================= */

function hasValidCid(
  cid
) {
  return !(
    cid === undefined ||
    cid === null ||
    cid === ""
  );
}

/* =========================================================
   CREATE IMAGE URL
========================================================= */

function createImageUrl(
  iconPath,
  icon
) {
  if (
    !iconPath ||
    !icon
  ) {
    return null;
  }

  const iconValue =
    String(
      icon
    ).trim();

  if (
    /^https?:\/\//i.test(
      iconValue
    )
  ) {
    return iconValue;
  }

  const cleanPath =
    String(
      iconPath
    ).replace(
      /\/+$/,
      ""
    );

  const cleanIcon =
    iconValue.replace(
      /^\/+/,
      ""
    );

  return `${cleanPath}/${cleanIcon}`;
}

/* =========================================================
   SAFE JSON RESPONSE
========================================================= */

async function parseJsonResponse(
  response,
  endpoint
) {
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
      `${endpoint} invalid response:`,
      text.slice(
        0,
        500
      )
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
   PACKAGES LIST

   Dynamic:
   cid=1 -> Kerala PSC packages
   cid=2 -> RRB & SSC packages
========================================================= */

export async function getPackagesList({
  uid = 0,
  cid,
} = {}) {
  try {
    if (!hasValidCid(cid)) {
      console.error(
        "getPackagesList: cid is required."
      );

      return [];
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
        `${apiBaseUrl}/getPackagesList`,
        {
          method:
            "POST",

          body:
            formData,

          next: {
            revalidate:
              3600,
          },
        }
      );

    const result =
      await parseJsonResponse(
        response,
        "getPackagesList"
      );

    const iconPath =
      String(
        result?.icon_path ??
          ""
      );

    const rawPackages =
      Array.isArray(
        result?.data
      )
        ? result.data
        : [];

    return rawPackages
      .filter(
        (item) =>
          item?.id &&
          item?.package
      )
      .filter(
        (item) => {
          /*
           * If API gives cid,
           * enforce current exam.
           *
           * If API doesn't give cid,
           * keep the package because
           * request itself was already
           * made with correct cid.
           */
          if (
            item?.cid ===
              undefined ||
            item?.cid ===
              null ||
            item?.cid ===
              ""
          ) {
            return true;
          }

          return (
            Number(
              item.cid
            ) ===
            Number(cid)
          );
        }
      )
      .map(
        (item) => ({
          id:
            item.id,

          cid:
            item?.cid ??
            cid,

          title:
            item?.package ??
            "",

          package:
            item?.package ??
            "",

          tag:
            item?.tag ??
            "",

          slug:
            createSlug(
              item?.package
            ),

          icon:
            item?.icon ??
            "",

          iconPath,

          imageUrl:
            createImageUrl(
              iconPath,
              item?.icon
            ),

          course:
            item?.course ??
            "",

          type:
            item?.type ??
            "",

          bgHex:
            item?.bgHex ??
            item?.bghex ??
            "",

          purchaseAvailable:
            String(
              item?.purchase ??
                ""
            ).toLowerCase() ===
            "active",

          raw:
            item,
        })
      );
  } catch (error) {
    console.error(
      "getPackagesList error:",
      error
    );

    return [];
  }
}

/* =========================================================
   PACKAGE DETAILS

   Dynamic:
   caller MUST provide cid
========================================================= */

export async function getPackageDetails({
  uid = 0,
  cid,
  pid,
} = {}) {
  try {
    if (!hasValidCid(cid)) {
      console.error(
        "getPackageDetails: cid is required."
      );

      return null;
    }

    if (
      pid === undefined ||
      pid === null ||
      pid === ""
    ) {
      console.error(
        "getPackageDetails: pid is required."
      );

      return null;
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

    formData.append(
      "pid",
      String(pid)
    );

    const response =
      await fetch(
        `${apiBaseUrl}/getPackagesDetails`,
        {
          method:
            "POST",

          body:
            formData,

          next: {
            revalidate:
              3600,
          },
        }
      );

    const result =
      await parseJsonResponse(
        response,
        "getPackagesDetails"
      );

    if (
      result?.status !== true
    ) {
      console.error(
        "getPackagesDetails returned unsuccessful status:",
        result?.message ??
          ""
      );

      return null;
    }

    /* =====================================================
       MAIN PACKAGE
    ===================================================== */

    const packageItem =
      Array.isArray(
        result?.data
      )
        ? result.data[0] ??
          null
        : null;

    if (!packageItem) {
      return null;
    }

    /*
     * Extra protection:
     * if backend returns cid,
     * ensure package belongs
     * to requested exam.
     */

    if (
      packageItem?.cid !==
        undefined &&
      packageItem?.cid !==
        null &&
      packageItem?.cid !==
        "" &&
      Number(
        packageItem.cid
      ) !==
        Number(cid)
    ) {
      console.error(
        "Package cid mismatch:",
        {
          requestedCid:
            cid,

          returnedCid:
            packageItem.cid,

          pid,
        }
      );

      return null;
    }

    /* =====================================================
       IMAGE
    ===================================================== */

    const iconPath =
      String(
        result?.icon_path ??
          ""
      );

    const imageUrl =
      createImageUrl(
        iconPath,
        packageItem?.icon
      );

    /* =====================================================
       PRICE
    ===================================================== */

    const rawPrices =
      Array.isArray(
        result?.price
      )
        ? result.price
        : [];

    const priceItem =
      rawPrices.find(
        (item) =>
          String(
            item?.status
          ) === "1"
      ) ??
      rawPrices[0] ??
      null;

    const price =
      priceItem
        ? {
            current:
              priceItem?.price ??
              "",

            original:
              priceItem
                ?.striked_price ??
              "",

            subtotal:
              priceItem?.subtotal ??
              "",

            final:
              priceItem?.roundvalue ??
              priceItem?.price ??
              "",

            gst:
              priceItem?.gst ??
              "0",

            validity:
              priceItem?.validity ??
              "",

            days:
              priceItem?.days ??
              "",
          }
        : null;

    /* =====================================================
       FEATURES
    ===================================================== */

    const features =
      Array.isArray(
        result?.contains
      )
        ? [...result.contains]
            .filter(
              (item) =>
                item?.text &&
                String(
                  item?.status ??
                    "1"
                ) !== "0"
            )
            .sort(
              (a, b) =>
                Number(
                  a?.orders ??
                    0
                ) -
                Number(
                  b?.orders ??
                    0
                )
            )
            .map(
              (item) =>
                item.text
            )
        : [];

    /* =====================================================
       INCLUDED COURSES
    ===================================================== */

    const courses =
      Array.isArray(
        result?.courses
      )
        ? result.courses
            .filter(
              (course) =>
                course?.exam
            )
            .map(
              (course) => ({
                id:
                  course?.id ??
                  null,

                cid:
                  course?.cid ??
                  cid,

                title:
                  course?.exam ??
                  "",

                exam:
                  course?.exam ??
                  "",

                subId:
                  course?.sub_id ??
                  course?.subId ??
                  null,

                icon:
                  course?.icon ??
                  "",

                imageUrl:
                  createImageUrl(
                    result?.course_icon_path ??
                      result?.icon_path ??
                      "",

                    course?.icon
                  ),
              })
            )
        : [];

    /* =====================================================
       SAFE PUBLIC DATA
    ===================================================== */

    return {
      id:
        packageItem?.id ??
        null,

      cid:
        packageItem?.cid ??
        cid,

      title:
        packageItem?.package ??
        "",

      package:
        packageItem?.package ??
        "",

      tag:
        packageItem?.tag ??
        "",

      description:
        packageItem
          ?.description ??
        "",

      slug:
        createSlug(
          packageItem?.package
        ),

      icon:
        packageItem?.icon ??
        "",

      iconPath,

      imageUrl,

      type:
        packageItem?.type ??
        "",

      bgHex:
        packageItem?.bgHex ??
        packageItem?.bghex ??
        "",

      purchaseAvailable:
        String(
          packageItem
            ?.purchase ??
            ""
        ).toLowerCase() ===
        "active",

      premium:
        Boolean(
          result?.premium
        ),

      price,

      features,

      courses,
    };
  } catch (error) {
    console.error(
      "getPackageDetails error:",
      error
    );

    return null;
  }
}