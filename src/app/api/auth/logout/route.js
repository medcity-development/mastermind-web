// src/app/api/auth/logout/route.js

import { NextResponse } from "next/server";

export async function POST() {
    try {
        const response = NextResponse.json(
            {
                status: true,
                message: "Logged out successfully.",
            },
            {
                status: 200,
            }
        );

        /* =========================================================
           CLEAR AUTH COOKIES
        ========================================================= */

        response.cookies.set(
            "student_auth_token",
            "",
            {
                httpOnly: true,
                secure:
                    process.env.NODE_ENV ===
                    "production",
                sameSite: "lax",
                path: "/",
                maxAge: 0,
                expires: new Date(0),
            }
        );

        response.cookies.set(
            "mastermind_uid",
            "",
            {
                httpOnly: true,
                secure:
                    process.env.NODE_ENV ===
                    "production",
                sameSite: "lax",
                path: "/",
                maxAge: 0,
                expires: new Date(0),
            }
        );

        response.cookies.set(
            "mastermind_email",
            "",
            {
                httpOnly: true,
                secure:
                    process.env.NODE_ENV ===
                    "production",
                sameSite: "lax",
                path: "/",
                maxAge: 0,
                expires: new Date(0),
            }
        );

        response.cookies.set(
            "mastermind_stage",
            "",
            {
                httpOnly: true,
                secure:
                    process.env.NODE_ENV ===
                    "production",
                sameSite: "lax",
                path: "/",
                maxAge: 0,
                expires: new Date(0),
            }
        );

        response.cookies.set(
            "mastermind_mobile",
            "",
            {
                httpOnly: true,
                secure:
                    process.env.NODE_ENV ===
                    "production",
                sameSite: "lax",
                path: "/",
                maxAge: 0,
                expires: new Date(0),
            }
        );

        return response;
    } catch (error) {
        console.error(
            "LOGOUT ROUTE ERROR:",
            error
        );

        return NextResponse.json(
            {
                status: false,
                message:
                    "Unable to logout. Please try again.",
            },
            {
                status: 500,
            }
        );
    }
}
