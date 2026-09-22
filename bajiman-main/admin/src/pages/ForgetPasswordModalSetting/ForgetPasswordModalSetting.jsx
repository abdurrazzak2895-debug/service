import React, { useEffect, useState } from "react";
import {
  BadgeCheck,
  ChevronDown,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const defaultForm = {
  status: "active",
  logo: "",
  logoUrl: "",

  overlayBg: "rgba(0,0,0,0.45)",
  modalBg: "#ffffff",
  headerBg: "#0865a9",
  headerText: "#ffffff",

  labelText: "#333333",
  inputBg: "#eeeeee",
  inputText: "#222222",
  inputBorder: "#d7d7d7",
  placeholderText: "#8c98a3",

  iconText: "#999999",

  buttonBg: "#0865a9",
  buttonText: "#ffffff",
  buttonDisabledBg: "#a6a6a6",

  secondaryButtonBg: "#ffffff",
  secondaryButtonText: "#0865a9",
  secondaryButtonBorder: "#0865a9",

  linkText: "#0069b4",
  footerText: "#8d8d8d",

  dropdownBg: "#ffffff",
  dropdownText: "#111111",
  dropdownBorder: "#dddddd",
  dropdownHoverBg: "#f5f5f5",
};

const inputClass =
  "w-full rounded-xl border border-[#1A79D3]/25 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#3ea0ff] focus:ring-2 focus:ring-[#1A79D3]/20";

const labelClass = "mb-2 block text-sm font-bold text-blue-100";

const ForgetPasswordModalSetting = () => {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  const loadSetting = async () => {
    try {
      setPageLoading(true);
      const res = await api.get("/api/forget-password-modal-settings");
      const data = { ...defaultForm, ...(res.data?.data || {}) };

      setForm(data);
      setLogoPreview(data.logoUrl || "");
      setLogoFile(null);
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
    if (logoFile instanceof File) {
      const url = URL.createObjectURL(logoFile);
      setLogoPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [logoFile]);

  const setValue = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const fd = new FormData();

      Object.keys(defaultForm).forEach((key) => {
        if (["logo", "logoUrl"].includes(key)) return;
        fd.append(key, form[key] || "");
      });

      if (logoFile instanceof File) {
        fd.append("logo", logoFile);
      }

      await api.put("/api/forget-password-modal-settings", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Forget password modal setting saved successfully");
      await loadSetting();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const removeLogo = async () => {
    const ok = window.confirm("Are you sure you want to remove logo?");
    if (!ok) return;

    try {
      setLoading(true);
      await api.delete("/api/forget-password-modal-settings/logo");
      toast.success("Logo removed successfully");
      await loadSetting();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Logo remove failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    const ok = window.confirm("Are you sure you want to reset all settings?");
    if (!ok) return;

    try {
      setLoading(true);
      await api.patch("/api/forget-password-modal-settings/reset");
      toast.success("Forget password modal setting reset successfully");
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
              Forget Password Modal{" "}
              <span className="bg-gradient-to-r from-[#3ea0ff] to-blue-100 bg-clip-text text-transparent">
                Setting
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Control forgot password modal logo, form colors, dropdown colors
              and buttons from admin panel.
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
          <Section title="Logo">
            <ImageInput
              label="Forget Password Logo"
              preview={logoPreview}
              onChange={setLogoFile}
            />

            {form.logo && (
              <button
                type="button"
                disabled={loading}
                onClick={removeLogo}
                className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-200 hover:bg-red-500/20 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Remove Logo
              </button>
            )}
          </Section>

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
                label="Overlay BG"
                value={form.overlayBg}
                onChange={(v) => setValue("overlayBg", v)}
              />
              <ColorInput
                label="Modal BG"
                value={form.modalBg}
                onChange={(v) => setValue("modalBg", v)}
              />
              <ColorInput
                label="Header BG"
                value={form.headerBg}
                onChange={(v) => setValue("headerBg", v)}
              />
              <ColorInput
                label="Header Text"
                value={form.headerText}
                onChange={(v) => setValue("headerText", v)}
              />
            </div>
          </Section>

          <Section title="Form Colors">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <ColorInput
                label="Label Text"
                value={form.labelText}
                onChange={(v) => setValue("labelText", v)}
              />
              <ColorInput
                label="Input BG"
                value={form.inputBg}
                onChange={(v) => setValue("inputBg", v)}
              />
              <ColorInput
                label="Input Text"
                value={form.inputText}
                onChange={(v) => setValue("inputText", v)}
              />
              <ColorInput
                label="Input Border"
                value={form.inputBorder}
                onChange={(v) => setValue("inputBorder", v)}
              />
              <ColorInput
                label="Placeholder Text"
                value={form.placeholderText}
                onChange={(v) => setValue("placeholderText", v)}
              />
              <ColorInput
                label="Eye Icon Text"
                value={form.iconText}
                onChange={(v) => setValue("iconText", v)}
              />
            </div>
          </Section>

          <Section title="Button & Link Colors">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <ColorInput
                label="Button BG"
                value={form.buttonBg}
                onChange={(v) => setValue("buttonBg", v)}
              />
              <ColorInput
                label="Button Text"
                value={form.buttonText}
                onChange={(v) => setValue("buttonText", v)}
              />
              <ColorInput
                label="Button Disabled BG"
                value={form.buttonDisabledBg}
                onChange={(v) => setValue("buttonDisabledBg", v)}
              />
              <ColorInput
                label="Secondary Button BG"
                value={form.secondaryButtonBg}
                onChange={(v) => setValue("secondaryButtonBg", v)}
              />
              <ColorInput
                label="Secondary Button Text"
                value={form.secondaryButtonText}
                onChange={(v) => setValue("secondaryButtonText", v)}
              />
              <ColorInput
                label="Secondary Button Border"
                value={form.secondaryButtonBorder}
                onChange={(v) => setValue("secondaryButtonBorder", v)}
              />
              <ColorInput
                label="Link Text"
                value={form.linkText}
                onChange={(v) => setValue("linkText", v)}
              />
              <ColorInput
                label="Footer Text"
                value={form.footerText}
                onChange={(v) => setValue("footerText", v)}
              />
            </div>
          </Section>

          <Section title="Country Dropdown Colors">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <ColorInput
                label="Dropdown BG"
                value={form.dropdownBg}
                onChange={(v) => setValue("dropdownBg", v)}
              />
              <ColorInput
                label="Dropdown Text"
                value={form.dropdownText}
                onChange={(v) => setValue("dropdownText", v)}
              />
              <ColorInput
                label="Dropdown Border"
                value={form.dropdownBorder}
                onChange={(v) => setValue("dropdownBorder", v)}
              />
              <ColorInput
                label="Dropdown Hover BG"
                value={form.dropdownHoverBg}
                onChange={(v) => setValue("dropdownHoverBg", v)}
              />
            </div>
          </Section>
        </div>

        <section className="sticky top-6 h-fit rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
          <div className="mb-5 flex items-center gap-3">
            <BadgeCheck className="h-5 w-5 text-[#3ea0ff]" />
            <h2 className="text-xl font-black">Live Preview</h2>
          </div>

          <Preview form={form} logoPreview={logoPreview} />

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
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-200 hover:bg-red-500/20 disabled:opacity-50"
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
            {loading ? "Saving..." : "Save Forget Password Setting"}
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
        placeholder="#000000 or rgba(...)"
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
          className="h-[70px] w-full rounded-xl object-contain"
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

const Preview = ({ form, logoPreview }) => (
  <div className="rounded-2xl p-4" style={{ background: form.overlayBg }}>
    <div
      className="mx-auto w-full max-w-[330px] overflow-hidden rounded-lg"
      style={{ backgroundColor: form.modalBg }}
    >
      <div
        className="relative flex h-[50px] items-center justify-center"
        style={{
          backgroundColor: form.headerBg,
          color: form.headerText,
        }}
      >
        <h2 className="text-[18px] font-semibold">Forgot Password</h2>
        <X className="absolute right-3" size={22} />
      </div>

      <div className="px-5 py-6">
        <div className="mb-8 flex justify-center">
          {logoPreview ? (
            <img
              src={logoPreview}
              alt="logo"
              className="h-[28px] object-contain"
            />
          ) : (
            <div className="h-[28px] w-[120px] rounded bg-gray-300" />
          )}
        </div>

        <div className="mb-7 flex items-center justify-center gap-2">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: form.buttonBg }}
          />
          <div
            className="h-[2px] w-16"
            style={{ backgroundColor: form.inputBorder }}
          />
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: form.inputBorder }}
          />
        </div>

        <label className="mb-2 block text-sm" style={{ color: form.labelText }}>
          Phone Number
        </label>

        <div
          className="flex h-[42px] items-center rounded border"
          style={{
            backgroundColor: form.inputBg,
            color: form.inputText,
            borderColor: form.inputBorder,
          }}
        >
          <button
            type="button"
            className="flex h-full items-center gap-2 px-3 text-sm"
          >
            <span>🇧🇩</span>
            <span>+880</span>
            <ChevronDown size={14} />
          </button>

          <div
            className="h-[22px] w-px"
            style={{ backgroundColor: form.inputBorder }}
          />

          <input
            disabled
            placeholder="Enter your phone number."
            className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
          />
        </div>

        <div
          className="mt-3 rounded border shadow-xl"
          style={{
            backgroundColor: form.dropdownBg,
            color: form.dropdownText,
            borderColor: form.dropdownBorder,
          }}
        >
          <div
            className="flex h-9 items-center gap-2 border-b px-2"
            style={{ borderColor: form.dropdownBorder }}
          >
            <Search size={15} />
            <span className="text-sm">Search country...</span>
          </div>

          <div
            className="flex items-center justify-between px-3 py-2 text-sm"
            style={{ backgroundColor: form.dropdownHoverBg }}
          >
            <span>🇧🇩 Bangladesh</span>
            <span>+880</span>
          </div>
        </div>

        <label
          className="mb-2 mt-4 block text-sm"
          style={{ color: form.labelText }}
        >
          OTP Code
        </label>

        <div className="flex gap-2">
          <input
            disabled
            placeholder="Enter OTP code"
            className="h-[42px] min-w-0 flex-1 rounded border px-3 text-sm outline-none"
            style={{
              backgroundColor: form.inputBg,
              color: form.inputText,
              borderColor: form.inputBorder,
            }}
          />

          <button
            type="button"
            className="rounded px-3 text-xs font-medium"
            style={{
              backgroundColor: form.buttonBg,
              color: form.buttonText,
            }}
          >
            Send OTP
          </button>
        </div>

        <button
          type="button"
          className="mt-5 h-[44px] w-full rounded-[3px] text-[14px] font-medium"
          style={{
            backgroundColor: form.buttonBg,
            color: form.buttonText,
          }}
        >
          Verify OTP
        </button>

        <div className="mt-5">
          <label
            className="mb-2 block text-sm"
            style={{ color: form.labelText }}
          >
            New Password
          </label>

          <div
            className="flex h-[42px] items-center rounded border px-3"
            style={{
              backgroundColor: form.inputBg,
              color: form.inputText,
              borderColor: form.inputBorder,
            }}
          >
            <input
              disabled
              placeholder="Enter new password"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            <Eye size={16} style={{ color: form.iconText }} />
            <EyeOff className="hidden" />
          </div>
        </div>

        <button
          type="button"
          className="mt-4 h-[42px] w-full rounded border text-sm font-medium"
          style={{
            backgroundColor: form.secondaryButtonBg,
            color: form.secondaryButtonText,
            borderColor: form.secondaryButtonBorder,
          }}
        >
          Back
        </button>

        <div
          className="mt-5 text-center text-sm"
          style={{ color: form.footerText }}
        >
          <span style={{ color: form.linkText }}>Back to Login</span>
        </div>
      </div>
    </div>
  </div>
);

export default ForgetPasswordModalSetting;
