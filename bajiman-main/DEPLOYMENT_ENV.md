# Vercel Environment Variables — Bajiman

Set these in each Vercel project → **Settings → Environment Variables** and scope them to **Production** and **Preview** as appropriate. **Never commit real secrets to git.** The credentials that were previously present in this file must be rotated because they were exposed in repository history.

## 1) SERVER project (`bajiman-server`)

Root directory: `server`.

| Key | Value | Notes |
|-----|-------|-------|
| `VERCEL` | `1` | Skips `app.listen` in serverless mode. |
| `MONGO_URI` | `mongodb+srv://DB_USER:DB_PASSWORD@DB_CLUSTER/bajiman` | Use a newly rotated Atlas user/password. Allow the selected server egress in Atlas Network Access. |
| `JWT_SECRET` | `<new-long-random-secret>` | Rotate the previously exposed value. |
| `JWT_EXPIRE` | `30d` | |
| `OTP_API_KEY` | `<provider-key>` | Do not use the old committed value. |
| `WORLD_CASINO_ENABLED` | `true` | |
| `WORLD_CASINO_API_URL` | `https://world-casino-api.com/api/v1` | Aliased to `NINEWICKET_API_BASE`. |
| `WORLD_CASINO_TOKEN` | `<provider-token>` | Rotate/reissue if the old value was active. |
| `WORLD_CASINO_SECRET` | `<exactly-32-byte-secret>` | Keep server-side only. |
| `WORLD_CASINO_RETURN_URL` | `https://bajiman-client-one.vercel.app/` | HTTPS, no query string. |
| `WORLD_CASINO_CALLBACK_URL` | `https://bajiman-server.vercel.app/api/callback/9wicket` | HTTPS and publicly reachable. |
| `WORLD_CASINO_9WICKET_GAME_UID` | `11539` | Confirm with the provider before launch. |
| `WORLD_CASINO_9WICKET_SOURCE_GAME_UIDS` | `<legacy-source-game-uid>` | Optional legacy IDs that resolve to 9Wicket. |
| `HEALTH_CHECK_KEY` | `<new-strong-random-string>` | Required for `/api/9wicket/health` in production. Send as `x-health-key` or `?key=`. |
| `ALLOWED_ORIGINS` | `https://bajiman-client-one.vercel.app,https://bajiman-admin-seven.vercel.app,https://bajiman-affiliate-brown.vercel.app,https://bajiman-brand-five.vercel.app,https://bajiman-guide-sigma.vercel.app` | Comma-separated credentialed browser origins. |
| `PROVIDER_RELAY_URL` | `https://<static-egress-host>/api/provider-relay` | Required for 9Wicket on Vercel unless the provider whitelists the current Vercel egress. |
| `PROVIDER_RELAY_KEY` | `<same-value-as-relay-RELAY_SHARED_SECRET>` | Server-side only. |
| `OUTBOUND_PROXY_URL` | *(empty unless using a static HTTP proxy)* | Alternative to the relay; use `http://user:pass@STATIC_IP:PORT`. |

`NINEWICKET_*` and `WORLD_CASINO_*` belong only to the existing 9Wicket transfer-wallet integration. SoftAPI/IGAMING uses separate variables below; do not reuse one provider's credentials for the other.

### Optional SoftAPI / IGAMING integration (not live-configured)

| Key | Value | Notes |
|-----|-------|-------|
| `SOFTAPI_LAUNCH_URL` | `<Provided By IGAMING KEY from the provider account>` | Required for launch; never guess this account-specific endpoint. `IGAMING_LAUNCH_URL` is an alias. |
| `SOFTAPI_TOKEN` | `<SoftAPI API Token>` | Server-side only. `IGAMING_API_TOKEN` is an alias. |
| `SOFTAPI_SECRET` | `<exactly 32 UTF-8 bytes>` | Server-side only. `IGAMING_API_SECRET` is an alias. |
| `SOFTAPI_CALLBACK_URL` | `https://<backend-domain>/api/softapi/callback` | Public HTTPS URL; no user auth header is required. |
| `SOFTAPI_RETURN_URL` | `https://<client-domain>/lobby` | Public HTTPS lobby URL. |
| `SOFTAPI_GAME_UID` | `<game_code from /provider/brands/>` | The catalog's `game_code`, not a World Casino UID. |
| `SOFTAPI_CURRENCY_CODE` | `BDT` | The player's play currency as accepted by the account. |
| `SOFTAPI_CALLBACK_ENCRYPTION_MODE` | `required` | Default. Set to `optional` only if the provider account sends plaintext callbacks (`enc=0`). |

