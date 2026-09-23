import crypto from "node:crypto";

const getSecret = () => String(process.env.NINEWICKET_SECRET || "");

const requireSecret = () => {
  const value = getSecret();
  if (Buffer.byteLength(value, "utf8") !== 32) {
    throw new Error("NINEWICKET_SECRET must be exactly 32 UTF-8 bytes");
  }
  return value;
};

export const encryptPayload = (plain) => {
  const cipher = crypto.createCipheriv("aes-256-ecb", Buffer.from(requireSecret(), "utf8"), null);
  cipher.setAutoPadding(true);
  return Buffer.concat([cipher.update(JSON.stringify(plain), "utf8"), cipher.final()]).toString("base64");
};

export const decryptPayload = (encoded) => {
  const decipher = crypto.createDecipheriv("aes-256-ecb", Buffer.from(requireSecret(), "utf8"), null);
  decipher.setAutoPadding(false);
  const raw = Buffer.concat([decipher.update(Buffer.from(String(encoded), "base64")), decipher.final()]);
  const pad = raw.at(-1);
  if (!pad || pad < 1 || pad > 16 || pad > raw.length) throw new Error("Invalid PKCS7 padding");
  return JSON.parse(raw.subarray(0, raw.length - pad).toString("utf8"));
};
