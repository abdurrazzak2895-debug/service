#!/usr/bin/env node
import "dotenv/config";
import mongoose from "mongoose";
import syncWorldCasinoCatalog from "../services/worldCasinoCatalogSync.js";

const categoryId = String(process.env.WORLD_CASINO_CATEGORY_ID || "").trim();
const brandId = String(process.env.WORLD_CASINO_BRAND_ID || "141").trim();
const dryRun = ["1", "true", "yes"].includes(
  String(process.env.WORLD_CASINO_DRY_RUN || "true").toLowerCase(),
);

if (!process.env.MONGO_URI) {
  console.error("Required environment variable: MONGO_URI");
  process.exit(1);
}
if (!categoryId) {
  console.error("Required environment variable: WORLD_CASINO_CATEGORY_ID");
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGO_URI);
  const summary = await syncWorldCasinoCatalog({
    categoryId,
    brandId: brandId === "all" ? "" : brandId,
    dryRun,
  });
  console.log(JSON.stringify(summary, null, 2));
  if (summary.providerErrors.length) process.exitCode = 2;
} catch (error) {
  console.error(error.message || error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
