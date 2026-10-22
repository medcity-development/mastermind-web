import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/getStudentSession";
import { getPackageDetails } from "@/lib/packagesHelper";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const searchParams = new URL(request.url).searchParams;
  const cid = Number(searchParams.get("cid"));
  const pid = Number(searchParams.get("pid"));

  if (
    !Number.isSafeInteger(cid) ||
    cid <= 0 ||
    !Number.isSafeInteger(pid) ||
    pid <= 0
  ) {
    return NextResponse.json(
      { status: false, message: "A valid exam category and package are required." },
      { status: 400 }
    );
  }

  try {
    const session = await getStudentSession();
    const uid = Number(session?.uid);

    if (!Number.isSafeInteger(uid) || uid <= 0) {
      return NextResponse.json(
        { status: false, message: "Please log in to view package details." },
        { status: 401 }
      );
    }

    const details = await getPackageDetails({ uid, cid, pid });

    if (!details) {
      return NextResponse.json(
        { status: false, message: "Unable to load this package's details." },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { status: true, details },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("GET /api/packages/details failed:", error);

    return NextResponse.json(
      { status: false, message: "Unable to load package details." },
      { status: 500 }
    );
  }
}
