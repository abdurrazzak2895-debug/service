import React, { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Loader2,
  Palette,
  RefreshCw,
  RotateCcw,
  Save,
  X,
  Wallet,
  Gift,
  AlertCircle,
  User,
  Lock,
  BadgePercent,
  ReceiptText,
  CreditCard,
  ShieldCheck,
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
  primaryHoverBg: "#075894",

  secondaryBg: "#2e9bf3",
  secondaryText: "#ffffff",

  inactiveTabBg: "#00518c",
  inactiveTabText: "#ffffff",

  promotionBg: "#e9b20d",
  promotionText: "#ffffff",

  sectionBg: "#eef4ff",
  sectionBorder: "#97b6e9",
  sectionText: "#2451cc",

  cardBg: "#ffffff",
  cardBorder: "#d7d7d7",

  inputBg: "#eeeeee",
  inputText: "#222222",
  inputBorder: "#d7d7d7",
  inputFocusBorder: "#0865a9",

  labelText: "#333333",
  normalText: "#333333",
  mutedText: "#777777",

  summaryBg: "#eef7ff",
  summaryText: "#0865a9",

  disabledBg: "#a6a6a6",
  disabledText: "#ffffff",

  dangerBg: "#e95b5b",
  dangerText: "#ffffff",

  successBg: "#22c55e",
  successText: "#ffffff",
};

const inputClass =
  "w-full rounded-xl border border-[#1A79D3]/25 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#3ea0ff] focus:ring-2 focus:ring-[#1A79D3]/20";

const labelClass = "mb-2 block text-sm font-bold text-blue-100";

