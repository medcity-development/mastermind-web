import {
    NextResponse,
} from "next/server";

import {
    getStudentSession,
} from "@/lib/auth/getStudentSession";

export const dynamic =
    "force-dynamic";

/* =========================================================
   BASE URL
========================================================= */

function cleanBaseUrl(
    value = ""
) {
    return String(
        value
    )
        .trim()
        .replace(
            /\/+$/,
            ""
        );
}

/* =========================================================
   GET REAL EXAM NAME
========================================================= */

function getRealName(
    result
) {
    const possibleObjects = [
        Array.isArray(
            result?.exam
        )
            ? result.exam[0]
            : result?.exam,

        Array.isArray(
            result?.data
        )
            ? result.data[0]
            : result?.data,

        Array.isArray(
            result?.details
        )
            ? result.details[0]
            : result?.details,

        result,
    ];

    for (
        const item of
        possibleObjects
    ) {
        if (
            !item ||
            typeof item !==
            "object"
        ) {
            continue;
        }

        const candidates = [
            item?.exam_name,
            item?.examName,

            item?.exam_title,
            item?.examTitle,

            item?.test_name,
            item?.testName,

            item?.mock_name,
            item?.mockName,

            item?.qp_name,
            item?.qpName,

            item?.title,
            item?.name,
        ];

        for (
            const candidate of
            candidates
        ) {
            const value =
                String(
                    candidate ?? ""
                ).trim();

            if (value) {
                return value;
            }
        }
    }

    return "";
}

/* =========================================================
   GET
========================================================= */

export async function GET(
    request
) {
    try {
        /* =====================================================
           SESSION
        ===================================================== */

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
            return NextResponse.json(
                {
                    status: false,

                    message:
                        "Please sign in to continue.",

                    examName: "",
                },
                {
                    status: 401,
                }
            );
        }

        /* =====================================================
           QUERY
        ===================================================== */

        const {
            searchParams,
        } = new URL(
            request.url
        );

        const cid =
            Number(
                searchParams.get(
                    "cid"
                )
            );

        const examId =
            Number(
                searchParams.get(
                    "examId"
                ) ??
                searchParams.get(
                    "examid"
                )
            );

        const examType =
            String(
                searchParams.get(
                    "examType"
                ) ??
                searchParams.get(
                    "examtype"
                ) ??
                ""
            )
                .trim()
                .toLowerCase();

        if (
            !Number.isFinite(cid) ||
            cid <= 0
        ) {
            return NextResponse.json(
                {
                    status: false,
                    message:
                        "Valid cid is required.",
                    examName: "",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            !Number.isFinite(
                examId
            ) ||
            examId <= 0
        ) {
            return NextResponse.json(
                {
                    status: false,
                    message:
                        "Valid exam id is required.",
                    examName: "",
                },
                {
                    status: 400,
                }
            );
        }

        if (!examType) {
            return NextResponse.json(
                {
                    status: false,
                    message:
                        "Exam type is required.",
                    examName: "",
                },
                {
                    status: 400,
                }
            );
        }

        /* =====================================================
           ENV
        ===================================================== */

        const apiBaseUrl =
            cleanBaseUrl(
                process.env
                    .PSC_API_BASE_URL
            );

        const apiKey =
            process.env
                .PSC_API_KEY;

        if (
            !apiBaseUrl ||
            !apiKey
        ) {
            return NextResponse.json(
                {
                    status: false,

                    message:
                        "PSC API configuration is missing.",

                    examName: "",
                },
                {
                    status: 500,
                }
            );
        }

        /* =====================================================
           ENDPOINT
    
           For now your history contains mock attempts.
           Mock details API gives the actual exam_name.
        ===================================================== */

        let endpoint = "";

        if (
            examType === "mock"
        ) {
            endpoint =
                "getMockTestDetails";
        }

        /*
         * Later when PYQ / SCERT / Topicwise attempts exist,
         * map them to their corresponding details APIs here.
         *
         * Do NOT invent an exam name.
         */
        if (!endpoint) {
            return NextResponse.json(
                {
                    status: true,

                    examName: "",

                    examId,

                    examType,
                },
                {
                    status: 200,
                }
            );
        }

        /* =====================================================
           REQUEST
        ===================================================== */

        const formData =
            new FormData();

        formData.append(
            "api",
            apiKey
        );

        formData.append(
            "uid",
            String(uid)
        );

        formData.append(
            "cid",
            String(cid)
        );

        formData.append(
            "examid",
            String(examId)
        );

        const response =
            await fetch(
                `${apiBaseUrl}/${endpoint}`,
                {
                    method:
                        "POST",

                    body:
                        formData,

                    cache:
                        "no-store",

                    headers: {
                        Accept:
                            "application/json",
                    },
                }
            );

        const raw =
            await response.text();

        let result = {};

        try {
            result =
                raw
                    ? JSON.parse(
                        raw
                    )
                    : {};
        } catch {
            console.error(
                "EXAM NAME INVALID JSON:",
                {
                    examType,
                    examId,
                    raw:
                        raw.slice(
                            0,
                            500
                        ),
                }
            );

            return NextResponse.json(
                {
                    status: false,

                    message:
                        "Exam details API returned invalid JSON.",

                    examName: "",
                },
                {
                    status: 502,
                }
            );
        }

        if (!response.ok) {
            return NextResponse.json(
                {
                    status: false,

                    message:
                        result?.message ||
                        result?.msg ||
                        "Unable to load exam details.",

                    examName: "",
                },
                {
                    status:
                        response.status,
                }
            );
        }

        const examName =
            getRealName(
                result
            );

        return NextResponse.json(
            {
                status: true,

                examId,

                examType,

                examName,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(
            "EXAM NAME ROUTE:",
            error
        );

        return NextResponse.json(
            {
                status: false,

                message:
                    error?.message ||
                    "Unable to resolve exam name.",

                examName: "",
            },
            {
                status: 500,
            }
        );
    }
}