import { NextResponse } from "next/server";

import {
    getStudentSession,
} from "@/lib/auth/getStudentSession";

import {
    buildAttemptPayload,
    getAttemptId,
} from "@/lib/examAttemptData";

export const dynamic = "force-dynamic";

function positiveId(value) {
    const number = Number(value);

    return Number.isSafeInteger(number) && number > 0
        ? number
        : null;
}

function failed(value) {
    return [
        false,
        "false",
        0,
        "0",
        "error",
        "failed",
    ].includes(value);
}

function reply(body, status = 200) {
    return NextResponse.json(body, {
        status,
        headers: {
            "Cache-Control": "no-store",
        },
    });
}

export async function POST(request) {
    try {
        const session = await getStudentSession();
        const uid = positiveId(session?.uid);

        if (!uid) {
            return reply(
                {
                    status: false,
                    message: "Please sign in to continue.",
                },
                401
            );
        }

        let body;

        try {
            body = await request.json();
        } catch {
            return reply(
                {
                    status: false,
                    message: "Invalid JSON request.",
                },
                400
            );
        }

        const cid = positiveId(body?.cid);
        const examId = positiveId(body?.exam_id);
        const pauseId = positiveId(body?.pauseid);
        const seconds = Number(body?.remaining_seconds);

        if (
            !cid ||
            !examId ||
            body?.exam_type !== "twe" ||
            !["create", "update"].includes(body?.action) ||
            (body.action === "update" && !pauseId) ||
            body.remaining_seconds == null ||
            !Number.isSafeInteger(seconds) ||
            seconds < 0 ||
            seconds > 86400
        ) {
            return reply(
                {
                    status: false,
                    message: "Invalid Topic Wise attempt information.",
                },
                400
            );
        }

        if (
            !Array.isArray(body.answer_array) ||
            !Array.isArray(body.user_answers) ||
            body.answer_array.length !==
            body.user_answers.length ||
            !body.answer_array.length
        ) {
            return reply(
                {
                    status: false,
                    message:
                        "The complete exam answer arrays are required.",
                },
                400
            );
        }

        if (
            !Number.isFinite(Number(body.start_time)) ||
            Number(body.start_time) <= 0
        ) {
            return reply(
                {
                    status: false,
                    message: "Exam start time is required.",
                },
                400
            );
        }

        const examStatus =
            body.action === "create"
                ? "pause"
                : body.exam_status;

        if (!["pause", "finish"].includes(examStatus)) {
            return reply(
                {
                    status: false,
                    message: "Invalid exam status.",
                },
                400
            );
        }

        const baseUrl = String(
            process.env.PSC_API_BASE_URL || ""
        )
            .trim()
            .replace(/\/+$/, "");

        const apiKey = String(
            process.env.PSC_API_KEY || ""
        ).trim();

        if (!baseUrl || !apiKey) {
            return reply(
                {
                    status: false,
                    message: "PSC API configuration is missing.",
                },
                500
            );
        }

        const payload = buildAttemptPayload(
            {
                ...body,
                cid,
                exam_id: examId,
                exam_type: "twe",
                exam_status: examStatus,

                __scoring: {
                    markPerCorrect: 1,
                    negativeMarkPerWrong: 0.333,
                },

                ...(pauseId
                    ? { pauseid: pauseId }
                    : {}),
            },
            uid
        );

        payload.paused_time = seconds * 1000;

        const form = new FormData();

        form.append("api", apiKey);

        for (
            const [key, value] of Object.entries(payload)
        ) {
            if (key.startsWith("__") || value == null) {
                continue;
            }

            form.append(
                key,
                Array.isArray(value)
                    ? JSON.stringify(value)
                    : String(value)
            );
        }

        const endpoint =
            body.action === "create"
                ? "setNewUserExams"
                : "setUpdateUserExams";

        const response = await fetch(
            `${baseUrl}/${endpoint}`,
            {
                method: "POST",
                body: form,
                cache: "no-store",
                signal: AbortSignal.timeout(15000),
            }
        );

        let result;

        try {
            result = await response.json();
        } catch {
            return reply(
                {
                    status: false,
                    message:
                        "Exam backend returned invalid JSON.",
                },
                502
            );
        }

        if (
            !response.ok ||
            !result ||
            failed(result.status)
        ) {
            return reply(
                {
                    status: false,
                    message:
                        result?.message ||
                        result?.msg ||
                        "Unable to save this exam.",
                },
                response.status === 429 ? 429 : 502
            );
        }

        const attemptId =
            pauseId ??
            positiveId(getAttemptId(result));

        return reply({
            ...result,
            status: true,
            ...(attemptId
                ? { pauseid: attemptId }
                : {}),
            savedResult: payload,
        });
    } catch (error) {
        console.error(
            "TOPIC WISE ATTEMPT:",
            error?.message
        );

        return reply(
            {
                status: false,
                message:
                    "Unable to save this exam. Please retry.",
            },
            502
        );
    }
}