The isolated SoftAPI callback stores notify-only events in `softapi_callback_events` and never changes `User.balance`. The launch adapter is a server-side service; it is not wired into `/api/game/launch` until the exact account URL, provider/catalog mapping, and wallet synchronization policy are confirmed.

## 2) CLIENT project (`bajiman-client-one`)

Root directory: `client`.

Choose one wiring mode:

### Mode A — direct backend (simplest)

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://bajiman-server.vercel.app` |

### Mode B — same-origin serverless proxy

| Key | Value |
|-----|-------|
| `VITE_API_URL` | *(empty)* |
| `BACKEND_API_URL` | `https://bajiman-server.vercel.app` |
| `VERCEL_BYPASS_SECRET` | *(only when server Deployment Protection is enabled)* |

Optional build-time links:

| Key | Value |
|-----|-------|
| `VITE_ADMIN_URL` | `https://bajiman-admin-seven.vercel.app` |
| `VITE_AFFILIATE_URL` | `https://bajiman-affiliate-brown.vercel.app` |
| `VITE_BRAND_URL` | `https://bajiman-brand-five.vercel.app` |
| `VITE_GUIDE_URL` | `https://bajiman-guide-sigma.vercel.app` |

`VITE_*` values are embedded at build time; redeploy after changing them.

## 3) ADMIN project (`admin`)

Root directory: `admin`.

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://bajiman-server.vercel.app` |

The admin proxy also supports Mode B with `BACKEND_API_URL` and, when needed, `VERCEL_BYPASS_SECRET`.

## 4) AFFILIATE / BRAND / GUIDE projects

| Project | Key | Value |
|---------|-----|-------|
| affiliate | `VITE_API_URL` | `https://bajiman-server.vercel.app` |
| affiliate | `VITE_CLIENT_URL` | `https://bajiman-client-one.vercel.app` |
| Brand | `VITE_CLIENT_URL`, `VITE_REGISTER_URL` | `https://bajiman-client-one.vercel.app` |
| Guide | `VITE_CLIENT_URL` | `https://bajiman-client-one.vercel.app` |

## 5) Required fix for the current live failure: static provider egress

The previously recorded live health check reported:

> `IP 100.53.60.85 not whitelisted. Please contact administrator to whitelist your IP.`

This was the egress address seen by that check; it is not the VPS address listed below. Vercel serverless egress IPs are dynamic, so provider calls should use a fixed-egress host unless the provider separately whitelists Vercel's current egress. Pick **one** production solution:

### Recommended: a small VPS relay with a fixed public IP

Current VPS target supplied for this deployment (not yet independently verified):

| Setting | Value |
|---------|-------|
| SSH alias / host label | `ipms-production` |
| Public IPv4 supplied | `128.140.100.85` |
| SSH user supplied | `root` |

Do not put the SSH password, provider credentials, or relay key in this repository. Before relying on the address, verify from the VPS that its public outbound IPv4 is `128.140.100.85` (for example, `curl -4 https://api.ipify.org`) and confirm the address is static with the VPS provider. Ask the World Casino administrator to whitelist that verified egress IP; an SSH destination IP is not automatically the outbound IP.

1. Verify the VPS has a stable public IPv4 address and ask the World Casino administrator to whitelist that address.
2. Copy this repository to the VPS and run the backend from `server` with `VERCEL=0`, `RELAY_SHARED_SECRET=<new-random-secret>`, the provider settings above, and the required database settings.
3. Put HTTPS in front of the VPS (for example, Caddy or Nginx) and expose only `POST /api/provider-relay` to the Vercel server. The route is key-guarded and path-locked to the configured provider API.
4. Set `PROVIDER_RELAY_URL` and `PROVIDER_RELAY_KEY` in the Vercel server project. `PROVIDER_RELAY_KEY` must equal the VPS `RELAY_SHARED_SECRET`.
5. Redeploy the Vercel server and verify the health response shows `config.relayConfigured: true` and `providerCheck.ipWhitelisted: true`.

The repository includes `server/Dockerfile` for this relay host. A preview pod is suitable only for a temporary demo because its public IP changes after restart.

