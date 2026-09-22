import mongoose from "mongoose";

const { Schema } = mongoose;

const UserCheckInProgressSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    setting: {
      type: Schema.Types.ObjectId,
      ref: "CheckInRewardSetting",
      default: null,
    },

    settingVersion: {
      type: Number,
      default: 1,
    },

    nextDayNumber: {
      type: Number,
      default: 1,
    },

    lastClaimedDayNumber: {
      type: Number,
      default: 0,
    },

    lastClaimAt: {
      type: Date,
      default: null,
    },

    nextClaimAt: {
      type: Date,
      default: null,
    },

    completedCycles: {
      type: Number,
      default: 0,
    },

    /**
     * Snapshot of the rewards credited on the last successful claim
     * (a day can hand out more than one reward at once).
     */
    lastRewards: {
      type: [
        {
          rewardType: {
            type: String,
            enum: ["balance", "reward_coin"],
          },
          amount: { type: Number, default: 0 },
          _id: false,
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

UserCheckInProgressSchema.index({ user: 1 }, { unique: true });

const UserCheckInProgress = mongoose.model(
  "UserCheckInProgress",
  UserCheckInProgressSchema,
);

export default UserCheckInProgress;
