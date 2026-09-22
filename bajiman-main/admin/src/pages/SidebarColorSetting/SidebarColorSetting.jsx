import React, { useEffect, useState } from "react";
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Home,
  Loader2,
  Palette,
  RefreshCw,
  RotateCcw,
  Save,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const defaultForm = {
  status: "active",

  desktopBg: "#0b66a8",
  desktopToggleBg: "#075893",
  desktopToggleText: "#ffffff",
  desktopToggleHoverBg: "#1979c9",

  desktopItemHoverBg: "#1979c9",
  desktopItemActiveBg: "#37a2ff",
  desktopItemActiveBorder: "#ffffff",

  desktopIconBg: "#075893",
  desktopIconText: "#ffffff",
  desktopActiveIconBg: "#005fff",
  desktopActiveIconText: "#ffffff",

  desktopExpandedText: "#ffffff",
  desktopExpandedIconBg: "#075893",
  desktopExpandedActiveBg: "#37a2ff",

  desktopChildBg: "#f4f4f4",
  desktopChildText: "#111111",
  desktopChildHoverBg: "#ffffff",
  desktopChildBorder: "#d8d8d8",

  mobileBg: "#ffffff",
  mobileText: "#111111",
  mobileItemHoverBg: "#f7f7f7",
  mobileItemActiveBg: "#e8f4ff",
  mobileItemActiveText: "#0b66a8",
  mobileIconText: "#0b66a8",

  mobileSectionText: "#111111",
  mobileSectionBorder: "#d9e6f2",

  mobilePanelBg: "#f5f5f5",
  mobilePanelBorder: "#d9d9d9",
  mobilePanelText: "#222222",
  mobilePanelHoverBg: "#ffffff",

  overlayBg: "rgba(0,0,0,0.60)",
};

const inputClass =
  "w-full rounded-xl border border-[#1A79D3]/25 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#3ea0ff] focus:ring-2 focus:ring-[#1A79D3]/20";

const labelClass = "mb-2 block text-sm font-bold text-blue-100";

