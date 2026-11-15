import crypto from "node:crypto";
import { Buffer } from "node:buffer";
import { secrets } from "base44:runtime";

const DEFAULT_HMAC_SECRET = "minicaptcha_hmac_master_secret_2026_x89a3";

function getMasterKey() {
  try {
    return secrets?.get?.("HMAC_SECRET") || DEFAULT_HMAC_SECRET;
  } catch {
    return DEFAULT_HMAC_SECRET;
  }
}

export const PLAN_LIMITS = {
  free: 10000,
  starter: 100000,
  unlimited: Infinity,
};

export function hashSecret(secret) {
  if (!secret || typeof secret !== "string") return "";
  return crypto.createHash("sha256").update(secret.trim()).digest("hex");
}

export function generateSiteCredentials() {
  const randSite = crypto.randomBytes(8).toString("hex");
  const randSec = crypto.randomBytes(24).toString("hex");
  const sitekey = `mc_live_${randSite}`;
  const secret = `mc_sec_${randSec}`;
  const secret_hash = hashSecret(secret);
  const secret_hint = `${secret.slice(0, 10)}...${secret.slice(-4)}`;
  return { sitekey, secret, secret_hash, secret_hint };
}

export function signToken({ sitekey, host }) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 120; // 2 minutes expiry
  const payload = {
    sitekey,
    host: host || "unknown",
    iat: now,
    exp,
    nonce: crypto.randomBytes(8).toString("hex"),
  };

  const payloadJson = JSON.stringify(payload);
  const payloadB64 = Buffer.from(payloadJson).toString("base64url");
  const key = getMasterKey();
  const signature = crypto.createHmac("sha256", key).update(payloadB64).digest("base64url");

  return `${payloadB64}.${signature}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return { valid: false, error: "Malformed token" };
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { valid: false, error: "Invalid token structure" };
  }

  const [payloadB64, signature] = parts;
  const key = getMasterKey();
  const expectedSignature = crypto.createHmac("sha256", key).update(payloadB64).digest("base64url");

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSignature);

  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return { valid: false, error: "Invalid token signature" };
  }

  let payload;
  try {
    const decoded = Buffer.from(payloadB64, "base64url").toString("utf-8");
    payload = JSON.parse(decoded);
  } catch {
    return { valid: false, error: "Unable to decode token payload" };
  }

  const now = Math.floor(Date.now() / 1000);
  if (now > payload.exp) {
    return { valid: false, error: "Token has expired (2 minute validity window exceeded)" };
  }

  return { valid: true, payload };
}

export function getCurrentMonthString() {
  const d = new Date();
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}