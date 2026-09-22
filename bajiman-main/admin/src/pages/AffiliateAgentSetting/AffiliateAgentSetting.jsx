import React, { useEffect, useState } from "react";
import {
  ArrowUpRight,
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
  backgroundImage: "",
  rightImage: "",

  topText: { bn: "ক্রিকেক্স এজেন্ট হতে", en: "Become a Crickex Agent" },
  title: { bn: "আবেদন করুন", en: "Apply Now" },
  line1: { bn: "এখানেই আপনার সাফল্য!", en: "Your success starts here!" },
  line2: {
    bn: "সরাসরি উপার্জন করুন ৫০% কমিশন আজীবন।",
    en: "Earn directly with 50% lifetime commission.",
  },
  buttonText: { bn: "এখনই যোগদিন", en: "Join Now" },
  buttonLink: "",

  topBg: "#ffffff",
  topTextColor: "#0067bd",
  titleColor: "#32e414",
  lineColor: "#ffffff",
  buttonBg: "#42ea08",
  buttonTextColor: "#0067bd",
  buttonIconBg: "#d2cc27",
  buttonIconColor: "#ffffff",

  sectionMinHeight: "515px",
  contentMaxWidth: "1400px",
};

const localizedFields = [
  ["topText", "Top Text"],
  ["title", "Title"],
  ["line1", "Line 1"],
  ["line2", "Line 2"],
  ["buttonText", "Button Text"],
];

