import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
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

const API_URL = import.meta.env.VITE_API_URL;

const emptySetting = {
  status: "active",
  bgImage: "",
  slides: [],
  autoPlay: true,
  interval: 4500,
  sectionPaddingY: "16px",
  sectionPaddingYDesktop: "40px",
  dotActiveBg: "#087cff",
  dotInactiveBg: "#151515",
  dotHoverBg: "#087cff",
};

const colorFields = [
  ["dotActiveBg", "Active Dot BG"],
  ["dotInactiveBg", "Inactive Dot BG"],
  ["dotHoverBg", "Dot Hover BG"],
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

const AffiliateSliderSetting = () => {
  const [form, setForm] = useState(emptySetting);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [bgFile, setBgFile] = useState(null);
  const [bgPreview, setBgPreview] = useState("");
  const [activePreview, setActivePreview] = useState(0);

  const loadSetting = async () => {
    try {
      setPageLoading(true);
      const res = await api.get("/api/affiliate-slider-settings");
      const data = { ...emptySetting, ...(res.data?.data || {}) };
      setForm(data);
      setBgPreview(data.bgImageUrl || fileUrl(data.bgImage));
      setBgFile(null);
      setActivePreview(0);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load slider setting",
      );
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadSetting();
  }, []);

  useEffect(() => {
    if (bgFile instanceof File) {
      const url = URL.createObjectURL(bgFile);
      setBgPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [bgFile]);

  const updateSlide = (index, key, value) => {
    setForm((prev) => {
      const list = [...(prev.slides || [])];
      list[index] = { ...list[index], [key]: value };
      return { ...prev, slides: list };
    });
  };

  const updateSlideImage = (index, file) => {
    setForm((prev) => {
      const list = [...(prev.slides || [])];
      list[index] = {
        ...list[index],
        imageFile: file,
        imagePreview: file ? URL.createObjectURL(file) : "",
      };
      return { ...prev, slides: list };
    });
  };

  const addSlide = () => {
    setForm((prev) => ({
      ...prev,
      slides: [
        ...(prev.slides || []),
        {
          localId: makeLocal(),
          image: "",
          imageFile: null,
          imagePreview: "",
          link: "",
          alt: "",
          order: prev.slides?.length || 0,
          status: "active",
        },
      ],
    }));
  };

  const removeSlide = (index) => {
    setForm((prev) => ({
      ...prev,
      slides: (prev.slides || []).filter((_, i) => i !== index),
    }));
  };

  const cleanSlides = (slides = []) =>
    slides.map(({ localId, imageFile, imagePreview, imageUrl, ...rest }) => ({
      image: rest.image || "",
      link: rest.link || "",
      alt: rest.alt || "",
      order: Number(rest.order || 0),
      status: rest.status === "inactive" ? "inactive" : "active",
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const fd = new FormData();

      fd.append("status", form.status);
      fd.append("autoPlay", String(Boolean(form.autoPlay)));
      fd.append("interval", String(form.interval || 4500));
      fd.append("sectionPaddingY", form.sectionPaddingY || "16px");
      fd.append(
        "sectionPaddingYDesktop",
        form.sectionPaddingYDesktop || "40px",
      );

      colorFields.forEach(([key]) => fd.append(key, form[key] || ""));

      fd.append("slides", JSON.stringify(cleanSlides(form.slides)));

      if (bgFile instanceof File) fd.append("bgImage", bgFile);

      form.slides?.forEach((item, index) => {
        if (item.imageFile instanceof File) {
          fd.append(`slides.${index}.image`, item.imageFile);
        }
      });

      await api.put("/api/affiliate-slider-settings", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Affiliate slider setting saved successfully");
      await loadSetting();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Slider save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = async (type, parentId = "") => {
    if (!window.confirm("Are you sure you want to remove this image?")) return;

    try {
      setLoading(true);
      await api.patch("/api/affiliate-slider-settings/remove-image", {
        type,
        parentId,
      });
      toast.success("Image removed successfully");
      await loadSetting();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Image remove failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResetColors = async () => {
    if (!window.confirm("Are you sure you want to reset slider colors?"))
      return;

    try {
      setLoading(true);
      await api.patch("/api/affiliate-slider-settings/reset-colors");
      toast.success("Slider colors reset successfully");
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
              Affiliate Slider{" "}
              <span className="bg-gradient-to-r from-[#3ea0ff] to-blue-100 bg-clip-text text-transparent">
                Setting
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Control affiliate homepage slider background, banner images, dots
              and timing.
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
            <SliderPreview
              form={form}
              bgPreview={bgPreview}
              active={activePreview}
              setActive={setActivePreview}
            />
          </Section>

          <Section title="Slider Color Control">
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

          <Section title="General Setting">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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

              <div>
                <label className={labelClass}>Auto Play</label>
                <select
                  value={String(Boolean(form.autoPlay))}
                  onChange={(e) =>
                    setForm({ ...form, autoPlay: e.target.value === "true" })
                  }
                  className={`${inputClass} cursor-pointer`}
                >
                  <option className="bg-[#050607]" value="true">
                    True
                  </option>
                  <option className="bg-[#050607]" value="false">
                    False
                  </option>
                </select>
              </div>

              <SmallInput
                label="Interval MS"
                type="number"
                value={form.interval}
                onChange={(v) => setForm({ ...form, interval: v })}
              />

              <SmallInput
                label="Mobile Padding Y"
                value={form.sectionPaddingY}
                onChange={(v) => setForm({ ...form, sectionPaddingY: v })}
              />

              <SmallInput
                label="Desktop Padding Y"
                value={form.sectionPaddingYDesktop}
                onChange={(v) =>
                  setForm({ ...form, sectionPaddingYDesktop: v })
                }
              />
            </div>
          </Section>

          <Section title="Background Image">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <ImageInput
                  label="Slider Background"
                  preview={bgPreview}
                  onChange={setBgFile}
                />

                {form.bgImage && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage("bgImage")}
                    className="mt-3 w-full cursor-pointer rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-200 hover:bg-red-500/20"
                  >
                    Remove Background Image
                  </button>
                )}
              </div>
            </div>
          </Section>

          <ListSection title="Slider Banners" onAdd={addSlide}>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {form.slides?.map((item, index) => (
                <Card key={item._id || item.localId || index}>
                  <ImageInput
                    label="Banner Image"
                    preview={
                      item.imagePreview || item.imageUrl || fileUrl(item.image)
                    }
                    onChange={(file) => updateSlideImage(index, file)}
                  />

                  <SmallInput
                    label="Alt Text"
                    value={item.alt}
                    onChange={(v) => updateSlide(index, "alt", v)}
                  />

                  <SmallInput
                    label="Link"
                    value={item.link}
                    onChange={(v) => updateSlide(index, "link", v)}
                  />

                  <div className="grid gap-3 md:grid-cols-2">
                    <SmallInput
                      label="Order"
                      type="number"
                      value={item.order}
                      onChange={(v) => updateSlide(index, "order", v)}
                    />

                    <StatusSelect
                      value={item.status}
                      onChange={(v) => updateSlide(index, "status", v)}
                    />
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {item._id && item.image ? (
                      <button
                        type="button"
                        onClick={() => handleRemoveImage("slide", item._id)}
                        className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-black text-red-200 hover:bg-red-500/20"
                      >
                        <X className="h-4 w-4" />
                        Remove Image
                      </button>
                    ) : (
                      <div />
                    )}

                    <button
                      type="button"
                      onClick={() => removeSlide(index)}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-black text-red-200 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove Item
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </ListSection>
        </div>

        <aside className="sticky top-6 h-fit space-y-6">
          <Section title="Quick Preview">
            <SliderPreview
              form={form}
              bgPreview={bgPreview}
              active={activePreview}
              setActive={setActivePreview}
              small
            />
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
              {loading ? "Saving..." : "Save Slider Setting"}
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
        placeholder="#000000 or rgba(...)"
      />
    </div>
  </div>
);

const SmallInput = ({ label, value, onChange, type = "text" }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <input
      type={type}
      min={type === "number" ? 0 : undefined}
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
            Click to upload image
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

const SliderPreview = ({
  form,
  bgPreview,
  active,
  setActive,
  small = false,
}) => {
  const slides = Array.isArray(form.slides)
    ? form.slides
        .filter((item) => item.status !== "inactive")
        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
    : [];

  const current = slides[active] || slides[0];
  const currentImg =
    current?.imagePreview || current?.imageUrl || fileUrl(current?.image);

  return (
    <section
      className="relative w-full overflow-hidden rounded-2xl bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: bgPreview ? `url(${bgPreview})` : "none",
        backgroundColor: bgPreview ? "transparent" : "#061532",
        paddingTop: small ? "16px" : form.sectionPaddingYDesktop || "40px",
        paddingBottom: small ? "16px" : form.sectionPaddingYDesktop || "40px",
      }}
    >
      <div className="mb-3 flex items-center gap-2 px-4 text-sm font-black text-white">
        <Eye className="h-4 w-4" />
        Slider Preview
      </div>

      <div className="mx-auto w-full max-w-[1500px] px-2 lg:px-8">
        <div className="relative mx-auto aspect-[5/2] w-full max-w-[1415px] overflow-hidden rounded-xl bg-black/20">
          <AnimatePresence mode="wait">
            {currentImg ? (
              <motion.img
                key={currentImg}
                src={currentImg}
                alt={current?.alt || "Banner"}
                className="absolute inset-0 h-full w-full object-contain"
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                draggable={false}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white/60">
                No banner image
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-2 flex items-center justify-center gap-1.5">
          {(slides.length ? slides : [{}, {}]).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActive(index)}
              className="h-[10px] w-[10px] cursor-pointer rounded-full transition-all duration-300"
              style={{
                backgroundColor:
                  active === index ? form.dotActiveBg : form.dotInactiveBg,
                transform: active === index ? "scale(1.1)" : "scale(1)",
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AffiliateSliderSetting;
