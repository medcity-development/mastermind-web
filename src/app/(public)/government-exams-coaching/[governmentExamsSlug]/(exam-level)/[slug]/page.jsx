import {
  notFound,
} from "next/navigation";

import SubExamHero from "./SubExamHero";
import SubExamList from "./SubExamList";

/* =========================================================
   FORMAT SLUG
========================================================= */

function formatSlug(
  slug = ""
) {
  return String(slug)
    .split("-")
    .filter(Boolean)
    .map(
      (word) =>
        word
          .charAt(0)
          .toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  params,
}) {
  const { slug } =
    await params;

  const title =
    formatSlug(slug);

  return {
    title:
      `${title} | Kerala PSC Coaching`,

    description:
      `Explore ${title} exams, preparation materials and learning resources for Kerala PSC.`,
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function ExamLevelPage({
  params,
  searchParams,
}) {
  const { slug } =
    await params;

  const search =
    await searchParams;

  const cid =
    search?.cid || "1";

  const subId =
    search?.subId;

  /* =======================================================
     VALIDATION
  ======================================================= */

  if (
    !slug ||
    !subId
  ) {
    notFound();
  }

  const title =
    formatSlug(slug);

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main
      className="
        min-h-screen
        bg-[#f4f9ff]
        pb-12
        pt-[100px]
        lg:pt-[115px]
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
        {/* HERO */}

        <SubExamHero
          title={title}
        />

        {/* SUB EXAMS */}

        <SubExamList
          cid={cid}
          subId={subId}
          levelSlug={slug}
        />
      </div>
    </main>
  );
}