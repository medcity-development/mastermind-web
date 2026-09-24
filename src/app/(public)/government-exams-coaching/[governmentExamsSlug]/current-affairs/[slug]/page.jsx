import {
    notFound,
  } from "next/navigation";
  
  import CurrentAffairsMonthViewer from "./components/CurrentAffairsMonthViewer";
  
  import {
    getCurrentAffairDates,
  } from "@/lib/currentAffairsHelper";
  
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
      slug,
    } = await params;
  
    const title =
      formatSlugTitle(slug);
  
    return {
      title:
        `${title} Kerala PSC Current Affairs`,
  
      description:
        `Read daily Kerala PSC current affairs for ${title}.`,
    };
  }
  
  export default async function CurrentAffairsMonthPage({
    params,
    searchParams,
  }) {
    const {
      slug,
    } = await params;
  
    const query =
      await searchParams;
  
    const cid =
      Number(
        query?.cid
      );
  
    if (!cid) {
      notFound();
    }
  
    const dates =
      await getCurrentAffairDates({
        uid: 0,
        cid,
      });
  
    const title =
      formatSlugTitle(slug);
  
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
        <CurrentAffairsMonthViewer
          cid={cid}
          title={title}
          dates={dates}
        />
      </main>
    );
  }