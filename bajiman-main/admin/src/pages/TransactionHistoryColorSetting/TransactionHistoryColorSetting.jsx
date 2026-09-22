import React, { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Loader2,
  Palette,
  RefreshCw,
  RotateCcw,
  Save,
  Receipt,
  Wallet,
  Landmark,
  Gamepad2,
  RotateCcw as TurnoverIcon,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  XCircle,
  CheckCircle2,
  Clock3,
  Gift,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const defaultForm = {
  status: "active",

  modalBg: "#ffffff",
  pageOverlayBg: "rgba(0,0,0,0.45)",

  headerBg: "#0865a9",
  headerText: "#ffffff",
  closeIconColor: "#ffffff",

  primaryBg: "#0865a9",
  primaryText: "#ffffff",

  secondaryBg: "#2e9bf3",
  secondaryText: "#ffffff",

  inactiveTabBg: "#00518c",
  inactiveTabText: "#ffffff",

  sectionBg: "#f3f7fb",
  sectionBorder: "#e5e5e5",
  sectionText: "#0865a9",

  cardBg: "#ffffff",
  cardBorder: "#dce8f5",

  inputBg: "#eeeeee",
  inputText: "#222222",
  inputBorder: "#d7d7d7",
  inputFocusBorder: "#0865a9",

  labelText: "#333333",
  normalText: "#222222",
  mutedText: "#777777",

  summaryBg: "#f4f8ff",
  summaryText: "#0865a9",

  progressBg: "#0865a9",
  progressTrackBg: "#ffffff",

  successBg: "#dcfce7",
  successText: "#15803d",

  warningBg: "#fef9c3",
  warningText: "#a16207",

  dangerBg: "#fee2e2",
  dangerText: "#b91c1c",

  disabledBg: "#a6a6a6",
  disabledText: "#ffffff",
};

const inputClass =
  "w-full rounded-xl border border-[#1A79D3]/25 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#3ea0ff] focus:ring-2 focus:ring-[#1A79D3]/20";

const labelClass = "mb-2 block text-sm font-bold text-blue-100";

const previewTabs = [
  { key: "deposit", label: "Deposit History", icon: Wallet },
  { key: "autoDeposit", label: "Auto Deposit History", icon: Landmark },
  { key: "withdraw", label: "Withdraw History", icon: Receipt },
  { key: "bet", label: "Bet History", icon: Gamepad2 },
  { key: "turnover", label: "Turnover History", icon: TurnoverIcon },
  { key: "comingSoon", label: "Coming Soon", icon: Clock },
];

const TransactionHistoryColorSetting = () => {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [activePreview, setActivePreview] = useState("deposit");

  const loadSetting = async () => {
    try {
      setPageLoading(true);
      const res = await api.get("/api/transaction-history-color-settings");
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
      await api.put("/api/transaction-history-color-settings", form);
      toast.success("Transaction history color setting saved successfully");
      await loadSetting();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    const ok = window.confirm(
      "Are you sure you want to reset all transaction history colors?",
    );
    if (!ok) return;

    try {
      setLoading(true);
      const res = await api.patch(
        "/api/transaction-history-color-settings/reset",
      );
      setForm({ ...defaultForm, ...(res.data?.data || {}) });
      toast.success("Transaction history color reset successfully");
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
              Transaction History{" "}
              <span className="bg-gradient-to-r from-[#3ea0ff] to-blue-100 bg-clip-text text-transparent">
                Color Setting
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Control Deposit History, Auto Deposit History, Withdraw History,
              Bet History, Turnover History and Coming Soon history colors.
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
          <Section title="Main Wrapper">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <ColorInput
                label="Modal Background"
                value={form.modalBg}
                onChange={(v) => setColor("modalBg", v)}
              />
              <ColorInput
                label="Overlay Background"
                value={form.pageOverlayBg}
                onChange={(v) => setColor("pageOverlayBg", v)}
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

          <Section title="Header & Tabs">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <ColorInput
                label="Header BG"
                value={form.headerBg}
                onChange={(v) => setColor("headerBg", v)}
              />
              <ColorInput
                label="Header Text"
                value={form.headerText}
                onChange={(v) => setColor("headerText", v)}
              />
              <ColorInput
                label="Close Icon"
                value={form.closeIconColor}
                onChange={(v) => setColor("closeIconColor", v)}
              />
              <ColorInput
                label="Primary BG"
                value={form.primaryBg}
                onChange={(v) => setColor("primaryBg", v)}
              />
              <ColorInput
                label="Primary Text"
                value={form.primaryText}
                onChange={(v) => setColor("primaryText", v)}
              />
              <ColorInput
                label="Secondary BG"
                value={form.secondaryBg}
                onChange={(v) => setColor("secondaryBg", v)}
              />
              <ColorInput
                label="Secondary Text"
                value={form.secondaryText}
                onChange={(v) => setColor("secondaryText", v)}
              />
              <ColorInput
                label="Inactive Tab BG"
                value={form.inactiveTabBg}
                onChange={(v) => setColor("inactiveTabBg", v)}
              />
              <ColorInput
                label="Inactive Tab Text"
                value={form.inactiveTabText}
                onChange={(v) => setColor("inactiveTabText", v)}
              />
            </div>
          </Section>

          <Section title="Sections, Cards & Inputs">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <ColorInput
                label="Section BG"
                value={form.sectionBg}
                onChange={(v) => setColor("sectionBg", v)}
              />
              <ColorInput
                label="Section Border"
                value={form.sectionBorder}
                onChange={(v) => setColor("sectionBorder", v)}
              />
              <ColorInput
                label="Section Text"
                value={form.sectionText}
                onChange={(v) => setColor("sectionText", v)}
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
            </div>
          </Section>

          <Section title="Text, Summary & Progress">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <ColorInput
                label="Label Text"
                value={form.labelText}
                onChange={(v) => setColor("labelText", v)}
              />
              <ColorInput
                label="Normal Text"
                value={form.normalText}
                onChange={(v) => setColor("normalText", v)}
              />
              <ColorInput
                label="Muted Text"
                value={form.mutedText}
                onChange={(v) => setColor("mutedText", v)}
              />

              <ColorInput
                label="Summary BG"
                value={form.summaryBg}
                onChange={(v) => setColor("summaryBg", v)}
              />
              <ColorInput
                label="Summary Text"
                value={form.summaryText}
                onChange={(v) => setColor("summaryText", v)}
              />

              <ColorInput
                label="Progress BG"
                value={form.progressBg}
                onChange={(v) => setColor("progressBg", v)}
              />
              <ColorInput
                label="Progress Track BG"
                value={form.progressTrackBg}
                onChange={(v) => setColor("progressTrackBg", v)}
              />
            </div>
          </Section>

          <Section title="Status & Disabled Colors">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <ColorInput
                label="Success BG"
                value={form.successBg}
                onChange={(v) => setColor("successBg", v)}
              />
              <ColorInput
                label="Success Text"
                value={form.successText}
                onChange={(v) => setColor("successText", v)}
              />

              <ColorInput
                label="Warning BG"
                value={form.warningBg}
                onChange={(v) => setColor("warningBg", v)}
              />
              <ColorInput
                label="Warning Text"
                value={form.warningText}
                onChange={(v) => setColor("warningText", v)}
              />

              <ColorInput
                label="Danger BG"
                value={form.dangerBg}
                onChange={(v) => setColor("dangerBg", v)}
              />
              <ColorInput
                label="Danger Text"
                value={form.dangerText}
                onChange={(v) => setColor("dangerText", v)}
              />

              <ColorInput
                label="Disabled BG"
                value={form.disabledBg}
                onChange={(v) => setColor("disabledBg", v)}
              />
              <ColorInput
                label="Disabled Text"
                value={form.disabledText}
                onChange={(v) => setColor("disabledText", v)}
              />
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <section className="sticky top-6 rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <BadgeCheck className="h-5 w-5 text-[#3ea0ff]" />
              <h2 className="text-xl font-black">All Components Preview</h2>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2">
              {previewTabs.map((item) => {
                const Icon = item.icon;
                const active = activePreview === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActivePreview(item.key)}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-black transition"
                    style={{
                      borderColor: active ? "#3ea0ff" : "rgba(26,121,211,0.25)",
                      backgroundColor: active
                        ? "rgba(26,121,211,0.25)"
                        : "rgba(0,0,0,0.25)",
                      color: active ? "#ffffff" : "#bfdbfe",
                    }}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div
              className="rounded-2xl p-4"
              style={{ background: form.pageOverlayBg }}
            >
              <PreviewShell colors={form} activePreview={activePreview} />
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
              {loading ? "Saving..." : "Save Transaction History Colors"}
            </button>
          </section>
        </div>
      </form>
    </div>
  );
};

const PreviewShell = ({ colors, activePreview }) => {
  const titleMap = {
    deposit: "Deposit History",
    autoDeposit: "Auto Deposit History",
    withdraw: "Withdraw History",
    bet: "Bet History",
    turnover: "Turnover History",
    comingSoon: "Coming Soon",
  };

  return (
    <div
      className="mx-auto w-full max-w-[390px] overflow-hidden rounded-[8px] shadow-2xl"
      style={{ backgroundColor: colors.modalBg }}
    >
      <div
        className="relative flex h-[48px] items-center justify-center"
        style={{
          backgroundColor: colors.headerBg,
          color: colors.headerText,
        }}
      >
        <h3 className="text-[16px] font-semibold">{titleMap[activePreview]}</h3>
      </div>

      <TransactionTabPreview colors={colors} activePreview={activePreview} />

      {activePreview === "comingSoon" ? (
        <ComingSoonPreview colors={colors} />
      ) : (
        <>
          <HistoryTopPreview colors={colors} activePreview={activePreview} />
          {(activePreview === "deposit" || activePreview === "autoDeposit") && (
            <FilterPreview colors={colors} />
          )}
          <div
            className="space-y-3 p-3"
            style={{ backgroundColor: colors.sectionBg }}
          >
            {activePreview === "deposit" && <DepositPreview colors={colors} />}
            {activePreview === "autoDeposit" && (
              <AutoDepositPreview colors={colors} />
            )}
            {activePreview === "withdraw" && (
              <WithdrawPreview colors={colors} />
            )}
            {activePreview === "bet" && <BetPreview colors={colors} />}
            {activePreview === "turnover" && (
              <TurnoverPreview colors={colors} />
            )}
          </div>
          <PaginationPreview colors={colors} />
        </>
      )}
    </div>
  );
};

const TransactionTabPreview = ({ colors, activePreview }) => {
  const tabs = [
    ["withdraw", "Withdraw"],
    ["bet", "Bet"],
    ["deposit", "Deposit"],
    ["autoDeposit", "Auto"],
    ["turnover", "Turnover"],
  ];

  return (
    <div className="px-3 pb-3" style={{ backgroundColor: colors.headerBg }}>
      <div className="flex gap-2 overflow-hidden">
        {tabs.map(([key, label]) => {
          const active = key === activePreview;

          return (
            <button
              key={key}
              type="button"
              className="h-[32px] cursor-pointer rounded-[4px] px-3 text-[11px] font-bold"
              style={{
                backgroundColor: active
                  ? colors.secondaryBg
                  : colors.inactiveTabBg,
                color: active ? colors.secondaryText : colors.inactiveTabText,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const HistoryTopPreview = ({ colors, activePreview }) => {
  return (
    <div className="px-4 pb-4" style={{ backgroundColor: colors.headerBg }}>
      <div
        className="rounded-[4px] px-4 py-3"
        style={{
          backgroundColor: "rgba(255,255,255,.10)",
          color: colors.headerText,
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
              <Receipt size={20} />
            </div>
            <div>
              <p className="text-[13px] font-bold">
                {activePreview === "bet"
                  ? "Your bet history"
                  : activePreview === "turnover"
                    ? "Your turnover history"
                    : activePreview === "withdraw"
                      ? "Your withdraw history"
                      : activePreview === "autoDeposit"
                        ? "Your auto deposit list"
                        : "Your deposit request list"}
              </p>
              <p className="mt-1 text-[11px] opacity-80">Total: 12</p>
            </div>
          </div>
          <button
            type="button"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded bg-white/15"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

const FilterPreview = ({ colors }) => {
  return (
    <div
      className="border-b px-4 py-3"
      style={{
        backgroundColor: colors.modalBg,
        borderColor: colors.sectionBorder,
      }}
    >
      <div className="space-y-2">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: colors.primaryBg }}
          />
          <input
            readOnly
            value="Transaction search"
            className="h-[36px] w-full rounded-[4px] border pl-9 pr-3 text-[12px] outline-none"
            style={{
              backgroundColor: colors.inputBg,
              borderColor: colors.inputBorder,
              color: colors.inputText,
            }}
          />
        </div>

        <div className="grid grid-cols-[1fr_40px] gap-2">
          <select
            value="all"
            readOnly
            className="h-[36px] cursor-pointer rounded-[4px] border px-3 text-[12px] outline-none"
            style={{
              backgroundColor: colors.inputBg,
              borderColor: colors.inputBorder,
              color: colors.inputText,
            }}
          >
            <option>All</option>
          </select>

          <button
            type="button"
            className="flex h-[36px] cursor-pointer items-center justify-center rounded-[4px]"
            style={{
              backgroundColor: colors.primaryBg,
              color: colors.primaryText,
            }}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const DepositPreview = ({ colors }) => (
  <HistoryCard colors={colors} title="BKASH Deposit" status="pending">
    <GridBox
      colors={colors}
      icon={<Wallet size={13} />}
      label="Amount"
      value="৳ 1,000"
      primary
    />
    <GridBox
      colors={colors}
      icon={<Gift size={13} />}
      label="Bonus"
      value="৳ 100"
    />
    <GridBox
      colors={colors}
      icon={<CheckCircle2 size={13} />}
      label="Credited"
      value="৳ 1,100"
      success
    />
    <GridBox
      colors={colors}
      icon={<RotateCcw size={13} />}
      label="Turnover"
      value="x2"
    />
    <SummaryBlock colors={colors} text="Transaction: TXN123456" />
  </HistoryCard>
);

const AutoDepositPreview = ({ colors }) => (
  <HistoryCard colors={colors} title="AUTO-USER-12345" status="paid">
    <GridBox
      colors={colors}
      icon={<Wallet size={13} />}
      label="Deposit"
      value="৳ 2,000"
      primary
    />
    <GridBox
      colors={colors}
      icon={<Gift size={13} />}
      label="Bonus"
      value="৳ 2,000"
    />
    <GridBox
      colors={colors}
      icon={<CheckCircle2 size={13} />}
      label="Credited"
      value="৳ 4,000"
      success
    />
    <GridBox
      colors={colors}
      icon={<RotateCcw size={13} />}
      label="Turnover"
      value="x3"
    />
    <SummaryBlock colors={colors} text="Welcome Bonus | First Deposit Only" />
  </HistoryCard>
);

const WithdrawPreview = ({ colors }) => (
  <HistoryCard colors={colors} title="BKASH Withdraw" status="approved">
    <GridBox
      colors={colors}
      icon={<Wallet size={13} />}
      label="Amount"
      value="৳ 500"
      primary
    />
    <GridBox
      colors={colors}
      icon={<Receipt size={13} />}
      label="Method"
      value="BKASH"
    />
    <GridBox
      colors={colors}
      icon={<Wallet size={13} />}
      label="Wallet"
      value="01700000000"
    />
    <GridBox
      colors={colors}
      icon={<CheckCircle2 size={13} />}
      label="Status"
      value="Approved"
      success
    />
    <SummaryBlock
      colors={colors}
      text="Balance Before: ৳1,500 | After: ৳1,000"
    />
  </HistoryCard>
);

const BetPreview = ({ colors }) => (
  <HistoryCard colors={colors} title="Game: PGSOFT-001" status="loss">
    <GridBox
      colors={colors}
      icon={<Wallet size={13} />}
      label="Bet"
      value="৳ 100"
      primary
    />
    <GridBox
      colors={colors}
      icon={<Gamepad2 size={13} />}
      label="Win"
      value="৳ 0"
    />
    <GridBox
      colors={colors}
      icon={<Receipt size={13} />}
      label="Net"
      value="-৳100"
      danger
    />
    <GridBox
      colors={colors}
      icon={<Clock3 size={13} />}
      label="Status"
      value="Lost"
    />
    <SummaryBlock colors={colors} text="Round: RND123456 | Serial: SN987654" />
  </HistoryCard>
);

const TurnoverPreview = ({ colors }) => (
  <HistoryCard colors={colors} title="Auto Deposit Turnover" status="running">
    <GridBox
      colors={colors}
      icon={<Wallet size={13} />}
      label="Required"
      value="৳ 4,000"
      primary
    />
    <GridBox
      colors={colors}
      icon={<Gamepad2 size={13} />}
      label="Progress"
      value="৳ 1,200"
    />
    <GridBox
      colors={colors}
      icon={<Receipt size={13} />}
      label="Credited"
      value="৳ 2,000"
    />
    <GridBox
      colors={colors}
      icon={<Clock3 size={13} />}
      label="Status"
      value="Running"
    />
    <div
      className="mt-3 rounded-[4px] p-3"
      style={{ backgroundColor: colors.summaryBg }}
    >
      <div
        className="mb-2 flex justify-between text-[12px] font-bold"
        style={{ color: colors.summaryText }}
      >
        <span>Progress</span>
        <span>30%</span>
      </div>
      <div
        className="h-[8px] overflow-hidden rounded-full"
        style={{ backgroundColor: colors.progressTrackBg }}
      >
        <div
          className="h-full rounded-full"
          style={{ width: "30%", backgroundColor: colors.progressBg }}
        />
      </div>
    </div>
  </HistoryCard>
);

const ComingSoonPreview = ({ colors }) => (
  <div
    className="flex min-h-[390px] items-center justify-center px-5"
    style={{ backgroundColor: colors.sectionBg }}
  >
    <div className="text-center">
      <div
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full"
        style={{
          backgroundColor: colors.summaryBg,
          color: colors.summaryText,
        }}
      >
        <Clock size={42} />
      </div>

      <h3
        className="mt-5 text-[22px] font-bold"
        style={{ color: colors.primaryBg }}
      >
        Coming Soon
      </h3>

      <p
        className="mx-auto mt-2 max-w-[260px] text-[13px] leading-6"
        style={{ color: colors.mutedText }}
      >
        This history service will be available soon.
      </p>
    </div>
  </div>
);

const HistoryCard = ({ colors, title, status, children }) => {
  const badge = getBadge(colors, status);

  return (
    <div
      className="rounded-[6px] border p-4 shadow-sm"
      style={{
        backgroundColor: colors.cardBg,
        borderColor: colors.cardBorder,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className="truncate text-[14px] font-bold"
            style={{ color: colors.normalText }}
          >
            {title}
          </p>
          <p className="mt-1 text-[12px]" style={{ color: colors.mutedText }}>
            Date: Jun 27, 2026
          </p>
        </div>

        <span
          className="flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-bold capitalize"
          style={{
            backgroundColor: badge.bg,
            color: badge.text,
            borderColor: badge.bg,
          }}
        >
          {badge.icon}
          {badge.label}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">{children}</div>
    </div>
  );
};

const GridBox = ({ colors, icon, label, value, primary, success, danger }) => (
  <div
    className="rounded-[4px] p-2"
    style={{ backgroundColor: colors.summaryBg }}
  >
    <div
      className="flex items-center gap-1"
      style={{ color: colors.mutedText }}
    >
      {icon}
      <span>{label}</span>
    </div>

    <p
      className="mt-1 font-bold"
      style={{
        color: success
          ? colors.successText
          : danger
            ? colors.dangerText
            : primary
              ? colors.primaryBg
              : colors.normalText,
      }}
    >
      {value}
    </p>
  </div>
);

const SummaryBlock = ({ colors, text }) => (
  <div
    className="col-span-2 mt-1 rounded-[4px] p-3 text-[12px]"
    style={{
      backgroundColor: colors.summaryBg,
      color: colors.mutedText,
    }}
  >
    {text}
  </div>
);

const PaginationPreview = ({ colors }) => (
  <div
    className="border-t px-4 py-3"
    style={{
      backgroundColor: colors.modalBg,
      borderColor: colors.sectionBorder,
    }}
  >
    <div
      className="mb-3 flex items-center justify-between text-[12px]"
      style={{ color: colors.mutedText }}
    >
      <span>Page 1 of 5</span>
      <span>Total: 50</span>
    </div>

    <div className="grid grid-cols-3 gap-2">
      <button
        type="button"
        className="flex h-[34px] cursor-pointer items-center justify-center gap-1 rounded-[4px] border text-[12px]"
        style={{
          backgroundColor: colors.cardBg,
          borderColor: colors.cardBorder,
          color: colors.normalText,
        }}
      >
        <ChevronLeft size={14} />
        Prev
      </button>

      <button
        type="button"
        className="h-[34px] cursor-pointer rounded-[4px] text-[12px] font-bold"
        style={{
          backgroundColor: colors.primaryBg,
          color: colors.primaryText,
        }}
      >
        Back
      </button>

      <button
        type="button"
        className="flex h-[34px] cursor-pointer items-center justify-center gap-1 rounded-[4px] border text-[12px]"
        style={{
          backgroundColor: colors.cardBg,
          borderColor: colors.cardBorder,
          color: colors.normalText,
        }}
      >
        Next
        <ChevronRight size={14} />
      </button>
    </div>
  </div>
);

const getBadge = (colors, status) => {
  if (status === "paid" || status === "approved") {
    return {
      label: status,
      bg: colors.successBg,
      text: colors.successText,
      icon: <CheckCircle2 size={14} />,
    };
  }

  if (status === "failed" || status === "rejected" || status === "loss") {
    return {
      label: status,
      bg: colors.dangerBg,
      text: colors.dangerText,
      icon: <XCircle size={14} />,
    };
  }

  return {
    label: status,
    bg: colors.warningBg,
    text: colors.warningText,
    icon: <Clock3 size={14} />,
  };
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

export default TransactionHistoryColorSetting;
