# Vercel Environment Variables — Bajiman

Set these in each Vercel project → **Settings → Environment Variables**
(scope: **Production** + **Preview**). Values below mirror the working local
`server/.env`. Do **not** commit real secrets to git.

---

## 1) SERVER project (`bajiman-server`)

Root directory: `server`

| Key | Value | Notes |
|-----|-------|-------|
| `VERCEL` | `1` | Skips `app.listen` (serverless). Vercel usually sets this automatically; set it explicitly to be safe. |
| `MONGO_URI` | `mongodb+srv://abdurrazzak7395_db_user:gfNcmCTQp7qfCwJj@cluster0.e1nyt5v.mongodb.net/bajiman?appName=Cluster0` | Password has **no** `< >` brackets. `/bajiman` = DB name. |
| `JWT_SECRET` | `n8GT-B8EisRCaTVlF2iCdcqA9x3nIR-Vrnkt8zf5hyBh1wsblBs7bsG-VEDAT5CE` | |
| `JWT_EXPIRE` | `30d` | |
| `OTP_API_KEY` | `demo-otp-key` | |
| `WORLD_CASINO_ENABLED` | `true` | |
| `WORLD_CASINO_API_URL` | `https://world-casino-api.com/api/v1` | Aliased to `NINEWICKET_API_BASE`. |
| `WORLD_CASINO_TOKEN` | `b72a0beafb2bcbf595056a6d2ff324c9` | |
| `WORLD_CASINO_SECRET` | `44ea1f9b7f1e6f235c06685cb9720b4a` | Must be exactly **32 bytes**. |
| `WORLD_CASINO_RETURN_URL` | `https://bajiman-client-one.vercel.app/` | HTTPS, **no** query string. |
| `WORLD_CASINO_CALLBACK_URL` | `https://bajiman-server.vercel.app/api/callback/9wicket` | HTTPS, publicly reachable. |
| `WORLD_CASINO_9WICKET_GAME_UID` | `11539` | |
| `WORLD_CASINO_9WICKET_SOURCE_GAME_UIDS` | `48341a3bf62b6dd0814d7129e7e0834b` | Legacy IDs that resolve to 9Wicket. |
| `HEALTH_CHECK_KEY` | *(any strong random string)* | Required to call `/api/9wicket/health` in prod. Send as `x-health-key` header or `?key=`. Leave unset to keep the endpoint open (dev only). |
| `OUTBOUND_PROXY_URL` | *(empty, or `http://user:pass@STATIC_IP:PORT`)* | Routes provider calls through a fixed-IP proxy so the provider sees a stable whitelisted IP. See "static egress" below. |
| `ALLOWED_ORIGINS` | `https://bajiman-client-one.vercel.app,https://<admin>.vercel.app,https://<affiliate>.vercel.app` | Comma-separated list of client origins allowed to make credentialed requests. Leave **empty** only in local dev (reflects any origin). Requests without an Origin header (provider callbacks, server-to-server) always pass. |

> The server also accepts `NINEWICKET_*` names directly; the `WORLD_CASINO_*`
> names above are auto-mapped, so you only need one set.

**MongoDB Atlas:** Network Access → allow the server's egress. On Vercel that
means `0.0.0.0/0` (serverless IPs are dynamic) or a static-IP egress.

---

## 2) CLIENT project (`bajiman-client-one`)

Root directory: `client`

Two supported wiring modes — pick ONE:

**Mode A — client calls the server directly (simplest):**

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://bajiman-server.vercel.app` |

**Mode B — go through the built-in serverless proxy** (`client/api/[...path].js`,
used when `VITE_API_URL` is empty and requests hit `/api/*` on the client origin):

| Key | Value | Notes |
|-----|-------|-------|
| `VITE_API_URL` | *(leave empty)* | Forces same-origin `/api/*` calls. |
| `BACKEND_API_URL` | `https://bajiman-server.vercel.app` | Where the proxy forwards. |
| `VERCEL_BYPASS_SECRET` | *(only if the server project has Deployment Protection on)* | Sent as `x-vercel-protection-bypass`. |

Optional cross-app links used by the client UI (set to the deployed URLs):

| Key | Example |
|-----|---------|
| `VITE_ADMIN_URL` | `https://<admin>.vercel.app` |
| `VITE_AFFILIATE_URL` | `https://<affiliate>.vercel.app` |
| `VITE_BRAND_URL` | `https://<brand>.vercel.app` |
| `VITE_GUIDE_URL` | `https://<guide>.vercel.app` |

> `VITE_*` values are baked in at **build time** — redeploy after changing them.

---

## 3) ADMIN project (`admin`) — if deployed

Root directory: `admin`

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://bajiman-server.vercel.app` |

(Admin also ships a `admin/api/[...path].js` proxy; if you use it, set
`BACKEND_API_URL` the same way as the client Mode B.)

---

## 4) AFFILIATE / BRAND / GUIDE — if deployed

| Project | Key | Value |
|---------|-----|-------|
| affiliate | `VITE_API_URL` | `https://bajiman-server.vercel.app` |
| affiliate | `VITE_CLIENT_URL` | `https://bajiman-client-one.vercel.app` |
| Brand | `VITE_CLIENT_URL` / `VITE_REGISTER_URL` | `https://bajiman-client-one.vercel.app` |
| Guide | `VITE_CLIENT_URL` | `https://bajiman-client-one.vercel.app` |

---

## ⚠️ Static egress (keep 9Wicket working when the provider tightens whitelisting)

The provider whitelists by **source IP**. Vercel serverless egress IPs are
**dynamic**, so a launch can start failing with `IP <x> not whitelisted` at any
time. The server now supports routing all provider calls through a fixed-IP
proxy:

1. Stand up (or rent) an HTTP proxy that has a **static outbound IP**
   (e.g. a small VPS running Squid/tinyproxy, or a managed static-egress /
   fixed-IP proxy service).
2. Give that static IP to the World Casino admin to **whitelist**.
3. Set `OUTBOUND_PROXY_URL` on the **server** project, e.g.
   `http://user:pass@STATIC_IP:8080` (or `https://…`). Leave it empty to send
   traffic directly (works only where the host IP itself is whitelisted).

Alternatively, host the Express server on a VPS/container with its own stable
IP instead of Vercel serverless, and whitelist that IP directly.

Verify anytime with:
`GET https://bajiman-server.vercel.app/api/9wicket/health` (with the
`x-health-key` header). Check `config.outboundProxyConfigured` and
`providerCheck.ipWhitelisted`.
