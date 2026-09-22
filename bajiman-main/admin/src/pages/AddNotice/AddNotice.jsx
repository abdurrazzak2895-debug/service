import React, { useEffect, useState } from "react";
import {
  Bell,
  Loader2,
  RefreshCw,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const defaultColors = {
  sectionBg: "#0B66A8",
  desktopSectionBg: "transparent",
  iconColor: "#ffffff",
  desktopIconColor: "#4b5563",
  textColor: "#ffffff",
  desktopTextColor: "#444444",
  skeletonBg: "rgba(255,255,255,0.4)",
  desktopSkeletonBg: "#d1d5db",
};

const emptyForm = {
  textBn: "",
  textEn: "",
  status: "active",
  ...defaultColors,
};

const colorFields = [
  ["sectionBg", "Mobile Section BG"],
  ["desktopSectionBg", "Desktop Section BG"],
  ["iconColor", "Mobile Icon Color"],
  ["desktopIconColor", "Desktop Icon Color"],
  ["textColor", "Mobile Text Color"],
  ["desktopTextColor", "Desktop Text Color"],
  ["skeletonBg", "Mobile Skeleton BG"],
  ["desktopSkeletonBg", "Desktop Skeleton BG"],
];

const inputClass =
  "w-full rounded-xl border border-[#1A79D3]/25 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#3ea0ff] focus:ring-2 focus:ring-[#1A79D3]/20";

const labelClass = "mb-2 block text-sm font-bold text-blue-100";

const AddNotice = () => {
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const normalizeNotice = (data = null) => {
    if (!data) return emptyForm;

    return {
      textBn: data?.text?.bn || "",
      textEn: data?.text?.en || "",
      status: data?.status || "active",

      sectionBg: data?.sectionBg || defaultColors.sectionBg,
      desktopSectionBg:
        data?.desktopSectionBg || defaultColors.desktopSectionBg,
      iconColor: data?.iconColor || defaultColors.iconColor,
      desktopIconColor:
        data?.desktopIconColor || defaultColors.desktopIconColor,
      textColor: data?.textColor || defaultColors.textColor,
      desktopTextColor:
        data?.desktopTextColor || defaultColors.desktopTextColor,
      skeletonBg: data?.skeletonBg || defaultColors.skeletonBg,
      desktopSkeletonBg:
        data?.desktopSkeletonBg || defaultColors.desktopSkeletonBg,
    };
  };

  const loadNotice = async () => {
    try {
      setFetching(true);

      const res = await api.get("/api/notice");
      const data = res.data?.data || null;

      setNotice(data);
      setForm(normalizeNotice(data));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load notice");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadNotice();
  }, []);

  const setValue = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.textBn.trim() || !form.textEn.trim()) {
      return toast.error("Bangla and English notice text are required");
    }

    try {
      setLoading(true);

      const payload = {
        textBn: form.textBn.trim(),
        textEn: form.textEn.trim(),
        status: form.status,
      };

      colorFields.forEach(([key]) => {
        payload[key] = form[key] || "";
      });

      const res = await api.post("/api/notice", payload);

      setNotice(res.data?.data || null);
      setForm(normalizeNotice(res.data?.data || null));

      toast.success("Notice saved successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save notice");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const ok = window.confirm("Are you sure you want to delete this notice?");
    if (!ok) return;

    try {
      setLoading(true);

      await api.delete("/api/notice");

      setNotice(null);
      setForm(emptyForm);

      toast.success("Notice deleted successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete notice");
    } finally {
      setLoading(false);
    }
  };

  const handleResetColors = async () => {
    const ok = window.confirm("Are you sure you want to reset notice colors?");
    if (!ok) return;

    try {
      setLoading(true);

      await api.patch("/api/notice/reset-colors");

      toast.success("Notice colors reset successfully");
      await loadNotice();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to reset colors");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-white">
      <section className="relative overflow-hidden rounded-3xl border border-[#1A79D3]/20 bg-gradient-to-r from-black/80 via-[#06182a] to-black/80 p-6 shadow-2xl shadow-black/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,121,211,0.30),transparent_35%)]" />

        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] shadow-lg shadow-[#1A79D3]/40">
              <Bell className="h-9 w-9" />
            </div>

            <h1 className="text-3xl font-black md:text-4xl">
              Notice{" "}
              <span className="bg-gradient-to-r from-[#3ea0ff] to-blue-100 bg-clip-text text-transparent">
                Management
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Manage notice text, status and notice bar colors from admin panel.
            </p>
          </div>

          <div className="rounded-2xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 p-5">
            <p className="text-sm font-black text-blue-100">Notice Status</p>
            <p
              className={`mt-1 text-2xl font-black ${
                notice?.status === "active"
                  ? "text-emerald-400"
                  : notice
                    ? "text-red-400"
                    : "text-slate-400"
              }`}
            >
              {notice ? notice.status?.toUpperCase() : "EMPTY"}
            </p>
          </div>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 "
      >
        <div className="space-y-6">
          <section className="rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
            <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h2 className="text-xl font-black">
                  {notice ? "Update Notice" : "Add Notice"}
                </h2>
                <p className="text-sm text-slate-400">
                  Add Bangla and English notice text.
                </p>
              </div>

              <button
                type="button"
                onClick={loadNotice}
                disabled={fetching}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-4 py-2 text-sm font-black text-blue-100 hover:bg-[#1A79D3]/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {fetching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </button>
            </div>

            <div className="grid gap-5">
              <div>
                <label className={labelClass}>Bangla Notice Text *</label>
                <textarea
                  rows={5}
                  className={`${inputClass} resize-none`}
                  value={form.textBn}
                  onChange={(e) => setValue("textBn", e.target.value)}
                  placeholder="বাংলা নোটিশ লিখুন..."
                />
              </div>

              <div>
                <label className={labelClass}>English Notice Text *</label>
                <textarea
                  rows={5}
                  className={`${inputClass} resize-none`}
                  value={form.textEn}
                  onChange={(e) => setValue("textEn", e.target.value)}
                  placeholder="Write English notice..."
                />
              </div>

              <div>
                <label className={labelClass}>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setValue("status", e.target.value)}
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
          </section>

          <section className="rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
            <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h2 className="text-xl font-black">Color Control</h2>
                <p className="text-sm text-slate-400">
                  Control mobile and desktop notice colors.
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetColors}
                disabled={loading || !notice}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-black text-red-200 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Colors
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {colorFields.map(([key, label]) => (
                <ColorInput
                  key={key}
                  label={label}
                  value={form[key]}
                  onChange={(v) => setValue(key, v)}
                />
              ))}
            </div>
          </section>

          <div className="grid gap-3 md:grid-cols-2">
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
              {loading ? "Saving..." : "Save Notice"}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={loading || !notice}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-5 py-3.5 text-sm font-black text-red-200 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-5 w-5" />
              Delete Notice
            </button>
          </div>
        </div>

        <section className="sticky top-6 h-fit rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
          <h2 className="text-xl font-black">Live Preview</h2>
          <p className="mt-1 text-sm text-slate-400">
            Mobile and desktop notice preview.
          </p>

          <div className="mt-5 space-y-5">
            <PreviewBox title="Mobile Preview">
              <NoticePreview form={form} mode="mobile" />
            </PreviewBox>

            <PreviewBox title="Desktop Preview">
              <NoticePreview form={form} mode="desktop" />
            </PreviewBox>

            <PreviewBox title="Loading Skeleton Preview">
              <SkeletonPreview form={form} />
            </PreviewBox>
          </div>
        </section>
      </form>
    </div>
  );
};

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
        placeholder="#000000 or rgba(...) or transparent"
      />
    </div>
  </div>
);

