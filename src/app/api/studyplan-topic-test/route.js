import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function json(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function validId(value) {
  const number = Number(value);

  return Number.isSafeInteger(number) &&
    number > 0
    ? number
    : null;
}

function getApiConfig() {
  const baseUrl = String(
    process.env.PSC_API_BASE_URL || ""
  )
    .trim()
    .replace(/\/+$/, "");

  const apiKey = process.env.PSC_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "PSC API configuration is missing."
    );
  }

  return { baseUrl, apiKey };
}

async function backendRequest(endpoint, fields) {
  const { baseUrl, apiKey } = getApiConfig();

  const body = new FormData();

  body.append("api", apiKey);

  Object.entries(fields).forEach(([key, value]) => {
    body.append(key, String(value));
  });

  const response = await fetch(
    `${baseUrl}/${endpoint}`,
    {
      method: "POST",
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    }
  );

  if (!response.ok) {
    throw new Error(
      `${endpoint} returned HTTP ${response.status}`
    );
  }

  const result = await response.json();

  if (result?.status === false) {
    throw new Error(
      result.message ||
      `${endpoint} failed.`
    );
  }

  return result;
}

function normalizeTest(item) {
  const id = validId(item?.id);

  if (!id) return null;

  return {
    id,
    exam_id: id,
    type: "studyplan",
    topicid:
      item.topicid ??
      item.topic_id ??
      null,
    exam_name:
      item.exam_name ||
      item.title ||
      "Study Plan Test",
    total_questions:
      Number(item.total_questions) || 0,
    total_mark:
      Number(item.total_mark) || 0,
    total_minutes:
      Number(item.total_minutes) || 0,
    access: String(
      item.access || "paid"
    ).toLowerCase(),
  };
}

export async function GET(request) {
  const params = new URL(request.url).searchParams;

  const cid = validId(params.get("cid"));
  const topicId = validId(params.get("topicId"));

  if (!cid || !topicId) {
    return json(
      {
        status: false,
        message: "Invalid cid or topicId.",
      },
      400
    );
  }

  try {
    // STEP 1: Retrieve the linked test ID.
    const chapters = await backendRequest(
      "getChaptersList",
      {
        cid,
        uid: 0,
        topicid: topicId,
      }
    );

    const mockTestId = validId(
      chapters?.mocktest ??
      chapters?.mock_test ??
      chapters?.mocktest_id
    );

    if (!mockTestId) {
      return json({
        status: true,
        mockTestId: null,
        test: null,
        message:
          "No Study Plan test is linked to this topic.",
      });
    }

    // STEP 2: Retrieve its actual details.
    const details = await backendRequest(
      "getMockTestDetails",
      {
        cid,
        uid: 0,
        examid: mockTestId,
        type: "studyplan",
      }
    );

    const exams = Array.isArray(details?.exam)
      ? details.exam
      : [];

    const selected = exams.find((item) => {
      const id = validId(item?.id);

      return (
        id === mockTestId &&
        String(item.type).toLowerCase() ===
          "studyplan" &&
        String(item.topicid) === String(topicId)
      );
    });

    const test = selected
      ? normalizeTest(selected)
      : null;

    return json({
      status: true,
      mockTestId,
      test,
    });
  } catch (error) {
    console.error(
      "studyplan-topic-test:",
      error
    );

    return json(
      {
        status: false,
        message:
          "Unable to retrieve the Study Plan test.",
      },
      502
    );
  }
}