import React, { useEffect, useState } from "react";
import {
  BadgeCheck,
  Eye,
  Loader2,
  RotateCcw,
  Save,
  Settings,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const localizedEmpty = { bn: "", en: "" };

const emptySetting = {
  status: "active",
  sectionTitle: {
    bn: "দেখুন ক্রিকেক্স অ্যাফিলিয়েট প্রোগ্রাম কীভাবে কাজ করে",
    en: "WATCH HOW CRICKEX AFFILIATE PROGRAM WORKS",
  },
  videoId: "EP-NFy9IpK8",
  videoUrl: "",

  sectionBg: "transparent",
  cardBg: "#ffffff",
  titleColor: "#17227a",
  videoBorderColor: "#333333",
  videoBg: "#000000",

  contentMaxWidth: "1425px",
  videoMaxWidth: "920px",
};

const colorFields = [
  ["sectionBg", "Section BG"],
  ["cardBg", "Card BG"],
  ["titleColor", "Title Color"],
  ["videoBorderColor", "Video Border Color"],
  ["videoBg", "Video BG"],
];

const inputClass =
  "w-full rounded-xl border border-[#1A79D3]/25 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#3ea0ff] focus:ring-2 focus:ring-[#1A79D3]/20";

const labelClass = "mb-2 block text-sm font-bold text-blue-100";

const getText = (obj, fallback = "") => obj?.en || obj?.bn || fallback;

const getEmbedUrl = (form) => {
  if (form?.embedUrl) return form.embedUrl;
  const id = form?.videoId || "EP-NFy9IpK8";
  return id ? `https://www.youtube.com/embed/${id}` : "";
};

const AffiliateWatchSetting = () => {
  const [form, setForm] = useState(emptySetting);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const loadSetting = async () => {
    try {
      setPageLoading(true);
      const res = await api.get("/api/affiliate-watch-settings");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await api.put("/api/affiliate-watch-settings", {
        status: form.status,
        sectionTitle: form.sectionTitle,
        videoId: form.videoId,
        videoUrl: form.videoUrl,

        sectionBg: form.sectionBg,
        cardBg: form.cardBg,
        titleColor: form.titleColor,
        videoBorderColor: form.videoBorderColor,
        videoBg: form.videoBg,

        contentMaxWidth: form.contentMaxWidth,
        videoMaxWidth: form.videoMaxWidth,
      });

      toast.success("Watch setting saved successfully");
      await loadSetting();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResetColors = async () => {
    if (!window.confirm("Are you sure you want to reset colors?")) return;

    try {
      setLoading(true);
      await api.patch("/api/affiliate-watch-settings/reset-colors");
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
              Affiliate Watch{" "}
              <span className="bg-gradient-to-r from-[#3ea0ff] to-blue-100 bg-clip-text text-transparent">
                Setting
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Control YouTube video, section title, colors and layout.
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
            <WatchPreview form={form} />
          </Section>

          <Section title="Video Setting">
            <div className="grid gap-5 md:grid-cols-2">
              <SmallInput
                label="YouTube Video ID"
                value={form.videoId}
                onChange={(v) => setForm({ ...form, videoId: v })}
              />

              <SmallInput
                label="YouTube Video URL"
                value={form.videoUrl}
                onChange={(v) => setForm({ ...form, videoUrl: v })}
              />

              <SmallInput
                label="Content Max Width"
                value={form.contentMaxWidth}
                onChange={(v) => setForm({ ...form, contentMaxWidth: v })}
              />

              <SmallInput
                label="Video Max Width"
                value={form.videoMaxWidth}
                onChange={(v) => setForm({ ...form, videoMaxWidth: v })}
              />
            </div>
          </Section>

          <Section title="Title & Status">
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
            </div>
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
        </div>

        <aside className="sticky top-6 h-fit space-y-6">
          <Section title="Quick Preview">
            <WatchPreview form={form} small />
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
              {loading ? "Saving..." : "Save Watch"}
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

const WatchPreview = ({ form, small = false }) => {
  const embedUrl = getEmbedUrl(form);

  return (
    <section
      className="w-full rounded-2xl px-4 py-6"
      style={{ backgroundColor: form.sectionBg || "transparent" }}
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
        <Eye className="h-4 w-4" />
        Watch Preview
      </div>

      <div
        className="mx-auto w-full rounded-md px-4 py-10 shadow-lg sm:px-8 md:py-16"
        style={{
          maxWidth: form.contentMaxWidth || "1425px",
          backgroundColor: form.cardBg || "#ffffff",
        }}
      >
        <h2
          className="mb-10 text-center text-[24px] font-extrabold uppercase tracking-wide drop-shadow-md sm:text-[32px]"
          style={{ color: form.titleColor || "#17227a" }}
        >
          {getText(
            form.sectionTitle,
            "WATCH HOW CRICKEX AFFILIATE PROGRAM WORKS",
          )}
        </h2>

        <div
          className="mx-auto w-full overflow-hidden rounded-md border shadow-md"
          style={{
            maxWidth: small ? "100%" : form.videoMaxWidth || "920px",
            borderColor: form.videoBorderColor || "#333333",
            backgroundColor: form.videoBg || "#000000",
          }}
        >
          <div className="relative aspect-video w-full">
            {embedUrl ? (
              <iframe
                className="absolute inset-0 h-full w-full"
                src={embedUrl}
                title="How Affiliate Program Works"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                No video selected
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AffiliateWatchSetting;