const colorFields = [
  ["topBg", "Top Badge BG"],
  ["topTextColor", "Top Badge Text"],
  ["titleColor", "Title Color"],
  ["lineColor", "Line Text Color"],
  ["buttonBg", "Button BG"],
  ["buttonTextColor", "Button Text"],
  ["buttonIconBg", "Button Icon BG"],
  ["buttonIconColor", "Button Icon Color"],
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

const AffiliateAgentSetting = () => {
  const [form, setForm] = useState(emptySetting);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const [bgFile, setBgFile] = useState(null);
  const [rightFile, setRightFile] = useState(null);

  const [bgPreview, setBgPreview] = useState("");
  const [rightPreview, setRightPreview] = useState("");

  const loadSetting = async () => {
    try {
      setPageLoading(true);
      const res = await api.get("/api/affiliate-agent-settings");
      const data = { ...emptySetting, ...(res.data?.data || {}) };

      setForm(data);
      setBgPreview(data.backgroundImageUrl || fileUrl(data.backgroundImage));
      setRightPreview(data.rightImageUrl || fileUrl(data.rightImage));
      setBgFile(null);
      setRightFile(null);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load agent setting",
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

  useEffect(() => {
    if (rightFile instanceof File) {
      const url = URL.createObjectURL(rightFile);
      setRightPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [rightFile]);

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
      fd.append("buttonLink", form.buttonLink || "");
      fd.append("sectionMinHeight", form.sectionMinHeight || "515px");
      fd.append("contentMaxWidth", form.contentMaxWidth || "1400px");

      localizedFields.forEach(([key]) => {
        fd.append(key, JSON.stringify(form[key] || localizedEmpty));
      });

      colorFields.forEach(([key]) => {
        fd.append(key, form[key] || "");
      });

      if (bgFile instanceof File) fd.append("backgroundImage", bgFile);
      if (rightFile instanceof File) fd.append("rightImage", rightFile);

      await api.put("/api/affiliate-agent-settings", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Affiliate agent setting saved successfully");
      await loadSetting();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Agent setting save failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = async (type) => {
    if (!window.confirm("Are you sure you want to remove this image?")) return;

    try {
      setLoading(true);
      await api.patch("/api/affiliate-agent-settings/remove-image", { type });
      toast.success("Image removed successfully");
      await loadSetting();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Image remove failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResetColors = async () => {
    if (!window.confirm("Are you sure you want to reset colors?")) return;

    try {
      setLoading(true);
      await api.patch("/api/affiliate-agent-settings/reset-colors");
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
              Affiliate Agent{" "}
              <span className="bg-gradient-to-r from-[#3ea0ff] to-blue-100 bg-clip-text text-transparent">
                Setting
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Control agent section background, mobile image, texts, button and
              colors.
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
            <AgentPreview
              form={form}
              bgPreview={bgPreview}
              rightPreview={rightPreview}
            />
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

          <Section title="Images">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <ImageInput
                  label="Background Image"
                  preview={bgPreview}
                  onChange={setBgFile}
                />

                {form.backgroundImage && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage("backgroundImage")}
                    className="mt-3 w-full cursor-pointer rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-200 hover:bg-red-500/20"
                  >
                    Remove Background Image
                  </button>
                )}
              </div>

              <div>
                <ImageInput
                  label="Right/Mobile Image"
                  preview={rightPreview}
                  onChange={setRightFile}
                />

                {form.rightImage && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage("rightImage")}
                    className="mt-3 w-full cursor-pointer rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-200 hover:bg-red-500/20"
                  >
                    Remove Right Image
                  </button>
                )}
              </div>
            </div>
          </Section>

          <Section title="Text Content">
            <div className="grid gap-5 md:grid-cols-2">
              {localizedFields.map(([key, label]) => (
                <LocalizedInput
                  key={key}
                  label={label}
                  value={form[key]}
                  onChange={(lang, value) => setLocalized(key, lang, value)}
                />
              ))}

              <SmallInput
                label="Button Link"
                value={form.buttonLink}
                onChange={(v) => setForm({ ...form, buttonLink: v })}
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
                label="Section Min Height"
                value={form.sectionMinHeight}
                onChange={(v) => setForm({ ...form, sectionMinHeight: v })}
              />

              <SmallInput
                label="Content Max Width"
                value={form.contentMaxWidth}
                onChange={(v) => setForm({ ...form, contentMaxWidth: v })}
              />
            </div>
          </Section>
        </div>

        <aside className="sticky top-6 h-fit space-y-6">
          <Section title="Quick Preview">
            <AgentPreview
              form={form}
              bgPreview={bgPreview}
              rightPreview={rightPreview}
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
              {loading ? "Saving..." : "Save Agent Setting"}
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
        placeholder="#000000 or rgba(...)"
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

const AgentPreview = ({ form, bgPreview, rightPreview, small = false }) => (
  <section
    className="relative w-full overflow-hidden rounded-2xl bg-cover bg-center bg-no-repeat"
    style={{
      backgroundImage: bgPreview ? `url(${bgPreview})` : "none",
      backgroundColor: bgPreview ? "transparent" : "#061532",
    }}
  >
    <div className="mb-3 flex items-center gap-2 px-4 pt-4 text-sm font-black text-white">
      <Eye className="h-4 w-4" />
      Agent Preview
    </div>

    <div
      className={`mx-auto flex w-full items-center justify-between px-5 py-8 ${
        small ? "flex-col gap-5" : "lg:px-12"
      }`}
      style={{
        minHeight: small ? "360px" : form.sectionMinHeight || "515px",
        maxWidth: form.contentMaxWidth || "1400px",
      }}
    >
      <div className="relative z-10 w-full max-w-[520px] text-white">
        <div
          className="mb-4 inline-flex rounded-full px-6 py-2 text-[18px] font-semibold leading-none shadow-md"
          style={{
            backgroundColor: form.topBg,
            color: form.topTextColor,
          }}
        >
          {getText(form.topText, "Become a Crickex Agent")}
        </div>

        <h2
          className="text-[40px] font-extrabold leading-[1.05] drop-shadow-lg md:text-[60px]"
          style={{ color: form.titleColor }}
        >
          {getText(form.title, "Apply Now")}
        </h2>

        <div
          className="mt-5 space-y-1 text-[18px] font-semibold leading-[1.35] md:text-[24px]"
          style={{ color: form.lineColor }}
        >
          <p>{getText(form.line1, "Your success starts here!")}</p>
          <p>
            {getText(form.line2, "Earn directly with 50% lifetime commission.")}
          </p>
        </div>

        <button
          type="button"
          className="mt-8 flex items-center gap-5 rounded-full py-3 pl-8 pr-2 text-[20px] font-bold shadow-[0_5px_0_rgba(0,0,0,0.22)]"
          style={{
            backgroundColor: form.buttonBg,
            color: form.buttonTextColor,
          }}
        >
          {getText(form.buttonText, "Join Now")}
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full"
            style={{
              backgroundColor: form.buttonIconBg,
              color: form.buttonIconColor,
            }}
          >
            <ArrowUpRight size={26} />
          </span>
        </button>
      </div>

      {rightPreview && (
        <div
          className={`relative z-10 flex flex-1 justify-end ${small ? "" : "hidden lg:flex"}`}
        >
          <img
            src={rightPreview}
            alt="Agent"
            className="h-auto w-full max-w-[520px] object-contain"
            draggable={false}
          />
        </div>
      )}
    </div>
  </section>
);

export default AffiliateAgentSetting;
