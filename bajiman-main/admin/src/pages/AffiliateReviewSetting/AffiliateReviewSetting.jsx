import React, { useEffect, useState } from "react";
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  ImagePlus,
  Loader2,
  PlusCircle,
  RotateCcw,
  Save,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

const API_URL = import.meta.env.VITE_API_URL;

const localizedEmpty = { bn: "", en: "" };

const emptySetting = {
  status: "active",

  sectionTitle: {
    bn: "CRICKEX সম্পর্কে অন্যরা যা বলে",
    en: "WHAT OTHERS SAY ABOUT CRICKEX",
  },

  reviews: [],

  sectionBg: "transparent",
  cardGradientFrom: "#3d80c8",
  cardGradientVia: "#479e95",
  cardGradientTo: "#50cf31",
  titleColor: "#ffffff",
  reviewCardBg: "#ffffff",
  reviewTextColor: "#02066e",
  navBorderColor: "#ffffff",
  navTextColor: "#ffffff",
  navHoverBg: "#ffffff",
  navHoverTextColor: "#236cb5",

  contentMaxWidth: "1425px",
  autoplayDelay: 3500,
  slideSpeed: 850,
};

const colorFields = [
  ["sectionBg", "Section BG"],
  ["cardGradientFrom", "Gradient From"],
  ["cardGradientVia", "Gradient Via"],
  ["cardGradientTo", "Gradient To"],
  ["titleColor", "Title Color"],
  ["reviewCardBg", "Review Card BG"],
  ["reviewTextColor", "Review Text Color"],
  ["navBorderColor", "Nav Border Color"],
  ["navTextColor", "Nav Text Color"],
  ["navHoverBg", "Nav Hover BG"],
  ["navHoverTextColor", "Nav Hover Text Color"],
];

const inputClass =
  "w-full rounded-xl border border-[#1A79D3]/25 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#3ea0ff] focus:ring-2 focus:ring-[#1A79D3]/20";

const labelClass = "mb-2 block text-sm font-bold text-blue-100";

const fileUrl = (path = "") => {
  if (!path) return "";
  if (String(path).startsWith("http")) return path;
  return `${API_URL}${String(path).startsWith("/") ? path : `/${path}`}`;
};

const makeLocal = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const getText = (obj, fallback = "") => obj?.en || obj?.bn || fallback;

