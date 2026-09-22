import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * A single reward item inside a day. A day can hand out more than one
 * reward at once (e.g. balance + reward coin), each with its own icon.
 */
const CheckInRewardItemSchema = new Schema(
  {
    rewardType: {
      type: String,
      enum: ["balance", "reward_coin"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    icon: {
      type: String,
      default: "",
    },
  },
  { _id: false },
);

const CheckInDaySchema = new Schema(
  {
    dayNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
    },

    dayName: {
      bn: {
        type: String,
        required: true,
        trim: true,
      },

      en: {
        type: String,
        required: true,
        trim: true,
      },
    },

    rewards: {
      type: [CheckInRewardItemSchema],
      default: [],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "Each Check-In day needs at least one reward",
      },
    },
  },
  { _id: true },
);

const CheckInRewardSettingSchema = new Schema(
  {
    settingKey: {
      type: String,
      default: "global",
      unique: true,
      trim: true,
    },

    title: {
      bn: { type: String, default: "দৈনিক চেক ইন", trim: true },
      en: { type: String, default: "Daily Check In", trim: true },
    },

    description: {
      bn: {
        type: String,
        default: "প্রতিদিন চেক ইন করুন এবং আপনার দৈনিক প্রস্কার সংগ্রহ করুন।",
        trim: true,
      },

      en: {
        type: String,
        default: "Check in daily and collect your daily reward.",
        trim: true,
      },
    },

    /**
     * The floating launcher icon shown on the client home page.
     * Clicking it opens the Check-In modal.
     */
    launcherIcon: {
      type: String,
      default: "",
    },

    days: {
      type: [CheckInDaySchema],
      default: [],
    },

    version: {
      type: Number,
      default: 1,
      min: 1,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

CheckInRewardSettingSchema.index({
  settingKey: 1,
  isActive: 1,
});

const CheckInRewardSetting = mongoose.model(
  "CheckInRewardSetting",
  CheckInRewardSettingSchema,
);

export default CheckInRewardSetting;
