
import "server-only";

const API_BASE_URL = process.env.PSC_API_BASE_URL;
const API_KEY = process.env.PSC_API_KEY;

function getConfig() {
  if (!API_BASE_URL) {
    throw new Error("PSC_API_BASE_URL is missing.");
  }

  if (!API_KEY) {
    throw new Error("PSC_API_KEY is missing.");
  }

  return {
    baseUrl: String(API_BASE_URL)
      .trim()
      .replace(/\/+$/, ""),
    apiKey: String(API_KEY).trim(),
  };
}

async function postProfileRequest(endpoint, fields = {}) {
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
      `${endpoint} returned invalid JSON.`
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

export function normalizeStudentProfile(result) {
  const data = result?.data;

  if (Array.isArray(data)) {
    return data[0] ?? null;
  }

  if (data && typeof data === "object") {
    return data;
  }

  return null;
}

export function isStudentProfileCompleted(profile) {
  if (!profile || typeof profile !== "object") {
    return false;
  }

  return (
    String(profile.stage ?? "")
      .trim()
      .toLowerCase() === "completed"
  );
}

export async function getStudentProfile({
  uid,
  cid = 1,
} = {}) {
  const studentId = Number(uid);
  const courseId = Number(cid);

  if (!Number.isInteger(studentId) || studentId <= 0) {
    throw new Error("Valid student ID is required.");
  }

  if (!Number.isInteger(courseId) || courseId <= 0) {
    throw new Error("Valid course ID is required.");
  }

  const result = await postProfileRequest(
    "getStudentProfile",
    {
      uid: studentId,
      cid: courseId,
    }
  );

  const profile = normalizeStudentProfile(result);

  return {
    status: result?.status === true,
    profile,
    profileCompleted: isStudentProfileCompleted(profile),
    message: result?.msg || result?.message || "",
  };
}

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
    throw new Error("Student ID is required.");
  }

  if (!String(name ?? "").trim()) {
    throw new Error("Name is required.");
  }

  if (!String(email ?? "").trim()) {
    throw new Error("Email is required.");
  }

  return postProfileRequest(
    "updateUserProfile",
    {
      uid,
      name,
      email,
      mobile,
      dob,
      place,
      promocode,
      code,
      avatar,
    }
  );
}
