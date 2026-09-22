const COOKIE_NAME = "admin_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
const ALLOWED_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]);

const parseCookies = (header = "") =>
  Object.fromEntries(
    header
      .split(";")
      .map((part) => part.trim().split("="))
      .filter(([key, value]) => key && value !== undefined)
      .map(([key, ...value]) => [key, decodeURIComponent(value.join("="))]),
  );

const readBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
};

const cookie = (value, request) => {
  const forwardedProto = request.headers["x-forwarded-proto"];
  const secure = forwardedProto === "https" || process.env.NODE_ENV === "production";
  return [
    `${COOKIE_NAME}=${encodeURIComponent(value)}`,
    "HttpOnly",
    "Path=/",
    `Max-Age=${COOKIE_MAX_AGE}`,
    "SameSite=Lax",
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
};

const expiredCookie = (request) => {
  const forwardedProto = request.headers["x-forwarded-proto"];
  const secure = forwardedProto === "https" || process.env.NODE_ENV === "production";
  return [
    `${COOKIE_NAME}=`,
    "HttpOnly",
    "Path=/",
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    "SameSite=Lax",
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
};

const getRequestPath = (req) => {
  const requestUrl = new URL(req.url || "/", "http://localhost");
  if (!requestUrl.pathname.startsWith("/api/")) {
    return null;
  }
  const pathname = requestUrl.pathname.startsWith("/api/uploads/")
    ? requestUrl.pathname.slice("/api".length)
    : requestUrl.pathname;
  return `${pathname}${requestUrl.search}`;
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (!ALLOWED_METHODS.has(req.method)) {
    res.setHeader("Allow", [...ALLOWED_METHODS].join(", "));
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const backendUrl = process.env.BACKEND_API_URL?.replace(/\/+$/, "");
  const bypassSecret = process.env.VERCEL_BYPASS_SECRET;
  const requestPath = getRequestPath(req);

  if (!backendUrl || !requestPath) {
    return res.status(500).json({
      success: false,
      message: "Proxy is not configured",
    });
  }

  // Logout is local to this proxy because the backend JWT is held here.
  if (req.method === "POST" && requestPath.split("?")[0] === "/api/admin/logout") {
    res.setHeader("Set-Cookie", expiredCookie(req));
    return res.status(200).json({ success: true, message: "Logged out" });
  }

  const cookies = parseCookies(req.headers.cookie);
  const headers = new Headers();
  const passThroughHeaders = [
    "accept",
    "content-type",
    "content-disposition",
    "if-none-match",
    "if-modified-since",
  ];

  for (const name of passThroughHeaders) {
    const value = req.headers[name];
    if (typeof value === "string") headers.set(name, value);
  }

  if (bypassSecret) {
    headers.set("x-vercel-protection-bypass", bypassSecret);
  }

  if (cookies[COOKIE_NAME]) {
    headers.set("authorization", `Bearer ${cookies[COOKIE_NAME]}`);
  }

  const body = ["GET", "HEAD", "OPTIONS"].includes(req.method)
    ? undefined
    : await readBody(req);

  let upstream;
  try {
    upstream = await fetch(`${backendUrl}${requestPath}`, {
      method: req.method,
      headers,
      body,
      redirect: "manual",
    });
  } catch (error) {
    console.error("Backend proxy request failed", error);
    return res.status(502).json({
      success: false,
      message: "Backend unavailable",
    });
  }

  const responseType = upstream.headers.get("content-type");
  if (responseType) res.setHeader("Content-Type", responseType);

  for (const name of ["content-disposition", "cache-control", "etag", "last-modified"]) {
    const value = upstream.headers.get(name);
    if (value) res.setHeader(name, value);
  }

  const responseBody = Buffer.from(await upstream.arrayBuffer());

  // Login returns the JWT in JSON. Convert it to an HttpOnly cookie and remove
  // the token from the response so it can never be read by browser JavaScript.
  if (upstream.ok && requestPath.split("?")[0] === "/api/admin/login") {
    try {
      const payload = JSON.parse(responseBody.toString("utf8"));
      const token = payload?.data?.token || payload?.token;
      if (token) {
        res.setHeader("Set-Cookie", cookie(token, req));
        if (payload.data) delete payload.data.token;
        else delete payload.token;
        return res.status(upstream.status).send(JSON.stringify(payload));
      }
    } catch {
      // Preserve a non-JSON upstream response below.
    }
  }

  // Never relay an upstream Set-Cookie header to the browser.
  return res.status(upstream.status).send(responseBody);
}
