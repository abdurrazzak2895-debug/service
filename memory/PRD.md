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

## Session 3 verification (testing_agent iterations 5-6)
- Preview (iter 5): backend 15/15 code-path tests pass, frontend 100%, thumbnail fix
  verified rendering, graceful launch failure verified (single launch POST, balance
  restored to 2000).
- LIVE VERCEL (iter 6): core bug FIXED — DB routes return proper JSON, live login
  works (demo01, balance 2000), catalog/callback/CORS-echo all good, client login +
  /play-game/11539 graceful-failure e2e passes. User fixed Atlas 0.0.0.0/0 AND the
  Vercel MONGO_URI (was 'bad auth' — brackets/typo).
- Live-only issues found by iter 6:
  1. Double-slash API URLs from live client (VITE_API_URL had trailing '/') breaking
     CORS preflights -> FIXED IN CODE: axios.js + PlayGame.jsx now strip trailing
     slashes from the base URL (needs client redeploy via Save to Github).
  2. HEALTH_CHECK_KEY not set on Vercel -> /api/9wicket/health open without key.
     USER: add HEALTH_CHECK_KEY=bajiman-health-2026 to server project env + redeploy.
  3. ALLOWED_ORIGINS not set on Vercel -> CORS reflects any origin with credentials.
     USER: add ALLOWED_ORIGINS=<5 live origins from DEPLOYMENT_ENV.md> + redeploy.
  4. Minor: catalog provider.providerIcon still references dead igamingapis.com URL
     (client-facing image fields are fine).
- Live verification FINAL (testing_agent iter 7): 100% backend + 100% frontend on the
  LIVE Vercel deployment. Double-slash fix confirmed (0 occurrences across 23 API
  calls, 0 CORS console errors), login e2e OK, single launch POST, graceful Bengali
  error for the IP-whitelist block, balance restored. STILL PENDING USER ACTIONS:
  HEALTH_CHECK_KEY + ALLOWED_ORIGINS env vars on the Vercel server project (then
  redeploy), and OUTBOUND_PROXY_URL static-IP proxy for real 9Wicket launches.
- 9Wicket launches from Vercel still need OUTBOUND_PROXY_URL + provider IP whitelist.

## Session 3 (2026-09): Preview restore + live-site diagnosis + serverless DB fix
- FULL SUITE NOW GREEN: 21/21 pytest pass from this pod — the provider now accepts
  this pod's IP (34.16.56.64); real launch+cashout round-trip verified.
- NEW FEATURE — provider relay: `server/routes/providerRelayRoutes.js`
  (POST /api/provider-relay, guarded by RELAY_SHARED_SECRET header x-relay-key,
  path-locked to WORLD_CASINO_API_URL) + relay mode in nineWicketService
  (PROVIDER_RELAY_URL / PROVIDER_RELAY_KEY forward provider calls through a
  whitelisted host). Verified locally: 401 without key, real provider round-trip
  through the relay, configSummary.relayConfigured flag, health shows it.
- For LIVE 9Wicket launches, user must: (1) Save to Github, (2) add Vercel server
  env PROVIDER_RELAY_URL=https://<preview-pod>/api/provider-relay +
  PROVIDER_RELAY_KEY=relay-9w-4f8a2c7e1b9d3456f0a8c2e4b6d19753, (3) redeploy.
  NOTE: preview pod is ephemeral (IP/URL can change on restart) — demo-grade;
  production should use a VPS relay (documented in DEPLOYMENT_ENV.md Option 1).
- Pod was reset: recreated `server/.env` (values from DEPLOYMENT_ENV.md, PORT=8001,
  HEALTH_CHECK_KEY=bajiman-health-2026 matching the regression suite), repointed
  `client/.env` VITE_API_URL at the preview URL, reinstalled node_modules, and
  replaced the default supervisor conf (was pointing at non-existent /app/backend
  FastAPI + /app/frontend CRA) with Express-on-8001 + Vite-on-3000. Persistent copy
  at `/app/scripts/supervisord.conf`.
- Regression: 15/21 pass locally; the same 6 fail ONLY because this pod's egress IP
  (34.16.56.64) is not whitelisted at the provider (provider-side, documented).
- Fixed broken lobby thumbnail: provider feed's image URL for game 11539 404s
  (`igamingapis.com/img/11539.png/images/index.png`); replaced DB record image with
  a generated hosted thumbnail.
