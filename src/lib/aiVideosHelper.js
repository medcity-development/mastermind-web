// src/lib/aiVideosHelper.js

import "server-only";

const API_BASE_URL =
  process.env.PSC_API_BASE_URL;

const API_KEY =
  process.env.PSC_API_KEY;

/* =========================================================
   GET AI VIDEOS
========================================================= */

export async function getAiVideos({
  uid = 0,
} = {}) {
  try {
    /* =====================================================
       VALIDATE CONFIG
    ===================================================== */

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

    /* =====================================================
       CLEAN BASE URL
    ===================================================== */

    const baseUrl =
      String(
        API_BASE_URL
      ).replace(
        /\/+$/,
        ""
      );

    /* =====================================================
       FORM DATA
    ===================================================== */

    const formData =
      new FormData();

    formData.append(
      "api",
      API_KEY
    );

    formData.append(
      "uid",
      String(uid)
    );

    /* =====================================================
       REQUEST
    ===================================================== */

    const response =
      await fetch(
        `${baseUrl}/getReelsList`,
        {
          method: "POST",
          body: formData,
          cache: "no-store",
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
        "getReelsList invalid JSON:",
        text
      );

      throw new Error(
        "getReelsList returned invalid JSON"
      );
    }

    if (!response.ok) {
      throw new Error(
        result?.message ||
          `getReelsList failed with ${response.status}`
      );
    }

    /* =====================================================
       THUMBNAIL PATH
    ===================================================== */

    const thumbnailPath =
      String(
        result?.thumbnail_path ??
          ""
      ).replace(
        /\/+$/,
        ""
      );

    /* =====================================================
       RAW VIDEOS
    ===================================================== */

    const rawVideos =
      Array.isArray(
        result?.data
      )
        ? result.data
        : [];

    /* =====================================================
       NORMALIZE
    ===================================================== */

    const videos =
      rawVideos
        .filter((item) => {
          return (
            item?.status ===
              undefined ||
            item?.status ===
              null ||
            String(
              item?.status
            ) === "1"
          );
        })
        .map((item) => {
          const thumbnailFile =
            String(
              item?.thumbnail ??
                ""
            ).replace(
              /^\/+/,
              ""
            );

          const thumbnailUrl =
            thumbnailPath &&
            thumbnailFile
              ? `${thumbnailPath}/${thumbnailFile}`
              : null;

          const videoUrl =
            String(
              item?.link ??
                ""
            ).trim();

          return {
            /* KEEP ORIGINAL API FIELDS */
            ...item,

            /* NORMALIZED FIELDS */
            id:
              item?.id ??
              null,

            title:
              item?.title ??
              "AI Learning Video",

            description:
              item?.description ??
              "",

            thumbnail:
              thumbnailFile,

            thumbnailUrl,

            /*
             * Backend:
             * link
             *
             * Frontend:
             * videoUrl
             */
            videoUrl,

            status:
              item?.status ??
              "1",

            createdDate:
              item?.created_date ??
              "",
          };
        });

    return {
      status:
        Boolean(
          result?.status
        ),

      thumbnailPath,

      data:
        videos,

      total:
        videos.length,

      message:
        result?.message ??
        "",
    };
  } catch (error) {
    console.error(
      "getAiVideos:",
      error
    );

    return {
      status: false,
      thumbnailPath: "",
      data: [],
      total: 0,

      message:
        error?.message ||
        "Unable to load AI videos",
    };
  }
}