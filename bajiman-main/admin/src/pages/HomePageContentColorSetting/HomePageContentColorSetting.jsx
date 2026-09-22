import React, { useEffect, useState } from "react";
import {
  BadgeCheck,
  BarChart3,
  ChevronRight,
  ClipboardList,
  FileText,
  Gift,
  Gamepad2,
  Inbox,
  Landmark,
  Loader2,
  Lock,
  Mail,
  Palette,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  User,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const defaultForm = {
  status: "active",
  pageBg: "#f1f1f1",

  sectionBg: "transparent",
  sectionTitleText: "#111111",
  sectionBarBg: "#0b66a8",

  cardBg: "#ffffff",
  cardBorder: "transparent",
  cardText: "#111111",
  cardHoverShadow: "rgba(0,0,0,0.12)",

  imageBoxBg: "#0b4f83",
  imagePlaceholderText: "#ffffff",
  skeletonBg: "#e5e7eb",

  buttonBg: "#005eb8",
  buttonText: "#ffffff",
  inactiveButtonBg: "#ffffff",
  inactiveButtonText: "#333333",

  inputBg: "#ffffff",
  inputText: "#333333",
  inputBorder: "transparent",
  inputFocusBorder: "#005eb8",

  emptyText: "#555555",

  paginationBg: "#ffffff",
  paginationText: "#333333",
  paginationDisabledOpacity: "0.50",

  accountOverlayBg: "rgba(0,0,0,0.45)",
  accountModalBg: "#ffffff",
  accountHeaderBg: "#0865a9",
  accountHeaderText: "#ffffff",
  accountHeaderCardBg: "rgba(255,255,255,0.10)",

  accountAvatarBg: "#e9b20d",
  accountAvatarText: "#ffffff",
  accountMutedText: "rgba(255,255,255,0.80)",

  accountBalanceBg: "#eef4ff",
  accountBalanceBorder: "#97b6e9",
  accountBalanceText: "#0865a9",
  accountBalanceMutedText: "#2451cc",

  accountPrimaryButtonBg: "#0865a9",
  accountPrimaryButtonText: "#ffffff",
  accountDangerButtonBg: "#ef4444",
  accountDangerButtonText: "#ffffff",

  accountSectionBg: "#ffffff",
  accountSectionBorder: "#dce8f5",
  accountSectionHeaderBg: "#eef4ff",
  accountSectionTitleText: "#0865a9",
  accountSectionBarBg: "#0865a9",

  accountIconBoxBg: "#eaf4ff",
  accountIconBoxText: "#0865a9",
  accountMenuText: "#333333",
  accountMenuHoverBg: "#f7fbff",

  accountLogoutBg: "#e9b20d",
  accountLogoutText: "#ffffff",

  accountLoadingBg: "#eef4ff",
  accountLoadingText: "#0865a9",
};

const inputClass =
  "w-full rounded-xl border border-[#1A79D3]/25 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#3ea0ff] focus:ring-2 focus:ring-[#1A79D3]/20";

const labelClass = "mb-2 block text-sm font-bold text-blue-100";

const HomePageContentColorSetting = () => {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const loadSetting = async () => {
    try {
      setPageLoading(true);
      const res = await api.get("/api/home-page-content-color-settings");
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
      await api.put("/api/home-page-content-color-settings", form);
      toast.success("Home page content color setting saved successfully");
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
      const res = await api.patch(
        "/api/home-page-content-color-settings/reset",
      );
      setForm({ ...defaultForm, ...(res.data?.data || {}) });
      toast.success("Home page content colors reset successfully");
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
              Home Page Content{" "}
              <span className="bg-gradient-to-r from-[#3ea0ff] to-blue-100 bg-clip-text text-transparent">
                Color Setting
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Control HotsGame, PopularGames, Sports, Providers, Favourites,
              AccountModal and Games page colors.
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
        className="grid gap-6 xl:grid-cols-[1fr_520px]"
      >
        <div className="space-y-6">
          <Section title="Page, Section & Card Colors">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <ColorInput
                label="Page BG"
                value={form.pageBg}
                onChange={(v) => setColor("pageBg", v)}
              />
              <ColorInput
                label="Section BG"
                value={form.sectionBg}
                onChange={(v) => setColor("sectionBg", v)}
              />
              <ColorInput
                label="Section Title Text"
                value={form.sectionTitleText}
                onChange={(v) => setColor("sectionTitleText", v)}
              />
              <ColorInput
                label="Section Bar BG"
                value={form.sectionBarBg}
                onChange={(v) => setColor("sectionBarBg", v)}
              />
              <ColorInput
                label="Card BG"
                value={form.cardBg}
                onChange={(v) => setColor("cardBg", v)}
              />
              <ColorInput
                label="Card Border"
                value={form.cardBorder}
                onChange={(v) => setColor("cardBorder", v)}
              />
              <ColorInput
                label="Card Text"
                value={form.cardText}
                onChange={(v) => setColor("cardText", v)}
              />
              <ColorInput
                label="Card Hover Shadow"
                value={form.cardHoverShadow}
                onChange={(v) => setColor("cardHoverShadow", v)}
              />
            </div>
          </Section>

          <Section title="Images, Skeleton, Buttons & Inputs">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <ColorInput
                label="Image Box BG"
                value={form.imageBoxBg}
                onChange={(v) => setColor("imageBoxBg", v)}
              />
              <ColorInput
                label="Image Placeholder Text"
                value={form.imagePlaceholderText}
                onChange={(v) => setColor("imagePlaceholderText", v)}
              />
              <ColorInput
                label="Skeleton BG"
                value={form.skeletonBg}
                onChange={(v) => setColor("skeletonBg", v)}
              />
              <ColorInput
                label="Button BG"
                value={form.buttonBg}
                onChange={(v) => setColor("buttonBg", v)}
              />
              <ColorInput
                label="Button Text"
                value={form.buttonText}
                onChange={(v) => setColor("buttonText", v)}
              />
              <ColorInput
                label="Inactive Button BG"
                value={form.inactiveButtonBg}
                onChange={(v) => setColor("inactiveButtonBg", v)}
              />
              <ColorInput
                label="Inactive Button Text"
                value={form.inactiveButtonText}
                onChange={(v) => setColor("inactiveButtonText", v)}
              />
              <ColorInput
                label="Input BG"
                value={form.inputBg}
                onChange={(v) => setColor("inputBg", v)}
              />
              <ColorInput
                label="Input Text"
                value={form.inputText}
                onChange={(v) => setColor("inputText", v)}
              />
              <ColorInput
                label="Input Border"
                value={form.inputBorder}
                onChange={(v) => setColor("inputBorder", v)}
              />
              <ColorInput
                label="Input Focus Border"
                value={form.inputFocusBorder}
                onChange={(v) => setColor("inputFocusBorder", v)}
              />
              <ColorInput
                label="Empty Text"
                value={form.emptyText}
                onChange={(v) => setColor("emptyText", v)}
              />
              <ColorInput
                label="Pagination BG"
                value={form.paginationBg}
                onChange={(v) => setColor("paginationBg", v)}
              />
              <ColorInput
                label="Pagination Text"
                value={form.paginationText}
                onChange={(v) => setColor("paginationText", v)}
              />
              <ColorInput
                label="Pagination Disabled Opacity"
                value={form.paginationDisabledOpacity}
                onChange={(v) => setColor("paginationDisabledOpacity", v)}
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

          <Section title="Account Modal Header">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <ColorInput
                label="Overlay BG"
                value={form.accountOverlayBg}
                onChange={(v) => setColor("accountOverlayBg", v)}
              />
              <ColorInput
                label="Modal BG"
                value={form.accountModalBg}
                onChange={(v) => setColor("accountModalBg", v)}
              />
              <ColorInput
                label="Header BG"
                value={form.accountHeaderBg}
                onChange={(v) => setColor("accountHeaderBg", v)}
              />
              <ColorInput
                label="Header Text"
                value={form.accountHeaderText}
                onChange={(v) => setColor("accountHeaderText", v)}
              />
              <ColorInput
                label="Header Card BG"
                value={form.accountHeaderCardBg}
                onChange={(v) => setColor("accountHeaderCardBg", v)}
              />
              <ColorInput
                label="Avatar BG"
                value={form.accountAvatarBg}
                onChange={(v) => setColor("accountAvatarBg", v)}
              />
              <ColorInput
                label="Avatar Text"
                value={form.accountAvatarText}
                onChange={(v) => setColor("accountAvatarText", v)}
              />
              <ColorInput
                label="Muted Text"
                value={form.accountMutedText}
                onChange={(v) => setColor("accountMutedText", v)}
              />
            </div>
          </Section>

          <Section title="Account Balance & Buttons">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <ColorInput
                label="Balance BG"
                value={form.accountBalanceBg}
                onChange={(v) => setColor("accountBalanceBg", v)}
              />
              <ColorInput
                label="Balance Border"
                value={form.accountBalanceBorder}
                onChange={(v) => setColor("accountBalanceBorder", v)}
              />
              <ColorInput
                label="Balance Text"
                value={form.accountBalanceText}
                onChange={(v) => setColor("accountBalanceText", v)}
              />
              <ColorInput
                label="Balance Muted Text"
                value={form.accountBalanceMutedText}
                onChange={(v) => setColor("accountBalanceMutedText", v)}
              />
              <ColorInput
                label="Primary Button BG"
                value={form.accountPrimaryButtonBg}
                onChange={(v) => setColor("accountPrimaryButtonBg", v)}
              />
              <ColorInput
                label="Primary Button Text"
                value={form.accountPrimaryButtonText}
                onChange={(v) => setColor("accountPrimaryButtonText", v)}
              />
              <ColorInput
                label="Danger Button BG"
                value={form.accountDangerButtonBg}
                onChange={(v) => setColor("accountDangerButtonBg", v)}
              />
              <ColorInput
                label="Danger Button Text"
                value={form.accountDangerButtonText}
                onChange={(v) => setColor("accountDangerButtonText", v)}
              />
            </div>
          </Section>

          <Section title="Account Sections & Menu">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <ColorInput
                label="Section BG"
                value={form.accountSectionBg}
                onChange={(v) => setColor("accountSectionBg", v)}
              />
              <ColorInput
                label="Section Border"
                value={form.accountSectionBorder}
                onChange={(v) => setColor("accountSectionBorder", v)}
              />
              <ColorInput
                label="Section Header BG"
                value={form.accountSectionHeaderBg}
                onChange={(v) => setColor("accountSectionHeaderBg", v)}
              />
              <ColorInput
                label="Section Title Text"
                value={form.accountSectionTitleText}
                onChange={(v) => setColor("accountSectionTitleText", v)}
              />
              <ColorInput
                label="Section Bar BG"
                value={form.accountSectionBarBg}
                onChange={(v) => setColor("accountSectionBarBg", v)}
              />
              <ColorInput
                label="Icon Box BG"
                value={form.accountIconBoxBg}
                onChange={(v) => setColor("accountIconBoxBg", v)}
              />
              <ColorInput
                label="Icon Box Text"
                value={form.accountIconBoxText}
                onChange={(v) => setColor("accountIconBoxText", v)}
              />
              <ColorInput
                label="Menu Text"
                value={form.accountMenuText}
                onChange={(v) => setColor("accountMenuText", v)}
              />
              <ColorInput
                label="Menu Hover BG"
                value={form.accountMenuHoverBg}
                onChange={(v) => setColor("accountMenuHoverBg", v)}
              />
              <ColorInput
                label="Logout BG"
                value={form.accountLogoutBg}
                onChange={(v) => setColor("accountLogoutBg", v)}
              />
              <ColorInput
                label="Logout Text"
                value={form.accountLogoutText}
                onChange={(v) => setColor("accountLogoutText", v)}
              />
              <ColorInput
                label="Loading BG"
                value={form.accountLoadingBg}
                onChange={(v) => setColor("accountLoadingBg", v)}
              />
              <ColorInput
                label="Loading Text"
                value={form.accountLoadingText}
                onChange={(v) => setColor("accountLoadingText", v)}
              />
            </div>
          </Section>
        </div>

        <section className="sticky top-6 h-fit rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
          <div className="mb-5 flex items-center gap-3">
            <BadgeCheck className="h-5 w-5 text-[#3ea0ff]" />
            <h2 className="text-xl font-black">All Components Preview</h2>
          </div>

          <div className="max-h-[760px] space-y-5 overflow-y-auto pr-1">
            <PreviewHomeGrid colors={form} title="HotsGame Preview" compact />
            <PreviewPopular colors={form} />
            <PreviewHomeGrid colors={form} title="Sports Preview" compact />
            <PreviewHomeGrid colors={form} title="Providers Preview" compact />
            <PreviewFavourites colors={form} />
            <PreviewGames colors={form} />
            <PreviewAccountModal colors={form} />
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
            {loading ? "Saving..." : "Save Home Page Content Colors"}
          </button>
        </section>
      </form>
    </div>
  );
};

const PreviewTitle = ({ colors, title }) => (
  <div className="flex h-[30px] items-center">
    <span
      className="mr-2 h-[15px] w-[4px] rounded-full"
      style={{ backgroundColor: colors.sectionBarBg }}
    />
    <h2
      className="text-[14px] font-semibold uppercase"
      style={{ color: colors.sectionTitleText }}
    >
      {title}
    </h2>
  </div>
);

const PreviewHomeGrid = ({ colors, title }) => (
  <PreviewBlock title={title}>
    <div className="rounded-xl p-2" style={{ backgroundColor: colors.pageBg }}>
      <PreviewTitle colors={colors} title={title.replace(" Preview", "")} />
      <div className="grid grid-cols-4 gap-[6px]">
        {[1, 2, 3, 4].map((item) => (
          <button
            key={item}
            type="button"
            className="flex h-[78px] flex-col items-center justify-center overflow-hidden px-1"
            style={{
              backgroundColor: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              boxShadow: `0 2px 8px ${colors.cardHoverShadow}`,
            }}
          >
            <div
              className="mb-[5px] h-[38px] w-[52px] rounded"
              style={{ backgroundColor: colors.imageBoxBg }}
            />
            <p
              className="w-full truncate text-center text-[12px] leading-none"
              style={{ color: colors.cardText }}
            >
              Game {item}
            </p>
          </button>
        ))}
      </div>
    </div>
  </PreviewBlock>
);

const PreviewPopular = ({ colors }) => (
  <PreviewBlock title="PopularGames Preview">
    <div className="rounded-xl p-2" style={{ backgroundColor: colors.pageBg }}>
      <PreviewTitle colors={colors} title="Popular Games" />
      <div className="grid grid-cols-2 gap-2">
        {[1, 2].map((item) => (
          <button
            key={item}
            type="button"
            className="block overflow-hidden rounded-[3px] text-left"
            style={{
              backgroundColor: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
            }}
          >
            <div
              className="flex h-[85px] w-full items-center justify-center text-[12px]"
              style={{
                backgroundColor: colors.imageBoxBg,
                color: colors.imagePlaceholderText,
              }}
            >
              Image
            </div>
            <p
              className="h-[34px] truncate px-2 py-[7px] text-[13px]"
              style={{ color: colors.cardText }}
            >
              Popular Game {item}
            </p>
          </button>
        ))}
      </div>
    </div>
  </PreviewBlock>
);

const PreviewFavourites = ({ colors }) => (
  <PreviewBlock title="Favourites Preview">
    <div className="rounded-xl p-2" style={{ backgroundColor: colors.pageBg }}>
      <PreviewTitle colors={colors} title="Favourites" />
      <div className="flex gap-2 overflow-hidden">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="flex h-[95px] min-w-[48%] items-center justify-center rounded-[3px] text-[12px]"
            style={{
              backgroundColor: colors.imageBoxBg,
              color: colors.imagePlaceholderText,
              border: `1px solid ${colors.cardBorder}`,
            }}
          >
            Banner {item}
          </div>
        ))}
      </div>
    </div>
  </PreviewBlock>
);

