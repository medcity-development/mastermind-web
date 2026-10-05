import {
    notFound,
    redirect,
} from "next/navigation";

import {
    getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import {
    getStudentSession,
} from "@/lib/auth/getStudentSession";

import {
    getExamHistoryTypes,
} from "@/lib/examHistoryTypes";

import ExamHistoryClient from "./ExamHistoryClient";

export const dynamic =
    "force-dynamic";

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
            `Exam History | ${config.shortName || config.name} | MasterMind Academy`,

        description:
            `View attempted exams and analytics for ${config.name}.`,

        robots: {
            index: false,
            follow: false,
        },
    };
}

export default async function ExamHistoryPage({
    params,
}) {
    const {
        governmentExamsSlug,
    } = await params;

    /* =======================================================
       CONFIG
    ======================================================= */

    const config =
        getGovernmentExamConfig(
            governmentExamsSlug
        );

    if (!config) {
        notFound();
    }

    const cid =
        Number(
            config?.cid
        );

    if (
        !Number.isFinite(cid) ||
        cid <= 0
    ) {
        notFound();
    }

    /* =======================================================
       SESSION
    ======================================================= */

    const session =
        await getStudentSession();

    const uid =
        Number(
            session?.uid
        );

    if (
        !Number.isFinite(uid) ||
        uid <= 0
    ) {
        const redirectPath =
            `/dashboard/${governmentExamsSlug}/exam-attempted`;

        redirect(
            `/login?redirect=${encodeURIComponent(
                redirectPath
            )}`
        );
    }

    /* =======================================================
       SUPPORTED BACKEND TYPES
    ======================================================= */

    const examTypes =
        getExamHistoryTypes();

    /* =======================================================
       PAGE
    ======================================================= */

    return (
        <main
            className="
        min-h-screen
        bg-[#f4f7fc]

        px-4
        py-6

        sm:px-6
        lg:px-8
      "
        >
            <div
                className="
          mx-auto
          w-full
          max-w-[1450px]
        "
            >
                <ExamHistoryClient
                    cid={cid}
                    examTypes={
                        examTypes
                    }
                    examName={
                        config?.shortName ||
                        config?.name ||
                        ""
                    }
                    governmentExamsSlug={
                        governmentExamsSlug
                    }
                />
            </div>
        </main>
    );
}