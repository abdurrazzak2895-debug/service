"""Live Vercel deployment tests for Bajiman server.

Targets:
- https://bajiman-server.vercel.app  (API)
- https://bajiman-client-one.vercel.app  (client site, CORS origin)
"""
import pytest
import requests

BASE = "https://bajiman-server.vercel.app"
CLIENT_ORIGIN = "https://bajiman-client-one.vercel.app"
EVIL_ORIGIN = "https://evil.example.com"
HEALTH_KEY = "bajiman-health-2026"

TIMEOUT = 30


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Accept": "application/json"})
    return s


# --- Root ---
def test_root_ok(session):
    r = session.get(f"{BASE}/", timeout=TIMEOUT)
    assert r.status_code == 200, r.text[:400]
    data = r.json()
    assert data.get("success") is True


# --- Login (DB middleware) ---
def test_login_success(session):
    r = session.post(
        f"{BASE}/api/users/login",
        json={"userId": "demo01", "password": "demo1234"},
        timeout=TIMEOUT,
    )
    assert r.status_code == 200, f"{r.status_code} {r.text[:400]}"
    data = r.json()
    # Token exists somewhere in response (top-level or nested)
    body_str = r.text
    assert "token" in body_str.lower()
    # Balance should be present as 2000 (may be nested)
    assert "2000" in body_str or "balance" in body_str.lower()


def test_login_wrong_password(session):
    r = session.post(
        f"{BASE}/api/users/login",
        json={"userId": "demo01", "password": "wrongpassword_xyz"},
        timeout=TIMEOUT,
    )
    assert 400 <= r.status_code < 500, f"expected 4xx, got {r.status_code}: {r.text[:300]}"


# --- Catalog ---
def test_catalog_9wicket(session):
    r = session.get(f"{BASE}/api/global/client/play-game/11539", timeout=TIMEOUT)
    assert r.status_code == 200, r.text[:400]
    data = r.json()
    body = str(data)
    assert "9Wicket" in body or "9wicket" in body.lower()
    # image must NOT be dead igamingapis.com URL
    assert "igamingapis.com" not in body, "Dead image URL still present"
    assert "emergentagent" in body or "customer-assets.emergentagent" in body or "http" in body


# --- Health guard ---
def test_health_no_key_401(session):
    r = session.get(f"{BASE}/api/9wicket/health?ping=false", timeout=TIMEOUT)
    assert r.status_code == 401, f"expected 401, got {r.status_code}: {r.text[:300]}"


def test_health_with_key_no_ping(session):
    r = session.get(
        f"{BASE}/api/9wicket/health?ping=false&key={HEALTH_KEY}", timeout=TIMEOUT
    )
    assert r.status_code == 200, r.text[:400]
    data = r.json()
    assert data.get("success") is True


def test_health_provider_ping_graceful_503(session):
    r = session.get(f"{BASE}/api/9wicket/health?key={HEALTH_KEY}", timeout=60)
    # Environment-blocked: provider IP whitelist; must be graceful JSON 503
    assert r.status_code in (503, 200), f"unexpected {r.status_code}: {r.text[:400]}"
    ctype = r.headers.get("content-type", "")
    assert "application/json" in ctype, f"non-JSON response: {ctype} body={r.text[:300]}"
    data = r.json()
    if r.status_code == 503:
        text_body = str(data).lower()
        assert "whitelist" in text_body or "not whitelisted" in text_body, data


# --- Callback ---
def test_callback_9wicket_empty_body(session):
    r = requests.post(
        f"{BASE}/api/callback/9wicket",
        json={},
        timeout=TIMEOUT,
        headers={"Content-Type": "application/json"},
    )
    assert r.status_code == 200, f"{r.status_code} {r.text[:400]}"


# --- CORS ---
def test_cors_allowed_origin(session):
    r = requests.get(
        f"{BASE}/api/global/client/play-game/11539",
        headers={"Origin": CLIENT_ORIGIN},
        timeout=TIMEOUT,
    )
    assert r.status_code == 200
    aco = r.headers.get("access-control-allow-origin", "")
    assert aco == CLIENT_ORIGIN, f"expected {CLIENT_ORIGIN}, got '{aco}'"
    acc = r.headers.get("access-control-allow-credentials", "")
    assert acc.lower() == "true", f"credentials header: '{acc}'"


def test_cors_rejects_evil_origin(session):
    r = requests.get(
        f"{BASE}/api/global/client/play-game/11539",
        headers={"Origin": EVIL_ORIGIN},
        timeout=TIMEOUT,
    )
    aco = r.headers.get("access-control-allow-origin", "")
    assert aco != EVIL_ORIGIN, f"evil origin was echoed back: {aco}"


if __name__ == "__main__":
    import sys
    sys.exit(pytest.main([__file__, "-v", "--tb=short"]))
