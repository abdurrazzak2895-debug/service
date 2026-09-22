import mongoose from "mongoose";

const GameSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GameCategory",
      required: true,
      index: true,
    },

    providerDbId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GameProvider",
      required: true,
      index: true,
    },

    oracleImageType: {
      type: String,
      enum: ["thumbnail", "height", "original"],
      default: "thumbnail",
    },

    gameUId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    isHot: {
      type: Boolean,
      default: false,
      index: true,
    },

    isFavorites: {
      type: Boolean,
      default: false,
      index: true,
    },

    isLatest: {
      type: Boolean,
      default: false,
      index: true,
    },

    isAZ: {
      type: Boolean,
      default: false,
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },

    syncStatus: {
      type: String,
      enum: ["pending", "synced", "failed"],
      default: "pending",
      index: true,
    },

    lastSyncedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

GameSchema.index({ providerDbId: 1, gameUId: 1 }, { unique: true });
GameSchema.index({ categoryId: 1, status: 1 });
GameSchema.index({ providerDbId: 1, status: 1 });

const Game = mongoose.models.Game || mongoose.model("Game", GameSchema);

export default Game;
