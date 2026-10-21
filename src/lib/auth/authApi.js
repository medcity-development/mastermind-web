
import "server-only";

function getConfig() {
  const baseUrl = String(
    process.env.PSC_API_BASE_URL ?? ""
  )
    .trim()
    .replace(/\/+$/, "");

  const apiKey = String(
    process.env.PSC_API_KEY ?? ""
  ).trim();

  if (!baseUrl) {
    throw new Error("PSC_API_BASE_URL is missing.");
  }

  if (!apiKey) {
    throw new Error("PSC_API_KEY is missing.");
  }

  return { baseUrl, apiKey };
}

async function postAuthRequest(endpoint, fields = {}) {
  const { baseUrl, apiKey } = getConfig();

  const formData = new FormData();

  formData.append("api", apiKey);

  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null) {
      continue;
    }

    formData.append(key, String(value));
  }

  const response = await fetch(
    `${baseUrl}/${endpoint}`,
    {
      method: "POST",
      body: formData,
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    }
  );

  const raw = await response.text();

  let result;

  try {
    result = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error(
      `${endpoint} returned an invalid JSON response.`
    );
  }

  if (!response.ok) {
    throw new Error(
      result?.msg ||
      result?.message ||
      `${endpoint} failed with HTTP ${response.status}.`
    );
  }

  return result;
}

// =====================================================
// SEND LOGIN OTP
// Backend: sendOTPforLogin
// =====================================================

export async function sendLoginOtp({
  email,
} = {}) {
  const cleanEmail = String(email ?? "")
    .trim()
    .toLowerCase();

  if (!cleanEmail) {
    throw new Error("Email is required.");
  }

  return postAuthRequest(
    "sendOTPforLogin",
    {
      type: "email",
      mobile: "",
      code: "+91",
      email: cleanEmail,
    }
  );
}

// =====================================================
// VERIFY OTP
// Backend: VerifyOTP
// =====================================================

export async function verifyLoginOtp({
  email,
  otp,
} = {}) {
  const cleanEmail = String(email ?? "")
    .trim()
    .toLowerCase();

  const cleanOtp = String(otp ?? "").trim();

  if (!cleanEmail) {
    throw new Error("Email is required.");
  }

  if (!/^\d{4,6}$/.test(cleanOtp)) {
    throw new Error("Enter a valid OTP.");
  }

  return postAuthRequest(
    "VerifyOTP",
    {
      email: cleanEmail,
      otp: cleanOtp,
      type: "email",
      model: "desktop",
      manufacture: "desktop",
      brand: "desktop",
      sdk: "desktop",
      release: "1.0.0",
      token: "web_login",
    }
  );
}

// =====================================================
// SET USER PROFILE
// Backend: setUserProfile
// =====================================================

export async function setUserProfile({
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
  const studentId = Number(uid);

  if (
    !Number.isInteger(studentId) ||
    studentId <= 0
  ) {
    throw new Error("Valid student ID is required.");
  }

  const cleanName = String(name ?? "").trim();

  const cleanEmail = String(email ?? "")
    .trim()
    .toLowerCase();

  if (!cleanName) {
    throw new Error("Name is required.");
  }

  if (!cleanEmail) {
    throw new Error("Email is required.");
  }

  return postAuthRequest(
    "setUserProfile",
    {
      uid: studentId,
      name: cleanName,
      email: cleanEmail,
      mobile: String(mobile ?? "").replace(/\D/g, ""),
      dob: String(dob ?? "").trim(),
      place: String(place ?? "").trim(),
      promocode: String(promocode ?? "").trim(),
      code: String(code ?? "+91").trim(),
      avatar: String(avatar ?? "").trim(),
    }
  );
}
