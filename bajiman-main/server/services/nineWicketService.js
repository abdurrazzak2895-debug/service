import axios from "axios";
import { decryptPayload, encryptPayload } from "./nineWicketCrypto.js";

export { decryptPayload, encryptPayload };

const apiUrl = () =>
  String(
    process.env.NINEWICKET_API_BASE ||
      process.env.WORLD_CASINO_API_BASE ||
      process.env.WORLD_CASINO_API_URL ||
      "https://world-casino-api.com/api/v1",
  ).replace(/\/+$/, "");
const token = () =>
  String(process.env.NINEWICKET_TOKEN || process.env.WORLD_CASINO_TOKEN || "").trim();
const secret = () =>
  String(process.env.NINEWICKET_SECRET || process.env.WORLD_CASINO_SECRET || "");

const requireConfig = () => {
  if (!token()) throw new Error("NINEWICKET_TOKEN is missing");
  if (Buffer.byteLength(secret(), "utf8") !== 32) {
    throw new Error("NINEWICKET_SECRET must be exactly 32 UTF-8 bytes");
  }
};

export const postTransfer = async (plain) => {
  requireConfig();
  const payload = { ...plain, token: token(), timestamp: Number(plain.timestamp || Date.now()) };
  const response = await axios.post(apiUrl(), { token: token(), payload: encryptPayload(payload) }, {
    headers: { "Content-Type": "application/json" },
    timeout: 60000,
  });
  const data = response.data || {};
  if (Number(data.code) !== 0) {
    const error = new Error(data.msg || "9Wicket transfer failed");
    error.providerResponse = data;
    throw error;
  }
  return data;
};

export const getTransactions = async (path, params) => {
  requireConfig();
  const response = await axios.get(`${apiUrl()}${path}`, {
    params: { ...params, token: token() },
    timeout: 60000,
  });
  const data = response.data || {};
  if (Number(data.code) !== 0) {
    const error = new Error(data.msg || "9Wicket history request failed");
    error.providerResponse = data;
    throw error;
  }
  return data;
};

export const configSummary = () => ({
  apiBase: apiUrl(),
  hasToken: Boolean(token()),
  secretConfigured: Buffer.byteLength(secret(), "utf8") === 32,
});
