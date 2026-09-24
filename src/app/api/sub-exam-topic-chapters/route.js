import {
  NextResponse,
} from "next/server";

import {
  getSubExamTopicChapters,
} from "@/lib/subExamTopicHelper";

/* =========================================================
   NORMALIZE CHAPTER
========================================================= */

function normalizeChapter(
  item = {},
  thumbnailPath = "",
  notePath = ""
) {
  const videoUrl =
    item?.videourl ||
    item?.video_url ||
    item?.videoUrl ||
    "";

  const videoHls =
    item?.videohls ||
    item?.video_hls ||
    item?.videoHls ||
    "";

  const videoId =
    item?.videoId ||
    item?.video_id ||
    item?.videoid ||
    "";

  const thumbnail =
    item?.thumbnail ||
    item?.thumb ||
    "";

  let thumbnailUrl = "";

  if (thumbnail) {
    if (
      String(
        thumbnail
      ).startsWith("http")
    ) {
      thumbnailUrl =
        thumbnail;
    } else if (
      thumbnailPath
    ) {
      thumbnailUrl =
        `${String(
          thumbnailPath
        ).replace(
          /\/+$/,
          ""
        )}/${String(
          thumbnail
        ).replace(
          /^\/+/,
          ""
        )}`;
    }
  }

  const notes =
    item?.notes ||
    item?.note ||
    "";

  let notesUrl = "";

  if (notes) {
    if (
      String(
        notes
      ).startsWith("http")
    ) {
      notesUrl =
        notes;
    } else if (
      notePath
    ) {
      notesUrl =
        `${String(
          notePath
        ).replace(
          /\/+$/,
          ""
        )}/${String(
          notes
        ).replace(
          /^\/+/,
          ""
        )}`;
    }
  }

  return {
    ...item,

    id:
      item?.id,

    order:
      item?.orders ??
      item?.order ??
      null,

    topicId:
      item?.topicid ||
      item?.topicId ||
      null,

    subjectId:
      item?.subjectid ||
      item?.subjectId ||
      null,

    title:
      item?.title ||
      item?.name ||
      `Chapter ${
        item?.orders ||
        item?.order ||
        ""
      }`,

    titleMal:
      item?.title_mal ||
      item?.titleMal ||
      "",

    description:
      item?.description ||
      "",

    descriptionMal:
      item?.description_mal ||
      "",

    type:
      String(
        item?.type ||
        "free"
      )
        .toLowerCase()
        .trim(),

    duration:
      item?.duration ||
      "",

    videoId,

    videoUrl,

    videoHls,

    thumbnailUrl,

    notesUrl,
  };
}

/* =========================================================
   GET
========================================================= */

export async function GET(
  request
) {
  try {
    const {
      searchParams,
    } = new URL(
      request.url
    );

    const uid =
      searchParams.get(
        "uid"
      ) || "0";

    const cid =
      searchParams.get(
        "cid"
      ) || "1";

    const topicId =
      searchParams.get(
        "topicId"
      );

    const offset =
      searchParams.get(
        "offset"
      ) || "0";

    if (!topicId) {
      return NextResponse.json(
        {
          status: false,
          data: [],
          nextOffset: null,
          message:
            "topicId is required.",
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await getSubExamTopicChapters({
        uid,
        cid,
        topicId,
        offset,
      });

    console.log(
      "RAW CHAPTER RESULT:",
      result
    );

    const thumbnailPath =
      result?.thumbnailPath ||
      result?.thumbnail_path ||
      "";

    const notePath =
      result?.notePath ||
      result?.note_path ||
      "";

    const rawChapters =
      Array.isArray(
        result?.data
      )
        ? result.data
        : [];

    const chapters =
      rawChapters.map(
        (item) =>
          normalizeChapter(
            item,
            thumbnailPath,
            notePath
          )
      );

    return NextResponse.json(
      {
        status:
          Boolean(
            result?.status
          ),

        view:
          result?.view ||
          "",

        thumbnailPath,

        notePath,

        data:
          chapters,

        nextOffset:
          result?.nextOffset ??
          result?.next_offset ??
          null,

        message:
          result?.message ||
          "",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "SUB EXAM TOPIC CHAPTER ERROR:",
      error
    );

    return NextResponse.json(
      {
        status: false,
        data: [],
        nextOffset: null,
        message:
          error?.message ||
          "Unable to load chapters.",
      },
      {
        status: 500,
      }
    );
  }
}