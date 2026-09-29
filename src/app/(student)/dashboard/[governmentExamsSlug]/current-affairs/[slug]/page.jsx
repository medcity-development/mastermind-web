// src/app/(student)/dashboard/[governmentExamsSlug]/current-affairs/[slug]/page.jsx

import {
    notFound,
} from "next/navigation";

import {
    getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import {
    getCurrentAffairDates,
} from "@/lib/currentAffairsHelper";

import CurrentAffairsMonthViewer from "./components/CurrentAffairsMonthViewer";

function formatSlugTitle(
    slug
) {
    return String(
        slug ?? ""
    )
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

    if (!config) {
        return {};
    }

    const title =
        formatSlugTitle(
            slug
        );

    return {
        title:
            `${title} ${config.name} Current Affairs | MasterMind Academy`,

        description:
            `Read daily ${config.name} current affairs for ${title}.`,
    };
}

export default async function CurrentAffairsMonthPage({
    params,
    searchParams,
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
        formatSlugTitle(
            slug
        );

    return (
        <main
            className="
        min-h-screen
        bg-[#f4f9ff]
        pb-12
        pt-5
      "
        >
            <CurrentAffairsMonthViewer
                cid={cid}
                title={title}
                dates={
                    Array.isArray(
                        dates
                    )
                        ? dates
                        : []
                }
                examName={
                    config.name
                }
                shortName={
                    config.shortName
                }
                governmentExamsSlug={
                    governmentExamsSlug
                }
            />
        </main>
    );
}