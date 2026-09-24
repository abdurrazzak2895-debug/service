# Bajiman — Repo Audit & 9Wicket/World Casino Fix

## Problem statement
User provided backend env values (PORT, MONGO_URI with `<password>` brackets, JWT, and
WORLD_CASINO_* / 9Wicket transfer-wallet integration) and asked to audit the repo,
get the server running, and fix why 9Wicket / World Casino game launch is not working
(both locally and on Vercel).

## Architecture
- Monorepo `bajiman-main/` with 6 apps: `server` (Express 5 + Mongoose, ESM),
  `client`, `admin`, `affiliate`, `Brand`, `Guide` (all Vite/React).
- Server deploys to Vercel (`bajiman-server.vercel.app`), client to
  `bajiman-client-one.vercel.app`. Serverless proxy at `client/api/[...path].js`.
- 9Wicket = World Casino transfer-wallet. Env supports WORLD_CASINO_* as fallback
  aliases for NINEWICKET_* (service/route resolvers). AES-256-ECB payload crypto,
  secret must be exactly 32 UTF-8 bytes.

## Findings (2026-06)
- **.env was missing** on server. Created `server/.env` from the provided values,
  removing the `< >` around the Mongo password. **MongoDB Atlas connects OK**
  (db = `bajiman`, currently empty — 0 active users).
- Server boots cleanly on PORT 5000; `/` health, auth guards, and callback routing
  (`/api/callback` Oracle vs `/api/callback/9wicket`) all verified working.
- **AES-256-ECB crypto round-trip verified**; secret `WORLD_CASINO_SECRET` is exactly
  32 bytes.
- **ROOT CAUSE of 9Wicket failure = provider IP whitelist.** Live call to the World
  Casino API returns: `IP 34.170.12.145 not whitelisted. Please contact administrator
  to whitelist your IP.` Token/secret are accepted; only the source IP is rejected.
  - Affects local (this container IP) AND Vercel (serverless egress IPs are dynamic,
    so they cannot be reliably whitelisted).
- Server maps this to a graceful `503 NINEWICKET_CONFIGURATION_ERROR` (no crash).
- Client builds successfully (`yarn build` → dist OK).

## What was changed
- Added `server/.env` (gitignored).
- Added `GET /api/9wicket/health` (config flags + live provider reachability; `?ping=false` for config only). File: `server/routes/nineWicketRoutes.js`.
- Added `server/scripts/seedTestUser.js` (idempotent demo player + JWT printer, optional `RUN_LAUNCH=true`).
- Added `bajiman-main/DEPLOYMENT_ENV.md` (exact Vercel env var lists for server/client/admin/etc).

## UPDATE (2026-06): 9Wicket now works END-TO-END
- The IP is now accepted by the provider. `/api/9wicket/health` reports
  `ipWhitelisted: true`, "Inquiry successful". A full authenticated launch
  (demo01, amount 10) returned a real playable game URL + session_id — balance
  transferred 0→10 on the provider side. The earlier "IP not whitelisted" block
  is resolved.

## Backlog / Next steps (mostly infra, provider-side)
- Whitelist a STATIC egress IP with the World Casino admin. For Vercel, route outbound
  through a fixed-IP proxy or host the server on a static-IP VPS.
- Set Vercel env vars for the server (all WORLD_CASINO_* / Mongo / JWT) and for the
  client proxy (`BACKEND_API_URL`).
- Seed/register a user to run a full authenticated launch e2e once IP is whitelisted.

## Session 2 (2026-06): 4 follow-ups + bug fixes (all verified by testing_agent)
Delivered & tested (iterations 1-3, all pass):
1. Health endpoint auth guard — GET /api/9wicket/health now guarded by HEALTH_CHECK_KEY
   (header x-health-key or ?key=). 401 without, 200 with. Config-only via ?ping=false.
2. Static egress proxy — nineWicketService routes provider calls through OUTBOUND_PROXY_URL
   (falls back to HTTPS_PROXY). configSummary/health expose outboundProxyConfigured.
3. Seed script — server/scripts/seedTestUser.js (demo01/demo1234, balance 2000, prints JWT,
   optional RUN_LAUNCH=true). Idempotent.
4. Client launch test — login (demo01) + open /play-game/11539 renders the 9Wicket iframe.

Bugs fixed this session (real, not just test-env):
- CORS: server used cors() with wildcard origin while client sends withCredentials -> browsers
  block credentialed cross-origin responses (would also break deployed client<->server on
  different vercel.app domains). Now cors({ origin: true, credentials: true }).
- PlayGame.jsx: pre-launch catalog lookup (GET /api/global/client/play-game/:id) 404'd on the
  empty catalog and showed "Game not found" before launch. Wrapped in try/catch, falls back to
  the route param as game_uid.
- PlayGame.jsx: launch effect double-fired (StrictMode) reserving double the amount + spurious
  error. Guarded with launchKeyRef (resets on failure so Try Again works).

Backend suite: 9/9 pass (test at /app/backend/tests/test_bajiman_api.py). Frontend: 100%.

Test-env runtime notes (this preview only):
- Express run on :8001 and Vite client on :3000 (ingress: /api->8001, else->3000).
- client/.env VITE_API_URL points at the preview URL; client/vite.config.js has
  server.allowedHosts:true (dev-only) so the preview host is accepted. Production values are in
  bajiman-main/DEPLOYMENT_ENV.md.
- By design (transfer-wallet), UI launch (no explicit amount) moves the whole local wallet into
  the 9Wicket provider wallet; POST /api/9wicket/cashout returns it.
