import { NextResponse } from "next/server";

import {
  getOwnedPackages,
} from "@/lib/packageAccess";

import {
  getPackagesList,
} from "@/lib/packagesHelper";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function reply(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
    },
  });
}

function normalizeId(value) {
  const text = String(value ?? "").trim();

  if (!/^[1-9]\d*$/.test(text)) {
    return null;
  }

  const id = Number(text);

  return Number.isSafeInteger(id) ? id : null;
}

function resolveImageUrl(item, iconPath) {
  if (item?.imageUrl) {
    return item.imageUrl;
  }

  const icon = String(item?.icon ?? "").trim();

  if (!icon) {
    return "";
  }

  if (/^https?:\/\//i.test(icon)) {
    return icon;
  }

  if (!iconPath) {
    return "";
  }

  return (
    iconPath.replace(/\/+$/, "") +
    "/" +
    icon.replace(/^\/+/, "")
  );
}

export async function GET(request) {
  const params = new URL(request.url).searchParams;

  const cid = normalizeId(params.get("cid"));

  if (!cid) {
    return reply(
      {
        status: false,
        message: "A valid exam category is required.",
      },
      400
    );
  }

  try {
    const session = await getStudentSession();

    const uid = normalizeId(session?.uid) ?? 0;

    const packages = await getPackagesList({
      uid,
      cid,
      throwOnError: true,
    });

    if (!Array.isArray(packages)) {
      throw new Error("Invalid package list response.");
    }

    // Image base path supplied by the PSC API.
    const iconPath =
      "https://psc.technocitysolutions.com/public/images/package/";

    let owned = [];
    let ownershipVerified = uid === 0;

    if (uid > 0) {
      try {
        const result = await getOwnedPackages(uid, cid);

        if (!Array.isArray(result)) {
          throw new Error(
            "Invalid subscription verification response."
          );
        }

        owned = result;
        ownershipVerified = true;
      } catch (error) {
        console.error(
          "Unable to verify owned packages:",
          error?.message
        );

        ownershipVerified = false;
      }
    }

    const ownedIds = new Set(
      owned
        .map(
          (item) =>
            normalizeId(
              item?.pid ??
              item?.package_id ??
              item?.plan?.pid
            )
        )
        .filter(Boolean)
        .map(String)
    );

    const normalizedPackages = packages.map((item) => {
      const id = normalizeId(
        item?.id ?? item?.pid
      );

      return {
        ...item,

        id,

        package:
          item?.package ??
          item?.package_name ??
          item?.name ??
          "Premium Package",

        icon: item?.icon ?? "",

        imageUrl: resolveImageUrl(
          item,
          iconPath
        ),

        packageAccess:
          ownershipVerified &&
          id !== null &&
          ownedIds.has(String(id)),

        purchaseAvailable:
          ownershipVerified &&
          !ownedIds.has(String(id)) &&
          item?.purchaseAvailable !== false,
      };
    });

    return reply({
      status: true,
      authenticated: uid > 0,
      profileCompleted:
        session?.stage === "completed",

      ownershipVerified,

      hasActivePlan:
        ownershipVerified &&
        owned.length > 0,

      icon_path: iconPath,
      iconPath,

      packages: normalizedPackages,
    });
  } catch (error) {
    console.error(
      "GET /api/packages failed:",
      error?.message
    );

    return reply(
      {
        status: false,
        message:
          "Unable to load available premium packages.",
      },
      500
    );
  }
}