const ModalColorSetting = () => {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [activePreview, setActivePreview] = useState("depositFunds");

  const previews = useMemo(
    () => [
      { key: "depositFunds", label: "Deposit Funds", icon: Wallet },
      { key: "depositConfirm", label: "Deposit Confirm", icon: CreditCard },
      { key: "autoDeposit", label: "Auto Deposit", icon: ShieldCheck },
      { key: "withdraw", label: "Withdraw", icon: ReceiptText },
      { key: "personalInfo", label: "Personal Info", icon: User },
      { key: "passwordChange", label: "Password Change", icon: Lock },
      { key: "promotion", label: "Promotion", icon: BadgePercent },
      { key: "referRedeem", label: "Refer & Redeem", icon: Gift },
    ],
    [],
  );

  const loadSetting = async () => {
    try {
      setPageLoading(true);
      const res = await api.get("/api/modal-color-settings");
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
      await api.put("/api/modal-color-settings", form);
      toast.success("Modal color setting saved successfully");
      await loadSetting();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    const ok = window.confirm(
      "Are you sure you want to reset all modal colors?",
    );
    if (!ok) return;

    try {
      setLoading(true);
      const res = await api.patch("/api/modal-color-settings/reset");
      setForm({ ...defaultForm, ...(res.data?.data || {}) });
      toast.success("Modal color reset successfully");
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
              Modal{" "}
              <span className="bg-gradient-to-r from-[#3ea0ff] to-blue-100 bg-clip-text text-transparent">
                Color Setting
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Control colors for deposit, withdraw, profile, password, promotion
              and refer modals.
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
        className="grid gap-6 xl:grid-cols-[1fr_460px]"
      >
        <div className="space-y-6">
          <Section title="Main Modal">
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

          <Section title="Header">
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
            </div>
          </Section>

          <Section title="Buttons & Tabs">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
                label="Primary Hover"
                value={form.primaryHoverBg}
                onChange={(v) => setColor("primaryHoverBg", v)}
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

          <Section title="Promotion & Section">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <ColorInput
                label="Promotion BG"
                value={form.promotionBg}
                onChange={(v) => setColor("promotionBg", v)}
              />
              <ColorInput
                label="Promotion Text"
                value={form.promotionText}
                onChange={(v) => setColor("promotionText", v)}
              />

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
            </div>
          </Section>

          <Section title="Cards & Inputs">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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

          <Section title="Text & State Colors">
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
                label="Disabled BG"
                value={form.disabledBg}
                onChange={(v) => setColor("disabledBg", v)}
              />
              <ColorInput
                label="Disabled Text"
                value={form.disabledText}
                onChange={(v) => setColor("disabledText", v)}
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
                label="Success BG"
                value={form.successBg}
                onChange={(v) => setColor("successBg", v)}
              />
              <ColorInput
                label="Success Text"
                value={form.successText}
                onChange={(v) => setColor("successText", v)}
              />
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <section className="sticky top-6 rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <BadgeCheck className="h-5 w-5 text-[#3ea0ff]" />
              <h2 className="text-xl font-black">Global Preview</h2>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2">
              {previews.map((item) => {
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
              <PreviewModal type={activePreview} colors={form} />
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
              {loading ? "Saving..." : "Save Modal Colors"}
            </button>
          </section>
        </div>
      </form>
    </div>
  );
};

const PreviewModal = ({ type, colors }) => {
  const titleMap = {
    depositFunds: "Deposit Funds",
    depositConfirm: "Confirm Deposit",
    autoDeposit: "Auto Deposit",
    withdraw: "Withdraw",
    personalInfo: "Personal Info",
    passwordChange: "Change Password",
    promotion: "Promotion",
    referRedeem: "Refer & Redeem",
  };

  return (
    <div
      className="mx-auto w-full max-w-[375px] overflow-hidden rounded-[8px] shadow-2xl"
      style={{ backgroundColor: colors.modalBg }}
    >
      <div
        className="relative flex h-[50px] items-center justify-center"
        style={{ backgroundColor: colors.headerBg, color: colors.headerText }}
      >
        <h3 className="text-[17px] font-semibold">{titleMap[type]}</h3>

        <button
          type="button"
          className="absolute right-3 cursor-pointer"
          style={{ color: colors.closeIconColor }}
        >
          <X size={22} />
        </button>
      </div>

      {(type === "depositFunds" || type === "autoDeposit") && (
        <div
          className="flex h-[52px] items-center gap-1 px-4 pb-3"
          style={{ backgroundColor: colors.headerBg }}
        >
          <button
            type="button"
            className="h-[34px] flex-1 cursor-pointer rounded-[3px] text-[13px] font-bold"
            style={{
              backgroundColor:
                type === "depositFunds"
                  ? colors.secondaryBg
                  : colors.inactiveTabBg,
              color:
                type === "depositFunds"
                  ? colors.secondaryText
                  : colors.inactiveTabText,
            }}
          >
            Deposit
          </button>

          <button
            type="button"
            className="h-[34px] flex-1 cursor-pointer rounded-[3px] text-[13px] font-bold"
            style={{
              backgroundColor:
                type === "autoDeposit"
                  ? colors.secondaryBg
                  : colors.inactiveTabBg,
              color:
                type === "autoDeposit"
                  ? colors.secondaryText
                  : colors.inactiveTabText,
            }}
          >
            Auto Deposit
          </button>
        </div>
      )}

      <div className="space-y-4 p-4">
        {type === "depositFunds" && <DepositFundsPreview colors={colors} />}
        {type === "depositConfirm" && <DepositConfirmPreview colors={colors} />}
        {type === "autoDeposit" && <AutoDepositPreview colors={colors} />}
        {type === "withdraw" && <WithdrawPreview colors={colors} />}
        {type === "personalInfo" && <PersonalInfoPreview colors={colors} />}
        {type === "passwordChange" && <PasswordChangePreview colors={colors} />}
        {type === "promotion" && <PromotionPreview colors={colors} />}
        {type === "referRedeem" && <ReferRedeemPreview colors={colors} />}
      </div>
    </div>
  );
};

const DepositFundsPreview = ({ colors }) => (
  <>
    <PromotionButton colors={colors} text="Select Promotion" />
    <InfoBox
      colors={colors}
      text="Below info are required to proceed deposit request."
    />
    <Card colors={colors} title="Payment Method" icon={Wallet}>
      <div className="grid grid-cols-3 gap-2">
        {["BKASH", "NAGAD", "ROCKET"].map((x, i) => (
          <button
            key={x}
            type="button"
            className="h-[60px] cursor-pointer rounded border text-xs font-bold"
            style={{
              backgroundColor: colors.cardBg,
              borderColor: i === 0 ? colors.primaryBg : colors.cardBorder,
              color: colors.normalText,
            }}
          >
            {x}
          </button>
        ))}
      </div>
    </Card>
    <InputPreview colors={colors} label="Deposit Amount" value="1000" />
    <Summary colors={colors} />
    <PrimaryButton colors={colors} text="Submit" />
  </>
);

const DepositConfirmPreview = ({ colors }) => (
  <>
    <div className="flex items-center justify-between">
      <div>
        <h3
          style={{ color: colors.normalText }}
          className="text-[16px] font-bold"
        >
          BKASH
        </h3>
        <p style={{ color: colors.mutedText }} className="text-xs">
          Time left: <span style={{ color: colors.dangerBg }}>14:59</span>
        </p>
      </div>

      <button
        type="button"
        className="cursor-pointer rounded border px-3 py-1 text-xs"
        style={{ borderColor: colors.cardBorder, color: colors.primaryBg }}
      >
        Back
      </button>
    </div>

    <InfoBox
      colors={colors}
      text="Send money to the number below and submit correct information."
    />
    <InputPreview colors={colors} label="Amount" value="৳ 1000" />
    <InputPreview colors={colors} label="Deposit Number" value="01700000000" />
    <InputPreview colors={colors} label="Transaction ID" value="TXN123456" />
    <Summary colors={colors} />
    <PrimaryButton colors={colors} text="Submit" />
  </>
);

const AutoDepositPreview = ({ colors }) => (
  <>
    <PromotionButton colors={colors} text="Select Bonus" />
    <InfoBox
      colors={colors}
      text="First Deposit bonus note will appear here."
    />
    <Card colors={colors} title="Deposit Amount" icon={Wallet}>
      <InputOnly colors={colors} value="2000" />
      <p className="mt-2 text-xs" style={{ color: colors.mutedText }}>
        Min: ৳100 | Max: ৳25,000
      </p>
    </Card>
    <Summary colors={colors} />
    <Card colors={colors} title="Welcome Bonus" icon={Gift}>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <SmallBox colors={colors} label="Bonus" value="+100%" />
        <SmallBox colors={colors} label="Scope" value="First Deposit" />
      </div>
    </Card>
    <PrimaryButton colors={colors} text="Submit" />
  </>
);

const WithdrawPreview = ({ colors }) => (
  <>
    <InfoBox
      colors={colors}
      text="Withdraw is blocked until turnover is completed."
    />
    <Card colors={colors} title="Select Withdraw Method" icon={Wallet}>
      <div className="grid grid-cols-3 gap-2">
        {["BKASH", "NAGAD", "BANK"].map((x, i) => (
          <button
            key={x}
            type="button"
            className="h-[50px] cursor-pointer rounded border text-xs font-bold"
            style={{
              backgroundColor: colors.cardBg,
              borderColor: i === 0 ? colors.primaryBg : colors.cardBorder,
              color: colors.normalText,
            }}
          >
            {x}
          </button>
        ))}
      </div>
    </Card>
    <Card colors={colors} title="Selected Wallet" icon={CreditCard}>
      <p className="text-sm" style={{ color: colors.normalText }}>
        Personal - 01700000000
      </p>
    </Card>
    <InputPreview colors={colors} label="Withdraw Amount" value="500" />
    <PrimaryButton colors={colors} text="Submit Withdraw" />
  </>
);

const PersonalInfoPreview = ({ colors }) => (
  <>
    <Card colors={colors} title="Profile Details" icon={User}>
      <InputPreview colors={colors} label="First Name" value="Oracle" />
      <InputPreview colors={colors} label="Last Name" value="Soft" />
      <InputPreview colors={colors} label="Phone" value="01700000000" />
    </Card>
    <InfoBox colors={colors} text="Keep your account information updated." />
    <PrimaryButton colors={colors} text="Update Profile" />
  </>
);

const PasswordChangePreview = ({ colors }) => (
  <>
    <Card colors={colors} title="Security" icon={Lock}>
      <InputPreview colors={colors} label="Old Password" value="********" />
      <InputPreview colors={colors} label="New Password" value="********" />
      <InputPreview colors={colors} label="Confirm Password" value="********" />
    </Card>
    <InfoBox
      colors={colors}
      text="Use strong password for your account safety."
    />
    <PrimaryButton colors={colors} text="Change Password" />
  </>
);

const PromotionPreview = ({ colors }) => (
  <>
    <PromotionButton colors={colors} text="Welcome Offer" />
    <Card colors={colors} title="200% Deposit Bonus" icon={BadgePercent}>
      <p className="text-sm leading-5" style={{ color: colors.normalText }}>
        Register and deposit to enjoy promotional bonus.
      </p>
      <p className="mt-2 text-xs" style={{ color: colors.mutedText }}>
        Valid for selected users only.
      </p>
    </Card>
    <Summary colors={colors} />
    <PrimaryButton colors={colors} text="Claim Now" />
  </>
);

const ReferRedeemPreview = ({ colors }) => (
  <>
    <Card colors={colors} title="Refer Bonus" icon={Gift}>
      <div className="grid grid-cols-2 gap-2">
        <SmallBox colors={colors} label="VIP Points" value="1,200" />
        <SmallBox colors={colors} label="Bonus Wallet" value="৳120" />
      </div>
    </Card>
    <InfoBox
      colors={colors}
      text="Share your referral link and earn rewards."
    />
    <InputPreview colors={colors} label="Referral Code" value="ABC123" />
    <PrimaryButton colors={colors} text="Redeem Bonus" />
  </>
);

const PromotionButton = ({ colors, text }) => (
  <button
    type="button"
    className="flex h-[40px] w-full cursor-pointer items-center justify-between rounded-[3px] px-3 text-sm font-bold"
    style={{ backgroundColor: colors.promotionBg, color: colors.promotionText }}
  >
    <span className="flex items-center gap-2">
      <BadgePercent size={17} />
      {text}
    </span>
    <span>⌄</span>
  </button>
);

const InfoBox = ({ colors, text }) => (
  <div
    className="rounded-[4px] border p-3"
    style={{
      backgroundColor: colors.sectionBg,
      borderColor: colors.sectionBorder,
      color: colors.sectionText,
    }}
  >
    <div className="flex items-start gap-2 text-sm">
      <AlertCircle size={17} className="shrink-0" />
      <p>{text}</p>
    </div>
  </div>
);

const Card = ({ colors, title, icon: Icon, children }) => (
  <div
    className="rounded-[4px] border p-3"
    style={{
      backgroundColor: colors.cardBg,
      borderColor: colors.cardBorder,
    }}
  >
    <div
      className="mb-3 flex items-center gap-2 text-sm font-bold"
      style={{ color: colors.labelText }}
    >
      <Icon size={17} />
      {title}
    </div>
    {children}
  </div>
);

const InputPreview = ({ colors, label, value }) => (
  <div className="mt-2">
    <label
      className="mb-1 block text-xs font-bold"
      style={{ color: colors.labelText }}
    >
      {label}
    </label>
    <InputOnly colors={colors} value={value} />
  </div>
);

const InputOnly = ({ colors, value }) => (
  <input
    value={value}
    readOnly
    className="h-[42px] w-full rounded-[4px] px-4 text-sm outline-none"
    style={{
      backgroundColor: colors.inputBg,
      color: colors.inputText,
      border: `1px solid ${colors.inputBorder}`,
    }}
  />
);

const Summary = ({ colors }) => (
  <div
    className="rounded-[4px] p-3 text-xs"
    style={{ backgroundColor: colors.summaryBg, color: colors.summaryText }}
  >
    <div className="flex justify-between">
      <span>Bonus</span>
      <span>৳100</span>
    </div>
    <div className="mt-1 flex justify-between font-bold">
      <span>Credited</span>
      <span>৳1,100</span>
    </div>
    <div className="mt-1 flex justify-between">
      <span>Turnover</span>
      <span>x2 / ৳2,200</span>
    </div>
  </div>
);

const SmallBox = ({ colors, label, value }) => (
  <div className="rounded p-2" style={{ backgroundColor: colors.summaryBg }}>
    <p className="text-xs" style={{ color: colors.mutedText }}>
      {label}
    </p>
    <p className="text-sm font-bold" style={{ color: colors.summaryText }}>
      {value}
    </p>
  </div>
);

const PrimaryButton = ({ colors, text }) => (
  <button
    type="button"
    className="h-[38px] w-full cursor-pointer rounded-[2px] text-sm font-medium"
    style={{ backgroundColor: colors.primaryBg, color: colors.primaryText }}
  >
    {text}
  </button>
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
        placeholder="#000000"
      />
    </div>
  </div>
);

export default ModalColorSetting;
