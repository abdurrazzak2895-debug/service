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
