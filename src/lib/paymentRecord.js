import "server-only";
import { localPaymentCommand } from "@/lib/localPaymentStore";

// Required: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.
// This durable record is an anti-duplicate-payment gate, not proof of access.
function config() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!url || !token || !url.startsWith("https://")) {
    throw new Error(
      "Payment tracking Redis is not configured; checkout is disabled to avoid duplicate charges."
    );
  }

  return {
    url: url.replace(/\/+$/, ""),
    token,
  };
}

async function command(...args) {
  if (
    process.env.NODE_ENV === "development" &&
    !process.env.UPSTASH_REDIS_REST_URL?.trim() &&
    !process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  ) {
    return localPaymentCommand(args);
  }

  const { url, token } = config();

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });

  const data = await response.json();

  if (!response.ok || data?.error) {
    throw new Error("Payment tracking service unavailable.");
  }

  return data.result;
}

const key = (uid, cid, pid) =>
  `mm:payment:v1:${uid}:${cid}:${pid}`;

export async function getPaymentRecord(uid, cid, pid) {
  const raw = await command("GET", key(uid, cid, pid));

  if (!raw) return null;

  return JSON.parse(raw);
}

export async function reservePayment(uid, cid, pid) {
  const record = {
    uid,
    cid,
    pid,
    state: "creating",
    createdAt: Date.now(),
  };

  const result = await command(
    "SET",
    key(uid, cid, pid),
    JSON.stringify(record),
    "NX"
  );

  return result === "OK" ? record : null;
}

export async function savePaymentRecord(uid, cid, pid, record) {
  await command(
    "SET",
    key(uid, cid, pid),
    JSON.stringify(record)
  );
}

export async function releasePayment(uid, cid, pid) {
  await command("DEL", key(uid, cid, pid));
}
