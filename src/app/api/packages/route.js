import { NextResponse } from "next/server";
import { getPackagesList } from "@/lib/packagesHelper";
import { getStudentSession } from "@/lib/auth/getStudentSession";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const cid = Number(new URL(request.url).searchParams.get("cid"));

  if (!Number.isSafeInteger(cid) || cid <= 0) {
    return NextResponse.json(
      { status: false, message: "A valid exam category is required." },
      { status: 400 }
    );
  }

  try {
    const session = await getStudentSession();
    const uid = Number(session?.uid) || 0;
    const packages = await getPackagesList({
      uid,
      cid,
      throwOnError: true,
    });

    return NextResponse.json(
      {
        status: true,
        authenticated: uid > 0,
        profileCompleted: session?.stage === "completed",
        packages: packages.map((item) => ({
          id: item.id,
          cid: item.cid,
          package: item.package,
          tag: item.tag,
          imageUrl: item.imageUrl,
          course: item.course,
          courseId: item.courseId,
          slug: item.slug,
          purchaseAvailable: item.purchaseAvailable,
        })),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("GET /api/packages failed:", error);

    return NextResponse.json(
      { status: false, message: "Unable to load available plans." },
      { status: 500 }
    );
  }
}
