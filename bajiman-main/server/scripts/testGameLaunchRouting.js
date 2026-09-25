#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { isYellowBatProvider } from "../routes/yellowBatLaunchRoutes.js";
import {
  isSoftApiProvider,
  isSoftApiSandboxEnabled,
  launchSoftApiSandbox,
  resolveSoftApiGameUid,
  resolveSoftApiSandboxEnv,
} from "../services/softApiRouting.js";
import { launchSoftApiGame } from "../services/softApiService.js";
import { decryptSoftApiPayload } from "../services/softApiCrypto.js";

const launchRouteSource = await readFile(
  new URL("../routes/gameLaunchRoutes.js", import.meta.url),
  "utf8",
);
assert.doesNotMatch(
  launchRouteSource,
  /oracleGameLaunchRoutes|isOracleProvider|launchOracleGame/,
  "generic game launch must not invoke the Oracle launch adapter",
);

assert.equal(isYellowBatProvider({ providerCode: "WORLD_166", providerName: "Yellow Bat" }), true);
assert.equal(isYellowBatProvider({ providerCode: "world_167", providerName: "Rectangle" }), false);

const sandboxEnv = {
  SOFTAPI_SANDBOX_LAUNCH_ENABLED: "true",
  SOFTAPI_SANDBOX_PROVIDER_CODES: "world_166, world_170",
  SOFTAPI_SANDBOX_GAME_UID_MAP: JSON.stringify({
    WORLD_166: { "local-yellow-bat-1": "softapi-code-1" },
    WORLD_170: { "local-provider-2": "softapi-code-2" },
  }),
  SOFTAPI_SANDBOX_TOKEN: "synthetic-sandbox-token",
  SOFTAPI_SANDBOX_SECRET: "0123456789abcdef0123456789abcdef",
  SOFTAPI_SANDBOX_LAUNCH_URL: "https://sandbox.example.test/launch",
  SOFTAPI_SANDBOX_CALLBACK_URL: "https://casino.example.test/api/softapi/callback",
  SOFTAPI_SANDBOX_RETURN_URL: "https://casino.example.test/lobby",
  SOFTAPI_SANDBOX_CURRENCY_CODE: "BDT",
  SOFTAPI_SANDBOX_LANGUAGE: "en",
  // Production config must never leak into the sandbox launcher.
  SOFTAPI_TOKEN: "production-token-must-not-be-used",
  SOFTAPI_SECRET: "fedcba9876543210fedcba9876543210",
  SOFTAPI_LAUNCH_URL: "https://production.example.test/launch",
};
assert.equal(isSoftApiSandboxEnabled(sandboxEnv), true);
assert.equal(isSoftApiProvider({ providerCode: "WORLD_166" }, sandboxEnv), true);
assert.equal(isSoftApiProvider({ providerCode: "world_170" }, sandboxEnv), true);
assert.equal(isSoftApiProvider({ providerCode: "WORLD_171" }, sandboxEnv), false);
assert.equal(
  resolveSoftApiGameUid("WORLD_166", "local-yellow-bat-1", sandboxEnv),
  "softapi-code-1",
);
assert.equal(
  resolveSoftApiGameUid("WORLD_166", "another-local-game", sandboxEnv),
  "",
  "unmapped local games must fail closed",
);
assert.equal(
  resolveSoftApiGameUid("WORLD_171", "local-yellow-bat-1", sandboxEnv),
  "",
  "provider codes outside the explicit allow-list must not map",
);
assert.throws(
  () => resolveSoftApiGameUid("WORLD_166", "local-yellow-bat-1", {
    ...sandboxEnv,
    SOFTAPI_SANDBOX_GAME_UID_MAP: "not-json",
  }),
  /valid JSON/,
);
assert.throws(
  () => resolveSoftApiGameUid("WORLD_166", "local-yellow-bat-1", {
    ...sandboxEnv,
    SOFTAPI_SANDBOX_GAME_UID_MAP: "[]",
  }),
  /JSON object/,
);
assert.equal(isSoftApiSandboxEnabled({}), false, "sandbox routing is off by default");
assert.equal(isSoftApiProvider({ providerCode: "WORLD_171" }, {}), false);
const verifiedWorld92Env = {
  SOFTAPI_SANDBOX_PROVIDER_CODES: "WORLD_92",
  SOFTAPI_SANDBOX_GAME_UID_MAP: "",
};
assert.equal(
  resolveSoftApiGameUid("WORLD_92", "1168", verifiedWorld92Env),
  "1168",
  "verified YGRGaming game codes should resolve from the checked-in catalog map",
);
assert.equal(
  resolveSoftApiGameUid("WORLD_92", "21051", verifiedWorld92Env),
  "",
  "unverified YGRGaming games must remain fail-closed",
);
assert.equal(
  resolveSoftApiGameUid("WORLD_92", "21056", verifiedWorld92Env),
  "",
  "duplicate-title Cash Maker UID must not inherit another game's code",
);
assert.equal(
  resolveSoftApiGameUid("WORLD_133", "11298", verifiedWorld92Env),
  "",
  "KA is not enabled until its map is explicitly reviewed and allow-listed",
);
assert.equal(
  resolveSoftApiSandboxEnv({
    NINEWICKET_TOKEN: "synthetic-shared-token",
    NINEWICKET_SECRET: "11223344556677881122334455667788",
  }).SOFTAPI_TOKEN,
  "",
  "shared credentials must not be reused implicitly",
);