const AffiliateReviewSetting = () => {
  const [form, setForm] = useState(emptySetting);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const loadSetting = async () => {
    try {
      setPageLoading(true);
      const res = await api.get("/api/affiliate-review-settings");
      setForm({ ...emptySetting, ...(res.data?.data || {}) });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load setting");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadSetting();
  }, []);

  const setLocalized = (field, lang, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: { ...(prev[field] || localizedEmpty), [lang]: value },
    }));
  };

  const addReview = () => {
    setForm((prev) => ({
      ...prev,
      reviews: [
        ...(prev.reviews || []),
        {
          localId: makeLocal(),
          logo: "",
          logoFile: null,
          logoPreview: "",
          reviewText: { bn: "", en: "" },
          order: prev.reviews?.length || 0,
          status: "active",
        },
      ],
    }));
  };

  const updateReview = (index, key, value) => {
    setForm((prev) => {
      const list = [...(prev.reviews || [])];
      list[index] = { ...list[index], [key]: value };
      return { ...prev, reviews: list };
    });
  };

  const updateReviewText = (index, lang, value) => {
    setForm((prev) => {
      const list = [...(prev.reviews || [])];
      list[index] = {
        ...list[index],
        reviewText: {
          ...(list[index]?.reviewText || localizedEmpty),
          [lang]: value,
        },
      };
      return { ...prev, reviews: list };
    });
  };

  const updateLogo = (index, file) => {
    setForm((prev) => {
      const list = [...(prev.reviews || [])];
      list[index] = {
        ...list[index],
        logoFile: file,
        logoPreview: file ? URL.createObjectURL(file) : "",
      };
      return { ...prev, reviews: list };
    });
  };

  const removeReview = (index) => {
    setForm((prev) => ({
      ...prev,
      reviews: (prev.reviews || []).filter((_, i) => i !== index),
    }));
  };

  const cleanReviews = (reviews = []) =>
    reviews.map(({ localId, logoFile, logoPreview, logoUrl, ...rest }) => ({
      logo: rest.logo || "",
      reviewText: rest.reviewText || localizedEmpty,
      order: Number(rest.order || 0),
      status: rest.status === "inactive" ? "inactive" : "active",
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const fd = new FormData();

      fd.append("status", form.status);
      fd.append(
        "sectionTitle",
        JSON.stringify(form.sectionTitle || localizedEmpty),
      );
      fd.append("reviews", JSON.stringify(cleanReviews(form.reviews)));

      [
        "sectionBg",
        "cardGradientFrom",
        "cardGradientVia",
        "cardGradientTo",
        "titleColor",
        "reviewCardBg",
        "reviewTextColor",
        "navBorderColor",
        "navTextColor",
        "navHoverBg",
        "navHoverTextColor",
        "contentMaxWidth",
        "autoplayDelay",
        "slideSpeed",
      ].forEach((field) => {
        fd.append(field, form[field] || "");
      });

      form.reviews?.forEach((review, index) => {
        if (review.logoFile instanceof File) {
          fd.append(`reviews.${index}.logo`, review.logoFile);
        }
      });

      await api.put("/api/affiliate-review-settings", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Affiliate review setting saved successfully");
      await loadSetting();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLogo = async (parentId) => {
    if (!window.confirm("Are you sure you want to remove this logo?")) return;

    try {
      setLoading(true);
      await api.patch("/api/affiliate-review-settings/remove-logo", {
        parentId,
      });
      toast.success("Logo removed successfully");
      await loadSetting();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Logo remove failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResetColors = async () => {
    if (!window.confirm("Are you sure you want to reset colors?")) return;

    try {
      setLoading(true);
      await api.patch("/api/affiliate-review-settings/reset-colors");
      toast.success("Colors reset successfully");
      await loadSetting();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Color reset failed");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center text-white">
        <Loader2 className="h-10 w-10 animate-spin text-[#3ea0ff]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      <section className="relative overflow-hidden rounded-3xl border border-[#1A79D3]/20 bg-gradient-to-r from-black/80 via-[#06182a] to-black/80 p-6 shadow-2xl shadow-black/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,121,211,0.30),transparent_35%)]" />

        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] shadow-lg shadow-[#1A79D3]/40">
              <Settings className="h-9 w-9" />
            </div>

            <h1 className="text-3xl font-black md:text-4xl">
              Affiliate Review{" "}
              <span className="bg-gradient-to-r from-[#3ea0ff] to-blue-100 bg-clip-text text-transparent">
                Setting
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Control review slider, logos, texts, colors and layout.
            </p>
          </div>

          <div className="rounded-2xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 p-5">
            <p className="text-sm font-black text-blue-100">Status</p>
            <p className="mt-1 text-3xl font-black text-[#3ea0ff]">
              {form.status?.toUpperCase()}
            </p>
          </div>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 xl:grid-cols-[1fr_430px]"
      >
        <div className="space-y-6">
          <Section title="Live Preview">
            <ReviewPreview form={form} />
          </Section>

          <Section title="Color Control">
            <div className="mb-5 flex justify-end">
              <button
                type="button"
                onClick={handleResetColors}
                disabled={loading}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-200 hover:bg-red-500/20 disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Colors
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {colorFields.map(([key, label]) => (
                <ColorInput
                  key={key}
                  label={label}
                  value={form[key]}
                  onChange={(v) => setForm((prev) => ({ ...prev, [key]: v }))}
                />
              ))}
            </div>
          </Section>

          <Section title="Title, Slider & Status">
            <div className="grid gap-5 md:grid-cols-2">
              <LocalizedInput
                label="Section Title"
                value={form.sectionTitle}
                onChange={(lang, value) =>
                  setLocalized("sectionTitle", lang, value)
                }
              />

              <div>
                <label className={labelClass}>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className={`${inputClass} cursor-pointer`}
                >
                  <option className="bg-[#050607]" value="active">
                    Active
                  </option>
                  <option className="bg-[#050607]" value="inactive">
                    Inactive
                  </option>
                </select>
              </div>

              <SmallInput
                label="Content Max Width"
                value={form.contentMaxWidth}
                onChange={(v) => setForm({ ...form, contentMaxWidth: v })}
              />

              <SmallInput
                label="Autoplay Delay"
                value={form.autoplayDelay}
                onChange={(v) => setForm({ ...form, autoplayDelay: v })}
              />

              <SmallInput
                label="Slide Speed"
                value={form.slideSpeed}
                onChange={(v) => setForm({ ...form, slideSpeed: v })}
              />
            </div>
          </Section>

          <ListSection title="Review Items" onAdd={addReview}>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {form.reviews?.map((review, index) => (
                <Card key={review._id || review.localId || index}>
                  <ImageInput
                    label="Review Logo"
                    preview={
                      review.logoPreview ||
                      review.logoUrl ||
                      fileUrl(review.logo)
                    }
                    onChange={(file) => updateLogo(index, file)}
                  />

                  <LocalizedTextarea
                    label="Review Text"
                    value={review.reviewText}
                    onChange={(lang, value) =>
                      updateReviewText(index, lang, value)
                    }
                  />

                  <div className="grid gap-3 md:grid-cols-2">
                    <SmallInput
                      label="Order"
                      value={review.order}
                      onChange={(v) => updateReview(index, "order", v)}
                    />

                    <StatusSelect
                      value={review.status}
                      onChange={(v) => updateReview(index, "status", v)}
                    />
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {review._id && review.logo ? (
                      <button
                        type="button"
                        onClick={() => handleRemoveLogo(review._id)}
                        className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-black text-red-200 hover:bg-red-500/20"
                      >
                        <X className="h-4 w-4" />
                        Remove Logo
                      </button>
                    ) : (
                      <div />
                    )}

                    <button
                      type="button"
                      onClick={() => removeReview(index)}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-black text-red-200 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove Review
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </ListSection>
        </div>

        <aside className="sticky top-6 h-fit space-y-6">
          <Section title="Quick Preview">
            <ReviewPreview form={form} small />
          </Section>

          <div className="rounded-3xl border border-[#1A79D3]/20 bg-black/80 p-4 shadow-2xl backdrop-blur">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-[#1A79D3]/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              {loading ? "Saving..." : "Save Review"}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
};

const Section = ({ title, children }) => (
  <section className="rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
    <div className="mb-5 flex items-center gap-3">
      <BadgeCheck className="h-5 w-5 text-[#3ea0ff]" />
      <h2 className="text-xl font-black">{title}</h2>
    </div>
    {children}
  </section>
);

const ListSection = ({ title, onAdd, children }) => (
  <section className="rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
    <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <h2 className="text-xl font-black">{title}</h2>
      <button
        type="button"
        onClick={onAdd}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-4 py-3 text-sm font-black text-blue-100 hover:bg-[#1A79D3]/20"
      >
        <PlusCircle className="h-4 w-4" />
        Add New
      </button>
    </div>
    {children}
  </section>
);

const Card = ({ children }) => (
  <div className="rounded-2xl border border-[#1A79D3]/20 bg-black/30 p-5 shadow-xl transition hover:border-[#3ea0ff]/50">
    <div className="space-y-4">{children}</div>
  </div>
);

const ColorInput = ({ label, value, onChange }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <div className="flex gap-3">
      <input
        type="color"
        value={String(value || "#000000").startsWith("#") ? value : "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="h-[46px] w-[58px] cursor-pointer rounded-xl border border-[#1A79D3]/25 bg-black/40 p-1"
      />
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        placeholder="#000000 or transparent"
      />
    </div>
  </div>
);

const LocalizedInput = ({ label, value = localizedEmpty, onChange }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <div className="grid gap-3 md:grid-cols-2">
      <input
        className={inputClass}
        value={value?.bn || ""}
        onChange={(e) => onChange("bn", e.target.value)}
        placeholder="Bangla"
      />
      <input
        className={inputClass}
        value={value?.en || ""}
        onChange={(e) => onChange("en", e.target.value)}
        placeholder="English"
      />
    </div>
  </div>
);

const LocalizedTextarea = ({ label, value = localizedEmpty, onChange }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <div className="grid gap-3 md:grid-cols-2">
      <textarea
        className={`${inputClass} min-h-[130px] resize-none`}
        value={value?.bn || ""}
        onChange={(e) => onChange("bn", e.target.value)}
        placeholder="Bangla"
      />
      <textarea
        className={`${inputClass} min-h-[130px] resize-none`}
        value={value?.en || ""}
        onChange={(e) => onChange("en", e.target.value)}
        placeholder="English"
      />
    </div>
  </div>
);

const SmallInput = ({ label, value, onChange }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <input
      className={inputClass}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const StatusSelect = ({ value, onChange }) => (
  <div>
    <label className={labelClass}>Status</label>
    <select
      value={value || "active"}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputClass} cursor-pointer`}
    >
      <option className="bg-[#050607]" value="active">
        Active
      </option>
      <option className="bg-[#050607]" value="inactive">
        Inactive
      </option>
    </select>
  </div>
);

const ImageInput = ({ label, preview, onChange }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#1A79D3]/40 bg-black/40 p-4 text-center transition hover:border-[#3ea0ff] hover:bg-[#1A79D3]/10">
      {preview ? (
        <img
          src={preview}
          alt="Preview"
          className="aspect-video w-full rounded-xl object-contain"
        />
      ) : (
        <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl bg-black/30">
          <ImagePlus className="mb-3 h-10 w-10 text-[#3ea0ff]" />
          <p className="text-sm font-black text-slate-100">
            Click to upload logo
          </p>
          <p className="mt-1 text-xs text-slate-500">PNG, JPG, WEBP, SVG</p>
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="hidden"
      />
    </label>
  </div>
);

const ReviewPreview = ({ form, small = false }) => {
  const reviews = Array.isArray(form.reviews)
    ? form.reviews
        .filter((review) => review.status !== "inactive")
        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
    : [];

  const navStyle = {
    borderColor: form.navBorderColor || "#ffffff",
    color: form.navTextColor || "#ffffff",
  };

  return (
    <section
      className="w-full rounded-2xl px-4 py-6"
      style={{ backgroundColor: form.sectionBg || "transparent" }}
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
        <Eye className="h-4 w-4" />
        Review Preview
      </div>

      <div
        className="mx-auto w-full rounded-md px-5 py-10 shadow-lg sm:px-10 lg:px-12"
        style={{
          maxWidth: form.contentMaxWidth || "1425px",
          backgroundImage: `linear-gradient(to bottom, ${form.cardGradientFrom || "#3d80c8"}, ${form.cardGradientVia || "#479e95"}, ${form.cardGradientTo || "#50cf31"})`,
        }}
      >
        <h2
          className="mb-10 text-center text-[26px] font-extrabold uppercase tracking-wide drop-shadow-md sm:text-left sm:text-[32px]"
          style={{ color: form.titleColor || "#ffffff" }}
        >
          {getText(form.sectionTitle, "WHAT OTHERS SAY ABOUT CRICKEX")}
        </h2>

        {reviews.length ? (
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={26}
            slidesPerView={small ? 1 : 4}
            slidesPerGroup={1}
            speed={Number(form.slideSpeed || 850)}
            loop={reviews.length > 4}
            grabCursor
            autoplay={{
              delay: Number(form.autoplayDelay || 3500),
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            navigation={{
              prevEl: ".admin-review-prev",
              nextEl: ".admin-review-next",
            }}
            breakpoints={
              small
                ? {}
                : {
                    0: { slidesPerView: 1, spaceBetween: 18 },
                    640: { slidesPerView: 2, spaceBetween: 22 },
                    1024: { slidesPerView: 3, spaceBetween: 24 },
                    1280: { slidesPerView: 4, spaceBetween: 26 },
                  }
            }
            className="!overflow-hidden"
          >
            {reviews.map((item, index) => {
              const logo =
                item.logoPreview || item.logoUrl || fileUrl(item.logo);

              return (
                <SwiperSlide
                  key={item._id || item.localId || index}
                  className="!h-auto"
                >
                  <div
                    className="relative h-full min-h-[328px] rounded-md px-8 pb-8 pt-20 shadow-md"
                    style={{ backgroundColor: form.reviewCardBg || "#ffffff" }}
                  >
                    {logo && (
                      <div className="absolute left-[-8px] top-[5px] flex h-[56px] w-[250px] items-center rounded-[4px]">
                        <img
                          src={logo}
                          alt="Review Brand"
                          className="max-h-[60px] w-auto max-w-[250px] object-contain"
                          draggable={false}
                        />
                      </div>
                    )}

                    <p
                      className="text-[15px] font-medium leading-[1.6]"
                      style={{ color: form.reviewTextColor || "#02066e" }}
                    >
                      {getText(item.reviewText, "Review text")}
                    </p>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        ) : (
          <div className="rounded-xl bg-white/20 px-6 py-8 text-center text-sm font-bold text-white">
            No review added
          </div>
        )}

        <div className="mt-5 flex items-center justify-center gap-8">
          <button
            type="button"
            style={navStyle}
            className="admin-review-prev flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border transition"
          >
            <ChevronLeft size={30} />
          </button>

          <button
            type="button"
            style={navStyle}
            className="admin-review-next flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border transition"
          >
            <ChevronRight size={30} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default AffiliateReviewSetting;
