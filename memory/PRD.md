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
- Added `server/.env` (gitignored). No source code changes required — code is healthy.

## Backlog / Next steps (mostly infra, provider-side)
- Whitelist a STATIC egress IP with the World Casino admin. For Vercel, route outbound
  through a fixed-IP proxy or host the server on a static-IP VPS.
- Set Vercel env vars for the server (all WORLD_CASINO_* / Mongo / JWT) and for the
  client proxy (`BACKEND_API_URL`).
- Seed/register a user to run a full authenticated launch e2e once IP is whitelisted.
