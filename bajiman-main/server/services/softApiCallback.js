import crypto from "node:crypto";
import { decryptSoftApiPayload, resolveSoftApiSecret } from "./softApiCrypto.js";

const requiredText = (value, name, maxLength = 200) => {
  const result = String(value ?? "").trim();
  if (!result || result.length > maxLength) throw new Error(`Invalid ${name}`);
  return result;
};

const amount = (value, name) => {
  if (value === null || value === undefined || value === "") throw new Error(`Missing ${name}`);
  if (typeof value !== "number" && typeof value !== "string") throw new Error(`Invalid ${name}`);
  if (typeof value === "string" && !/^\d+(?:\.\d+)?$/.test(value.trim())) {
    throw new Error(`Invalid ${name}`);
  }
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 1_000_000_000_000) {
    throw new Error(`Invalid ${name}`);
  }
  return number;
};

const eventTimestamp = (value) => {
  const timestamp = Number(value);
  if (!Number.isSafeInteger(timestamp) || timestamp <= 0) {
    throw new Error("Invalid callback timestamp");
  }
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) throw new Error("Invalid callback timestamp");
  return date;
};

const notifyOnly = (value) => value === true || value === 1 || value === "1" || String(value).toLowerCase() === "true";

const idempotencyKey = ({ serialNumber, gameUid, gameRound, memberAccount, betAmount, winAmount, timestamp }) => {
  const source = [
    serialNumber ? "serial" : "round",
    gameUid,
    memberAccount,
    serialNumber || gameRound,
    gameRound,
    betAmount,
    winAmount,
    timestamp,
  ];
  const digest = crypto.createHash("sha256").update(JSON.stringify(source)).digest("hex");
  return { eventKey: `softapi:${digest}`, idempotencySource: serialNumber ? "serial_number" : "game_round_event" };
};

export const parseSoftApiCallback = (
  body,
  { secret = resolveSoftApiSecret(), encryptionMode = "required" } = {},
) => {
  if (encryptionMode !== "required" && encryptionMode !== "optional") {
    throw new Error("Invalid SoftAPI callback encryption mode");
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Callback body must be a JSON object");
  }
  const hasEncryptedPayload = typeof body.payload === "string" && body.payload.length > 0;
  if (hasEncryptedPayload && body.timestamp !== undefined) {
    const wrapperTimestamp = Number(body.timestamp);
    if (!Number.isSafeInteger(wrapperTimestamp) || wrapperTimestamp <= 0) {
      throw new Error("Invalid encrypted callback wrapper timestamp");
    }
  }
  if (!hasEncryptedPayload && encryptionMode === "required") {
    throw new Error("Encrypted SoftAPI callbacks are required");
  }
  const event = hasEncryptedPayload ? decryptSoftApiPayload(body.payload, secret) : body;
  if (!event || typeof event !== "object" || Array.isArray(event)) {
    throw new Error("Decrypted callback must be a JSON object");
  }
  if (!notifyOnly(event.notify_only)) {
    throw new Error("SoftAPI callback must be notify-only");
  }
  const gameId = requiredText(event.game_id, "game_id");
  const gameUid = requiredText(event.game_uid, "game_uid");
  const gameRound = requiredText(event.game_round, "game_round");
  const memberAccount = requiredText(event.member_account, "member_account");
  const serialNumber = event.serial_number === undefined || event.serial_number === null || event.serial_number === ""
    ? ""
    : requiredText(event.serial_number, "serial_number");
  const gameName = event.game_name === undefined || event.game_name === null
    ? ""
    : requiredText(event.game_name, "game_name", 300);
  const betAmount = amount(event.bet_amount, "bet_amount");
  const winAmount = amount(event.win_amount, "win_amount");
  const occurredAt = eventTimestamp(event.timestamp);
  const keys = idempotencyKey({
    serialNumber,
    gameUid,
    gameRound,
    memberAccount,
    betAmount,
    winAmount,
    timestamp: occurredAt.getTime(),
  });
  return {
    provider: "softapi",
    ...keys,
    gameId,
    gameUid,
    gameRound,
    memberAccount,
    serialNumber,
    gameName,
    betAmount,
    winAmount,
    eventTimestamp: occurredAt,
    notifyOnly: true,
    encrypted: hasEncryptedPayload,
    rawEvent: {
      game_id: gameId,
      game_uid: gameUid,
      game_round: gameRound,
      member_account: memberAccount,
      bet_amount: betAmount,
      win_amount: winAmount,
      timestamp: occurredAt.getTime(),
      notify_only: true,
      ...(serialNumber ? { serial_number: serialNumber } : {}),
      ...(gameName ? { game_name: gameName } : {}),
    },
  };
};

export { idempotencyKey as softApiIdempotencyKey };
export default { parseSoftApiCallback, softApiIdempotencyKey: idempotencyKey };