const PreviewGames = ({ colors }) => (
  <PreviewBlock title="Games Page Preview">
    <div className="rounded-xl p-2" style={{ backgroundColor: colors.pageBg }}>
      <div className="mb-3 flex gap-2">
        <button
          type="button"
          className="h-[30px] min-w-[80px] rounded-[3px] text-[12px]"
          style={{ backgroundColor: colors.buttonBg, color: colors.buttonText }}
        >
          ALL
        </button>
        <button
          type="button"
          className="h-[30px] min-w-[80px] rounded-[3px] text-[12px]"
          style={{
            backgroundColor: colors.inactiveButtonBg,
            color: colors.inactiveButtonText,
          }}
        >
          PGSOFT
        </button>
        <button
          type="button"
          className="flex h-[30px] w-[42px] items-center justify-center rounded-[3px]"
          style={{ backgroundColor: colors.buttonBg, color: colors.buttonText }}
        >
          <Search size={16} />
        </button>
      </div>

      <div className="mb-3">
        <input
          readOnly
          value="Search game..."
          className="h-[34px] w-full rounded-[3px] px-3 text-[13px] outline-none"
          style={{
            backgroundColor: colors.inputBg,
            color: colors.inputText,
            border: `1px solid ${colors.inputBorder}`,
          }}
        />
      </div>

      <PreviewTitle colors={colors} title="Games" />

      <div className="grid grid-cols-2 gap-2">
        {[1, 2].map((item) => (
          <button
            key={item}
            type="button"
            className="block overflow-hidden rounded-[3px] text-left"
            style={{
              backgroundColor: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
            }}
          >
            <div
              className="flex h-[85px] items-center justify-center text-[12px]"
              style={{
                backgroundColor: colors.imageBoxBg,
                color: colors.imagePlaceholderText,
              }}
            >
              No Image
            </div>
            <p
              className="h-[34px] truncate px-2 py-[7px] text-[13px]"
              style={{ color: colors.cardText }}
            >
              Game Name
            </p>
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        <button
          type="button"
          className="h-[32px] rounded-[3px] px-3 text-[13px]"
          style={{
            backgroundColor: colors.paginationBg,
            color: colors.paginationText,
          }}
        >
          Prev
        </button>
        <span className="text-[13px]" style={{ color: colors.paginationText }}>
          1 / 5
        </span>
        <button
          type="button"
          className="h-[32px] rounded-[3px] px-3 text-[13px]"
          style={{
            backgroundColor: colors.paginationBg,
            color: colors.paginationText,
          }}
        >
          Next
        </button>
      </div>
    </div>
  </PreviewBlock>
);

const PreviewAccountModal = ({ colors }) => {
  const menuItems = [
    { title: "Deposit", icon: Wallet },
    { title: "Profile", icon: User },
    { title: "Inbox", icon: Inbox },
  ];

  return (
    <PreviewBlock title="AccountModal Preview">
      <div
        className="rounded-xl p-4"
        style={{ background: colors.accountOverlayBg }}
      >
        <div
          className="mx-auto max-w-[360px] overflow-hidden rounded-[8px]"
          style={{ backgroundColor: colors.accountModalBg }}
        >
          <div
            style={{
              backgroundColor: colors.accountHeaderBg,
              color: colors.accountHeaderText,
            }}
          >
            <div className="relative flex h-[50px] items-center justify-center">
              <h2 className="text-[18px] font-semibold">Account</h2>
              <X className="absolute right-3" size={20} />
            </div>

            <div className="px-4 pb-4">
              <div
                className="rounded-[4px] px-4 py-3"
                style={{ backgroundColor: colors.accountHeaderCardBg }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-full text-[24px] font-black"
                    style={{
                      backgroundColor: colors.accountAvatarBg,
                      color: colors.accountAvatarText,
                    }}
                  >
                    U
                  </div>
                  <div>
                    <p className="text-[14px] font-bold">User ID: user123</p>
                    <p
                      className="mt-1 text-[12px]"
                      style={{ color: colors.accountMutedText }}
                    >
                      Phone: 01700000000
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3">
            <div
              className="rounded-[4px] border p-3"
              style={{
                backgroundColor: colors.accountBalanceBg,
                borderColor: colors.accountBalanceBorder,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div
                    className="flex items-center gap-2"
                    style={{ color: colors.accountBalanceMutedText }}
                  >
                    <Wallet size={16} />
                    <h3 className="text-[14px] font-bold">Balance</h3>
                  </div>
                  <p
                    className="mt-2 text-[22px] font-black"
                    style={{ color: colors.accountBalanceText }}
                  >
                    300.00 TK
                  </p>
                </div>
                <div className="flex w-[95px] flex-col gap-2">
                  <button
                    className="h-[30px] rounded-[3px] text-[12px] font-bold"
                    style={{
                      backgroundColor: colors.accountPrimaryButtonBg,
                      color: colors.accountPrimaryButtonText,
                    }}
                  >
                    Deposit
                  </button>
                  <button
                    className="h-[30px] rounded-[3px] text-[12px] font-bold"
                    style={{
                      backgroundColor: colors.accountDangerButtonBg,
                      color: colors.accountDangerButtonText,
                    }}
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            </div>

            <div
              className="mt-3 overflow-hidden rounded-[4px] border"
              style={{
                backgroundColor: colors.accountSectionBg,
                borderColor: colors.accountSectionBorder,
              }}
            >
              <div
                className="flex h-[42px] items-center gap-2 border-b px-3"
                style={{
                  backgroundColor: colors.accountSectionHeaderBg,
                  borderColor: colors.accountSectionBorder,
                }}
              >
                <span
                  className="h-5 w-[4px] rounded-full"
                  style={{ backgroundColor: colors.accountSectionBarBg }}
                />
                <h3
                  className="text-[14px] font-bold"
                  style={{ color: colors.accountSectionTitleText }}
                >
                  Funds
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="flex flex-col items-center rounded-[4px] p-1"
                    >
                      <div
                        className="flex h-[46px] w-[46px] items-center justify-center rounded-full"
                        style={{
                          backgroundColor: colors.accountIconBoxBg,
                          color: colors.accountIconBoxText,
                        }}
                      >
                        <Icon size={20} />
                      </div>
                      <span
                        className="mt-2 text-center text-[11px] font-bold"
                        style={{ color: colors.accountMenuText }}
                      >
                        {item.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              className="mt-3 flex h-[42px] w-full items-center justify-center gap-2 rounded-[3px] text-[14px] font-bold"
              style={{
                backgroundColor: colors.accountLogoutBg,
                color: colors.accountLogoutText,
              }}
            >
              Log out
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </PreviewBlock>
  );
};

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
        placeholder="#000000 / rgba(...) / transparent"
      />
    </div>
  </div>
);

export default HomePageContentColorSetting;
