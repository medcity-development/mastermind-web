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
    getStudentProfile,
} from "@/lib/studentProfileHelper";

import StudentProfile from "./components/StudentProfile";

/* =========================================================
   DYNAMIC
========================================================= */

export const dynamic =
    "force-dynamic";

/* =========================================================
   METADATA
========================================================= */

export const metadata = {
    title:
        "My Profile | Student Dashboard",

    robots: {
        index: false,
        follow: false,
    },
};

/* =========================================================
   PROFILE PAGE
========================================================= */

export default async function ProfilePage({
    params,
}) {
    /* =======================================================
       PARAMS
    ======================================================= */

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
        redirect(
            `/login?redirect=/dashboard/${governmentExamsSlug}/profile`
        );
    }

    /* =======================================================
       PROFILE
    ======================================================= */

    const result =
        await getStudentProfile({
            uid,

            cid:
                config.cid,
        });

    const profile =
        result?.profile ||
        result?.data?.profile ||
        result?.data ||
        {};

    /* =======================================================
       RENDER
    ======================================================= */

    return (
        <StudentProfile
            initialProfile={
                profile
            }
            config={
                config
            }
        />
    );
}