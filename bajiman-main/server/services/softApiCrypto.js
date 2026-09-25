import crypto from "node:crypto";

export const resolveSoftApiSecret = (env = process.env) => {
  const sandboxEnabled =
    String(env.SOFTAPI_SANDBOX_LAUNCH_ENABLED || "").trim().toLowerCase() ===
    "true";
  const reuseWorldCasinoCredentials =
    String(env.SOFTAPI_SANDBOX_REUSE_WORLD_CASINO_CREDENTIALS || "")
      .trim()
      .toLowerCase() === "true";
  const sandboxSecret = sandboxEnabled
    ? env.SOFTAPI_SANDBOX_SECRET ||
      (reuseWorldCasinoCredentials
        ? env.NINEWICKET_SECRET || env.WORLD_CASINO_SECRET
        : "")
    : "";

  return String(sandboxSecret || env.SOFTAPI_SECRET || env.IGAMING_API_SECRET || "");
};

const requireSecret = (secret = resolveSoftApiSecret()) => {
  const value = String(secret || "");
  if (Buffer.byteLength(value, "utf8") !== 32) {
    throw new Error("SoftAPI API secret must be exactly 32 UTF-8 bytes");
  }
  return value;
};

export const encryptSoftApiPayload = (value, secret = resolveSoftApiSecret()) => {
  const cipher = crypto.createCipheriv(
    "aes-256-ecb",
    Buffer.from(requireSecret(secret), "utf8"),
    null,
  );
  cipher.setAutoPadding(true);
  return Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]).toString("base64");
};

export const decryptSoftApiPayload = (encoded, secret = resolveSoftApiSecret()) => {
  if (typeof encoded !== "string" || !encoded || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encoded)) {
    throw new Error("SoftAPI payload must be valid Base64");
  }
  const ciphertext = Buffer.from(encoded, "base64");
  if (!ciphertext.length || ciphertext.length % 16 !== 0 || ciphertext.toString("base64") !== encoded) {
    throw new Error("SoftAPI payload has an invalid ciphertext length");
  }
  const decipher = crypto.createDecipheriv(
    "aes-256-ecb",
    Buffer.from(requireSecret(secret), "utf8"),
    null,
  );
  decipher.setAutoPadding(false);
  const padded = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  const pad = padded.at(-1);
  if (!pad || pad > 16 || pad > padded.length) {
    throw new Error("Invalid SoftAPI PKCS7 padding");
  }
  for (let index = padded.length - pad; index < padded.length; index += 1) {
    if (padded[index] !== pad) throw new Error("Invalid SoftAPI PKCS7 padding");
  }
  return JSON.parse(padded.subarray(0, padded.length - pad).toString("utf8"));
};

export const softApiSecretConfigured = (env = process.env) => {
  try {
    requireSecret(resolveSoftApiSecret(env));
    return true;
  } catch {
    return false;
  }
};

export { requireSecret as requireSoftApiSecret };

export default {
  decryptSoftApiPayload,
  encryptSoftApiPayload,
  resolveSoftApiSecret,
  softApiSecretConfigured,
};
