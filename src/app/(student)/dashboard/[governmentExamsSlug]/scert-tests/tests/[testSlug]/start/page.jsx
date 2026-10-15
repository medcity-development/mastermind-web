import {
  notFound,
  redirect,
} from "next/navigation";

import {
  getScertFolders,
  getScertTestsPage,
  getScertExamDetails,
  getScertQuestions,
} from "@/lib/scertHelper";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import ScertExamClient from "../../../start/components/ScertExamClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "SCERT Exam | MasterMind Academy",
  robots: {
    index: false,
    follow: false,
  },
};

function id(value) {
  const number = Number(value);

  return Number.isSafeInteger(number) && number > 0
    ? number
    : null;
}

function slugOf(value) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function nextOffset(result) {
  return (
    result?.nextOffset ??
    result?.nextoffset ??
    null
  );
}

async function collectPages(fetchPage) {
  const rows = [];
  const seen = new Set();

  let offset = 0;

  while (!seen.has(String(offset))) {
    seen.add(String(offset));

    const result = await fetchPage(offset);

    if (
      [false, "false", 0, "0"].includes(
        result?.status
      )
    ) {
      throw new Error(
        "SCERT listing could not be loaded."
      );
    }

    rows.push(
      ...(Array.isArray(result?.data)
        ? result.data
        : [])
    );

    const next = nextOffset(result);

    if (
      next == null ||
      next === "" ||
      Number(next) <= 0 ||
      !Number.isFinite(Number(next))
    ) {
      break;
    }

    offset = Number(next);
  }

  return rows;
}

async function findTest(
  testSlug,
  {
    uid,
    cid,
    selectedClassId,
  }
) {
  const folders = selectedClassId
    ? [{ id: selectedClassId }]
    : await collectPages(
      (offset) =>
        getScertFolders({
          uid,
          cid,
          offset,
        })
    );

  for (const folder of folders) {
    const classId = id(folder?.id);

    if (!classId) continue;

    const tests = await collectPages(
      (offset) =>
        getScertTestsPage({
          uid,
          classId,
          offset,
          filter: 0,
        })
    );

    const test = tests.find(
      (item) =>
        slugOf(item?.exam_name) === testSlug
    );

    if (test && id(test.id)) {
      return {
        classId,
        examId: id(test.id),
      };
    }
  }

  return null;
}

export default async function ScertStartPage({
  params,
  searchParams,
}) {
  const {
    governmentExamsSlug,
    testSlug,
  } = await params;

  const query = await searchParams;

  const config = getGovernmentExamConfig(
    governmentExamsSlug
  );

  if (!config) {
    notFound();
  }

  const session = await getStudentSession();

  const uid = id(session?.uid) || 0;
  const cid = Number(config.cid);

  const mode =
    query?.mode === "resume"
      ? "resume"
      : "new";

  const pauseId = id(query?.pauseId);

  const directExamId = id(query?.examId);
  const directClassId = id(query?.classId);

  const selected =
    directExamId && directClassId
      ? {
        examId: directExamId,
        classId: directClassId,
      }
      : await findTest(testSlug, {
        uid,
        cid,
        selectedClassId: directClassId,
      });

  if (!selected) {
    notFound();
  }

  const {
    examId,
    classId,
  } = selected;

  if (mode === "resume" && !uid) {
    const target = new URLSearchParams({
      examId: String(examId),
      classId: String(classId),
      mode,
      ...(pauseId
        ? { pauseId: String(pauseId) }
        : {}),
    });

    const returnPath =
      `/government-exams-coaching/${governmentExamsSlug}` +
      `/scert-tests/start?${target}`;

    redirect(
      `/login?redirect=${encodeURIComponent(returnPath)}`
    );
  }

  const [details, paper] = await Promise.all([
    getScertExamDetails({
      uid,
      cid,
      examId,
    }),

    getScertQuestions({
      uid,
      cid,
      examId,
    }),
  ]);

  const questions = Array.isArray(paper?.data)
    ? paper.data
    : [];

  if (!details?.exam || !questions.length) {
    return (
      <p
        role="alert"
        className="p-6 text-red-700"
      >
        Unable to load this SCERT exam.
        Refresh and try again.
      </p>
    );
  }

  const guestAction = [
    "pause",
    "submit",
  ].includes(query?.guestAction)
    ? query.guestAction
    : "";

  return (
    <ScertExamClient
      key={`${examId}-${uid}-${mode}-${guestAction}`}
      exam={{
        ...details.exam,
        id: examId,
      }}
      examId={examId}
      questions={questions}
      imagePath={paper.imagePath || ""}
      uid={uid}

      // Dashboard course ID.
      cid={cid}

      // SCERT class ID.
      classId={classId}

      testSlug={testSlug}
      examType="scert"
      lastPosition="scert"
      durationMinutes={
        Number(details.exam.total_minutes) || 90
      }
      questionsPerPage={10}
      mode={mode}
      initialPauseId={pauseId}
      governmentExamsSlug={governmentExamsSlug}
      guestAction={guestAction}
    />
  );
}