import mongoose from "mongoose";

const NineWicketSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userId: { type: Number, required: true, index: true },
    gameUid: { type: String, default: "11539", trim: true },
    symbol: { type: String, default: "9W", trim: true, uppercase: true },
    sessionId: { type: Number, default: null, index: true },
    launchTransferId: { type: String, required: true, unique: true, index: true },
    launchAmount: { type: Number, default: 0, min: 0 },
    lastProviderBalance: { type: Number, default: 0 },
    status: { type: String, enum: ["launching", "active", "ended", "cashout_pending", "cashed_out", "failed"], default: "launching", index: true },
    callbackEvents: { type: [mongoose.Schema.Types.Mixed], default: [] },
    lastError: { type: String, default: "" },
    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
    cashedOutAt: { type: Date, default: null },
  },
  { timestamps: true },
);

NineWicketSessionSchema.index({ user: 1, status: 1 });
NineWicketSessionSchema.index({ sessionId: 1 }, { sparse: true });

const NineWicketSession =
  mongoose.models.NineWicketSession || mongoose.model("NineWicketSession", NineWicketSessionSchema);

export default NineWicketSession;
