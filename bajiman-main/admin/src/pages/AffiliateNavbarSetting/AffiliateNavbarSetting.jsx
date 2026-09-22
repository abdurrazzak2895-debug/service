import React, { useEffect, useState } from "react";
import {
  BadgeCheck,
  Check,
  ChevronDown,
  Eye,
  ImagePlus,
  Loader2,
  Menu,
  RotateCcw,
  Save,
  Settings,
  X,
} from "lucide-react";
import { Link } from "react-router";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "../../api/axios";

const API_URL = import.meta.env.VITE_API_URL;

const localizedEmpty = { bn: "", en: "" };

const emptySetting = {
  status: "active",
  logo: "",

  loginText: { bn: "প্রবেশ করুন", en: "Login" },
  registerText: { bn: "নিবন্ধন করুন", en: "Register" },
  selectLanguageText: { bn: "ভাষা নির্বাচন করুন", en: "Select Language" },

  loginPath: "/login",
  registerPath: "/register",

  navbarBg: "#dff8ff",
  navbarBorderColor: "#0b1f33",
  textColor: "#18344d",

  loginButtonBg: "#2069b7",
  loginButtonHoverBg: "#175ba3",
  loginButtonBorderColor: "#0e62b8",

  registerButtonBg: "#48b948",
  registerButtonHoverBg: "#37a937",

  buttonTextColor: "#ffffff",

  contentMaxWidth: "1500px",
  navbarHeight: "95px",
  logoHeight: "44px",
};

const flagUrl = {
  Bangla: "https://flagcdn.com/w40/bd.png",
  English: "https://flagcdn.com/w40/us.png",
};

const colorFields = [
  ["navbarBg", "Navbar BG"],
  ["navbarBorderColor", "Navbar Border Color"],
  ["textColor", "Text Color"],
  ["loginButtonBg", "Login Button BG"],
  ["loginButtonHoverBg", "Login Button Hover BG"],
  ["loginButtonBorderColor", "Login Border Color"],
  ["registerButtonBg", "Register Button BG"],
  ["registerButtonHoverBg", "Register Button Hover BG"],
  ["buttonTextColor", "Button Text Color"],
];

