import React, { useEffect, useState } from "react";
import {
  BadgeCheck,
  Eye,
  ImagePlus,
  Loader2,
  RotateCcw,
  Save,
  Settings,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const API_URL = import.meta.env.VITE_API_URL;

const localizedEmpty = { bn: "", en: "" };

const emptySetting = {
  status: "active",
  logo: "",
  title: { bn: "আমাদের সম্পর্কে", en: "ABOUT US" },
  description: { bn: "", en: "" },

  sectionBg: "transparent",
  cardBg: "#eef6fb",
  titleColor: "#161f7a",
  descriptionColor: "#161f7a",

  cardMaxWidth: "1425px",
  logoMaxWidth: "340px",
};

const localizedFields = [
  ["title", "Title"],
  ["description", "Description"],
];

const colorFields = [
  ["sectionBg", "Section BG"],
  ["cardBg", "Card BG"],
  ["titleColor", "Title Color"],
  ["descriptionColor", "Description Color"],
];

const inputClass =
  "w-full rounded-xl border border-[#1A79D3]/25 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#3ea0ff] focus:ring-2 focus:ring-[#1A79D3]/20";

const labelClass = "mb-2 block text-sm font-bold text-blue-100";

const fileUrl = (path = "") => {
  if (!path) return "";
  if (String(path).startsWith("http")) return path;
  return `${API_URL}${String(path).startsWith("/") ? path : `/${path}`}`;
};

const getText = (obj, fallback = "") => obj?.en || obj?.bn || fallback;

const AffiliateAboutSetting = () => {
  const [form, setForm] = useState(emptySetting);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  const loadSetting = async () => {
    try {
      setPageLoading(true);
      const res = await api.get("/api/affiliate-about-settings");
      const data = { ...emptySetting, ...(res.data?.data || {}) };

      setForm(data);
      setLogoPreview(data.logoUrl || fileUrl(data.logo));
      setLogoFile(null);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load about setting",
      );
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadSetting();
  }, []);

  useEffect(() => {
    if (logoFile instanceof File) {
      const url = URL.createObjectURL(logoFile);
      setLogoPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [logoFile]);

  const setLocalized = (field, lang, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: { ...(prev[field] || localizedEmpty), [lang]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const fd = new FormData();

      fd.append("status", form.status);
      fd.append("cardMaxWidth", form.cardMaxWidth || "1425px");
      fd.append("logoMaxWidth", form.logoMaxWidth || "340px");

      localizedFields.forEach(([key]) => {
        fd.append(key, JSON.stringify(form[key] || localizedEmpty));
      });

      colorFields.forEach(([key]) => {
        fd.append(key, form[key] || "");
      });

      if (logoFile instanceof File) {
        fd.append("logo", logoFile);
      }

      await api.put("/api/affiliate-about-settings", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Affiliate about setting saved successfully");
      await loadSetting();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "About setting save failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!window.confirm("Are you sure you want to remove logo?")) return;

    try {
      setLoading(true);
      await api.patch("/api/affiliate-about-settings/remove-logo");
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
      await api.patch("/api/affiliate-about-settings/reset-colors");
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
              Affiliate About{" "}
              <span className="bg-gradient-to-r from-[#3ea0ff] to-blue-100 bg-clip-text text-transparent">
                Setting
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Control about section logo, title, description, layout and colors.
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
            <AboutPreview form={form} logoPreview={logoPreview} />
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

          <Section title="Logo">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <ImageInput
                  label="About Logo"
                  preview={logoPreview}
                  onChange={setLogoFile}
                />

                {form.logo && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="mt-3 w-full cursor-pointer rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-200 hover:bg-red-500/20"
                  >
                    Remove Logo
                  </button>
                )}
              </div>
            </div>
          </Section>

          <Section title="Text Content">
            <div className="grid gap-5">
              <LocalizedInput
                label="Title"
                value={form.title}
                onChange={(lang, value) => setLocalized("title", lang, value)}
              />

              <LocalizedTextarea
                label="Description"
                value={form.description}
                onChange={(lang, value) =>
                  setLocalized("description", lang, value)
                }
              />
            </div>
          </Section>

          <Section title="Layout & Status">
            <div className="grid gap-5 md:grid-cols-3">
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
                label="Card Max Width"
                value={form.cardMaxWidth}
                onChange={(v) => setForm({ ...form, cardMaxWidth: v })}
              />

              <SmallInput
                label="Logo Max Width"
                value={form.logoMaxWidth}
                onChange={(v) => setForm({ ...form, logoMaxWidth: v })}
              />
            </div>
          </Section>
        </div>

        <aside className="sticky top-6 h-fit space-y-6">
          <Section title="Quick Preview">
            <AboutPreview form={form} logoPreview={logoPreview} small />
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
              {loading ? "Saving..." : "Save About Setting"}
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
        className={`${inputClass} min-h-[220px] resize-none`}
        value={value?.bn || ""}
        onChange={(e) => onChange("bn", e.target.value)}
        placeholder="Bangla description"
      />
      <textarea
        className={`${inputClass} min-h-[220px] resize-none`}
        value={value?.en || ""}
        onChange={(e) => onChange("en", e.target.value)}
        placeholder="English description"
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

const AboutPreview = ({ form, logoPreview, small = false }) => (
  <section
    className="w-full rounded-2xl px-4 py-4 md:py-8"
    style={{ backgroundColor: form.sectionBg || "transparent" }}
  >
    <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
      <Eye className="h-4 w-4" />
      About Preview
    </div>

    <div
      className={`mx-auto flex w-full flex-col items-center gap-8 rounded-md px-6 py-8 shadow-lg ${
        small ? "" : "md:flex-row md:px-10"
      }`}
      style={{
        maxWidth: form.cardMaxWidth || "1425px",
        backgroundColor: form.cardBg || "#eef6fb",
      }}
    >
      {logoPreview && (
        <div
          className={`${small ? "flex" : "hidden md:flex"} w-full items-center justify-center md:w-[32%]`}
        >
          <img
            src={logoPreview}
            alt="Affiliate About"
            className="w-full object-contain"
            style={{ maxWidth: form.logoMaxWidth || "340px" }}
            draggable={false}
          />
        </div>
      )}

      <div
        className="w-full md:w-[68%]"
        style={{ color: form.descriptionColor }}
      >
        <h2
          className="mb-5 text-center text-[28px] font-bold uppercase tracking-wide md:text-left md:text-[30px]"
          style={{ color: form.titleColor }}
        >
          {getText(form.title, "ABOUT US")}
        </h2>

        <p
          className="whitespace-pre-line text-[16px] font-semibold leading-[1.5] md:text-[17px] lg:text-[18px]"
          style={{ color: form.descriptionColor }}
        >
          {getText(form.description, "About description preview...")}
        </p>
      </div>
    </div>
  </section>
);

export default AffiliateAboutSetting;