const sharedAccountSandboxEnv = {
  ...sandboxEnv,
  SOFTAPI_SANDBOX_TOKEN: "",
  SOFTAPI_SANDBOX_SECRET: "",
  SOFTAPI_SANDBOX_LAUNCH_URL: "",
  SOFTAPI_SANDBOX_REUSE_WORLD_CASINO_CREDENTIALS: "true",
  NINEWICKET_TOKEN: "synthetic-shared-token",
  NINEWICKET_SECRET: "11223344556677881122334455667788",
  NINEWICKET_API_BASE: "https://world-casino.example.test/api/v1",
};
const sharedSoftApiEnv = resolveSoftApiSandboxEnv(sharedAccountSandboxEnv);
assert.equal(sharedSoftApiEnv.SOFTAPI_TOKEN, "synthetic-shared-token");
assert.equal(
  sharedSoftApiEnv.SOFTAPI_SECRET,
  "11223344556677881122334455667788",
);
assert.equal(
  sharedSoftApiEnv.SOFTAPI_LAUNCH_URL,
  sharedAccountSandboxEnv.NINEWICKET_API_BASE,
  "explicit same-account opt-in should use the configured API base verbatim",
);

let capturedRequest;
const result = await launchSoftApiSandbox(
  { userId: 1234, gameUid: "softapi-code-1", balance: 9876 },
  {
    env: sharedAccountSandboxEnv,
    launcher: (input, options) =>
      launchSoftApiGame(input, {
        ...options,
        now: 1_710_000_000_000,
        httpClient: {
          post: async (url, body) => {
            capturedRequest = { url, body };
            return {
              data: {
                code: 0,
                msg: "OK",
                data: { url: "https://sandbox.example.test/game/session" },
              },
            };
          },
        },
      }),
  },
);
assert.equal(capturedRequest.url, sharedAccountSandboxEnv.NINEWICKET_API_BASE);
assert.equal(capturedRequest.body.token, "synthetic-shared-token");
const capturedPlain = decryptSoftApiPayload(
  capturedRequest.body.payload,
  "11223344556677881122334455667788",
);
assert.equal(capturedPlain.user_id, 1234);
assert.equal(capturedPlain.game_uid, "softapi-code-1");
assert.equal(capturedPlain.balance, 0, "the encrypted sandbox request must carry zero balance");
assert.equal(result.gameUrl, "https://sandbox.example.test/game/session");

console.log("PASS: Oracle is not used by the generic game-launch dispatcher.");
console.log("PASS: only exact verified WORLD_92 game mappings resolve; unmatched games fail closed.");
console.log("PASS: Yellow Bat matches the guarded WORLD_166 adapter only.");
console.log("PASS: SoftAPI sandbox routing requires explicit provider codes and per-game UID mapping.");
console.log("PASS: sandbox launches isolate credentials by default and force balance to zero.");
console.log("PASS: shared World Casino credentials are reused only with explicit opt-in.");
console.log("PASS: unmapped games fail closed; sandbox routing is disabled by default.");
