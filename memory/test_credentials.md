# Test Credentials

## Demo player (client login) — created by server/scripts/seedTestUser.js
- Username (login): `demo01`
- Password: `demo1234`
- phone: `+88001700000001`
- balance: 2000 BDT
- Login is via the **Login modal** (click the "লগইন / Login" button in the top-right navbar), POST /api/users/login {username,password}.
- Re-seed / reset anytime: `cd /app/bajiman-main/server && node scripts/seedTestUser.js`

## Runtime (current preview pod)
- App URL: https://e2308627-bf54-41fe-b0ee-1c3f39d3ace5.preview.emergentagent.com
- Backend: Node/Express on :8001 (supervisor `backend`), Vite client on :3000 (supervisor `frontend`)
- MongoDB: local `mongodb://127.0.0.1:27017/bajiman`
- Seed catalog: `node scripts/seedDemoCatalog.js` then `node scripts/updateDemoImages.js`

## 9Wicket diagnostics
- Health: `GET /api/9wicket/health?ping=false` (config only). Key `bajiman-health-2026` (x-health-key). Provider launch disabled locally (WORLD_CASINO_ENABLED=false).
