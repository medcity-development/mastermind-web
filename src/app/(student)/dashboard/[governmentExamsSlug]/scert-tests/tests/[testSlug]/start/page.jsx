import {
  notFound,
} from "next/navigation";

import {
  getScertFolders,
  getScertTestsByClassId,
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



export const metadata = {
  title:
    "SCERT Exam | MasterMind Academy",

  robots: {
    index: false,
    follow: false,
  },
};

function createSlug(
  value = ""
) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
}

async function findScertTestBySlug(
  testSlug,
  {
    uid,
    cid,
  }
) {
  const foldersResult =
    await getScertFolders({
      uid,
      cid,
      offset: 0,
    });

  const folders =
    Array.isArray(
      foldersResult?.data
    )
      ? foldersResult.data
      : [];

  for (
    const folder of folders
  ) {
    const classId =
      folder?.id;

    if (!classId) {
      continue;
    }

    const result =
      await getScertTestsByClassId({
        uid,
        classId,
        filter: 0,
      });

    const tests =
      Array.isArray(
        result?.data
      )
        ? result.data
        : [];

    const test =
      tests.find(
        (item) =>
          createSlug(
            item?.exam_name
          ) ===
          testSlug
      );

    if (test) {
      return {
        classId,
        test,
        examId:
          test.id,
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
    testSlug,
    governmentExamsSlug,
  } = await params;

  const config =
    getGovernmentExamConfig(
      governmentExamsSlug
    );

  if (!config) {
    notFound();
  }

  const session =
    await getStudentSession();

  const uid =
    session?.uid;

  const query =
    await searchParams;

  const mode =
    query?.mode ===
    "resume"
      ? "resume"
      : "new";

  const initialPauseId =
    query?.pauseId ||
    null;

  const selected =
    await findScertTestBySlug(
      testSlug,
      {
        uid,
        cid:
          config.cid,
      }
    );

  if (!selected) {
    notFound();
  }

  const {
    classId,
    examId,
  } = selected;

  const [
    detailsResult,
    questionsResult,
  ] = await Promise.all([
    getScertExamDetails({
      uid,
      cid:
        classId,
      examId,
    }),

    getScertQuestions({
      uid,
      cid:
        classId,
      examId,
    }),
  ]);

  const exam =
    detailsResult?.exam;

  const questions =
    Array.isArray(
      questionsResult?.data
    )
      ? questionsResult.data
      : [];

  if (
    !exam ||
    !questions.length
  ) {
    notFound();
  }

  return (
    <ScertExamClient
      exam={exam}
      questions={
        questions
      }
      imagePath={
        questionsResult?.imagePath ||
        ""
      }
      uid={uid}
      cid={
        classId
      }
      classId={
        classId
      }
      testSlug={
        testSlug
      }
      examType="scert"
      lastPosition="scert"
      durationMinutes={
        Number(
          exam?.total_minutes
        ) || 90
      }
      questionsPerPage={
        10
      }
      mode={
        mode
      }
      initialPauseId={
        initialPauseId
      }
      governmentExamsSlug={
        governmentExamsSlug
      }
    />
  );
}
