const API_BASE_URL =
  process.env.PSC_API_BASE_URL;

const API_KEY =
  process.env.PSC_API_KEY;

export async function getAiVideos({
  uid = 0,
} = {}) {
  try {
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

    formData.append(
      "uid",
      String(uid)
    );

    const endpoint =
      `${API_BASE_URL.replace(
        /\/+$/,
        ""
      )}/getReelsList`;

    const response =
      await fetch(
        endpoint,
        {
          method: "POST",
          body: formData,

          next: {
            revalidate: 3600,
          },
        }
      );

    if (!response.ok) {
      throw new Error(
        `getReelsList failed with ${response.status}`
      );
    }

    const result =
      await response.json();

    const thumbnailPath =
      result?.thumbnail_path ||
      "";

    const data =
      Array.isArray(
        result?.data
      )
        ? result.data
        : [];

    const videos =
      data
        .filter(
          (item) =>
            String(
              item?.status
            ) === "1"
        )
        .map(
          (item) => {
            const basePath =
              String(
                thumbnailPath
              ).replace(
                /\/+$/,
                ""
              );

            const thumbnail =
              String(
                item?.thumbnail ||
                  ""
              ).replace(
                /^\/+/,
                ""
              );

            return {
              ...item,

              thumbnailUrl:
                basePath &&
                thumbnail
                  ? `${basePath}/${thumbnail}`
                  : null,
            };
          }
        );

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