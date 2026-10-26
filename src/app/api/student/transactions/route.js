import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/getStudentSession";
import {
  getUserTransactionDetails,
  getUserTransactions,
} from "@/lib/pscApi";

export const dynamic = "force-dynamic";

function reply(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request) {
  try {
    const session = await getStudentSession();
    const uid = String(session?.uid ?? "");

    if (!/^[1-9]\d*$/.test(uid)) {
      return reply(
        { status: false, message: "Please sign in to view your purchases." },
        401
      );
    }

    const tid = new URL(request.url).searchParams.get("tid");
    if (tid !== null && !/^[1-9]\d*$/.test(tid)) {
      return reply(
        { status: false, message: "A valid transaction ID is required." },
        400
      );
    }

    const result = tid
      ? await getUserTransactionDetails({ uid, tid })
      : await getUserTransactions({ uid });

    if (!result.status) {
      return reply(
        {
          status: false,
          message: result.message || "Unable to load your purchases.",
        },
        502
      );
    }

    return reply(
      tid
        ? { status: true, transaction: result.transaction }
        : { status: true, data: result.transactions }
    );
  } catch (error) {
    console.error("GET /api/student/transactions failed:", error);

    return reply(
      { status: false, message: "Unable to load your purchases." },
      500
    );
  }
}
