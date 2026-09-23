#!/usr/bin/env node
import "dotenv/config";

const baseUrl = String(process.env.BACKEND_URL || "").replace(/\/+$/, "");
const email = process.env.ADMIN_EMAIL || "";
const password = process.env.ADMIN_PASSWORD || "";
const categoryId = process.env.ORACLE_CATEGORY_ID || "";
const dryRun = !["0", "false", "no"].includes(String(process.env.ORACLE_DRY_RUN || "true").toLowerCase());
const concurrency = Number(process.env.ORACLE_SYNC_CONCURRENCY || 3);

if (!baseUrl || !email || !password || !categoryId) {
  console.error("Required: BACKEND_URL, ADMIN_EMAIL, ADMIN_PASSWORD, ORACLE_CATEGORY_ID");
  process.exit(1);
}

const request = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const text = await response.text();
  let body;
  try { body = JSON.parse(text); } catch { body = { raw: text }; }
  if (!response.ok || body?.success === false) {
    throw new Error(`${options.method || "GET"} ${path} failed (${response.status}): ${body?.message || text}`);
  }
  return body;
};

const main = async () => {
  const login = await request("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const token = login?.data?.token;
  if (!token) throw new Error("Admin login succeeded but no token was returned");
  const auth = { Authorization: `Bearer ${token}` };

  const [methods, fields, providers] = await Promise.all([
    request("/api/deposit-methods", { headers: auth }),
    request("/api/deposit-fields", { headers: auth }),
    request("/api/game-providers/oracle/list", { headers: auth }),
  ]);

  const activeMethods = (methods.data || []).filter((item) => item.isActive);
  const configs = fields.data || [];
  const configured = new Set(configs.map((item) => String(item.depositMethod?._id || item.depositMethod)));
  const missingDepositConfig = activeMethods
    .filter((item) => !configured.has(String(item._id)))
    .map((item) => item.methodId);
  console.log(JSON.stringify({
    depositCheck: {
      activeMethods: activeMethods.length,
      fieldConfigs: configs.length,
      missingFieldConfig: missingDepositConfig,
      warning: missingDepositConfig.length ? "Some active deposit channels lack field configuration" : "OK",
    },
    oracleProviders: (providers.data || []).length,
    dryRun,
  }, null, 2));

  if (missingDepositConfig.length && process.env.REQUIRE_DEPOSIT_SETUP === "true") {
    throw new Error("Deposit setup preflight failed; configure deposit fields or set REQUIRE_DEPOSIT_SETUP=false");
  }

  const providerCodes = (providers.data || []).map((item) => item.providerCode).filter(Boolean);
  const sync = await request("/api/admin/oracle-sync", {
    method: "POST",
    headers: auth,
    body: JSON.stringify({ categoryId, providerCodes, dryRun, concurrency }),
  });
  console.log(JSON.stringify(sync.data, null, 2));
  if (sync.data?.providerErrors?.length) process.exitCode = 2;
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
