# SoftAPI documentation findings and implementation status

**Sources:** the authenticated [SoftAPI API documentation](https://igamingapis.com/documentation/) (accessed with the user-provided agent code) and the [SoftAPI seamless-wallet callback tutorial](https://igamingapis.com/softapi-seamless-wallet-tutorial/). No provider token or secret is stored in this repository.

## Confirmed provider contract

The public catalog uses `GET https://igamingapis.com/provider/` and `GET https://igamingapis.com/provider/brands/?brand_id=<brand_id>`. A catalog `games[].game_code` becomes the launch payload's `game_uid`. Provider details are dynamic catalog data; do not infer an iGaming brand from an unrelated World Casino provider code.

The launch API is a `POST` request to the account-specific endpoint shown as **Provided By IGAMING KEY**. The public docs do not disclose this value. The JSON request includes the API token and an AES-256-ECB / PKCS7 / Base64-encrypted JSON payload. The inner payload includes `user_id`, `balance`, `game_uid`, `token`, a fresh Unix-millisecond `timestamp`, HTTPS `return` and `callback` URLs, and `currency_code`; the outer and inner token must match. The API secret is exactly 32 bytes.

The provider sends callbacks to the launch payload's callback URL. The documented event includes `game_id`, `game_uid`, `game_round`, `member_account`, `bet_amount`, `win_amount`, millisecond `timestamp`, and `notify_only`; `serial_number` and `game_name` are optional. When encrypted, the wrapper is `{ "payload": "...", "timestamp": ... }` and uses the same API secret. Plain callbacks are supported only when account encryption is disabled. The documentation explicitly calls these notifications **notify-only**: the aggregator manages the session balance, so callbacks must not debit or credit the local wallet. Idempotency should use `serial_number` when present, otherwise the round/player/game identity.

## Implemented in this repository

- Added a distinct SoftAPI crypto/service adapter. It accepts only `SOFTAPI_*` or `IGAMING_*` launch credentials and rejects a missing account-specific HTTPS launch URL. It validates the launch player ID, balance, game code, callback/return URL, currency, and timestamp and can send the encrypted request when called with configured settings.
- Removed SoftAPI/IGAMING credentials from the existing NineWicket service and crypto fallback chains. `NINEWICKET_*` / `WORLD_CASINO_*` settings remain dedicated to 9Wicket and cannot silently be used for SoftAPI, or vice versa.
- Added `POST /api/softapi/callback`, separate from the existing wallet-settlement callbacks. Encrypted callbacks are required by default; plaintext acceptance can be enabled only with `SOFTAPI_CALLBACK_ENCRYPTION_MODE=optional` when the provider account is configured for `enc=0`.
- The callback validates the documented fields and notify-only flag, then upserts to the separate `softapi_callback_events` MongoDB collection using a stable idempotency key. It never changes a user balance. Valid duplicates are acknowledged; storage failure returns HTTP 503 so delivery can retry. No callback body, token, or secret is logged.
- Added deterministic no-network coverage with synthetic credentials and updated the SoftAPI payload smoke test so it cannot borrow NineWicket credentials.

## Remaining launch/go-live blockers

The standalone launch adapter is intentionally **not** connected to `/api/game/launch`. The current game dispatcher selects the NineWicket transfer-wallet or Oracle flow. Connecting SoftAPI there without an approved product mapping and balance policy could launch the wrong game or expose a stale/unreconciled balance. In particular, the existing NineWicket launch handler reserves local funds and performs provider transfers; that behavior is incompatible with SoftAPI's notify-only contract.

To complete live game dispatch, obtain and configure the actual `SOFTAPI_LAUNCH_URL` from the account, the account token and 32-byte secret, the intended catalog `brand_id` / `game_code` mapping in this repository's game catalog, callback/return hostnames, and an explicit policy for how to reconcile the local wallet after a notify-only session. The docs page access code is not an API token and does not reveal the portal launch URL. Do not put API credentials or access codes in source control.

The previously checked public catalog showed brand `141` titled `9wickets`, with game code `11539`. It did not establish that any unrelated `WORLD_190` / XGaming catalog record maps to SoftAPI, and it does not supply the private launch URL or account credentials. No live launch request was made by this change.

## Safe local tests

From `bajiman-main/server`:

```bash
npm test
npm run test:softapi-integration
```

These use synthetic credentials, exercise encrypted launch payload generation and both callback formats, verify key separation and idempotency, and make no network request. To validate actual deployment settings without contacting the provider, set the required `SOFTAPI_*` or `IGAMING_*` environment variables and run `npm run test:softapi-payload`.

## References

- [Authenticated API documentation](https://igamingapis.com/documentation/)
- [Seamless-wallet callback tutorial](https://igamingapis.com/softapi-seamless-wallet-tutorial/)