const localizedFields = [
  ["loginText", "Login Text"],
  ["registerText", "Register Text"],
  ["selectLanguageText", "Select Language Text"],
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

const AffiliateNavbarSetting = () => {
  const [form, setForm] = useState(emptySetting);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  const loadSetting = async () => {
    try {
      setPageLoading(true);
      const res = await api.get("/api/affiliate-navbar-settings");
      setForm({ ...emptySetting, ...(res.data?.data || {}) });
      setLogoFile(null);
      setLogoPreview("");
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

      const fd = new FormData();

      fd.append("status", form.status);
      fd.append("logo", form.logo || "");

      if (logoFile instanceof File) {
        fd.append("logo", logoFile);
      }

      localizedFields.forEach(([key]) => {
        fd.append(key, JSON.stringify(form[key] || localizedEmpty));
      });

      [
        "loginPath",
        "registerPath",
        "navbarBg",
        "navbarBorderColor",
        "textColor",
        "loginButtonBg",
        "loginButtonHoverBg",
        "loginButtonBorderColor",
        "registerButtonBg",
        "registerButtonHoverBg",
        "buttonTextColor",
        "contentMaxWidth",
        "navbarHeight",
        "logoHeight",
      ].forEach((field) => {
        fd.append(field, form[field] || "");
      });

      await api.put("/api/affiliate-navbar-settings", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Affiliate navbar setting saved successfully");
      await loadSetting();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!window.confirm("Are you sure you want to remove logo?")) return;

    try {
      setLoading(true);
      await api.patch("/api/affiliate-navbar-settings/remove-logo");
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
      await api.patch("/api/affiliate-navbar-settings/reset-colors");
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
              Affiliate Navbar{" "}
              <span className="bg-gradient-to-r from-[#3ea0ff] to-blue-100 bg-clip-text text-transparent">
                Setting
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Control navbar logo, login/register buttons, language text, colors
              and layout.
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
            <NavbarPreview form={form} logoPreview={logoPreview} />
          </Section>

          <Section title="Logo & Layout">
            <div className="grid gap-5 md:grid-cols-2">
              <ImageInput
                label="Navbar Logo"
                preview={logoPreview || form.logoUrl || fileUrl(form.logo)}
                onChange={(file) => {
                  setLogoFile(file);
                  setLogoPreview(file ? URL.createObjectURL(file) : "");
                }}
              />

              <div className="space-y-4">
                <SmallInput
                  label="Content Max Width"
                  value={form.contentMaxWidth}
                  onChange={(v) => setForm({ ...form, contentMaxWidth: v })}
                />

                <SmallInput
                  label="Navbar Height"
                  value={form.navbarHeight}
                  onChange={(v) => setForm({ ...form, navbarHeight: v })}
                />

                <SmallInput
                  label="Logo Height"
                  value={form.logoHeight}
                  onChange={(v) => setForm({ ...form, logoHeight: v })}
                />

                {form.logo && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-black text-red-200 hover:bg-red-500/20"
                  >
                    <X className="h-4 w-4" />
                    Remove Logo
                  </button>
                )}
              </div>
            </div>
          </Section>

          <Section title="Texts, Paths & Status">
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
                label="Login Path"
                value={form.loginPath}
                onChange={(v) => setForm({ ...form, loginPath: v })}
              />

              <SmallInput
                label="Register Path"
                value={form.registerPath}
                onChange={(v) => setForm({ ...form, registerPath: v })}
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
            <NavbarPreview form={form} logoPreview={logoPreview} small />
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
              {loading ? "Saving..." : "Save Navbar"}
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

const NavbarPreview = ({ form, logoPreview = "", small = false }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const logo = logoPreview || form.logoUrl || fileUrl(form.logo);

  return (
    <div className="rounded-2xl bg-black/20 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
        <Eye className="h-4 w-4" />
        Navbar Preview
      </div>

      <header
        className="sticky top-0 z-10 w-full border-t shadow-sm"
        style={{
          backgroundColor: form.navbarBg || "#dff8ff",
          borderColor: form.navbarBorderColor || "#0b1f33",
        }}
      >
        <nav
          className="mx-auto flex w-full items-center justify-between px-4 sm:px-8 lg:px-12"
          style={{
            maxWidth: form.contentMaxWidth || "1500px",
            height: form.navbarHeight || "95px",
          }}
        >
          <Link to="/" className="flex cursor-pointer items-center">
            {logo && (
              <img
                src={logo}
                alt="Crickex Partner"
                className="w-auto cursor-pointer object-contain"
                style={{ height: form.logoHeight || "44px" }}
                draggable={false}
              />
            )}
          </Link>

          <div
            className={`${small ? "hidden" : "hidden lg:flex"} items-center gap-9`}
          >
            <div
              className="relative cursor-pointer"
              onMouseEnter={() => setLangOpen(true)}
              onMouseLeave={() => setLangOpen(false)}
            >
              <button
                type="button"
                className="flex cursor-pointer items-center gap-4 px-2 py-4 text-[17px] font-medium"
                style={{ color: form.textColor || "#18344d" }}
              >
                <img
                  src={flagUrl.English}
                  alt="English"
                  className="h-8 w-8 rounded-full object-cover"
                />

                <span>English</span>

                <ChevronDown
                  size={18}
                  className={`transition ${langOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.16 }}
                    className="absolute left-1/2 top-full z-50 w-[190px] -translate-x-1/2 overflow-hidden rounded-xl border border-[#b5dbff] bg-white shadow-xl"
                  >
                    {[
                      { key: "Bangla", label: "বাংলা", flag: flagUrl.Bangla },
                      {
                        key: "English",
                        label: "English",
                        flag: flagUrl.English,
                      },
                    ].map((item) => {
                      const active = item.key === "English";

                      return (
                        <button
                          key={item.key}
                          type="button"
                          className={`flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left text-[15px] font-medium transition ${
                            active
                              ? "bg-[#e8f6ff] text-[#145ca8]"
                              : "text-[#23384d] hover:bg-[#f2fbff]"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <img
                              src={item.flag}
                              alt={item.label}
                              className="h-6 w-6 rounded-full object-cover"
                            />
                            {item.label}
                          </span>

                          {active && <Check size={18} />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <span
              className="cursor-pointer rounded-[7px] border px-5 py-[8px] text-[16px] font-semibold shadow-[inset_0_0_0_1px_rgba(255,255,255,0.45)] transition"
              style={{
                backgroundColor: form.loginButtonBg || "#2069b7",
                borderColor: form.loginButtonBorderColor || "#0e62b8",
                color: form.buttonTextColor || "#ffffff",
              }}
            >
              {getText(form.loginText, "Login")}
            </span>

            <span
              className="cursor-pointer rounded-[7px] px-5 py-[9px] text-[16px] font-semibold shadow-sm transition"
              style={{
                backgroundColor: form.registerButtonBg || "#48b948",
                color: form.buttonTextColor || "#ffffff",
              }}
            >
              {getText(form.registerText, "Register")}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className={`${small ? "flex" : "flex lg:hidden"} h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-[#2b77c8] bg-white text-[#1d5f9e]`}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden border-t border-[#bfe8f5] lg:hidden"
              style={{ backgroundColor: form.navbarBg || "#dff8ff" }}
            >
              <div className="mx-auto flex w-full max-w-[480px] flex-col gap-3 px-4 py-5">
                <div className="rounded-xl border border-[#b5dbff] bg-white p-2">
                  <p className="mb-2 px-2 text-sm font-semibold text-[#18344d]">
                    {getText(form.selectLanguageText, "Select Language")}
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#e1eef8] bg-white px-3 py-3 text-sm font-semibold text-[#23384d]"
                    >
                      <img
                        src={flagUrl.Bangla}
                        alt="Bangla"
                        className="h-6 w-6 rounded-full object-cover"
                      />
                      বাংলা
                    </button>

                    <button
                      type="button"
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#2b77c8] bg-[#e8f6ff] px-3 py-3 text-sm font-semibold text-[#145ca8]"
                    >
                      <img
                        src={flagUrl.English}
                        alt="English"
                        className="h-6 w-6 rounded-full object-cover"
                      />
                      English
                      <Check size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <span
                    className="cursor-pointer rounded-lg border px-4 py-3 text-center text-[15px] font-semibold"
                    style={{
                      backgroundColor: form.loginButtonBg || "#2069b7",
                      borderColor: form.loginButtonBorderColor || "#0e62b8",
                      color: form.buttonTextColor || "#ffffff",
                    }}
                  >
                    {getText(form.loginText, "Login")}
                  </span>

                  <span
                    className="cursor-pointer rounded-lg px-4 py-3 text-center text-[15px] font-semibold"
                    style={{
                      backgroundColor: form.registerButtonBg || "#48b948",
                      color: form.buttonTextColor || "#ffffff",
                    }}
                  >
                    {getText(form.registerText, "Register")}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </div>
  );
};

export default AffiliateNavbarSetting;
