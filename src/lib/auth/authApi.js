// src/lib/auth/authApi.js

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
   COMMON POST REQUEST
========================================================= */

async function postAuthRequest(
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
        value ===
          undefined ||
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
        method: "POST",

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
    console.error(
      `${endpoint} RAW RESPONSE:`,
      text
    );

    throw new Error(
      `${endpoint} returned invalid JSON.`
    );
  }

  if (!response.ok) {
    throw new Error(
      result?.msg ||
        result?.message ||
        `${endpoint} failed with status ${response.status}.`
    );
  }

  return result;
}

/* =========================================================
   SEND LOGIN OTP

   Backend:
   sendOTPforLogin

   Fields:
   api
   type
   mobile
   code
   email
========================================================= */

export async function sendLoginOtp({
  email,
} = {}) {
  const cleanEmail =
    String(
      email || ""
    )
      .trim()
      .toLowerCase();

  if (!cleanEmail) {
    throw new Error(
      "Email is required."
    );
  }

  return postAuthRequest(
    "sendOTPforLogin",
    {
      type: "email",

      mobile: "",

      code: "+91",

      email:
        cleanEmail,
    }
  );
}

/* =========================================================
   VERIFY OTP

   Backend:
   VerifyOTP

   Fields:
   api
   email
   otp
   type
   model
   manufacture
   brand
   sdk
   release
   token
========================================================= */

export async function verifyLoginOtp({
  email,
  otp,
} = {}) {
  const cleanEmail =
    String(
      email || ""
    )
      .trim()
      .toLowerCase();

  const cleanOtp =
    String(
      otp || ""
    ).trim();

  if (!cleanEmail) {
    throw new Error(
      "Email is required."
    );
  }

  if (!cleanOtp) {
    throw new Error(
      "OTP is required."
    );
  }

  return postAuthRequest(
    "VerifyOTP",
    {
      email:
        cleanEmail,

      otp:
        cleanOtp,

      type:
        "email",

      model:
        "desktop",

      manufacture:
        "desktop",

      brand:
        "desktop",

      sdk:
        "desktop",

      release:
        "1.0.0",

      token:
        "web_login",
    }
  );
}

/* =========================================================
   SET USER PROFILE

   Backend:
   setUserProfile

   Fields:
   api
   name
   email
   mobile
   dob
   place
   promocode
   code
   uid
   avatar
========================================================= */

export async function setUserProfile({
  name,
  email,
  mobile,
  dob,
  place,
  promocode = "",
  code = "+91",
  uid,
  avatar,
} = {}) {
  if (!uid) {
    throw new Error(
      "User ID is required."
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

  return postAuthRequest(
    "setUserProfile",
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