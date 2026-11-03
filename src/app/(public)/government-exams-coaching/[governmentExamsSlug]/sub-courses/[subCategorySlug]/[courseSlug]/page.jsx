import { cache } from "react";
import { notFound } from "next/navigation";
import { getGovernmentExamConfig } from "@/lib/governmentExamConfig";
import { getSubCategories, getSubExams } from "@/lib/pscApi";
import { createSlug } from "@/lib/pscSlug";
import { getSubExamDetails } from "@/lib/subExamDetailsHelper";
import ExamDetailsHero from "../../../(exam-level)/[slug]/[examSlug]/components/ExamDetailsHero";
import ExamDetailsTabs from "../../../(exam-level)/[slug]/[examSlug]/components/ExamDetailsTabs";

// Resolve within the selected category; query IDs must not override the URL.
const resolveCourse = cache(async (governmentExamsSlug, subCategorySlug, courseSlug, type) => {
  const config = getGovernmentExamConfig(governmentExamsSlug);
  if (!config) return null;

  const cid = Number(config.cid);
  const { categories } = await getSubCategories({ cid, uid: 0 });
  const category = categories.find((item) => createSlug(item?.name || "") === subCategorySlug);
  if (!category?.id) return null;

  const { exams } = await getSubExams({ cid, subId: category.id, uid: 0 });
  const course = exams.find((item) =>
    createSlug(item?.exam || item?.name || item?.subcourse || "") === courseSlug
  );
  if (!course?.id) return null;

  const result = await getSubExamDetails({
    uid: 0, cid, subExamId: course.id, type, offset: 0,
  });
  if (!result?.status || !result?.data) return null;

  return { config, cid, subId: category.id, examId: course.id, exam: result.data };
});

function getType(query) {
  return typeof query?.type === "string" ? query.type : "mock";
}

export async function generateMetadata({ params, searchParams }) {
  const { governmentExamsSlug, subCategorySlug, courseSlug } = await params;
  const resolved = await resolveCourse(governmentExamsSlug, subCategorySlug, courseSlug, getType(await searchParams));
  if (!resolved) return { title: "Course Not Found", robots: { index: false, follow: false } };

  const { config, exam } = resolved;
  const title = exam?.exam ?? exam?.exam_name ?? exam?.name ?? courseSlug.replace(/-/g, " ");
  return {
    title: `${title} | ${config.name} | MasterMind Academy`,
    description: `Explore ${title} preparation resources, mock tests, previous questions and study materials for ${config.name}.`,
    alternates: {
      canonical: `/government-exams-coaching/${governmentExamsSlug}/sub-courses/${subCategorySlug}/${courseSlug}`,
    },
  };
}

export default async function SubCourseDetailsPage({ params, searchParams }) {
  const { governmentExamsSlug, subCategorySlug, courseSlug } = await params;
  const resolved = await resolveCourse(governmentExamsSlug, subCategorySlug, courseSlug, getType(await searchParams));
  if (!resolved) notFound();
  const { config, cid, subId, examId, exam } = resolved;

  return (
    <main
      className="
        min-h-screen
        bg-[#f4f9ff]
        pb-12
        pt-10
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
        {/* =================================================
            HERO
        ================================================= */}

        <ExamDetailsHero
          exam={
            exam
          }
          levelSlug={
            `sub-courses/${subCategorySlug}`
          }
          governmentExamsSlug={
            governmentExamsSlug
          }
          examName={
            config.name
          }
          shortName={
            config.shortName
          }
        />

        {/* =================================================
            EXAM TABS
        ================================================= */}

        <div className="mt-5">
          <ExamDetailsTabs
            cid={
              cid
            }
            uid={
              0
            }
            examId={
              examId
            }
            subId={
              subId
            }
            exam={
              exam
            }
            governmentExamsSlug={
              governmentExamsSlug
            }
            examName={
              config.name
            }
            shortName={
              config.shortName
            }
          />
        </div>
      </div>
    </main>
  );
}