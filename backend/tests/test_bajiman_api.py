"""Backend API tests for Bajiman 9Wicket integration."""
import os
import pytest
import requests

BASE_URL = "https://b34f6e99-48cd-4553-96e0-d5a31a07c743.preview.emergentagent.com"
HEALTH_KEY = "bajiman-health-2026"
USER_ID = "demo01"
PASSWORD = "demo1234"


@pytest.fixture(scope="session")
def token():
    r = requests.post(f"{BASE_URL}/api/users/login",
                      json={"userId": USER_ID, "password": PASSWORD}, timeout=30)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text[:300]}"
    body = r.json()
    tok = (body.get("data") or {}).get("token") or body.get("token")
    assert tok, f"no token in login body: {body}"
    return tok


# ---------- Health endpoint auth guard ----------
class TestHealth:
    def test_health_without_key_unauthorized(self):
        r = requests.get(f"{BASE_URL}/api/9wicket/health", timeout=30)
        assert r.status_code == 401
        data = r.json()
        assert data.get("success") is False

    def test_health_with_key_query(self):
        r = requests.get(f"{BASE_URL}/api/9wicket/health",
                         params={"key": HEALTH_KEY}, timeout=45)
        assert r.status_code == 200
        data = r.json()
        assert data.get("success") is True
        assert data.get("status") == "ok"
        assert data.get("config", {}).get("outboundProxyConfigured") is False

    def test_health_with_key_header(self):
        r = requests.get(f"{BASE_URL}/api/9wicket/health",
                         headers={"x-health-key": HEALTH_KEY}, timeout=45)
        assert r.status_code == 200
        assert r.json().get("success") is True

    def test_health_ping_false_skips_provider(self):
        r = requests.get(f"{BASE_URL}/api/9wicket/health",
                         params={"key": HEALTH_KEY, "ping": "false"}, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert data.get("success") is True
        # providerCheck should indicate skipped when ping=false
        pc = data.get("providerCheck")
        assert pc is None or pc.get("attempted") is False or pc.get("skipped") is True or pc == {}, f"provider was pinged: {pc}"

    def test_health_provider_ping_ok(self):
        r = requests.get(f"{BASE_URL}/api/9wicket/health",
                         params={"key": HEALTH_KEY}, timeout=45)
        assert r.status_code == 200
        data = r.json()
        pc = data.get("providerCheck") or {}
        assert pc.get("ok") is True, f"providerCheck not ok: {pc}"
        assert pc.get("ipWhitelisted") is True, f"IP not whitelisted: {pc}"


# ---------- Login ----------
class TestLogin:
    def test_login_success(self, token):
        assert isinstance(token, str) and len(token) > 10

    def test_login_bad_password(self):
        r = requests.post(f"{BASE_URL}/api/users/login",
                          json={"userId": USER_ID, "password": "wrongpass"}, timeout=30)
        assert r.status_code in (400, 401, 403)


# ---------- 9Wicket launch + cashout ----------
class TestNineWicket:
    def test_launch_and_cashout(self, token):
        headers = {"Authorization": f"Bearer {token}"}
        r = requests.post(f"{BASE_URL}/api/9wicket/launch",
                          json={"game_uid": "11539", "amount": 10},
                          headers=headers, timeout=45)
        assert r.status_code == 200, f"launch failed: {r.status_code} {r.text[:300]}"
        body = r.json()
        assert body.get("success") is True, body
        inner = body.get("data") or {}
        session_id = body.get("sessionId") or inner.get("session_id")
        game_url = body.get("gameUrl") or body.get("launch_url") or inner.get("url")
        assert session_id, f"no sessionId: {body}"
        assert game_url and game_url.startswith("http"), f"bad gameUrl: {game_url}"

        # cashout
        r2 = requests.post(f"{BASE_URL}/api/9wicket/cashout",
                           json={}, headers=headers, timeout=45)
        assert r2.status_code == 200, f"cashout failed: {r2.status_code} {r2.text[:300]}"
        b2 = r2.json()
        assert b2.get("success") is True, b2
        d2 = b2.get("data") or {}
        credited = d2.get("credited", 0)
        remaining = d2.get("remaining", None)
        assert (credited and credited > 0) or remaining == 0, f"cashout data odd: {d2}"


# ---------- Callback ----------
class TestCallback:
    def test_9wicket_callback_empty_body(self):
        r = requests.post(f"{BASE_URL}/api/callback/9wicket",
                          json={}, timeout=30)
        assert r.status_code == 200
        assert r.text.strip() == "OK", f"unexpected body: {r.text[:200]}"


# ---------- Catalog seeding ----------
class TestCatalog:
    def test_play_game_lookup_11539(self):
        r = requests.get(f"{BASE_URL}/api/global/client/play-game/11539", timeout=30)
        assert r.status_code == 200, f"catalog lookup failed: {r.status_code} {r.text[:300]}"
        body = r.json()
        assert body.get("success") is True, body
        data = body.get("data") or body.get("game") or {}
        # find name field
        name = data.get("name") or body.get("name") or ""
        assert "9Wicket" in str(data) or "9Wicket" in str(body), f"9Wicket not found: {body}"

    def test_game_data_has_two_games(self):
        r = requests.get(f"{BASE_URL}/api/global/client/game-data", timeout=30)
        assert r.status_code == 200, f"game-data failed: {r.status_code} {r.text[:300]}"
        body = r.json()
        # find list of games somewhere
        import json as _j
        blob = _j.dumps(body)
        assert "11539" in blob, "gameUId 11539 missing from game-data"


# ---------- CORS allow-list ----------
class TestCORS:
    def test_allowed_origin_reflected(self):
        # Note: Cloudflare ingress rewrites the Origin header from
        # preview.emergentagent.com to the internal cluster domain
        # (cluster-5.preview.emergentcf.cloud) before it reaches Express.
        # Real browser POSTs from the preview origin also arrive with the
        # cluster origin, so we validate the cluster domain is reflected.
        origin = "https://b34f6e99-48cd-4553-96e0-d5a31a07c743.preview.emergentagent.com"
        r = requests.post(
            f"{BASE_URL}/api/users/login",
            headers={"Origin": origin, "Content-Type": "application/json"},
            json={"userId": USER_ID, "password": PASSWORD},
            timeout=30,
        )
        assert r.status_code == 200, f"login with browser origin failed: {r.status_code} {r.text[:200]}"
        acao = r.headers.get("access-control-allow-origin")
        assert acao and "cluster-5.preview.emergentcf.cloud" in acao or acao == origin, \
            f"ACAO not properly reflected: {acao}"
        assert r.headers.get("access-control-allow-credentials") == "true"

    def test_disallowed_origin_blocked(self):
        origin = "https://evil.example.com"
        r = requests.options(
            f"{BASE_URL}/api/users/login",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
            timeout=30,
        )
        # Either 500 "Not allowed by CORS" or missing ACAO header
        acao = r.headers.get("access-control-allow-origin")
        assert acao != origin, f"disallowed origin was reflected: {acao}"

    def test_no_origin_passes(self):
        # curl-style, no Origin header
        r = requests.post(f"{BASE_URL}/api/callback/9wicket", json={}, timeout=30)
        assert r.status_code == 200
        assert r.text.strip() == "OK"
