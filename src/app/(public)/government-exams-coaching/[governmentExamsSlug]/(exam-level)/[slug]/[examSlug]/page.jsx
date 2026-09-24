import {
  notFound,
} from "next/navigation";

import {
  getSubExamDetails,
} from "@/lib/subExamDetailsHelper";

import ExamDetailsHero from "./components/ExamDetailsHero";
import ExamDetailsTabs from "./components/ExamDetailsTabs";

export default async function SubExamDetailsPage({
  params,
  searchParams,
}) {
  const {
    slug,
  } = await params;

  const search =
    await searchParams;

  const cid =
    String(
      search?.cid || "1"
    );

  const examId =
    search?.examId
      ? String(
          search.examId
        )
      : "";

  const subId =
    search?.subId
      ? String(
          search.subId
        )
      : "";

  const type =
    search?.type ||
    "mock";

  console.log(
    "DETAIL PAGE PARAMS:",
    {
      slug,
      cid,
      examId,
      subId,
      type,
    }
  );

  if (
    !slug ||
    !examId
  ) {
    notFound();
  }

  const result =
    await getSubExamDetails({
      uid: 0,
      cid,
      subExamId:
        examId,
      type,
      offset: 0,
    });

  const exam =
    result?.data ||
    null;

  if (!exam) {
    notFound();
  }

  return (
    <main
      className="
        min-h-screen
        bg-[#f4f9ff]
        pb-5
        pt-5
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-[1450px]
          px-4
          sm:px-6
          lg:px-8
        "
      >
        <ExamDetailsHero
          exam={exam}
          levelSlug={
            slug
          }
        />

        <ExamDetailsTabs
          cid={cid}
          uid={0}
          examId={
            examId
          }
          subId={
            subId
          }
          exam={
            exam
          }
        />
      </div>
    </main>
  );
}