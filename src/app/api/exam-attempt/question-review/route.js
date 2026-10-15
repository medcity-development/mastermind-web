
import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/getStudentSession";
import { getExamAnalyticDetails } from "@/lib/examAttemptHelper";
import {
    normalizeHistoryType,
    backendHistoryType,
} from "@/lib/examHistoryApi";
import { getTopicWiseExamQuestions } from "@/lib/topicWiseExamHelper";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TYPES = new Set(["mock", "pqp", "scert", "topicwise"]);

const id = (v) => {
    const n = Number(v);
    return Number.isSafeInteger(n) && n > 0 ? n : null;
};

const bad = (v) =>
    !v || [false, "false", 0, "0", "failed", "error"].includes(v.status);

function send(body, status = 200) {
    return NextResponse.json(body, {
        status,
        headers: { "Cache-Control": "no-store" },
    });
}

function records(result) {
    for (const value of [
        result?.details,
        result?.data?.details,
        result?.data?.data,
        result?.data,
        result?.result?.details,
        result?.result,
    ]) {
        if (Array.isArray(value)) return value;
        if (
            value &&
            typeof value === "object" &&
            (value.exam_id != null || value.user_answers != null)
        ) return [value];
    }
    return [];
}

function attemptIdOf(row) {
    return id(
        row?.id ?? row?.attempt_id ?? row?.attemptId ??
        row?.pauseid ?? row?.pause_id
    );
}

async function fetchQuestionPaper({ uid, cid, examId, type }) {
    if (type === "topicwise") {
        const result = await getTopicWiseExamQuestions({
            uid,
            cid,
            examId,
            examType: "twe",
        });

        if (bad(result)) {
            throw new Error(
                result?.message || "Unable to load topic-wise questions."
            );
        }

        return {
            questions: Array.isArray(result.data) ? result.data : [],
            imagePath: result.imagePath ?? result.img_path ?? "",
        };
    }

    const base = String(process.env.PSC_API_BASE_URL || "")
        .trim().replace(/\/+$/, "");
    const apiKey = String(process.env.PSC_API_KEY || "").trim();

    if (!base || !apiKey) {
        throw new Error("PSC API configuration is missing.");
    }

    const form = new FormData();
    form.append("api", apiKey);
    form.append("uid", String(uid));
    form.append("cid", String(cid));
    form.append("examid", String(examId));
    form.append("examtype", backendHistoryType(type));

    const response = await fetch(`${base}/getMockTestQuestions`, {
        method: "POST",
        body: form,
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(20000),
    });

    const raw = await response.text();
    let result;

    try {
        result = JSON.parse(raw);
    } catch {
        throw new Error("Question backend returned invalid JSON.");
    }

    if (!response.ok || bad(result)) {
        throw new Error(
            result?.message || result?.msg ||
            "Original question paper could not be loaded."
        );
    }

    return {
        questions: Array.isArray(result.data)
            ? result.data
            : Array.isArray(result.details)
                ? result.details
                : [],
        imagePath:
            result.img_path ?? result.imagePath ??
            result.image_path ?? "",
    };
}

export async function POST(request) {
    try {
        const session = await getStudentSession();
        const uid = id(session?.uid);

        if (!uid) {
            return send({
                status: false,
                message: "Please sign in to continue.",
            }, 401);
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return send({
                status: false,
                message: "Invalid JSON request.",
            }, 400);
        }

        const cid = id(body?.cid);
        const selectedId = id(body?.attemptId ?? body?.id);
        const type = normalizeHistoryType(
            body?.examType ?? body?.exam_type
        );

        if (!cid || !selectedId || !TYPES.has(type)) {
            return send({
                status: false,
                message: "Invalid course, attempt ID or exam type.",
            }, 400);
        }

        const result = await getExamAnalyticDetails({
            uid,
            cid,
            id: selectedId,
            exam_type: backendHistoryType(type),
        });

        if (bad(result)) {
            return send({
                status: false,
                message: result?.message || "Saved attempt unavailable.",
            }, result?.httpStatus === 429 ? 429 : 502);
        }

        const attempt = records(result).find(
            (row) => attemptIdOf(row) === selectedId
        );

        if (!attempt) {
            return send({
                status: false,
                message: "Selected saved attempt was not returned.",
            }, 404);
        }

        const owner = attempt.uid ?? attempt.user_id;
        const course =
            attempt.cid ?? attempt.course_id ?? attempt.courseId;
        const returnedType = attempt.exam_type;

        if (
            (owner != null && Number(owner) !== uid) ||
            (course != null && Number(course) !== cid) ||
            (returnedType != null &&
                backendHistoryType(returnedType) !== backendHistoryType(type))
        ) {
            return send({
                status: false,
                message: "Attempt does not belong to this student or course.",
            }, 403);
        }

        const examId = id(
            attempt.exam_id ?? attempt.examid ??
            attempt.test_id ?? attempt.testId
        );

        if (!examId) {
            return send({
                status: false,
                message: "Original exam ID is missing.",
            }, 422);
        }

        let paper = { questions: [], imagePath: "" };
        let questionError = "";

        try {
            paper = await fetchQuestionPaper({
                uid, cid, examId, type,
            });

            if (!paper.questions.length) {
                questionError = "The question API returned an empty paper.";
            }
        } catch (error) {
            questionError = error.message;
            console.error("QUESTION PAPER:", type, examId, error.message);
        }

        return send({
            status: true,
            attemptId: selectedId,
            examId,
            examType: type,
            attempt,
            questions: paper.questions,
            imagePath: paper.imagePath,
            questionError,
        });
    } catch (error) {
        console.error("QUESTION REVIEW:", error);

        return send({
            status: false,
            message: "Unable to load exam review.",
        }, 500);
    }
}
