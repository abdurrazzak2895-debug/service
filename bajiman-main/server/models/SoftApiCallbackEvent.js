import mongoose from "mongoose";

const SoftApiCallbackEventSchema = new mongoose.Schema(
  {
    provider: { type: String, enum: ["softapi"], default: "softapi", required: true },
    eventKey: { type: String, required: true, unique: true },
    idempotencySource: { type: String, enum: ["serial_number", "game_round_event"], required: true },
    gameId: { type: String, required: true, trim: true },
    gameUid: { type: String, required: true, trim: true },
    gameRound: { type: String, required: true, trim: true },
    memberAccount: { type: String, required: true, trim: true },
    serialNumber: { type: String, default: "", trim: true },
    gameName: { type: String, default: "", trim: true },
    betAmount: { type: Number, required: true, min: 0 },
    winAmount: { type: Number, required: true, min: 0 },
    eventTimestamp: { type: Date, required: true },
    notifyOnly: { type: Boolean, enum: [true], default: true, required: true },
    encrypted: { type: Boolean, default: false },
    rawEvent: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true, collection: "softapi_callback_events" },
);

SoftApiCallbackEventSchema.index({ gameUid: 1, gameRound: 1, memberAccount: 1 });
SoftApiCallbackEventSchema.index({ eventTimestamp: -1 });

const SoftApiCallbackEvent =
  mongoose.models.SoftApiCallbackEvent ||
  mongoose.model("SoftApiCallbackEvent", SoftApiCallbackEventSchema);

export default SoftApiCallbackEvent;
