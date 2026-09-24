#!/usr/bin/env node
/**
 * Seed (or refresh) a demo player with a funded wallet, then print login
 * credentials + a ready-to-use JWT. Optionally fires a real 9Wicket launch.
 *
 * Usage:
 *   node scripts/seedTestUser.js
 *   TEST_USER_ID=demo01 TEST_USER_PASSWORD=demo1234 TEST_USER_BALANCE=2000 node scripts/seedTestUser.js
 *   RUN_LAUNCH=true node scripts/seedTestUser.js        # also calls the local /api/9wicket/launch
 *
 * Env: reads MONGO_URI, JWT_SECRET from .env (same as the server).
 */
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

const rndLetters = (n) =>
  Array.from({ length: n }, () =>
    String.fromCharCode(97 + Math.floor(Math.random() * 26)),
  ).join("");

const rndReferral = () =>
  Array.from({ length: 6 }, () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return chars[Math.floor(Math.random() * chars.length)];
  }).join("");

const uniqueGamePlayName = async () => {
  for (let i = 0; i < 50; i += 1) {
    const name = rndLetters(10);
    if (!(await User.exists({ userGamePlayName: name }))) return name;
  }
  throw new Error("Could not generate a unique gameplay name");
};

const uniqueReferralCode = async () => {
  for (let i = 0; i < 50; i += 1) {
    const code = rndReferral();
    if (!(await User.exists({ referralCode: code }))) return code;
  }
  throw new Error("Could not generate a unique referral code");
};

const run = async () => {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing in .env");
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing in .env");

  const userId = String(process.env.TEST_USER_ID || "demo01").toLowerCase();
  const password = String(process.env.TEST_USER_PASSWORD || "demo1234");
  const balance = Number(process.env.TEST_USER_BALANCE ?? 2000);
  const countryCode = process.env.TEST_USER_COUNTRY_CODE || "+880";
  const phone = process.env.TEST_USER_PHONE || "01700000001";

  await mongoose.connect(process.env.MONGO_URI);
  console.log(`✅ Connected to db: ${mongoose.connection.name}`);

  const hashedPassword = await bcrypt.hash(password, 10);
  let user = await User.findOne({ userId });

  if (user) {
    user.password = hashedPassword;
    user.balance = balance;
    user.isActive = true;
    if (!user.userGamePlayName) user.userGamePlayName = await uniqueGamePlayName();
    if (!user.referralCode) user.referralCode = await uniqueReferralCode();
    await user.save();
    console.log(`♻️  Updated existing demo user "${userId}" (balance reset to ${balance}).`);
  } else {
    user = await User.create({
      userId,
      userGamePlayName: await uniqueGamePlayName(),
      countryCode,
      phone,
      password: hashedPassword,
      role: "user",
      isActive: true,
      currency: "BDT",
      balance,
      referralCode: await uniqueReferralCode(),
    });
    console.log(`🆕 Created demo user "${userId}" with balance ${balance}.`);
  }

  const token = generateToken({ id: user._id, userId: user.userId });

  console.log("\n================ DEMO PLAYER ================");
  console.log("userId (login):     ", user.userId);
  console.log("password:           ", password);
  console.log("phone:              ", `${user.countryCode}${user.phone}`);
  console.log("gameplay name:      ", user.userGamePlayName);
  console.log("balance:            ", user.balance, user.currency);
  console.log("mongo _id:          ", String(user._id));
  console.log("\nJWT (Authorization: Bearer <token>):");
  console.log(token);
  console.log("============================================\n");

  console.log("Try a launch (once your IP is whitelisted):");
  const base = process.env.SELF_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  console.log(
    `curl -s -X POST ${base}/api/9wicket/launch \\\n` +
      `  -H "Authorization: Bearer ${token}" \\\n` +
      `  -H "Content-Type: application/json" \\\n` +
      `  -d '{"game_uid":"11539","amount":10}'\n`,
  );

  if (String(process.env.RUN_LAUNCH || "").toLowerCase() === "true") {
    console.log("→ RUN_LAUNCH=true, calling launch now...");
    try {
      const r = await fetch(`${base}/api/9wicket/launch`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ game_uid: "11539", amount: 10 }),
      });
      console.log("Launch status:", r.status);
      console.log("Launch body:", (await r.text()).slice(0, 600));
    } catch (e) {
      console.log("Launch call failed (is the server running?):", e.message);
    }
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
