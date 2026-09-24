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

The server accepts the equivalent `NINEWICKET_*` names directly. Do not set both families to conflicting values.

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

The live health check currently reports:

> `IP 100.53.60.85 not whitelisted. Please contact administrator to whitelist your IP.`

This is expected when Vercel calls the provider directly: Vercel serverless egress IPs are dynamic. Pick **one** production solution:

### Recommended: a small VPS relay with a fixed public IP

1. Provision a VPS with a stable public IPv4 address and ask the World Casino administrator to whitelist that address.
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
