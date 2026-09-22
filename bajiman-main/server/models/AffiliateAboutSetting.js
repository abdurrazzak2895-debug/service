import mongoose from "mongoose";

const { Schema } = mongoose;

const localizedTextSchema = new Schema(
  {
    bn: { type: String, default: "", trim: true },
    en: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const AffiliateAboutSettingSchema = new Schema(
  {
    logo: { type: String, default: "", trim: true },

    title: {
      type: localizedTextSchema,
      default: () => ({ bn: "আমাদের সম্পর্কে", en: "ABOUT US" }),
    },

    description: {
      type: localizedTextSchema,
      default: () => ({
        bn: `Crickex হলো Sports Exchange এবং Sports Betting ওয়েবসাইটের একটি শীর্ষস্থানীয় প্রোভাইডার। এখানে Back & Lay, Fancy এবং Premium Bets সহ Live Match Streaming সুবিধা রয়েছে। Sports Exchange এর পাশাপাশি Crickex Live Casino, Slots এবং Virtual Games-ও প্রদান করে।

Crickex সহজ, দ্রুত এবং ইউজার-ফ্রেন্ডলি অনলাইন স্পোর্টস বেটিং অভিজ্ঞতা নিশ্চিত করে। ডিপোজিট ও উইথড্র করার জন্য একাধিক পদ্ধতি এবং ২৪ ঘণ্টা সাপোর্ট রয়েছে, যাতে আমাদের এজেন্টরা নতুন মেম্বার যুক্ত করে আয় বৃদ্ধি করতে পারে। এখনই Crickex Affiliate-এ যোগ দিন এবং আয় শুরু করুন!`,
        en: `Crickex is a leading provider in Sports Exchange and Sports Betting websites having Back & Lay, Fancy, and Premium Bets with Live Match Streaming. Along with sports exchange, Crickex also provides a wide variety of live casinos, slots, and virtual games.

Crickex ensures the ultimate online sports betting experience and simple quick user-friendly deposit and withdrawal methods with 24-hour support available for all members to help our agents to boost joining new members to Crickex. Join Crickex Affiliate Now & Begin Earning!`,
      }),
    },

    sectionBg: { type: String, default: "transparent", trim: true },
    cardBg: { type: String, default: "#eef6fb", trim: true },
    titleColor: { type: String, default: "#161f7a", trim: true },
    descriptionColor: { type: String, default: "#161f7a", trim: true },

    cardMaxWidth: { type: String, default: "1425px", trim: true },
    logoMaxWidth: { type: String, default: "340px", trim: true },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

const AffiliateAboutSetting =
  mongoose.models.AffiliateAboutSetting ||
  mongoose.model("AffiliateAboutSetting", AffiliateAboutSettingSchema);

export default AffiliateAboutSetting;