- LIVE SITE (bajiman-server.vercel.app) diagnosis: `/` and health?ping=false = 200,
  DB routes previously crashed with FUNCTION_INVOCATION_FAILED.
- FIX (serverless-safe DB + diagnostic detail in responses):
  - `server/config/db.js`: connection cached on globalThis across invocations,
    8s serverSelectionTimeout, NO process.exit (rethrows instead).
  - `server/index.js`: `app.use("/api", ...)` middleware awaits the cached
    connection per request; returns 503 JSON with error `detail` field instead of crashing.
  - `nineWicketService.js`: axios timeout 60s -> 20s.
- Vercel Environment Configuration Checklist:
  - Key: `MONGO_URI`
  - Value: `mongodb+srv://abdurrazzak7395_db_user:gfNcmCTQp7qfCwJj@cluster0.e1nyt5v.mongodb.net/bajiman?appName=Cluster0` (NO `< >` brackets).
  - Key: `JWT_SECRET`
  - Value: `n8GT-B8EisRCaTVlF2iCdcqA9x3nIR-Vrnkt8zf5hyBh1wsblBs7bsG-VEDAT5CE`
  - Key: `HEALTH_CHECK_KEY`
  - Value: `bajiman-health-2026`
  - Key: `VERCEL`
  - Value: `1`

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

## Session 4 (2026-06): Pod restore + run in Emergent preview + lobby polish
- User request: "check my repo, full copy all pages with similar design to https://marbaji88.com/bn/en". The repo already contains a full Marbaji-style clone (bajiman-main monorepo) from prior sessions; pod had been reset so nothing was running.
- Actions:
  - Wired supervisor to run the monorepo: Express `server` on :8001 (backend), Vite `client` on :3000 (frontend). Persistent copy in /app/scripts/supervisord.conf; live copy written to /etc/supervisor/conf.d/supervisord.conf.
  - Created `server/.env` -> local MongoDB (mongodb://127.0.0.1:27017/bajiman), PORT=8001, VERCEL=0, JWT, HEALTH_CHECK_KEY, WORLD_CASINO_ENABLED=false (provider launch disabled locally).
  - Created `client/.env` VITE_API_URL = current preview URL.
  - Seeded demo catalog (`seedDemoCatalog.js`) + demo user (`seedTestUser.js`, demo01/demo1234, 2000 BDT). Replaced irrelevant Unsplash game images with generated casino-style tiles via `scripts/updateDemoImages.js`.
- Verified (Playwright + curl + testing_agent iter 8): home lobby renders, login (demo01), register modal, games page, and logout dropdown ALL work. Backend /api/users/login, /api/global/client/site-data, /api/global/client/game-data all 200.
- Design note: the client is a CUSTOM Marbaji-style casino lobby (dark navy + gold, hero slider, VIP tier, provider chips, popular/all-game grids), not a pixel copy of the live marbaji88.com (which does not render in available tooling). Exact page-by-page matching needs reference screenshots from the user.
- Backlog / next: RegisterModal calls restcountries.com from the browser (CORS-blocked) -> proxy via backend; add data-testid attributes for auth/nav/games; seed admin-configured deposit/withdraw methods so those private pages have content; provider game launch needs external IP whitelist (disabled locally).

## Session 5 (2026-06): Deposit/Withdraw seeding + country picker CORS fix
- Deposit & Withdraw methods: added `server/scripts/seedPaymentMethods.js` seeding 3 deposit methods (bkash/nagad/rocket) with contacts + DepositBonusTurnover channels & promotions, and 3 withdraw methods (BKASH/NAGAD/ROCKET). Deposit modal now shows methods/channels/promotions and reaches the confirm step; Withdraw modal shows methods + auto registration wallet.
- Country picker fix: RegisterModal previously fetched restcountries.com from the browser (CORS-blocked -> empty dropdown). Added `server/routes/countryRoutes.js` (GET /api/countries) that fetches server-side with a curated 30+ country fallback; RegisterModal now calls `api.get('/api/countries')`. Defaults to Bangladesh +880.
- Verified by testing_agent iter 9: 100% frontend, all 3 features PASS, no regressions.
- Re-seed anytime: `cd /app/bajiman-main/server && node scripts/seedPaymentMethods.js`
- Still user/infra-dependent: page-by-page 1:1 match of live marbaji88.com (needs reference screenshots), and real provider game launches (needs static egress IP whitelisted with provider).
