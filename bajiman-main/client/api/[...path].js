const ALLOWED_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]);

const readBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
};

const getRequestPath = (req) => {
  const requestUrl = new URL(req.url || "/", "http://localhost");
  if (!requestUrl.pathname.startsWith("/api/")) return null;

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

  if (req.method === "OPTIONS") return res.status(204).end();

  const backendUrl = process.env.BACKEND_API_URL?.replace(/\/+$/, "");
  const bypassSecret = process.env.VERCEL_BYPASS_SECRET;
  const requestPath = getRequestPath(req);

  if (!backendUrl || !requestPath) {
    return res.status(500).json({
      success: false,
      message: "Client proxy is not configured",
    });
  }

  const headers = new Headers();
  for (const name of [
    "accept",
    "content-type",
    "content-disposition",
    "if-none-match",
    "if-modified-since",
    "authorization",
  ]) {
    const value = req.headers[name];
    if (typeof value === "string") headers.set(name, value);
  }

  if (bypassSecret) headers.set("x-vercel-protection-bypass", bypassSecret);

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
    console.error("Client backend proxy request failed", error);
    return res.status(502).json({
      success: false,
      message: "Backend unavailable",
    });
  }

  const contentType = upstream.headers.get("content-type");
  if (contentType) res.setHeader("Content-Type", contentType);

  for (const name of ["content-disposition", "cache-control", "etag", "last-modified"]) {
    const value = upstream.headers.get(name);
    if (value) res.setHeader(name, value);
  }

  return res.status(upstream.status).send(Buffer.from(await upstream.arrayBuffer()));
}
