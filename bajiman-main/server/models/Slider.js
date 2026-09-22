import mongoose from "mongoose";

const SliderSchema = new mongoose.Schema(
  {
    desktopImage: {
      type: String,
      default: "",
      trim: true,
    },

    mobileImage: {
      type: String,
      default: "",
      trim: true,
    },

    order: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },

    sectionBg: {
      type: String,
      default: "#0B66A8",
      trim: true,
    },

    desktopSectionBg: {
      type: String,
      default: "#f5f5f5",
      trim: true,
    },

    slideBg: {
      type: String,
      default: "#082056",
      trim: true,
    },

    arrowColor: {
      type: String,
      default: "#9ca3af",
      trim: true,
    },

    arrowHoverColor: {
      type: String,
      default: "#4b5563",
      trim: true,
    },

    paginationBg: {
      type: String,
      default: "#7aa7d9",
      trim: true,
    },

    paginationActiveBg: {
      type: String,
      default: "#2f79c9",
      trim: true,
    },

    mobileSkeletonBg: {
      type: String,
      default: "rgba(255,255,255,0.2)",
      trim: true,
    },

    desktopSkeletonBg: {
      type: String,
      default: "#d1d5db",
      trim: true,
    },

    skeletonDotBg: {
      type: String,
      default: "rgba(122,167,217,0.5)",
      trim: true,
    },

    skeletonDotActiveBg: {
      type: String,
      default: "#7aa7d9",
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },

    // Click behavior: "link" opens `link` in a new tab; "promo" opens an
    // in-app modal showing promoImage/promoTitle/promoDescription instead.
    mode: {
      type: String,
      enum: ["link", "promo"],
      default: "link",
    },

    link: {
      type: String,
      default: "",
      trim: true,
    },

    promoImage: {
      type: String,
      default: "",
      trim: true,
    },

    promoTitle: {
      bn: { type: String, default: "", trim: true },
      en: { type: String, default: "", trim: true },
    },

    // Rich body text — rendered with a light markup convention so admin
    // can reproduce a "Weekly Lucky Draw"-style layout without a rigid
    // schema: a line ending with ":" becomes a bold sub-header (e.g. "How
    // to Participate:"), a line starting with "- " becomes a bullet point,
    // a blank line adds spacing, anything else is a plain paragraph.
    promoDescription: {
      bn: { type: String, default: "", trim: true },
      en: { type: String, default: "", trim: true },
    },

    // Optional structured content rendered below the body text — one or
    // more labeled sections (e.g. "Eligible Tier", "Eligible Games"), each
    // either a multi-column table (columns set) or a plain list (no
    // columns), matching a real promo layout like a deposit bonus's tier
    // table plus a separate eligible-games list.
    promoTable: {
      enabled: { type: Boolean, default: false },

      sections: [
        {
          _id: false,
          label: {
            bn: { type: String, default: "", trim: true },
            en: { type: String, default: "", trim: true },
          },

          columns: [
            {
              _id: false,
              bn: { type: String, default: "", trim: true },
              en: { type: String, default: "", trim: true },
            },
          ],

          rows: [
            {
              _id: false,
              cells: [
                {
                  _id: false,
                  bn: { type: String, default: "", trim: true },
                  en: { type: String, default: "", trim: true },
                },
              ],
            },
          ],
        },
      ],
    },
  },
  { timestamps: true },
);

SliderSchema.index({ status: 1, order: 1 });

const Slider = mongoose.models.Slider || mongoose.model("Slider", SliderSchema);

export default Slider;
