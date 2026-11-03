import {
    notFound,
  } from "next/navigation";

  import {
    getGovernmentExamConfig,
  } from "@/lib/governmentExamConfig";

  import CurrentAffairsMonthViewer from "./components/CurrentAffairsMonthViewer";
  
  import {
    getCurrentAffairDates,
    getCurrentAffairMonths,
  } from "@/lib/currentAffairsHelper";
  import {
    createCurrentAffairsMonthSlug,
  } from "@/lib/currentAffairsSlug";
  
  function formatSlugTitle(
    slug
  ) {
    return String(slug)
      .split("-")
      .map(
        (word) =>
          word
            .charAt(0)
            .toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  }
  
  export async function generateMetadata({
    params,
  }) {
    const {
        governmentExamsSlug,
        slug,
      } = await params;
      const config =
        getGovernmentExamConfig(
          governmentExamsSlug
        );
  
      const title =
        formatSlugTitle(slug);
  
      return {
        title:
          `${title} ${config?.name ?? "Kerala PSC"} Current Affairs`,
  
        description:
          `Read daily ${config?.name ?? "Government Exams"} current affairs for ${title}.`,
        alternates: {
          canonical: `/government-exams-coaching/${governmentExamsSlug}/current-affairs/${slug}`,
        },
      };
    }
  
  export default async function CurrentAffairsMonthPage({
      params,
    }) {
      const {
        governmentExamsSlug,
        slug,
      } = await params;

      const config =
        getGovernmentExamConfig(
          governmentExamsSlug
        );

      if (!config) {
        notFound();
      }

      const result =
        await getCurrentAffairMonths({
          uid: 0,
          cid: config.cid,
        });

      if (!result?.status) {
        throw new Error(
          result?.error ||
            "Unable to load current affairs months."
        );
      }

      const selectedMonth =
        result?.months?.find(
          (month) =>
            createCurrentAffairsMonthSlug(
              month?.month,
              month?.year
            ) === slug
        );
      const cid =
        Number(selectedMonth?.id);

      if (!Number.isFinite(cid) || cid <= 0) {
        notFound();
      }

      const dates =
        await getCurrentAffairDates({
          uid: 0,
          cid,
        });
  
      const title = selectedMonth
        ? `${selectedMonth.month} ${selectedMonth.year}`
        : formatSlugTitle(slug);
  
    return (
      <main
        className="
          min-h-screen
          bg-[#f4f9ff]
          pb-12
          pt-10
        "
      >
        <CurrentAffairsMonthViewer
          cid={cid}
          title={title}
          dates={dates}
          governmentExamsSlug={
            governmentExamsSlug
          }
        />
      </main>
    );
  }