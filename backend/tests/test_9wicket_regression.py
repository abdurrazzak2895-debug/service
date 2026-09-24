"""Iteration 4 backend regression: 9Wicket + CORS allow-list + catalog seed."""
import os
import requests

BASE_URL = "https://live-website-14.preview.emergentagent.com"
HEALTH_KEY = "bajiman-health-2026"


def test_9wicket_health():
    r = requests.get(f"{BASE_URL}/api/9wicket/health", params={"key": HEALTH_KEY}, timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data.get("success") is True, data


def test_9wicket_callback_ok():
    r = requests.post(f"{BASE_URL}/api/callback/9wicket", json={}, timeout=30)
    assert r.status_code == 200, r.text
    assert r.text.strip().upper() == "OK", r.text


def test_login_demo01():
    r = requests.post(
        f"{BASE_URL}/api/users/login",
        json={"userId": "demo01", "password": "demo1234"},
        timeout=30,
    )
    assert r.status_code == 200, r.text
    data = r.json()
    assert data.get("success") is True, data


def test_catalog_play_game_11539():
    r = requests.get(f"{BASE_URL}/api/global/client/play-game/11539", timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    # Response wraps a game with name '9Wicket'
    body = data.get("data") or data.get("game") or data
    name = body.get("name") if isinstance(body, dict) else None
    # Some routes may return {success, data:{name}}
    if not name and isinstance(data, dict) and isinstance(data.get("data"), dict):
        name = data["data"].get("name")
    assert name == "9Wicket", f"Expected name 9Wicket, got {name}. Full: {data}"


def test_game_data_list():
    """Home game-data returns the seeded 9Wicket."""
    # Try common paths
    for path in ["/api/global/client/game-data", "/api/global/client/games"]:
        r = requests.get(f"{BASE_URL}{path}", timeout=30)
        if r.status_code == 200:
            text = r.text
            if "9Wicket" in text or "11539" in text:
                return
    assert False, "Could not find 9Wicket in any game listing endpoint"


def test_cors_allowed_origin():
    """Preview origin (or its Cloudflare-rewritten cluster origin) should be allowed.

    Cloudflare rewrites Origin to `*.cluster-*.preview.emergentcf.cloud` before it
    reaches Express, so the server echoes that host — which is what the allow-list
    is configured for. The important check: request succeeds (200) and ACAO is set
    to a bajiman/preview host, not '*'.
    """
    r = requests.get(
        f"{BASE_URL}/api/9wicket/health",
        params={"key": HEALTH_KEY},
        headers={"Origin": BASE_URL},
        timeout=30,
    )
    assert r.status_code == 200, r.text
    aco = r.headers.get("access-control-allow-origin", "")
    assert aco and aco != "*", f"Expected a specific allow-origin echoed back, got: {aco!r}"
    assert "preview.emergent" in aco or "b34f6e99" in aco, f"Unexpected ACAO: {aco}"


def test_cors_blocked_origin():
    """Random origin must NOT be echoed back in ACAO."""
    r = requests.get(
        f"{BASE_URL}/api/9wicket/health",
        params={"key": HEALTH_KEY},
        headers={"Origin": "https://evil.example.com"},
        timeout=30,
    )
    aco = r.headers.get("access-control-allow-origin", "")
    assert "evil.example.com" not in aco, f"Evil origin was allowed: {aco}"
