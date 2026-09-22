import "dotenv/config";

const backendUrl = (process.env.BACKEND_URL || "https://bajiman-server.vercel.app").replace(/\/+$/, "");
const token = String(process.env.JWT_TOKEN || "").trim();
const gameUid = String(process.env.GAME_UID || "").trim();

if (!token || !gameUid) {
  console.error("Usage: JWT_TOKEN='<user JWT>' GAME_UID='<game uid>' npm run test:oracle-launch");
  process.exit(2);
}

const response = await fetch(`${backendUrl}/api/game/launch`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ game_uid: gameUid }),
});

const text = await response.text();
let body;
try {
  body = JSON.parse(text);
} catch {
  body = { raw: text.slice(0, 300) };
}

const launchUrl =
  body?.gameUrl ||
  body?.launch_url ||
  body?.data?.gameUrl ||
  body?.data?.launch_url ||
  body?.url ||
  body?.data?.url ||
  "";

console.log(JSON.stringify({
  backendUrl,
  endpoint: "/api/game/launch",
  gameUid,
  httpStatus: response.status,
  success: body?.success === true,
  oracleResponseDetected: response.status >= 200 && response.status < 300,
  launchUrlReturned: Boolean(launchUrl),
  launchUrlOrigin: launchUrl ? (() => { try { return new URL(launchUrl).origin; } catch { return "invalid-url"; } })() : null,
  message: body?.message || "",
}, null, 2));

if (!response.ok || body?.success !== true || !launchUrl) process.exit(1);