const PreviewBox = ({ title, children }) => (
  <div className="rounded-2xl border border-[#1A79D3]/20 bg-black/40 p-4">
    <h3 className="mb-3 text-sm font-black text-blue-100">{title}</h3>
    {children}
  </div>
);

const NoticePreview = ({ form, mode = "mobile" }) => {
  const isDesktop = mode === "desktop";

  const bg = isDesktop ? form.desktopSectionBg : form.sectionBg;
  const iconColor = isDesktop ? form.desktopIconColor : form.iconColor;
  const textColor = isDesktop ? form.desktopTextColor : form.textColor;
  const text = isDesktop ? form.textEn : form.textBn;

  return (
    <div
      className="w-full overflow-hidden rounded-md py-1"
      style={{ background: bg }}
    >
      <div className="flex h-[26px] items-center overflow-hidden rounded-sm">
        <div className="flex h-full w-9 shrink-0 items-center justify-center">
          <Bell size={18} style={{ color: iconColor }} />
        </div>

        <div className="relative flex-1 overflow-hidden">
          <div className="inline-block whitespace-nowrap">
            <span
              className="text-[14px] font-medium"
              style={{ color: textColor }}
            >
              {text ||
                (isDesktop
                  ? "English notice preview will show here..."
                  : "বাংলা নোটিশ প্রিভিউ এখানে দেখাবে...")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const SkeletonPreview = ({ form }) => (
  <div className="space-y-3">
    <div
      className="rounded-md p-2"
      style={{ background: form.sectionBg || defaultColors.sectionBg }}
    >
      <div
        className="h-[14px] w-full rounded"
        style={{ background: form.skeletonBg || defaultColors.skeletonBg }}
      />
    </div>

    <div
      className="rounded-md p-2"
      style={{
        background: form.desktopSectionBg || defaultColors.desktopSectionBg,
      }}
    >
      <div
        className="h-[14px] w-full rounded"
        style={{
          background: form.desktopSkeletonBg || defaultColors.desktopSkeletonBg,
        }}
      />
    </div>
  </div>
);

export default AddNotice;
