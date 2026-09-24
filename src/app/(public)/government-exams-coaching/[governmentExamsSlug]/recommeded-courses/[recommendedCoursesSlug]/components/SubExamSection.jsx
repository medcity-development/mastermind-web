import SubExamsGrid from "./SubExamsGrid";

export default function SubExamSection({
  recommendedCoursesSlug = "",
}) {
  const hasSelectedCourse =
    Boolean(recommendedCoursesSlug);

  return (
    <section
      className="
        mt-8
        rounded-[26px]
        border
        border-[#dfeaf6]
        bg-white
        p-5
        shadow-[0_14px_40px_rgba(15,58,110,0.06)]
        sm:p-6
      "
    >
      <div className="mb-7">
        <p
          className="
            text-[10px]
            font-black
            uppercase
            tracking-[0.18em]
            text-[#017dc0]
          "
        >
          {hasSelectedCourse
            ? "Available Exams"
            : "Available Courses"}
        </p>

        <h2
          className="
            mt-2
            text-2xl
            font-black
            text-[#0b216c]
            sm:text-3xl
          "
        >
          {hasSelectedCourse
            ? "Choose Your Exam"
            : "Recommended Courses"}
        </h2>

        <p
          className="
            mt-2
            max-w-2xl
            text-sm
            leading-6
            text-slate-500
          "
        >
          {hasSelectedCourse
            ? "Choose an exam under this course and continue your preparation with available learning resources."
            : "Choose an exam and start your preparation with video classes, mock tests, previous questions and SCERT exams."}
        </p>
      </div>

      <SubExamsGrid
        recommendedCoursesSlug={
          recommendedCoursesSlug
        }
      />
    </section>
  );
}