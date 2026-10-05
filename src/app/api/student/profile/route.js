import {
    NextResponse,
} from "next/server";

import {
    getStudentSession,
} from "@/lib/auth/getStudentSession";

import {
    updateStudentProfile,
} from "@/lib/studentProfileHelper";

export async function PATCH(
    request
) {
    try {
        const session =
            await getStudentSession();

        if (!session?.uid) {
            return NextResponse.json(
                {
                    status: false,
                    message:
                        "Unauthorized.",
                },
                {
                    status: 401,
                }
            );
        }

        const body =
            await request.json();

        const name =
            String(
                body?.name ?? ""
            ).trim();

        const email =
            String(
                body?.email ??
                session.email ??
                ""
            )
                .trim()
                .toLowerCase();

        const mobile =
            String(
                body?.mobile ?? ""
            )
                .replace(
                    /\D/g,
                    ""
                )
                .trim();

        const dob =
            String(
                body?.dob ?? ""
            ).trim();

        const place =
            String(
                body?.place ?? ""
            ).trim();

        const promocode =
            String(
                body?.promocode ?? ""
            ).trim();

        const code =
            String(
                body?.code ??
                "+91"
            ).trim();

        const avatar =
            String(
                body?.avatar ?? ""
            ).trim();

        if (!name) {
            return NextResponse.json(
                {
                    status: false,
                    message:
                        "Name is required.",
                },
                {
                    status: 400,
                }
            );
        }

        if (!email) {
            return NextResponse.json(
                {
                    status: false,
                    message:
                        "Email is required.",
                },
                {
                    status: 400,
                }
            );
        }

        const result =
            await updateStudentProfile({
                uid:
                    session.uid,

                name,
                email,
                mobile,
                dob,
                place,
                promocode,
                code,
                avatar,
            });

        if (
            result?.status !== true
        ) {
            return NextResponse.json(
                {
                    status: false,

                    message:
                        result?.msg ||
                        result?.message ||
                        "Unable to update profile.",
                },
                {
                    status: 400,
                }
            );
        }

        return NextResponse.json(
            {
                status: true,

                message:
                    result?.msg ||
                    result?.message ||
                    "Profile updated successfully.",
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(
            "UPDATE PROFILE ERROR:",
            error
        );

        return NextResponse.json(
            {
                status: false,

                message:
                    error?.message ||
                    "Unable to update profile.",
            },
            {
                status: 500,
            }
        );
    }
}