const SidebarColorSetting = () => {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const loadSetting = async () => {
    try {
      setPageLoading(true);
      const res = await api.get("/api/sidebar-color-settings");
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
      await api.put("/api/sidebar-color-settings", form);
      toast.success("Sidebar color setting saved successfully");
      await loadSetting();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    const ok = window.confirm("Are you sure you want to reset sidebar colors?");
    if (!ok) return;

    try {
      setLoading(true);
      const res = await api.patch("/api/sidebar-color-settings/reset");
      setForm({ ...defaultForm, ...(res.data?.data || {}) });
      toast.success("Sidebar color reset successfully");
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
              Sidebar{" "}
              <span className="bg-gradient-to-r from-[#3ea0ff] to-blue-100 bg-clip-text text-transparent">
                Color Setting
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Control desktop sidebar, mobile sidebar and mobile child panel
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
          <Section title="Main Control">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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

              <ColorInput
                label="Mobile Overlay BG"
                value={form.overlayBg}
                onChange={(v) => setColor("overlayBg", v)}
              />
            </div>
          </Section>

          <Section title="Desktop Sidebar">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <ColorInput
                label="Desktop BG"
                value={form.desktopBg}
                onChange={(v) => setColor("desktopBg", v)}
              />
              <ColorInput
                label="Toggle BG"
                value={form.desktopToggleBg}
                onChange={(v) => setColor("desktopToggleBg", v)}
              />
              <ColorInput
                label="Toggle Text"
                value={form.desktopToggleText}
                onChange={(v) => setColor("desktopToggleText", v)}
              />
              <ColorInput
                label="Toggle Hover BG"
                value={form.desktopToggleHoverBg}
                onChange={(v) => setColor("desktopToggleHoverBg", v)}
              />

              <ColorInput
                label="Item Hover BG"
                value={form.desktopItemHoverBg}
                onChange={(v) => setColor("desktopItemHoverBg", v)}
              />
              <ColorInput
                label="Item Active BG"
                value={form.desktopItemActiveBg}
                onChange={(v) => setColor("desktopItemActiveBg", v)}
              />
              <ColorInput
                label="Active Border"
                value={form.desktopItemActiveBorder}
                onChange={(v) => setColor("desktopItemActiveBorder", v)}
              />

              <ColorInput
                label="Icon BG"
                value={form.desktopIconBg}
                onChange={(v) => setColor("desktopIconBg", v)}
              />
              <ColorInput
                label="Icon Text"
                value={form.desktopIconText}
                onChange={(v) => setColor("desktopIconText", v)}
              />
              <ColorInput
                label="Active Icon BG"
                value={form.desktopActiveIconBg}
                onChange={(v) => setColor("desktopActiveIconBg", v)}
              />
              <ColorInput
                label="Active Icon Text"
                value={form.desktopActiveIconText}
                onChange={(v) => setColor("desktopActiveIconText", v)}
              />

              <ColorInput
                label="Expanded Text"
                value={form.desktopExpandedText}
                onChange={(v) => setColor("desktopExpandedText", v)}
              />
              <ColorInput
                label="Expanded Icon BG"
                value={form.desktopExpandedIconBg}
                onChange={(v) => setColor("desktopExpandedIconBg", v)}
              />
              <ColorInput
                label="Expanded Active BG"
                value={form.desktopExpandedActiveBg}
                onChange={(v) => setColor("desktopExpandedActiveBg", v)}
              />
            </div>
          </Section>

          <Section title="Desktop Child Menu">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <ColorInput
                label="Child BG"
                value={form.desktopChildBg}
                onChange={(v) => setColor("desktopChildBg", v)}
              />
              <ColorInput
                label="Child Text"
                value={form.desktopChildText}
                onChange={(v) => setColor("desktopChildText", v)}
              />
              <ColorInput
                label="Child Hover BG"
                value={form.desktopChildHoverBg}
                onChange={(v) => setColor("desktopChildHoverBg", v)}
              />
              <ColorInput
                label="Child Border"
                value={form.desktopChildBorder}
                onChange={(v) => setColor("desktopChildBorder", v)}
              />
            </div>
          </Section>

          <Section title="Mobile Sidebar">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <ColorInput
                label="Mobile BG"
                value={form.mobileBg}
                onChange={(v) => setColor("mobileBg", v)}
              />
              <ColorInput
                label="Mobile Text"
                value={form.mobileText}
                onChange={(v) => setColor("mobileText", v)}
              />
              <ColorInput
                label="Mobile Icon Text"
                value={form.mobileIconText}
                onChange={(v) => setColor("mobileIconText", v)}
              />
              <ColorInput
                label="Item Hover BG"
                value={form.mobileItemHoverBg}
                onChange={(v) => setColor("mobileItemHoverBg", v)}
              />
              <ColorInput
                label="Item Active BG"
                value={form.mobileItemActiveBg}
                onChange={(v) => setColor("mobileItemActiveBg", v)}
              />
              <ColorInput
                label="Item Active Text"
                value={form.mobileItemActiveText}
                onChange={(v) => setColor("mobileItemActiveText", v)}
              />

              <ColorInput
                label="Section Text"
                value={form.mobileSectionText}
                onChange={(v) => setColor("mobileSectionText", v)}
              />
              <ColorInput
                label="Section Border"
                value={form.mobileSectionBorder}
                onChange={(v) => setColor("mobileSectionBorder", v)}
              />
            </div>
          </Section>

          <Section title="Mobile Child Panel">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <ColorInput
                label="Panel BG"
                value={form.mobilePanelBg}
                onChange={(v) => setColor("mobilePanelBg", v)}
              />
              <ColorInput
                label="Panel Border"
                value={form.mobilePanelBorder}
                onChange={(v) => setColor("mobilePanelBorder", v)}
              />
              <ColorInput
                label="Panel Text"
                value={form.mobilePanelText}
                onChange={(v) => setColor("mobilePanelText", v)}
              />
              <ColorInput
                label="Panel Hover BG"
                value={form.mobilePanelHoverBg}
                onChange={(v) => setColor("mobilePanelHoverBg", v)}
              />
            </div>
          </Section>
        </div>

        <section className="sticky top-6 h-fit rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
          <div className="mb-5 flex items-center gap-3">
            <BadgeCheck className="h-5 w-5 text-[#3ea0ff]" />
            <h2 className="text-xl font-black">Live Preview</h2>
          </div>

          <Preview form={form} />

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
            {loading ? "Saving..." : "Save Sidebar Colors"}
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
        placeholder="#000000 or rgba(0,0,0,.6)"
      />
    </div>
  </div>
);

const Preview = ({ form }) => {
  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-black text-blue-100">
          Desktop Collapsed
        </p>

        <div
          className="w-[57px] overflow-hidden rounded-xl shadow-xl"
          style={{ backgroundColor: form.desktopBg }}
        >
          <div className="flex h-[52px] w-full items-center justify-center">
            <span
              className="flex h-[32px] w-[32px] items-center justify-center rounded-full"
              style={{
                backgroundColor: form.desktopToggleBg,
                color: form.desktopToggleText,
              }}
            >
              <ChevronRight size={22} />
            </span>
          </div>

          <DesktopIcon form={form} active icon={<Home size={19} />} />
          <DesktopIcon form={form} icon={<Gamepad2 size={19} />} />
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-black text-blue-100">
          Desktop Expanded
        </p>

        <div
          className="w-full overflow-hidden rounded-xl shadow-xl"
          style={{ backgroundColor: form.desktopBg }}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <span
              className="text-sm font-bold"
              style={{ color: form.desktopExpandedText }}
            >
              Sidebar
            </span>

            <span
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{
                backgroundColor: form.desktopToggleBg,
                color: form.desktopToggleText,
              }}
            >
              <ChevronLeft size={20} />
            </span>
          </div>

          <div
            className="flex h-[48px] items-center gap-3 px-4"
            style={{
              backgroundColor: form.desktopItemActiveBg,
              boxShadow: `inset 4px 0 0 0 ${form.desktopItemActiveBorder}`,
              color: form.desktopExpandedText,
            }}
          >
            <span
              className="flex h-[30px] w-[30px] items-center justify-center rounded-full"
              style={{
                backgroundColor: form.desktopActiveIconBg,
                color: form.desktopActiveIconText,
              }}
            >
              <Home size={18} />
            </span>
            <span className="text-sm font-bold">Home</span>
          </div>

          <div
            className="flex h-[48px] items-center gap-3 px-4"
            style={{ color: form.desktopExpandedText }}
          >
            <span
              className="flex h-[30px] w-[30px] items-center justify-center rounded-full"
              style={{
                backgroundColor: form.desktopIconBg,
                color: form.desktopIconText,
              }}
            >
              <Gamepad2 size={18} />
            </span>
            <span className="text-sm font-bold">Games</span>
          </div>

          <div style={{ backgroundColor: form.desktopChildBg }}>
            <div
              className="flex h-[42px] items-center gap-3 border-b px-9 text-sm font-medium"
              style={{
                color: form.desktopChildText,
                borderColor: form.desktopChildBorder,
              }}
            >
              Provider 1
            </div>
            <div
              className="flex h-[42px] items-center gap-3 border-b px-9 text-sm font-medium"
              style={{
                color: form.desktopChildText,
                borderColor: form.desktopChildBorder,
                backgroundColor: form.desktopChildHoverBg,
              }}
            >
              Provider Hover
            </div>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-black text-blue-100">Mobile Sidebar</p>

        <div className="flex overflow-hidden rounded-xl shadow-xl">
          <div
            className="w-[194px] p-3"
            style={{
              backgroundColor: form.mobileBg,
              color: form.mobileText,
            }}
          >
            <MobileItem
              form={form}
              active
              text="Home"
              icon={<Home size={18} />}
            />
            <MobileItem
              form={form}
              text="Promotion"
              icon={<Gamepad2 size={18} />}
            />

            <div
              className="mx-1 my-3 border-t pt-3 text-[15px] font-bold"
              style={{
                color: form.mobileSectionText,
                borderColor: form.mobileSectionBorder,
              }}
            >
              Games
            </div>

            <MobileItem
              form={form}
              text="Hot Game"
              icon={<Gamepad2 size={18} />}
            />
          </div>

          <div
            className="w-[108px] border-l"
            style={{
              backgroundColor: form.mobilePanelBg,
              borderColor: form.mobilePanelBorder,
            }}
          >
            <div
              className="flex h-[90px] flex-col items-center justify-center border-b text-center text-sm font-medium uppercase"
              style={{
                color: form.mobilePanelText,
                borderColor: form.mobilePanelBorder,
              }}
            >
              <Gamepad2 size={30} />
              <span className="mt-1">Game</span>
            </div>

            <div
              className="flex h-[90px] flex-col items-center justify-center border-b text-center text-sm font-medium uppercase"
              style={{
                color: form.mobilePanelText,
                borderColor: form.mobilePanelBorder,
                backgroundColor: form.mobilePanelHoverBg,
              }}
            >
              <Gamepad2 size={30} />
              <span className="mt-1">Hover</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DesktopIcon = ({ form, active, icon }) => (
  <div
    className="flex h-[52px] w-full items-center justify-center"
    style={{
      backgroundColor: active ? form.desktopItemActiveBg : "transparent",
      boxShadow: active
        ? `inset 4px 0 0 0 ${form.desktopItemActiveBorder}`
        : "none",
    }}
  >
    <span
      className="flex h-[32px] w-[32px] items-center justify-center rounded-full"
      style={{
        backgroundColor: active ? form.desktopActiveIconBg : form.desktopIconBg,
        color: active ? form.desktopActiveIconText : form.desktopIconText,
      }}
    >
      {icon}
    </span>
  </div>
);

const MobileItem = ({ form, active, text, icon }) => (
  <div
    className="mb-1 flex min-h-[42px] items-center gap-3 rounded-lg px-3 text-sm font-bold"
    style={{
      backgroundColor: active ? form.mobileItemActiveBg : "transparent",
      color: active ? form.mobileItemActiveText : form.mobileText,
    }}
  >
    <span
      style={{
        color: active ? form.mobileItemActiveText : form.mobileIconText,
      }}
    >
      {icon}
    </span>
    <span>{text}</span>
  </div>
);

export default SidebarColorSetting;
