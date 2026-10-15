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

import {
    getStudentProfile,
} from "@/lib/studentProfileHelper";

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
       STUDENT PROFILE & ACTIVE PLAN CHECK
    ======================================================= */

    let profile = null;
    try {
        const profileResult = await getStudentProfile({
            uid,
            cid,
        });

        profile =
            profileResult?.profile ||
            profileResult?.data?.profile ||
            profileResult?.data ||
            null;
    } catch (error) {
        console.warn("STUDENT PROFILE CHECK ERROR:", error?.message);
    }

    const isPlanActive = Boolean(
        profile?.active === "active" ||
        profile?.active === true ||
        profile?.active === 1 ||
        profile?.active === "1" ||
        profile?.status === "active" ||
        profile?.is_active === 1 ||
        profile?.is_active === true ||
        profile?.is_active === "1" ||
        profile?.package_status === "active" ||
        profile?.plan_status === "active" ||
        profile?.subscription_status === "active" ||
        profile?.payment_status === "active" ||
        profile?.stage === "active" ||
        profile?.stage === "completed" ||
        session?.active === "active" ||
        session?.active === true ||
        session?.status === "active"
    );

    /* =======================================================
       SUPPORTED BACKEND TYPES
    ======================================================= */

    const examTypes = isPlanActive
        ? [...getExamHistoryTypes(), "studyplan"]
        : getExamHistoryTypes();

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
                    hasActivePlan={
                        isPlanActive
                    }
                />
            </div>
        </main>
    );
}