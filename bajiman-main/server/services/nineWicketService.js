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

// Optional static-IP egress: route provider calls through a fixed-IP proxy so
// the provider always sees the same whitelisted source IP (essential on Vercel
// where serverless egress IPs are dynamic). Set OUTBOUND_PROXY_URL, e.g.
// http://user:pass@1.2.3.4:8080 . Falls back to standard HTTPS_PROXY env.
// Return false to explicitly disable axios' default env-proxy pickup.
const proxyConfig = () => {
  const raw = String(
    process.env.OUTBOUND_PROXY_URL ||
      process.env.HTTPS_PROXY ||
      process.env.https_proxy ||
      "",
  ).trim();
  if (!raw) return false;
  try {
    const u = new URL(raw);
    return {
      protocol: u.protocol.replace(":", ""),
      host: u.hostname,
      port: Number(u.port) || (u.protocol === "https:" ? 443 : 80),
      ...(u.username
        ? {
            auth: {
              username: decodeURIComponent(u.username),
              password: decodeURIComponent(u.password),
            },
          }
        : {}),
    };
  } catch {
    return false;
  }
};

export const postTransfer = async (plain) => {
  requireConfig();
  const payload = { ...plain, token: token(), timestamp: Number(plain.timestamp || Date.now()) };
  const response = await axios.post(apiUrl(), { token: token(), payload: encryptPayload(payload) }, {
    headers: { "Content-Type": "application/json" },
    timeout: 20000,
    proxy: proxyConfig(),
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
    timeout: 20000,
    proxy: proxyConfig(),
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
  outboundProxyConfigured: proxyConfig() !== false,
});
