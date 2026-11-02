import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import RecommendedCourseCard from "../recommeded-courses/components/RecommendedCourseCard";
import { getGovernmentExamConfig } from "@/lib/governmentExamConfig";
import { getHomeResponses } from "@/lib/homeResponsesHelper";

export async function generateMetadata({ params }) {
  const { governmentExamsSlug } = await params;
  const config = getGovernmentExamConfig(governmentExamsSlug);

  if (!config) {
    return {
      title: "Recommended Courses",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `Recommended ${config.name} Courses | MasterMind Academy`,
    description: `Explore recommended courses for ${config.name}.`,
    alternates: {
      canonical: `/government-exams-coaching/${governmentExamsSlug}/recommended-courses`,
    },
  };
}

export default async function RecommendedCoursesPage({ params }) {
  const { governmentExamsSlug } = await params;
  const config = getGovernmentExamConfig(governmentExamsSlug);

  if (!config) {
    notFound();
  }

  const result = await getHomeResponses({
    uid: 0,
    cid: config.cid,
  });
  const maximumCourses = Number(config.cid) === 1 ? 7 : 6;
  const courses = Array.isArray(result?.subExams)
    ? result.subExams
        .filter((course) => Number(course?.cid) === Number(config.cid))
        .slice(0, maximumCourses)
    : [];
  const hasLoadError =
    result?.status === false && courses.length === 0;
  const basePath = `/government-exams-coaching/${governmentExamsSlug}`;

  return (
    <main className="min-h-screen bg-[#f5f9ff] pb-14 pt-[100px] lg:pt-[115px]">
      <div className="mx-auto w-full max-w-[1450px] px-4 sm:px-6 lg:px-8">
        <Link
          href={basePath}
          className="inline-flex items-center gap-2 text-[12px] font-bold text-[#075fc8] transition hover:text-[#071f55]"
        >
          <ArrowLeft size={16} />
          Back to {config.name}
        </Link>

        <section className="relative mt-5 overflow-hidden rounded-[28px] bg-gradient-to-r from-[#071f55] via-[#075fc8] to-[#7c3aed] px-6 py-9 text-white shadow-[0_18px_45px_rgba(22,79,165,0.18)] sm:px-8 lg:px-10">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-100">
            {config.name} Learning
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] sm:text-4xl">
            Recommended Courses
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100">
            Explore all recommended {config.name} courses and continue to
            course details.
          </p>
        </section>

        {hasLoadError ? (
          <p
            role="alert"
            className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700"
          >
            {result.message || "Unable to load recommended courses right now."}
          </p>
        ) : courses.length ? (
          <section
            aria-label={`${config.name} recommended courses`}
            className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {courses.map((course) => (
              <RecommendedCourseCard
                key={`${config.cid}-${course.id}`}
                course={course}
                cid={config.cid}
                governmentExamsSlug={governmentExamsSlug}
                examName={config.name}
              />
            ))}
          </section>
        ) : (
          <p className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-600">
            No recommended courses are available right now.
          </p>
        )}
      </div>
    </main>
  );
}
