// src/app/(student)/dashboard/[governmentExamsSlug]/current-affairs/page.jsx

import { notFound } from "next/navigation";

import { getGovernmentExamConfig } from "@/lib/governmentExamConfig";
import { getCurrentAffairMonths } from "@/lib/currentAffairsHelper";

import CurrentAffairsHero from "./components/CurrentAffairsHero";
import CurrentAffairsFolders from "./components/CurrentAffairsFolders";
import CurrentAffairsCTA from "./components/CurrentAffairsCTA";


export async function generateMetadata({
    params,
}) {
    const {
        governmentExamsSlug,
    } = await params;

    const config =
        getGovernmentExamConfig(
            governmentExamsSlug
        );

    if (!config) {
        return {};
    }

    return {
        title:
            `${config.name} Current Affairs | MasterMind Academy`,

        description:
            `Explore month-wise ${config.name} current affairs, daily updates and exam-focused preparation.`,
    };
}

export default async function CurrentAffairsPage({
    params,
}) {
    const {
        governmentExamsSlug,
    } = await params;

    const config =
        getGovernmentExamConfig(
            governmentExamsSlug
        );

    if (!config) {
        notFound();
    }

    const {
        cid,
        name,
        shortName,
    } = config;

    const result =
        await getCurrentAffairMonths({
            uid: 0,
            cid,
        });

    return (
        <main
            className="
        min-h-screen
        bg-[#f4f9ff]
        pb-12
        pt-5
      "
        >
            <div
                className="
          mx-auto
          w-full
          max-w-[1540px]
          px-3
          sm:px-5
          lg:px-7
        "
            >
                <CurrentAffairsHero
                    examName={name}
                    shortName={shortName}
                    governmentExamsSlug={
                        governmentExamsSlug
                    }
                />

                <CurrentAffairsFolders
                    months={
                        result?.months ?? []
                    }
                    years={
                        result?.years ?? []
                    }
                    governmentExamsSlug={
                        governmentExamsSlug
                    }
                />

                <CurrentAffairsCTA
                    examName={name}
                    governmentExamsSlug={
                        governmentExamsSlug
                    }
                />


            </div>
        </main>
    );
}