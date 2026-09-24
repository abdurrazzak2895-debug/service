# Test Credentials

## Demo player (client login) — created by server/scripts/seedTestUser.js
- userId (login): `demo01`
- password: `demo1234`
- phone: `+88001700000001`
- balance: 2000 BDT (a launch reserves from this)
- Re-run / reset anytime: `cd server && node scripts/seedTestUser.js`
  - Env overrides: `TEST_USER_ID`, `TEST_USER_PASSWORD`, `TEST_USER_BALANCE`, `RUN_LAUNCH=true`

## 9Wicket diagnostics
- Health: `GET /api/9wicket/health` (add `?ping=false` for config-only, no provider call)
- Key: `bajiman-health-2026` (x-health-key header or ?key=)

## Provider relay (game launches from Vercel)
- Pod relay endpoint: `POST https://6c847b38-af7d-4785-bd9e-f7fc703fa7f0.preview.emergentagent.com/api/provider-relay`
- Relay key (x-relay-key / PROVIDER_RELAY_KEY): `relay-9w-4f8a2c7e1b9d3456f0a8c2e4b6d19753`
- Pod .env has RELAY_SHARED_SECRET set; Vercel needs PROVIDER_RELAY_URL + PROVIDER_RELAY_KEY.
