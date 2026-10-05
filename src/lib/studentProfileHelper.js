import "server-only";

const API_BASE_URL =
    process.env.PSC_API_BASE_URL;

const API_KEY =
    process.env.PSC_API_KEY;

/* =========================================================
   CONFIG
========================================================= */

function getConfig() {
    if (!API_BASE_URL) {
        throw new Error(
            "PSC_API_BASE_URL is missing."
        );
    }

    if (!API_KEY) {
        throw new Error(
            "PSC_API_KEY is missing."
        );
    }

    return {
        baseUrl:
            String(
                API_BASE_URL
            )
                .trim()
                .replace(
                    /\/+$/,
                    ""
                ),

        apiKey:
            String(
                API_KEY
            ).trim(),
    };
}

/* =========================================================
   COMMON POST
========================================================= */

async function postProfileRequest(
    endpoint,
    fields = {}
) {
    const {
        baseUrl,
        apiKey,
    } = getConfig();

    const formData =
        new FormData();

    formData.append(
        "api",
        apiKey
    );

    Object.entries(
        fields
    ).forEach(
        ([key, value]) => {
            if (
                value === undefined ||
                value === null
            ) {
                return;
            }

            formData.append(
                key,
                String(value)
            );
        }
    );

    const response =
        await fetch(
            `${baseUrl}/${endpoint}`,
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

    const text =
        await response.text();

    let result = {};

    try {
        result =
            text
                ? JSON.parse(
                    text
                )
                : {};
    } catch {
        throw new Error(
            `${endpoint} returned invalid JSON.`
        );
    }

    if (!response.ok) {
        throw new Error(
            result?.msg ||
            result?.message ||
            `${endpoint} failed.`
        );
    }

    return result;
}

/* =========================================================
   GET STUDENT PROFILE
========================================================= */

export async function getStudentProfile({
    uid,
    cid,
} = {}) {
    if (!uid) {
        throw new Error(
            "Student ID is required."
        );
    }

    if (!cid) {
        throw new Error(
            "Course ID is required."
        );
    }

    const result =
        await postProfileRequest(
            "getStudentProfile",
            {
                uid,
                cid,
            }
        );

    const profile =
        Array.isArray(
            result?.data
        )
            ? result.data[0] ??
            null
            : result?.data ??
            null;

    return {
        status:
            result?.status ===
            true,

        profile,

        message:
            result?.msg ||
            result?.message ||
            "",
    };
}

/* =========================================================
   UPDATE STUDENT PROFILE
========================================================= */

export async function updateStudentProfile({
    uid,
    name,
    email,
    mobile,
    dob,
    place,
    promocode = "",
    code = "+91",
    avatar = "",
} = {}) {
    if (!uid) {
        throw new Error(
            "Student ID is required."
        );
    }

    if (!name) {
        throw new Error(
            "Name is required."
        );
    }

    if (!email) {
        throw new Error(
            "Email is required."
        );
    }

    return postProfileRequest(
        "updateUserProfile",
        {
            name,
            email,
            mobile,
            dob,
            place,
            promocode,
            code,
            uid,
            avatar,
        }
    );
}