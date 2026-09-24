# SoftAPI documentation findings

**Source:** authenticated `https://igamingapis.com/documentation/` reviewed with the user-provided agent code. No credentials or secrets are stored in this repository.

## Confirmed contract

The public provider catalog is available at `GET https://igamingapis.com/provider/`. Brand games are available at `GET https://igamingapis.com/provider/brands/?brand_id=<brand_id>`. A catalog `games[].game_code` is the value that becomes the launch payload's `game_uid`.

The documented launch contract is a `POST` request to the endpoint identified in the portal as **Provided By IGAMING KEY**. The outer JSON body is:

```json
{
  "token": "YOUR_API_TOKEN",
  "payload": "base64 AES-256-ECB ciphertext"
}
```

The encrypted plaintext contains `user_id`, `balance`, `game_uid`, `token`, `timestamp`, `return`, and `callback`. The timestamp is Unix milliseconds and must be fresh. The outer token and plaintext token must match. The API secret must be exactly 32 bytes and AES-256-ECB with PKCS7 padding is used.

The existing 9Wicket implementation already satisfies the cryptographic and payload requirements: it uses AES-256-ECB with PKCS7 padding, generates a fresh millisecond timestamp, includes both the outer and plaintext token, validates HTTPS callback/return URLs, and sends `game_uid` from the resolved game code.

## Repository changes

The backend now accepts explicit SoftAPI/IGAMING aliases without breaking the existing World Casino configuration:

- `SOFTAPI_API_BASE` or `IGAMING_API_BASE`
- `SOFTAPI_LAUNCH_URL` or `IGAMING_LAUNCH_URL`
- `SOFTAPI_TOKEN` or `IGAMING_API_TOKEN`
- `SOFTAPI_SECRET` or `IGAMING_API_SECRET`

`SOFTAPI_LAUNCH_URL` is intentionally explicit because the documentation does not reveal the exact endpoint; it must be copied from the provider portal's **Provided By IGAMING KEY** field. The current production endpoint is not changed until that value and the correct brand/game mapping are confirmed.

## Unresolved provider mapping

The previously tested live catalog record was `WORLD_190` / XGaming with game UID `24178`, but the public SoftAPI catalog currently has no `brand_id=190`; the request returns `Brand not found for brand_id=190`. Therefore, the documentation does not prove that `WORLD_190` maps to a SoftAPI brand, and `24178` must not be silently remapped.

The public catalog was rechecked on 2026-09-25. It contains the following confirmed mapping:

| SoftAPI brand ID | Provider title | Confirmed game code | Evidence |
|---:|---|---|---|
| `141` | `9wickets` | `11539` | `GET /provider/brands/?brand_id=141` returned one game with `game_code=11539` |

`brand_id=190` is still absent from `GET /provider/`, and `GET /provider/brands/?brand_id=190` returns `Brand not found for brand_id=190`. No public catalog evidence maps `WORLD_190`, `XGaming`, or game code `24178` to SoftAPI.

## Callback/webhook audit

The mounted callback paths are `/api/9wicket/callback` and `/api/callback/9wicket`. The current handler decrypts a body `payload` when present, or accepts a plaintext body, then updates the matching `NineWicketSession` balance/status and stores the raw event in `callbackEvents`.

The authenticated SoftAPI documentation now confirms that these are **notify-only** webhooks: SoftAPI updates the player balance on its side, and the operator should acknowledge quickly and store the event for its own ledger or CRM. The documented event fields are `game_id`, `game_uid`, `game_round`, `member_account`, `bet_amount`, `win_amount`, `timestamp`, `notify_only`, optional `serial_number`, and optional `game_name`. Encrypted callbacks use `{ payload, timestamp }` and the same AES-256-ECB secret; unencrypted callbacks contain the event fields directly.

The current handler is broadly compatible with the notify-only model because it decrypts the wrapper, stores the raw event, and returns HTTP 200 without attempting to debit or credit the user wallet. It should still be hardened before production SoftAPI use by validating the event shape, rejecting stale encrypted timestamps where appropriate, and deduplicating ledger/CRM processing by `game_round` or `serial_number`. The existing general callback route contains wallet/history accounting for a different provider schema and must not be used for SoftAPI notify-only events.

The VPS smoke test was not run against production credentials: the current checkout has no `.env` file and no `SOFTAPI_*`, `IGAMING_*`, `NINEWICKET_*`, or `WORLD_CASINO_*` variables in its environment. The payload test was therefore run only in no-network mode with synthetic test values.

The connected Vercel backend environment was also checked by variable name. Production currently has the existing `NINEWICKET_*` and `WORLD_CASINO_*` configuration, but no `SOFTAPI_*` or `IGAMING_*` variables. No production SoftAPI payload can therefore be generated from the VPS without first configuring the SoftAPI token, 32-byte secret, and portal launch URL.

## Confirmed endpoint status

The public catalog endpoints are confirmed as:

```text
GET https://igamingapis.com/provider/
GET https://igamingapis.com/provider/brands/?brand_id=141
```

The launch endpoint is **not** the public catalog URL. It is the portal-specific URL shown as **Provided By IGAMING KEY**. No authenticated portal value was available in the repository or Vercel environment, so no launch endpoint has been invented or written into production configuration. The current deployment continues to use its existing NINEWICKET/World Casino launch configuration.

The supplied agent code grants access to the documentation page, but the `My account` page redirects to the separate email/password login. The documentation page itself exposes only the literal placeholder **Provided By IGAMING KEY**, not the account's actual URL. Therefore the account login or the provider-issued launch URL is still required to finish this mapping.

The production credentials supplied separately were tested without being written to the repository or deployment configuration. A read-only request to `GET https://world-casino-api.com/api/v1/9w/transactions` returned HTTP 200 with provider `code=0` and an empty transaction result for test user `1001`. This confirms the existing World Casino/9Wicket API URL, token, secret length, and network connectivity; it does **not** identify or validate the SoftAPI portal launch endpoint.

The remaining deployment inputs are:

1. The exact SoftAPI launch URL from the authenticated portal. The public catalog does not provide it; the documentation labels it **Provided By IGAMING KEY**.
2. The valid SoftAPI brand ID for the intended provider. For the currently confirmed 9wickets game, this is `141`.
3. The intended SoftAPI `game_code` for the selected game. For the currently confirmed 9wickets game, this is `11539`; `24178` remains unverified.
4. The matching API token and 32-byte secret configured only in Vercel/VPS environment variables.
5. The exact SoftAPI callback schema and idempotency identifier before implementing wallet settlement.

Until those values are confirmed, the backend retains the current provider configuration and fails safely if a SoftAPI launch URL or secret is missing.

## Payload smoke test

The server includes `npm run test:softapi-payload`, implemented by `server/scripts/testSoftApiPayload.js`. It reads the SoftAPI/IGAMING aliases, creates a fresh Unix-millisecond payload, encrypts it with AES-256-ECB and PKCS7 padding, decrypts it locally, verifies that the outer and plaintext tokens match, checks HTTPS callback/return URLs, and prints only redacted metadata. It never sends a provider request.