### Alternative: static HTTP proxy

Provision a static-egress HTTP proxy, whitelist its public IP with World Casino, then set `OUTBOUND_PROXY_URL` on the Vercel server. Leave it empty only when the provider explicitly whitelists the current hosting egress.

### Alternative: move the backend off Vercel

Run the entire Express backend on a VPS/container with a stable public IP, whitelist that IP, and point all `VITE_API_URL` values to the new HTTPS backend.

## 6) Verification checklist

```bash
curl -sS -H 'x-health-key: <HEALTH_CHECK_KEY>' \
  https://bajiman-server.vercel.app/api/9wicket/health | jq
```

A working provider path must report:

```json
{
  "config": { "relayConfigured": true },
  "providerCheck": { "reachable": true, "ok": true, "ipWhitelisted": true }
}
```

Also test a browser login, a protected API request, game launch, provider callback, and return-to-lobby flow after redeploying. If any old credential was real, rotate it before testing production.


## 7) Provider game-session troubleshooting

### Blank white game page

Use a single fresh launch URL in a full browser tab. Provider launch links may be one-time-use; refreshing or reopening an old link can produce `Launch link expired`. Open browser Developer Tools before launching, enable **Preserve log** and **Disable cache**, filter the Network panel by `playerService`, and inspect `queryInitInfo`, `queryEventLabel`, `getFingerprintProPublicKey`, `accountTracker`, and `testLine`.

If the provider terms dialog appears, manually accept it before judging the game page. Do not place a bet during diagnostics. Static JavaScript, CSS, `setting.json`, and `image-manifest.json` loading proves only that the frontend host is reachable; the player-session API must also return a non-empty response.

### CORS and blocked requests

`testLine` returning HTTP 200 while initialization calls return zero bytes indicates that the provider host is reachable and is not suffering from a general browser CORS failure. Inspect each request's status, `Origin`, `Referer`, cookies, request headers, response headers, and Timing panel. `(blocked:cors)` indicates an origin/credential policy problem; `401` or `403` indicates an invalid or expired player session; `5xx` indicates a provider backend failure; an indefinitely pending request indicates network, proxy, firewall, or provider edge trouble.

The browser cannot expose cross-origin response headers to page JavaScript unless the provider grants access with the appropriate `Access-Control-Allow-Origin`, `Access-Control-Allow-Credentials`, and related headers. Do not work around this by disabling browser security in production. Ask the provider to allow the actual game origin and confirm the generated game session is valid for game UID `11539`, currency `BDT`, and the configured callback and return URLs.

### Validating a session token

`WORLD_CASINO_TOKEN` authenticates the backend API; the `t=` value in a returned game URL is a one-time player launch credential. Preserve the URL exactly and do not paste it into logs or chat. A successful launch should return `success: true`, `provider: "9wicket"`, a numeric `sessionId`, `data.session_id`, `data.game_uid: "11539"`, and a non-empty game URL. The protected `/api/9wicket/inquiry` endpoint is the safest server-side follow-up because it checks the provider wallet without creating another launch.

### `No active 9Wicket session`

This message is returned by `POST /api/9wicket/cashout`, not by the inquiry route. Cashout requires a local `NineWicketSession` belonging to the current authenticated user with `status: "active"`. Check the `ninewicketsessions` collection by `sessionId`, the authenticated user's ObjectId, and the status before retrying. `launching`, `failed`, `ended`, `cashout_pending`, and `cashed_out` are not eligible for a new cashout. Do not manually change a session or retry blindly until provider transaction history and local wallet accounting are reconciled.

For a diagnostic session, inspect these fields read-only: `sessionId`, `user`, `userId`, `gameUid`, `launchAmount`, `lastProviderBalance`, `status`, `lastError`, `startedAt`, `endedAt`, `cashedOutAt`, `createdAt`, and `updatedAt`. A missing record commonly means the launch used a different database or deployment. A session in `ended` may have been closed by a provider `session_end` callback. A session in `cashed_out` has already been reconciled.

### Provider escalation packet

If static assets load but player initialization remains empty after terms acceptance, send the provider the session ID, game UID `11539`, currency `BDT`, UTC test time, API hostnames, request statuses, Timing results, and the exact provider error. Do not send backend JWTs, MongoDB URIs, provider secrets, or full one-time launch URLs.
