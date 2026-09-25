#!/usr/bin/env node
import assert from "node:assert/strict";
import { isOracleProvider } from "../routes/oracleGameLaunchRoutes.js";
import { isYellowBatProvider } from "../routes/yellowBatLaunchRoutes.js";

assert.equal(isOracleProvider({ providerCode: "WORLD_92" }), true);
assert.equal(isOracleProvider({ providerCode: "WORLD_133" }), true);
assert.equal(isOracleProvider({ providerCode: "world_92" }), true);
assert.equal(isOracleProvider({ providerCode: "WORLD_141", providerName: "9wickets" }), false);
assert.equal(isOracleProvider({ providerCode: "UNKNOWN", providerName: "Unknown" }), false);
assert.equal(isYellowBatProvider({ providerCode: "WORLD_166", providerName: "Yellow Bat" }), true);
assert.equal(isYellowBatProvider({ providerCode: "world_167", providerName: "Rectangle" }), false);

console.log("PASS: KA and YGRGaming route through the Oracle-compatible handler.");
console.log("PASS: 9wicket and unknown providers do not route through the Oracle handler.");
console.log("PASS: Yellow Bat matches the guarded WORLD_166 adapter only.");
