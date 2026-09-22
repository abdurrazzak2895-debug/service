import React, { useEffect, useState } from "react";
import {
  BadgeCheck,
  Loader2,
  Palette,
  RefreshCw,
  RotateCcw,
  Save,
  UserCircle,
  WalletCards,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const defaultForm = {
  status: "active",
  headerBg: "#0b66a8",
  signupBg: "#5ed51d",
  signupText: "#ffffff",
  signupHoverBg: "#52c719",
  loginBg: "#247ccf",
  loginText: "#ffffff",
  loginHoverBg: "#1f72c0",
  depositBg: "#247ccf",
  depositText: "#ffffff",
  depositHoverBg: "#1f72c0",
  walletBg: "#5ed51d",
  walletText: "#ffffff",
  walletHoverBg: "#52c719",
  profileIconBg: "#ffffff",
  profileIconColor: "#0b66a8",
  dropdownBg: "#ffffff",
  dropdownText: "#333333",
  dropdownHoverBg: "#f7f7f7",
  dropdownIconBg: "#ec4899",
  dropdownIconText: "#ffffff",
  logoutText: "#d93636",
  logoutIconBg: "#d93636",
  logoutHoverBg: "#fff3f3",
  languageModalHeaderBg: "#0b66a8",
  languageModalHeaderText: "#ffffff",
  languageActiveBg: "#0b66a8",
  languageActiveText: "#ffffff",
  languageInactiveBg: "#ffffff",
  languageInactiveText: "#111111",
  mobileMenuIconColor: "#ffffff",
};

const inputClass =
  "w-full rounded-xl border border-[#1A79D3]/25 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#3ea0ff] focus:ring-2 focus:ring-[#1A79D3]/20";

const labelClass = "mb-2 block text-sm font-bold text-blue-100";

const NavbarColorSetting = () => {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const loadSetting = async () => {
    try {
      setPageLoading(true);
      const res = await api.get("/api/navbar-color-settings");
      setForm({ ...defaultForm, ...(res.data?.data || {}) });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load setting");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadSetting();
  }, []);

  const setColor = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await api.put("/api/navbar-color-settings", form);
      toast.success("Navbar color setting saved successfully");
      await loadSetting();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    const ok = window.confirm("Are you sure you want to reset all colors?");
    if (!ok) return;

    try {
      setLoading(true);
      const res = await api.patch("/api/navbar-color-settings/reset");
      setForm({ ...defaultForm, ...(res.data?.data || {}) });
      toast.success("Navbar color reset successfully");
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
              <Palette className="h-9 w-9" />
            </div>

            <h1 className="text-3xl font-black md:text-4xl">
              Navbar{" "}
              <span className="bg-gradient-to-r from-[#3ea0ff] to-blue-100 bg-clip-text text-transparent">
                Color Setting
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Control navbar header, login, signup, wallet, dropdown and
              language colors.
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
          <Section title="Main Navbar">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <ColorInput
                label="Header Background"
                value={form.headerBg}
                onChange={(v) => setColor("headerBg", v)}
              />
              <ColorInput
                label="Mobile Menu Icon"
                value={form.mobileMenuIconColor}
                onChange={(v) => setColor("mobileMenuIconColor", v)}
              />

              <div>
                <label className={labelClass}>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setColor("status", e.target.value)}
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

          <Section title="Before Login Buttons">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <ColorInput
                label="Signup Background"
                value={form.signupBg}
                onChange={(v) => setColor("signupBg", v)}
              />
              <ColorInput
                label="Signup Text"
                value={form.signupText}
                onChange={(v) => setColor("signupText", v)}
              />
              <ColorInput
                label="Signup Hover"
                value={form.signupHoverBg}
                onChange={(v) => setColor("signupHoverBg", v)}
              />

              <ColorInput
                label="Login Background"
                value={form.loginBg}
                onChange={(v) => setColor("loginBg", v)}
              />
              <ColorInput
                label="Login Text"
                value={form.loginText}
                onChange={(v) => setColor("loginText", v)}
              />
              <ColorInput
                label="Login Hover"
                value={form.loginHoverBg}
                onChange={(v) => setColor("loginHoverBg", v)}
              />
            </div>
          </Section>

          <Section title="After Login Buttons">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <ColorInput
                label="Deposit Background"
                value={form.depositBg}
                onChange={(v) => setColor("depositBg", v)}
              />
              <ColorInput
                label="Deposit Text"
                value={form.depositText}
                onChange={(v) => setColor("depositText", v)}
              />
              <ColorInput
                label="Deposit Hover"
                value={form.depositHoverBg}
                onChange={(v) => setColor("depositHoverBg", v)}
              />

              <ColorInput
                label="Wallet Background"
                value={form.walletBg}
                onChange={(v) => setColor("walletBg", v)}
              />
              <ColorInput
                label="Wallet Text"
                value={form.walletText}
                onChange={(v) => setColor("walletText", v)}
              />
              <ColorInput
                label="Wallet Hover"
                value={form.walletHoverBg}
                onChange={(v) => setColor("walletHoverBg", v)}
              />

              <ColorInput
                label="Profile Icon BG"
                value={form.profileIconBg}
                onChange={(v) => setColor("profileIconBg", v)}
              />
              <ColorInput
                label="Profile Icon Color"
                value={form.profileIconColor}
                onChange={(v) => setColor("profileIconColor", v)}
              />
            </div>
          </Section>

          <Section title="Dropdown Menu">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <ColorInput
                label="Dropdown Background"
                value={form.dropdownBg}
                onChange={(v) => setColor("dropdownBg", v)}
              />
              <ColorInput
                label="Dropdown Text"
                value={form.dropdownText}
                onChange={(v) => setColor("dropdownText", v)}
              />
              <ColorInput
                label="Dropdown Hover"
                value={form.dropdownHoverBg}
                onChange={(v) => setColor("dropdownHoverBg", v)}
              />

              <ColorInput
                label="Dropdown Icon BG"
                value={form.dropdownIconBg}
                onChange={(v) => setColor("dropdownIconBg", v)}
              />
              <ColorInput
                label="Dropdown Icon Text"
                value={form.dropdownIconText}
                onChange={(v) => setColor("dropdownIconText", v)}
              />

              <ColorInput
                label="Logout Text"
                value={form.logoutText}
                onChange={(v) => setColor("logoutText", v)}
              />
              <ColorInput
                label="Logout Icon BG"
                value={form.logoutIconBg}
                onChange={(v) => setColor("logoutIconBg", v)}
              />
              <ColorInput
                label="Logout Hover"
                value={form.logoutHoverBg}
                onChange={(v) => setColor("logoutHoverBg", v)}
              />
            </div>
          </Section>

          <Section title="Language Modal">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <ColorInput
                label="Modal Header BG"
                value={form.languageModalHeaderBg}
                onChange={(v) => setColor("languageModalHeaderBg", v)}
              />
              <ColorInput
                label="Modal Header Text"
                value={form.languageModalHeaderText}
                onChange={(v) => setColor("languageModalHeaderText", v)}
              />

              <ColorInput
                label="Active Language BG"
                value={form.languageActiveBg}
                onChange={(v) => setColor("languageActiveBg", v)}
              />
              <ColorInput
                label="Active Language Text"
                value={form.languageActiveText}
                onChange={(v) => setColor("languageActiveText", v)}
              />

              <ColorInput
                label="Inactive Language BG"
                value={form.languageInactiveBg}
                onChange={(v) => setColor("languageInactiveBg", v)}
              />
              <ColorInput
                label="Inactive Language Text"
                value={form.languageInactiveText}
                onChange={(v) => setColor("languageInactiveText", v)}
              />
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <section className="sticky top-6 rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <BadgeCheck className="h-5 w-5 text-[#3ea0ff]" />
              <h2 className="text-xl font-black">Live Preview</h2>
            </div>

            <div
              className="rounded-2xl p-4 shadow-lg"
              style={{ backgroundColor: form.headerBg }}
            >
              <div className="mb-4 flex items-center justify-between">
                <span
                  style={{ color: form.mobileMenuIconColor }}
                  className="text-2xl font-black"
                >
                  ☰
                </span>

                <div className="h-[24px] w-[110px] rounded bg-white/30" />

                <div className="h-[26px] w-[26px] rounded-full bg-white/80" />
              </div>

              <div className="mb-4 flex gap-3">
                <button
                  type="button"
                  className="rounded-[5px] px-5 py-2 text-sm font-bold"
                  style={{
                    backgroundColor: form.signupBg,
                    color: form.signupText,
                  }}
                >
                  Sign Up
                </button>

                <button
                  type="button"
                  className="rounded-[5px] px-5 py-2 text-sm font-bold"
                  style={{
                    backgroundColor: form.loginBg,
                    color: form.loginText,
                  }}
                >
                  Login
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-[4px] px-3 py-2 text-sm font-bold"
                  style={{
                    backgroundColor: form.depositBg,
                    color: form.depositText,
                  }}
                >
                  <WalletCards size={17} />
                  Deposit
                </button>

                <button
                  type="button"
                  className="rounded-[5px] px-3 py-2 text-sm font-bold"
                  style={{
                    backgroundColor: form.walletBg,
                    color: form.walletText,
                  }}
                >
                  Main Wallet ৳100.00
                </button>

                <button
                  type="button"
                  className="flex h-[32px] w-[32px] items-center justify-center rounded-full"
                  style={{
                    backgroundColor: form.profileIconBg,
                    color: form.profileIconColor,
                  }}
                >
                  <UserCircle size={24} />
                </button>
              </div>
            </div>

            <div
              className="mt-5 overflow-hidden rounded-xl shadow-xl"
              style={{
                backgroundColor: form.dropdownBg,
                color: form.dropdownText,
              }}
            >
              {["Deposit", "Withdrawal", "Transaction Records"].map(
                (item, i) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold"
                  >
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-xs"
                      style={{
                        backgroundColor: form.dropdownIconBg,
                        color: form.dropdownIconText,
                      }}
                    >
                      {i + 1}
                    </span>
                    {item}
                  </div>
                ),
              )}

              <div
                className="flex items-center gap-3 px-4 py-3 text-sm font-bold"
                style={{ color: form.logoutText }}
              >
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full text-xs text-white"
                  style={{ backgroundColor: form.logoutIconBg }}
                >
                  ×
                </span>
                Logout
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-white shadow-xl">
              <div
                className="rounded-t-2xl px-5 py-4"
                style={{
                  backgroundColor: form.languageModalHeaderBg,
                  color: form.languageModalHeaderText,
                }}
              >
                <h3 className="font-bold">Choose Language</h3>
                <p className="text-xs opacity-80">
                  Select your preferred language
                </p>
              </div>

              <div className="space-y-2 p-4">
                <div
                  className="rounded-lg px-4 py-3 text-sm font-bold"
                  style={{
                    backgroundColor: form.languageActiveBg,
                    color: form.languageActiveText,
                  }}
                >
                  বাংলা
                </div>

                <div
                  className="rounded-lg px-4 py-3 text-sm font-bold"
                  style={{
                    backgroundColor: form.languageInactiveBg,
                    color: form.languageInactiveText,
                  }}
                >
                  English
                </div>
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
                onClick={handleReset}
                disabled={loading}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-200 hover:bg-red-500/20 disabled:opacity-60"
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
              {loading ? "Saving..." : "Save Navbar Colors"}
            </button>
          </section>
        </div>
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
        value={value || "#000000"}
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

export default NavbarColorSetting;
