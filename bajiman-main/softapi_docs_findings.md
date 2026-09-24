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

The remaining deployment inputs are:

1. The exact SoftAPI launch URL from the authenticated portal.
2. The valid SoftAPI brand ID for the intended provider.
3. The intended SoftAPI `game_code` for the selected game.
4. The matching API token and 32-byte secret configured only in Vercel environment variables.

Until those values are confirmed, the backend retains the current provider configuration and fails safely if a SoftAPI launch URL or secret is missing.
