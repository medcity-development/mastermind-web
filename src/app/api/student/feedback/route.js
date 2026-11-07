import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/getStudentSession";

export const dynamic = "force-dynamic";

function reply(body, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
}

async function handleFeedback(request, adding) {
  try {
    const session = await getStudentSession();
    const uid = String(session?.uid ?? "");
    if (!/^[1-9]\d*$/.test(uid) || session?.stage !== "completed") {
      return reply({ status: false, message: "Please sign in to continue." }, 401);
    }

    let message;
    let problem;
    if (adding) {
      let body;
      try { body = await request.json(); } catch {
        return reply({ status: false, message: "Invalid request body." }, 400);
      }
      message = typeof body?.message === "string" ? body.message.trim() : "";
      problem = typeof body?.problem === "string" ? body.problem.trim() : "";
      if (!problem || problem.length > 150) {
        return reply({ status: false, message: "Enter a subject between 1 and 150 characters." }, 400);
      }
      if (!message || message.length > 2000) {
        return reply({ status: false, message: "Enter feedback between 1 and 2,000 characters." }, 400);
      }
    }

    const baseUrl = process.env.PSC_API_BASE_URL?.trim().replace(/\/+$/, "");
    const apiKey = process.env.PSC_API_KEY?.trim();
    if (!baseUrl || !apiKey) throw new Error("Missing feedback API configuration");
    const form = new FormData();
    form.append("api", apiKey);
    form.append("uid", uid);
    if (adding) {
      form.append("type", "feedback");
      form.append("message", message);
      form.append("problem", problem);
    }
    const response = await fetch(`${baseUrl}/${adding ? "AddFeedback" : "getFeedback"}`, {
      method: "POST", body: form, cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    });
    const result = await response.json();
    if (adding && response.ok && result?.status === false && result?.msg === "") {
      return reply({ status: false, message: "You have already submitted this feedback. Select View feedbacks to check its reply." }, 409);
    }
    if (!response.ok || ![true, 1, "1", "true"].includes(result?.status)) {
      return reply({ status: false, message: adding ? "Unable to submit feedback. Please try again." : "Unable to load feedback. Please try again." }, 502);
    }
    if (adding) return reply({ status: true, message: "Feedback submitted successfully." });

    const rows = Array.isArray(result.details) ? result.details : [];
    const feedback = rows
      .filter(row => row && String(row.user_id) === uid && row.type === "feedback")
      .map(row => ({ id: row.id, problem: String(row.problem ?? ""), message: String(row.message ?? ""), reply: String(row.reply ?? ""), createdAt: String(row.created_at ?? "") }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return reply({ status: true, data: feedback });
  } catch {
    return reply({ status: false, message: "Feedback service is temporarily unavailable. Please try again." }, 502);
  }
}

export async function GET(request) { return handleFeedback(request, false); }
export async function POST(request) { return handleFeedback(request, true); }
