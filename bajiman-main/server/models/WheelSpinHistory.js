import mongoose from "mongoose";

const { Schema } = mongoose;

/* ======================================================
   WHEEL SPIN HISTORY
====================================================== */

const WheelSpinHistorySchema = new Schema(
  {
    spinId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    wheel: {
      type: Schema.Types.ObjectId,
      ref: "WheelReward",
      required: true,
      index: true,
    },

    selectedPosition: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
      index: true,
    },

    wheelSnapshot: {
      wheelImage: {
        type: String,
        default: "",
      },

      title: {
        bn: {
          type: String,
          default: "",
        },

        en: {
          type: String,
          default: "",
        },
      },

      spinCost: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    prizeSnapshot: {
      position: {
        type: Number,
        required: true,
        min: 1,
        max: 8,
      },

      text: {
        bn: {
          type: String,
          default: "",
        },

        en: {
          type: String,
          default: "",
        },
      },

      prizeType: {
        type: String,
        enum: ["balance", "reward_coin", "no_prize"],
        required: true,
      },

      amount: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
      },

      probability: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      turnoverMultiplier: {
        type: Number,
        default: 0,
        min: 0,
      },

      backgroundColor: {
        type: String,
        default: "#ffc800",
      },

      textColor: {
        type: String,
        default: "#000000",
      },
    },

    rewardCoinBefore: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    spinCost: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    rewardCoinPrize: {
      type: Number,
      default: 0,
      min: 0,
    },

    rewardCoinAfter: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    balanceBefore: {
      type: Number,
      required: true,
      default: 0,
    },

    balancePrize: {
      type: Number,
      default: 0,
      min: 0,
    },

    balanceAfter: {
      type: Number,
      required: true,
      default: 0,
    },

    turnoverMultiplier: {
      type: Number,
      default: 0,
      min: 0,
    },

    turnoverRequired: {
      type: Number,
      default: 0,
      min: 0,
    },

    turnover: {
      type: Schema.Types.ObjectId,
      ref: "TurnOver",
      default: null,
    },

    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
      index: true,
    },

    failureReason: {
      type: String,
      default: "",
      trim: true,
    },

    spunAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

/* ======================================================
   INDEXES
====================================================== */

WheelSpinHistorySchema.index({
  user: 1,
  createdAt: -1,
});

WheelSpinHistorySchema.index({
  wheel: 1,
  createdAt: -1,
});

WheelSpinHistorySchema.index({
  user: 1,
  wheel: 1,
  createdAt: -1,
});

WheelSpinHistorySchema.index({
  wheel: 1,
  status: 1,
  createdAt: -1,
});

WheelSpinHistorySchema.index({
  "prizeSnapshot.prizeType": 1,
  createdAt: -1,
});

const WheelSpinHistory =
  mongoose.models.WheelSpinHistory ||
  mongoose.model("WheelSpinHistory", WheelSpinHistorySchema);

export default WheelSpinHistory;
