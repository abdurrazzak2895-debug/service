"""Live Vercel deployment smoke tests for Bajiman."""
import requests

SERVER = "https://bajiman-server.vercel.app"
CLIENT = "https://bajiman-client-one.vercel.app"


def test_root_ok():
    r = requests.get(f"{SERVER}/", timeout=30)
    assert r.status_code == 200


def test_login_demo01():
    r = requests.post(f"{SERVER}/api/users/login",
                      json={"username": "demo01", "password": "demo1234"},
                      timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    payload = data.get("data", data)
    assert "token" in payload and "user" in payload, data
    assert payload["user"]["userId"] == "demo01"


def test_game_catalog_11539():
    r = requests.get(f"{SERVER}/api/global/client/play-game/11539", timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    body_str = str(data)
    assert "emergentagent" in body_str or "image" in body_str.lower()


def test_9wicket_callback_empty():
    r = requests.post(f"{SERVER}/api/callback/9wicket", data="", timeout=30)
    assert r.status_code == 200
    assert "OK" in r.text or r.text.strip().upper() == "OK"


def test_client_loads_no_double_slash_in_bundle():
    """Fetch main client HTML and verify no 'vercel.app//api' pattern in referenced JS."""
    r = requests.get(f"{CLIENT}/", timeout=30)
    assert r.status_code == 200
    # find asset JS
    import re
    m = re.search(r'/assets/(index-[A-Za-z0-9_-]+\.js)', r.text)
    assert m, "no asset js found"
    js_url = f"{CLIENT}/assets/{m.group(1)}"
    j = requests.get(js_url, timeout=30)
    assert j.status_code == 200
    assert "vercel.app//api" not in j.text, "double slash found in bundle"


# --- Regression checks (record state, non-failing) ---
def test_health_endpoint_state():
    """Currently 200 without key -- pending user setting HEALTH_CHECK_KEY."""
    r = requests.get(f"{SERVER}/api/9wicket/health?ping=false", timeout=30)
    print(f"HEALTH_STATE status={r.status_code} body={r.text[:200]}")
    assert r.status_code in (200, 401, 403)


def test_cors_evil_origin_state():
    r = requests.options(f"{SERVER}/api/users/login",
                         headers={
                             "Origin": "https://evil.example.com",
                             "Access-Control-Request-Method": "POST",
                             "Access-Control-Request-Headers": "content-type",
                         },
                         timeout=30)
    acao = r.headers.get("access-control-allow-origin", "")
    print(f"CORS_STATE status={r.status_code} acao={acao}")
    assert r.status_code in (200, 204, 400, 403)
