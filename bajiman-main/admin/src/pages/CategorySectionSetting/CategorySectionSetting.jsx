import React, { useEffect, useState } from "react";
import {
  BadgeCheck,
  Flame,
  ImagePlus,
  Loader2,
  RefreshCw,
  RotateCcw,
  Save,
  Settings,
  Trophy,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const defaultForm = {
  status: "active",
  sectionBg: "#0b66a8",
  navBg: "#074b7f",
  activeItemBg: "#0b66a8",
  inactiveItemBg: "#074b7f",
  itemTextColor: "#ffffff",
  activeBorderColor: "#1fa7ff",
  hotImage: "",
  sportsImage: "",
  hotImageUrl: "",
  sportsImageUrl: "",
};

const inputClass =
  "w-full rounded-xl border border-[#1A79D3]/25 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#3ea0ff] focus:ring-2 focus:ring-[#1A79D3]/20";

const labelClass = "mb-2 block text-sm font-bold text-blue-100";

const CategorySectionSetting = () => {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const [hotImageFile, setHotImageFile] = useState(null);
  const [sportsImageFile, setSportsImageFile] = useState(null);
  const [hotPreview, setHotPreview] = useState("");
  const [sportsPreview, setSportsPreview] = useState("");

  const loadSetting = async () => {
    try {
      setPageLoading(true);
      const res = await api.get("/api/category-section-settings");
      const data = { ...defaultForm, ...(res.data?.data || {}) };

      setForm(data);
      setHotPreview(data.hotImageUrl || "");
      setSportsPreview(data.sportsImageUrl || "");
      setHotImageFile(null);
      setSportsImageFile(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load setting");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadSetting();
  }, []);

  useEffect(() => {
    if (hotImageFile instanceof File) {
      const url = URL.createObjectURL(hotImageFile);
      setHotPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [hotImageFile]);

  useEffect(() => {
    if (sportsImageFile instanceof File) {
      const url = URL.createObjectURL(sportsImageFile);
      setSportsPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [sportsImageFile]);

  const setValue = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const fd = new FormData();

      fd.append("status", form.status);
      fd.append("sectionBg", form.sectionBg);
      fd.append("navBg", form.navBg);
      fd.append("activeItemBg", form.activeItemBg);
      fd.append("inactiveItemBg", form.inactiveItemBg);
      fd.append("itemTextColor", form.itemTextColor);
      fd.append("activeBorderColor", form.activeBorderColor);

      if (hotImageFile instanceof File) {
        fd.append("hotImage", hotImageFile);
      }

      if (sportsImageFile instanceof File) {
        fd.append("sportsImage", sportsImageFile);
      }

      await api.put("/api/category-section-settings", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Category section setting saved successfully");
      await loadSetting();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (type) => {
    const ok = window.confirm("Are you sure you want to remove this image?");
    if (!ok) return;

    try {
      setLoading(true);

      if (type === "hot") {
        await api.delete("/api/category-section-settings/hot-image");
        toast.success("Hot image removed successfully");
      }

      if (type === "sports") {
        await api.delete("/api/category-section-settings/sports-image");
        toast.success("Sports image removed successfully");
      }

      await loadSetting();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Remove failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    const ok = window.confirm("Are you sure you want to reset all settings?");
    if (!ok) return;

    try {
      setLoading(true);
      await api.patch("/api/category-section-settings/reset");
      toast.success("Category section setting reset successfully");
      await loadSetting();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Reset failed");
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
              Category{" "}
              <span className="bg-gradient-to-r from-[#3ea0ff] to-blue-100 bg-clip-text text-transparent">
                Section Setting
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Control category bar colors and upload Hot Game / Sports icons.
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
        className="grid gap-6 xl:grid-cols-[1fr_420px]"
      >
        <div className="space-y-6">
          <Section title="Main Colors">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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

              <ColorInput
                label="Section Background"
                value={form.sectionBg}
                onChange={(v) => setValue("sectionBg", v)}
              />

              <ColorInput
                label="Nav Background"
                value={form.navBg}
                onChange={(v) => setValue("navBg", v)}
              />

              <ColorInput
                label="Active Item Background"
                value={form.activeItemBg}
                onChange={(v) => setValue("activeItemBg", v)}
              />

              <ColorInput
                label="Inactive Item Background"
                value={form.inactiveItemBg}
                onChange={(v) => setValue("inactiveItemBg", v)}
              />

              <ColorInput
                label="Item Text Color"
                value={form.itemTextColor}
                onChange={(v) => setValue("itemTextColor", v)}
              />

              <ColorInput
                label="Active Border Color"
                value={form.activeBorderColor}
                onChange={(v) => setValue("activeBorderColor", v)}
              />
            </div>
          </Section>

          <Section title="Hot & Sports Images">
            <div className="grid gap-6 md:grid-cols-2">
              <ImageInput
                label="Hot Game Image"
                preview={hotPreview}
                onChange={setHotImageFile}
              />

              <ImageInput
                label="Sports Image"
                preview={sportsPreview}
                onChange={setSportsImageFile}
              />
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <button
                type="button"
                disabled={loading || !form.hotImage}
                onClick={() => handleDeleteImage("hot")}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-200 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Remove Hot Image
              </button>

              <button
                type="button"
                disabled={loading || !form.sportsImage}
                onClick={() => handleDeleteImage("sports")}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-200 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Remove Sports Image
              </button>
            </div>
          </Section>
        </div>

        <section className="sticky top-6 h-fit rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
          <div className="mb-5 flex items-center gap-3">
            <BadgeCheck className="h-5 w-5 text-[#3ea0ff]" />
            <h2 className="text-xl font-black">Live Preview</h2>
          </div>

          <div
            className="rounded-2xl p-3"
            style={{ backgroundColor: form.sectionBg }}
          >
            <div
              className="no-scrollbar flex overflow-x-auto rounded-md"
              style={{ backgroundColor: form.navBg }}
            >
              <PreviewItem
                active
                icon={hotPreview}
                label="Hot Game"
                Icon={Flame}
                form={form}
              />

              <PreviewItem
                icon={sportsPreview}
                label="Sports"
                Icon={Trophy}
                form={form}
              />

              <PreviewItem label="Casino" Icon={Settings} form={form} />
              <PreviewItem label="Slot" Icon={Settings} form={form} />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={loadSetting}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-4 py-3 text-sm font-black text-blue-100 hover:bg-[#1A79D3]/20"
            >
              <RefreshCw className="h-4 w-4" />
              Reload
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleReset}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-200 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-[#1A79D3]/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            {loading ? "Saving..." : "Save Category Section"}
          </button>
        </section>
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
        placeholder="#000000"
      />
    </div>
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
          className="h-[90px] w-[90px] rounded-xl object-contain"
        />
      ) : (
        <div className="flex h-[120px] w-full flex-col items-center justify-center rounded-xl bg-black/30">
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

const PreviewItem = ({ active, icon, label, Icon, form }) => (
  <div
    className="relative flex h-[88px] min-w-[92px] flex-col items-center justify-center gap-[8px]"
    style={{
      backgroundColor: active ? form.activeItemBg : form.inactiveItemBg,
      color: form.itemTextColor,
    }}
  >
    {icon ? (
      <img
        src={icon}
        alt={label}
        className="h-[36px] w-[36px] object-contain"
      />
    ) : (
      <Icon className="h-[36px] w-[36px]" />
    )}

    <span className="text-[14px] font-bold leading-none">{label}</span>

    {active && (
      <span
        className="absolute bottom-0 left-0 h-[3px] w-full"
        style={{ backgroundColor: form.activeBorderColor }}
      />
    )}
  </div>
);

export default CategorySectionSetting;
