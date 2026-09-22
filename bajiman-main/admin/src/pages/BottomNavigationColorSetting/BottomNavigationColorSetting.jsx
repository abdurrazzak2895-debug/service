import React, { useEffect, useState } from "react";
import {
  BadgeCheck,
  Check,
  Gift,
  Home,
  Landmark,
  Loader2,
  Palette,
  RefreshCw,
  RotateCcw,
  Save,
  Sparkles,
  UserCircle,
  WalletCards,
  CreditCard,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const defaultForm = {
  status: "active",

  beforeLoginBg: "#ffffff",
  beforeLoginBorder: "#c9c9c9",

  languageBoxBg: "#dce8f2",
  languageTitleText: "#0b3554",
  languageSubtitleText: "#111111",

  signupBg: "#ffffff",
  signupText: "#111111",

  loginBg: "#0b66a8",
  loginText: "#ffffff",

  afterLoginBgFrom: "#051b2e",
  afterLoginBgVia: "#082f50",
  afterLoginBgTo: "#051b2e",
  afterLoginBorder: "rgba(255,255,255,0.10)",

  itemIconBg: "rgba(255,255,255,0.10)",
  itemIconText: "rgba(255,255,255,0.85)",
  itemText: "rgba(255,255,255,0.75)",

  activeIconBg: "#2e9bf3",
  activeIconText: "#ffffff",
  activeText: "#ffffff",

  depositIconBgFrom: "#2e9bf3",
  depositIconBgTo: "#0865a9",
  depositIconText: "#ffffff",
  depositBadgeBg: "#5ed51d",
  depositBadgeText: "#ffffff",

  balanceBgFrom: "#064b83",
  balanceBgVia: "#0b66a8",
  balanceBgTo: "#063f70",
  balanceText: "#ffffff",
  balanceMutedText: "rgba(255,255,255,0.70)",
  balanceIconBg: "rgba(255,255,255,0.15)",
  balanceActionBg: "rgba(255,255,255,0.10)",
  balanceActionText: "#ffffff",
  balanceAccentIcon: "#ff4960",
  balanceDivider: "rgba(255,255,255,0.15)",

  langModalOverlayBg: "rgba(0,0,0,0.50)",
  langModalBg: "#ffffff",
  langModalHeaderBg: "#0b66a8",
  langModalHeaderText: "#ffffff",
  langModalMutedText: "rgba(255,255,255,0.80)",

  langOptionWrapperBg: "#eef7ff",
  langOptionBg: "#ffffff",
  langOptionText: "#111111",
  langOptionActiveBg: "#0b66a8",
  langOptionActiveText: "#ffffff",
  langOptionCheckBg: "#ffffff",
  langOptionCheckText: "#0b66a8",
  langOptionCheckBorder: "#c9dff2",
};

const inputClass =
  "w-full rounded-xl border border-[#1A79D3]/25 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#3ea0ff] focus:ring-2 focus:ring-[#1A79D3]/20";

const labelClass = "mb-2 block text-sm font-bold text-blue-100";

const BottomNavigationColorSetting = () => {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const loadSetting = async () => {
    try {
      setPageLoading(true);
      const res = await api.get("/api/bottom-navigation-color-settings");
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
      await api.put("/api/bottom-navigation-color-settings", form);
      toast.success("Bottom navigation color setting saved successfully");
      await loadSetting();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    const ok = window.confirm(
      "Are you sure you want to reset bottom navigation colors?",
    );
    if (!ok) return;

    try {
      setLoading(true);
      const res = await api.patch(
        "/api/bottom-navigation-color-settings/reset",
      );
      setForm({ ...defaultForm, ...(res.data?.data || {}) });
      toast.success("Bottom navigation color reset successfully");
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
              Bottom Navigation{" "}
              <span className="bg-gradient-to-r from-[#3ea0ff] to-blue-100 bg-clip-text text-transparent">
                Color Setting
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Control BottomNavbar before/after login, language modal and
              BalanceSection colors.
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
        className="grid gap-6 xl:grid-cols-[1fr_480px]"
      >
        <div className="space-y-6">
          <Section title="Before Login Bottom Navbar">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <ColorInput
                label="Before Login BG"
                value={form.beforeLoginBg}
                onChange={(v) => setColor("beforeLoginBg", v)}
              />
              <ColorInput
                label="Before Login Border"
                value={form.beforeLoginBorder}
                onChange={(v) => setColor("beforeLoginBorder", v)}
              />
              <ColorInput
                label="Language Box BG"
                value={form.languageBoxBg}
                onChange={(v) => setColor("languageBoxBg", v)}
              />
              <ColorInput
                label="Language Title Text"
                value={form.languageTitleText}
                onChange={(v) => setColor("languageTitleText", v)}
              />
              <ColorInput
                label="Language Subtitle Text"
                value={form.languageSubtitleText}
                onChange={(v) => setColor("languageSubtitleText", v)}
              />
              <ColorInput
                label="Signup BG"
                value={form.signupBg}
                onChange={(v) => setColor("signupBg", v)}
              />
              <ColorInput
                label="Signup Text"
                value={form.signupText}
                onChange={(v) => setColor("signupText", v)}
              />
              <ColorInput
                label="Login BG"
                value={form.loginBg}
                onChange={(v) => setColor("loginBg", v)}
              />
              <ColorInput
                label="Login Text"
                value={form.loginText}
                onChange={(v) => setColor("loginText", v)}
              />
            </div>
          </Section>

          <Section title="After Login Bottom Navbar">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <ColorInput
                label="After BG From"
                value={form.afterLoginBgFrom}
                onChange={(v) => setColor("afterLoginBgFrom", v)}
              />
              <ColorInput
                label="After BG Via"
                value={form.afterLoginBgVia}
                onChange={(v) => setColor("afterLoginBgVia", v)}
              />
              <ColorInput
                label="After BG To"
                value={form.afterLoginBgTo}
                onChange={(v) => setColor("afterLoginBgTo", v)}
              />
              <ColorInput
                label="After Border"
                value={form.afterLoginBorder}
                onChange={(v) => setColor("afterLoginBorder", v)}
              />

              <ColorInput
                label="Item Icon BG"
                value={form.itemIconBg}
                onChange={(v) => setColor("itemIconBg", v)}
              />
              <ColorInput
                label="Item Icon Text"
                value={form.itemIconText}
                onChange={(v) => setColor("itemIconText", v)}
              />
              <ColorInput
                label="Item Text"
                value={form.itemText}
                onChange={(v) => setColor("itemText", v)}
              />

              <ColorInput
                label="Active Icon BG"
                value={form.activeIconBg}
                onChange={(v) => setColor("activeIconBg", v)}
              />
              <ColorInput
                label="Active Icon Text"
                value={form.activeIconText}
                onChange={(v) => setColor("activeIconText", v)}
              />
              <ColorInput
                label="Active Text"
                value={form.activeText}
                onChange={(v) => setColor("activeText", v)}
              />

              <ColorInput
                label="Deposit Icon From"
                value={form.depositIconBgFrom}
                onChange={(v) => setColor("depositIconBgFrom", v)}
              />
              <ColorInput
                label="Deposit Icon To"
                value={form.depositIconBgTo}
                onChange={(v) => setColor("depositIconBgTo", v)}
              />
              <ColorInput
                label="Deposit Icon Text"
                value={form.depositIconText}
                onChange={(v) => setColor("depositIconText", v)}
              />
              <ColorInput
                label="Deposit Badge BG"
                value={form.depositBadgeBg}
                onChange={(v) => setColor("depositBadgeBg", v)}
              />
              <ColorInput
                label="Deposit Badge Text"
                value={form.depositBadgeText}
                onChange={(v) => setColor("depositBadgeText", v)}
              />
            </div>
          </Section>

          <Section title="Balance Section">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <ColorInput
                label="Balance BG From"
                value={form.balanceBgFrom}
                onChange={(v) => setColor("balanceBgFrom", v)}
              />
              <ColorInput
                label="Balance BG Via"
                value={form.balanceBgVia}
                onChange={(v) => setColor("balanceBgVia", v)}
              />
              <ColorInput
                label="Balance BG To"
                value={form.balanceBgTo}
                onChange={(v) => setColor("balanceBgTo", v)}
              />
              <ColorInput
                label="Balance Text"
                value={form.balanceText}
                onChange={(v) => setColor("balanceText", v)}
              />
              <ColorInput
                label="Balance Muted Text"
                value={form.balanceMutedText}
                onChange={(v) => setColor("balanceMutedText", v)}
              />
              <ColorInput
                label="Balance Icon BG"
                value={form.balanceIconBg}
                onChange={(v) => setColor("balanceIconBg", v)}
              />
              <ColorInput
                label="Balance Action BG"
                value={form.balanceActionBg}
                onChange={(v) => setColor("balanceActionBg", v)}
              />
              <ColorInput
                label="Balance Action Text"
                value={form.balanceActionText}
                onChange={(v) => setColor("balanceActionText", v)}
              />
              <ColorInput
                label="Balance Accent Icon"
                value={form.balanceAccentIcon}
                onChange={(v) => setColor("balanceAccentIcon", v)}
              />
              <ColorInput
                label="Balance Divider"
                value={form.balanceDivider}
                onChange={(v) => setColor("balanceDivider", v)}
              />
            </div>
          </Section>

          <Section title="Language Modal">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <ColorInput
                label="Overlay BG"
                value={form.langModalOverlayBg}
                onChange={(v) => setColor("langModalOverlayBg", v)}
              />
              <ColorInput
                label="Modal BG"
                value={form.langModalBg}
                onChange={(v) => setColor("langModalBg", v)}
              />
              <ColorInput
                label="Header BG"
                value={form.langModalHeaderBg}
                onChange={(v) => setColor("langModalHeaderBg", v)}
              />
              <ColorInput
                label="Header Text"
                value={form.langModalHeaderText}
                onChange={(v) => setColor("langModalHeaderText", v)}
              />
              <ColorInput
                label="Muted Text"
                value={form.langModalMutedText}
                onChange={(v) => setColor("langModalMutedText", v)}
              />

              <ColorInput
                label="Option Wrapper BG"
                value={form.langOptionWrapperBg}
                onChange={(v) => setColor("langOptionWrapperBg", v)}
              />
              <ColorInput
                label="Option BG"
                value={form.langOptionBg}
                onChange={(v) => setColor("langOptionBg", v)}
              />
              <ColorInput
                label="Option Text"
                value={form.langOptionText}
                onChange={(v) => setColor("langOptionText", v)}
              />
              <ColorInput
                label="Option Active BG"
                value={form.langOptionActiveBg}
                onChange={(v) => setColor("langOptionActiveBg", v)}
              />
              <ColorInput
                label="Option Active Text"
                value={form.langOptionActiveText}
                onChange={(v) => setColor("langOptionActiveText", v)}
              />
              <ColorInput
                label="Check BG"
                value={form.langOptionCheckBg}
                onChange={(v) => setColor("langOptionCheckBg", v)}
              />
              <ColorInput
                label="Check Text"
                value={form.langOptionCheckText}
                onChange={(v) => setColor("langOptionCheckText", v)}
              />
              <ColorInput
                label="Check Border"
                value={form.langOptionCheckBorder}
                onChange={(v) => setColor("langOptionCheckBorder", v)}
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
        </div>

        <section className="sticky top-6 h-fit rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
          <div className="mb-5 flex items-center gap-3">
            <BadgeCheck className="h-5 w-5 text-[#3ea0ff]" />
            <h2 className="text-xl font-black">Live Preview</h2>
          </div>

          <div className="space-y-5">
            <PreviewBalance colors={form} />
            <PreviewBeforeLogin colors={form} />
            <PreviewAfterLogin colors={form} />
            <PreviewLanguageModal colors={form} />
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
            {loading ? "Saving..." : "Save Bottom Navigation Colors"}
          </button>
        </section>
      </form>
    </div>
  );
};

const PreviewBalance = ({ colors }) => (
  <PreviewBlock title="BalanceSection Preview">
    <div
      className="relative overflow-hidden rounded-xl px-2 py-3 shadow-lg"
      style={{
        background: `linear-gradient(to right, ${colors.balanceBgFrom}, ${colors.balanceBgVia}, ${colors.balanceBgTo})`,
        color: colors.balanceText,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.balanceIconBg }}
          >
            <WalletCards size={20} />
          </div>

          <div className="min-w-0">
            <p
              className="text-[11px] font-semibold"
              style={{ color: colors.balanceMutedText }}
            >
              Balance
            </p>
            <p className="truncate text-[18px] font-black leading-tight">
              ৳ 3,007.40
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full"
            style={{
              backgroundColor: colors.balanceActionBg,
              color: colors.balanceActionText,
            }}
          >
            <RefreshCw size={17} />
          </button>

          <div
            className="h-[30px] w-px"
            style={{ backgroundColor: colors.balanceDivider }}
          />

          <SmallAction
            colors={colors}
            icon={<Gift size={15} />}
            label="Promo"
          />
          <SmallAction
            colors={colors}
            icon={<CreditCard size={15} />}
            label="Deposit"
          />
        </div>
      </div>
    </div>
  </PreviewBlock>
);

const SmallAction = ({ colors, icon, label }) => (
  <button
    type="button"
    className="flex min-w-[50px] cursor-pointer flex-col items-center justify-center gap-[3px]"
    style={{ color: colors.balanceActionText }}
  >
    <span
      className="flex h-[26px] w-[26px] items-center justify-center rounded-full"
      style={{
        backgroundColor: colors.balanceActionBg,
        color: colors.balanceAccentIcon,
      }}
    >
      {icon}
    </span>
    <span className="text-[10px] font-semibold leading-none">{label}</span>
  </button>
);

const PreviewBeforeLogin = ({ colors }) => (
  <PreviewBlock title="BottomNavbar Before Login Preview">
    <div
      className="flex h-[50px] overflow-hidden rounded-xl border shadow"
      style={{
        backgroundColor: colors.beforeLoginBg,
        borderColor: colors.beforeLoginBorder,
      }}
    >
      <div
        className="flex w-[100px] items-center justify-center gap-2"
        style={{ backgroundColor: colors.languageBoxBg }}
      >
        <img
          src="https://flagcdn.com/w40/bd.png"
          alt="BD"
          className="h-[25px] w-[25px] rounded-full object-cover"
        />
        <div className="text-left leading-[15px]">
          <p
            className="text-[13px] font-bold"
            style={{ color: colors.languageTitleText }}
          >
            BDT
          </p>
          <p
            className="text-[12px] font-semibold"
            style={{ color: colors.languageSubtitleText }}
          >
            বাংলা
          </p>
        </div>
      </div>

      <div
        className="flex flex-1 items-center justify-center text-[15px] font-bold"
        style={{
          backgroundColor: colors.signupBg,
          color: colors.signupText,
        }}
      >
        Sign Up
      </div>

      <div
        className="flex flex-1 items-center justify-center text-[15px] font-bold"
        style={{
          backgroundColor: colors.loginBg,
          color: colors.loginText,
        }}
      >
        Login
      </div>
    </div>
  </PreviewBlock>
);

const PreviewAfterLogin = ({ colors }) => {
  const items = [
    { label: "Home", icon: Home, active: true },
    { label: "Promo", icon: Gift },
    { label: "Deposit", icon: Landmark, deposit: true },
    { label: "Account", icon: UserCircle },
  ];

  return (
    <PreviewBlock title="BottomNavbar After Login Preview">
      <div
        className="rounded-[18px] border px-2 pb-[3px] pt-[5px] shadow"
        style={{
          background: `linear-gradient(to right, ${colors.afterLoginBgFrom}, ${colors.afterLoginBgVia}, ${colors.afterLoginBgTo})`,
          borderColor: colors.afterLoginBorder,
        }}
      >
        <div className="flex h-[58px] items-center justify-between">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="relative flex h-full flex-1 flex-col items-center justify-center"
              >
                <div
                  className="relative flex h-[30px] w-[30px] items-center justify-center rounded-full"
                  style={{
                    background: item.deposit
                      ? `linear-gradient(to bottom right, ${colors.depositIconBgFrom}, ${colors.depositIconBgTo})`
                      : item.active
                        ? colors.activeIconBg
                        : colors.itemIconBg,
                    color: item.deposit
                      ? colors.depositIconText
                      : item.active
                        ? colors.activeIconText
                        : colors.itemIconText,
                  }}
                >
                  <Icon size={17} />

                  {item.deposit && (
                    <span
                      className="absolute -right-[3px] -top-[3px] flex h-[13px] w-[13px] items-center justify-center rounded-full"
                      style={{
                        backgroundColor: colors.depositBadgeBg,
                        color: colors.depositBadgeText,
                      }}
                    >
                      <Sparkles size={8} />
                    </span>
                  )}
                </div>

                <span
                  className="mt-[3px] text-[10.5px] font-bold leading-none"
                  style={{
                    color:
                      item.active || item.deposit
                        ? colors.activeText
                        : colors.itemText,
                  }}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </PreviewBlock>
  );
};

const PreviewLanguageModal = ({ colors }) => (
  <PreviewBlock title="Language Modal Preview">
    <div
      className="rounded-xl p-4"
      style={{ background: colors.langModalOverlayBg }}
    >
      <div
        className="overflow-hidden rounded-2xl shadow-2xl"
        style={{ backgroundColor: colors.langModalBg }}
      >
        <div
          className="px-5 py-4"
          style={{
            backgroundColor: colors.langModalHeaderBg,
            color: colors.langModalHeaderText,
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Choose Language</h2>
              <p
                className="mt-1 text-xs"
                style={{ color: colors.langModalMutedText }}
              >
                Select your preferred language
              </p>
            </div>

            <button
              type="button"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/15"
              style={{ color: colors.langModalHeaderText }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-5">
          <div
            className="rounded-xl p-1"
            style={{ backgroundColor: colors.langOptionWrapperBg }}
          >
            <LangOption colors={colors} active label="বাংলা" />
            <LangOption colors={colors} label="English" />
          </div>
        </div>
      </div>
    </div>
  </PreviewBlock>
);

const LangOption = ({ colors, active, label }) => (
  <div
    className="mb-1 flex h-[52px] items-center justify-between rounded-lg px-3 last:mb-0"
    style={{
      backgroundColor: active ? colors.langOptionActiveBg : colors.langOptionBg,
      color: active ? colors.langOptionActiveText : colors.langOptionText,
    }}
  >
    <div className="flex items-center gap-3">
      <img
        src={
          label === "বাংলা"
            ? "https://flagcdn.com/w40/bd.png"
            : "https://flagcdn.com/w40/us.png"
        }
        alt={label}
        className="h-8 w-8 rounded-full object-cover"
      />
      <span className="text-sm font-bold">{label}</span>
    </div>

    <span
      className="flex h-6 w-6 items-center justify-center rounded-full border"
      style={{
        borderColor: active
          ? colors.langOptionCheckBg
          : colors.langOptionCheckBorder,
        backgroundColor: active
          ? colors.langOptionCheckBg
          : colors.langOptionWrapperBg,
        color: active ? colors.langOptionCheckText : "transparent",
      }}
    >
      <Check size={15} />
    </span>
  </div>
);

const PreviewBlock = ({ title, children }) => (
  <div>
    <p className="mb-2 text-sm font-black text-blue-100">{title}</p>
    {children}
  </div>
);

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
        placeholder="#000000 / rgba(...)"
      />
    </div>
  </div>
);

export default BottomNavigationColorSetting;
