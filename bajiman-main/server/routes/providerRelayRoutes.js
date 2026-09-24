import express from "express";
import axios from "axios";

// Authenticated forward-relay for the game provider API. Deployed on a host
// whose egress IP is whitelisted at the provider (e.g. a VPS or the preview
// pod). Vercel (dynamic IPs) forwards provider calls here via
// PROVIDER_RELAY_URL / PROVIDER_RELAY_KEY. Path-locked to the configured
// provider base URL so it can never be abused as an open proxy.
const router = express.Router();

const apiUrl = () =>
  String(
    process.env.NINEWICKET_API_BASE ||
      process.env.WORLD_CASINO_API_BASE ||
      process.env.WORLD_CASINO_API_URL ||
      "https://world-casino-api.com/api/v1",
  ).replace(/\/+$/, "");
const relaySecret = () => String(process.env.RELAY_SHARED_SECRET || "").trim();

router.post("/", async (req, res) => {
  const secret = relaySecret();
  if (!secret) {
    return res.status(404).json({ success: false, message: "Relay disabled" });
  }
  if (String(req.headers["x-relay-key"] || "") !== secret) {
    return res.status(401).json({ success: false, message: "Unauthorized relay request" });
  }

  const { method = "POST", path = "", body, params } = req.body || {};
  const m = String(method).toUpperCase();
  if (
    (m !== "POST" && m !== "GET") ||
    typeof path !== "string" ||
    !/^$|^\/[a-zA-Z0-9/_-]*$/.test(path)
  ) {
    return res.status(400).json({ success: false, message: "Bad relay request" });
  }

  try {
    const url = `${apiUrl()}${path}`;
    const upstream =
      m === "GET"
        ? await axios.get(url, { params, timeout: 20000 })
        : await axios.post(url, body, {
            headers: { "Content-Type": "application/json" },
            timeout: 20000,
          });
    return res.status(upstream.status).json(upstream.data);
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return res
      .status(502)
      .json({ success: false, message: `Relay upstream error: ${error.message}` });
  }
});

export default router;
