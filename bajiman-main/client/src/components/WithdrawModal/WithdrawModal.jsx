import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Wallet,
  AlertCircle,
  Loader2,
  Plus,
  Phone,
  CheckCircle2,
  ChevronUp,
} from "lucide-react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import api from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";
import { selectIsAuth, selectUser } from "../../features/auth/authSelectors";
import { selectModalColorSetting } from "../../features/global/globalSelectors";
import AddEWalletFlow from "./AddEWalletFlow";
import OtpVerifyBox from "../OtpVerifyBox/OtpVerifyBox";
import useOtpSetting from "../../hook/useOtpSetting";

const defaultModalColors = {
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

  sectionBg: "#eef4ff",
  sectionBorder: "#97b6e9",
  sectionText: "#2451cc",

  cardBg: "#ffffff",
  cardBorder: "#dce8f5",

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

const money = (value) => {
  const num = Number(value || 0);
  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${import.meta.env.VITE_API_URL}${url}`;
};

const MANUAL_WALLET_CAP = 4;
const PRESET_AMOUNTS = [300, 1000, 2000, 5000, 10000, 15000, 20000, 25000];

const WithdrawModal = ({ open, onClose, onHistoryClick, onDepositClick }) => {
  const { isBangla, language } = useLanguage();

  const isAuthenticated = useSelector(selectIsAuth);
  const user = useSelector(selectUser);

  const modalColorSetting = useSelector(selectModalColorSetting);
  const colors = {
    ...defaultModalColors,
    ...(modalColorSetting || {}),
  };

  const { withdrawEnabled: withdrawOtpEnabled } = useOtpSetting();

  const [loading, setLoading] = useState(true);
  const [eligibilityLoading, setEligibilityLoading] = useState(true);
  const [methods, setMethods] = useState([]);
  const [wallets, setWallets] = useState([]);

  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [selectedWalletId, setSelectedWalletId] = useState("");
  const [showAddWallet, setShowAddWallet] = useState(false);

  const [amount, setAmount] = useState("");

  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);

  // Withdraw-confirm OTP step: submitting the request itself needs a
  // second OTP (sent to the registration phone), same as adding a wallet.
  const [confirmStep, setConfirmStep] = useState("form");
  const [maskedPhone, setMaskedPhone] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);

  const [eligibility, setEligibility] = useState({
    eligible: false,
    hasRunningTurnover: false,
    hasPendingWithdraw: false,
    remaining: 0,
    message: "",
  });

  const t = {
    title: isBangla ? "উইথড্র" : "Withdraw",
    history: isBangla ? "হিস্টোরি" : "History",
    deposit: isBangla ? "ডিপোজিট" : "Deposit",
    loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
    loginRequired: isBangla
      ? "উইথড্র করতে আগে লগইন করুন"
      : "Please login first to withdraw.",
    method: isBangla ? "উইথড্র মেথড নির্বাচন করুন" : "Select Withdraw Method",
    wallet: isBangla ? "ওয়ালেট নির্বাচন করুন" : "Select Wallet",
    addWallet: isBangla ? "ওয়ালেট যোগ করুন" : "Add Wallet",
    closeWallet: isBangla ? "ওয়ালেট ফর্ম বন্ধ করুন" : "Close Wallet Form",
    maxWalletText: isBangla
      ? "রেজিস্ট্রেশন নাম্বার সবসময় available, এর বাইরে সর্বোচ্চ ৪টি নাম্বার যোগ করা যাবে।"
      : "The registration number is always available; you can add up to 4 more numbers.",
    maxWalletReached: isBangla
      ? "৪টির বেশি নাম্বার যোগ করা যাবে না।"
      : "You cannot add more than 4 numbers.",
    registrationNumber: isBangla
      ? "রেজিস্ট্রেশন নাম্বার"
      : "Registration Number",
    amount: isBangla ? "উইথড্র এমাউন্ট" : "Withdraw Amount",
    enterAmount: isBangla ? "এমাউন্ট লিখুন" : "Enter amount",
    min: isBangla ? "সর্বনিম্ন" : "Min",
    max: isBangla ? "সর্বোচ্চ" : "Max",
    submit: isBangla ? "উইথড্র সাবমিট" : "Submit Withdraw",
    confirmWithdraw: isBangla ? "কনফার্ম করে উইথড্র করুন" : "Confirm & Withdraw",
    processing: isBangla ? "প্রসেস হচ্ছে..." : "Processing...",
    sendingOtp: isBangla ? "OTP পাঠানো হচ্ছে..." : "Sending OTP...",
    noMethod: isBangla
      ? "কোনো active withdraw method পাওয়া যায়নি"
      : "No active withdraw method found",
    noWallet: isBangla
      ? "কোনো wallet নেই। Add Wallet বাটনে ক্লিক করে wallet যোগ করুন।"
      : "No wallet found. Click Add Wallet to add one.",
    turnoverTitle: isBangla ? "টার্নওভার বাকি আছে" : "Turnover Required",
    pendingTitle: isBangla ? "পেন্ডিং উইথড্র আছে" : "Pending Withdraw Exists",
    eligibleTitle: isBangla ? "উইথড্র করা যাবে" : "Withdraw Available",
    remaining: isBangla ? "বাকি টার্নওভার" : "Remaining Turnover",
    balance: isBangla ? "ব্যালেন্স" : "Balance",
    invalidAmount: isBangla ? "সঠিক এমাউন্ট দিন" : "Enter valid amount",
    invalidWallet: isBangla
      ? "একটি wallet নির্বাচন করুন"
      : "Please select a wallet",
    invalidMethod: isBangla
      ? "একটি withdraw method নির্বাচন করুন"
      : "Please select withdraw method",
    requestCreated: isBangla
      ? "উইথড্র request submit হয়েছে"
      : "Withdraw request submitted",
    secureText: isBangla
      ? "টার্নওভার পূরণ না হলে withdraw করা যাবে না"
      : "Withdraw is blocked until turnover is completed",
  };

  const selectedMethod = useMemo(
    () =>
      methods.find(
        (item) => String(item.methodId) === String(selectedMethodId),
      ) || null,
    [methods, selectedMethodId],
  );

  const amountNum = Number(amount || 0);
  const minAmount = Number(selectedMethod?.minimumWithdrawAmount || 0);
  const maxAmount = Number(selectedMethod?.maximumWithdrawAmount || 0);
  const userBalance = Number(user?.balance || 0);

  const manualWalletCount = wallets.filter(
    (item) => !item.isAutoRegistration,
  ).length;
  const walletLimitReached = manualWalletCount >= MANUAL_WALLET_CAP;

  const visiblePresets = useMemo(
    () =>
      PRESET_AMOUNTS.filter(
        (value) =>
          (minAmount <= 0 || value >= minAmount) &&
          (maxAmount <= 0 || value <= maxAmount),
      ),
    [minAmount, maxAmount],
  );

  const amountValid =
    Number.isFinite(amountNum) &&
    amountNum > 0 &&
    (minAmount <= 0 || amountNum >= minAmount) &&
    (maxAmount <= 0 || amountNum <= maxAmount) &&
    amountNum <= userBalance;

  const canWithdraw =
    isAuthenticated &&
    eligibility?.eligible &&
    selectedMethodId &&
    selectedWalletId &&
    amountValid &&
    !submittingWithdraw &&
    !sendingOtp;

  const loadMethods = async () => {
    const { data } = await api.get("/api/withdraw-methods/public");
    const list = Array.isArray(data?.data) ? data.data : [];

    setMethods(list);

    if (list.length && !selectedMethodId) {
      setSelectedMethodId(list[0].methodId);
    }
  };

  const loadWallets = async () => {
    if (!isAuthenticated) return;

    const { data } = await api.get("/api/e-wallets");
    const list = Array.isArray(data?.data) ? data.data : [];

    setWallets(list);

    const defaultWallet = list.find((item) => item.isDefault) || list[0];
    setSelectedWalletId(defaultWallet?._id || "");
  };

  const loadEligibility = async () => {
    if (!isAuthenticated) {
      setEligibility({
        eligible: false,
        hasRunningTurnover: false,
        hasPendingWithdraw: false,
        remaining: 0,
        message: t.loginRequired,
      });
      return;
    }

    const { data } = await api.get("/api/withdraw-requests/eligibility");

    setEligibility({
      eligible: !!data?.data?.eligible,
      hasRunningTurnover: !!data?.data?.hasRunningTurnover,
      hasPendingWithdraw: !!data?.data?.hasPendingWithdraw,
      remaining: Number(data?.data?.remaining || 0),
      message: data?.data?.message || "",
    });
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      setEligibilityLoading(true);
      await Promise.all([loadMethods(), loadEligibility()]);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load withdraw");
    } finally {
      setLoading(false);
      setEligibilityLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setConfirmStep("form");
      setMaskedPhone("");
      setResendSeconds(0);
      return;
    }

    setShowAddWallet(false);
    loadAll();
    loadWallets().catch((error) => {
      toast.error(error?.response?.data?.message || "Failed to load wallets");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (resendSeconds <= 0) return undefined;

    const timer = setInterval(() => {
      setResendSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendSeconds]);

  const handleSelectMethod = (methodId) => {
    setSelectedMethodId(methodId);
  };

  const handleWalletCreated = async (createdWallet) => {
    await loadWallets();
    setSelectedWalletId(createdWallet?._id || "");
  };

  const submitWithdraw = async (otpValue = "") => {
    try {
      setSubmittingWithdraw(true);

      const { data } = await api.post("/api/withdraw-requests", {
        methodId: selectedMethodId,
        walletId: selectedWalletId,
        amount: amountNum,
        otp: otpValue,
      });

      if (!data?.success) {
        throw new Error(data?.message || "Withdraw request failed");
      }

      toast.success(data?.message || t.requestCreated);
      setAmount("");
      setConfirmStep("form");

      await loadEligibility();
      onClose?.();
      onHistoryClick?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message);
    } finally {
      setSubmittingWithdraw(false);
    }
  };

  const handleSendWithdrawOtp = async () => {
    try {
      setSendingOtp(true);

      const { data } = await api.post("/api/e-wallets/send-otp");

      if (!data?.success) {
        throw new Error(data?.message || "OTP send failed");
      }

      setMaskedPhone(data?.maskedPhone || "");
      setResendSeconds(Number(data?.resendAfter || 60));
      setConfirmStep("otp");
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleWithdraw = async () => {
    if (!isAuthenticated) return toast.error(t.loginRequired);
    if (!eligibility?.eligible)
      return toast.error(eligibility?.message || t.secureText);
    if (!selectedMethodId) return toast.error(t.invalidMethod);
    if (!selectedWalletId) return toast.error(t.invalidWallet);
    if (!amountValid) return toast.error(t.invalidAmount);

    if (withdrawOtpEnabled) {
      handleSendWithdrawOtp();
      return;
    }

    await submitWithdraw("");
  };

  const EligibilityBox = () => {
    if (eligibilityLoading) {
      return (
        <div
          className="rounded-[4px] border p-3"
          style={{
            backgroundColor: colors.sectionBg,
            borderColor: colors.cardBorder,
            color: colors.summaryText,
          }}
        >
          <div className="flex items-center gap-2 text-[13px] font-bold">
            <Loader2 size={15} className="animate-spin" />
            {t.loading}
          </div>
        </div>
      );
    }

    if (eligibility?.hasRunningTurnover) {
      return (
        <div className="rounded-[4px] border border-yellow-300 bg-yellow-50 p-3">
          <div className="flex items-start gap-2 text-yellow-700">
            <AlertCircle size={17} className="mt-[1px] shrink-0" />
            <div>
              <p className="text-[13px] font-bold">{t.turnoverTitle}</p>
              <p className="mt-1 text-[12px] leading-5">
                {t.remaining}: {money(eligibility.remaining)}
              </p>
              <p className="mt-1 text-[12px] leading-5">
                {eligibility.message || t.secureText}
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (eligibility?.hasPendingWithdraw) {
      return (
        <div className="rounded-[4px] border border-yellow-300 bg-yellow-50 p-3">
          <div className="flex items-start gap-2 text-yellow-700">
            <AlertCircle size={17} className="mt-[1px] shrink-0" />
            <div>
              <p className="text-[13px] font-bold">{t.pendingTitle}</p>
              <p className="mt-1 text-[12px] leading-5">
                {eligibility.message}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-[4px] border border-green-200 bg-green-50 p-3">
        <div className="flex items-start gap-2 text-green-700">
          <CheckCircle2 size={17} className="mt-[1px] shrink-0" />
          <div>
            <p className="text-[13px] font-bold">{t.eligibleTitle}</p>
            <p className="mt-1 text-[12px] leading-5">{t.secureText}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center px-0 backdrop-blur-[3px] sm:px-4"
          style={{ background: colors.pageOverlayBg }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative flex h-dvh w-full flex-col overflow-hidden shadow-2xl sm:h-[700px] sm:max-w-[375px] sm:rounded-[8px]"
            style={{ backgroundColor: colors.modalBg }}
          >
            <div
              className="relative flex h-[50px] shrink-0 items-center justify-center"
              style={{
                backgroundColor: colors.headerBg,
                color: colors.headerText,
              }}
            >
              <h2 className="text-[18px] font-semibold">{t.title}</h2>

              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center"
                style={{ color: colors.closeIconColor }}
              >
                <X size={24} />
              </button>
            </div>

            <div
              className="flex h-[52px] shrink-0 items-center gap-1 px-4 pb-3"
              style={{ backgroundColor: colors.headerBg }}
            >
              <button
                type="button"
                onClick={onDepositClick}
                className="h-[34px] flex-1 cursor-pointer rounded-[3px] text-[13px] font-bold"
                style={{
                  backgroundColor: colors.inactiveTabBg,
                  color: colors.inactiveTabText,
                }}
              >
                {t.deposit}
              </button>

              <button
                type="button"
                className="h-[34px] flex-1 cursor-pointer rounded-[3px] text-[13px] font-bold"
                style={{
                  backgroundColor: colors.secondaryBg,
                  color: colors.secondaryText,
                }}
              >
                {t.title}
              </button>
            </div>

            {loading ? (
              <div
                className="flex flex-1 items-center justify-center"
                style={{ backgroundColor: colors.modalBg }}
              >
                <div
                  className="flex items-center gap-2 text-[14px] font-semibold"
                  style={{ color: colors.primaryBg }}
                >
                  <Loader2 size={18} className="animate-spin" />
                  {t.loading}
                </div>
              </div>
            ) : confirmStep === "otp" ? (
              <div
                className="flex-1 overflow-y-auto px-4 pb-5 pt-4"
                style={{ backgroundColor: colors.modalBg }}
              >
                <div
                  className="rounded-[4px] border p-3 shadow-sm"
                  style={{
                    backgroundColor: colors.cardBg,
                    borderColor: colors.cardBorder,
                  }}
                >
                  <OtpVerifyBox
                    maskedPhone={maskedPhone}
                    resendSeconds={resendSeconds}
                    onResend={handleSendWithdrawOtp}
                    sendingOtp={sendingOtp}
                    onVerify={submitWithdraw}
                    verifying={submittingWithdraw}
                    onBack={() => setConfirmStep("form")}
                    colors={colors}
                    isBangla={isBangla}
                    submitLabel={t.confirmWithdraw}
                    submittingLabel={t.processing}
                  />
                </div>
              </div>
            ) : (
              <>
                <div
                  className="flex-1 overflow-y-auto px-4 pb-5 pt-3"
                  style={{ backgroundColor: colors.modalBg }}
                >
                  <div
                    className="mt-4 rounded-[4px] border p-3 shadow-sm"
                    style={{
                      backgroundColor: colors.cardBg,
                      borderColor: colors.cardBorder,
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div
                        className="flex items-center gap-2"
                        style={{ color: colors.primaryBg }}
                      >
                        <Wallet size={18} />
                        <span className="text-[14px] font-bold">
                          {t.balance}
                        </span>
                      </div>

                      <span
                        className="text-[14px] font-bold"
                        style={{ color: colors.successBg }}
                      >
                        {money(userBalance)}
                      </span>
                    </div>
                  </div>

                  <div
                    className="mt-4 rounded-[4px] border p-3 shadow-sm"
                    style={{
                      backgroundColor: colors.cardBg,
                      borderColor: colors.cardBorder,
                    }}
                  >
                    <p
                      className="text-[14px] font-bold"
                      style={{ color: colors.primaryBg }}
                    >
                      {t.method}
                    </p>

                    {methods.length ? (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {methods.map((method) => {
                          const active =
                            String(method.methodId) ===
                            String(selectedMethodId);

                          const name =
                            language === "Bangla"
                              ? method?.name?.bn || method?.name?.en
                              : method?.name?.en || method?.name?.bn;

                          return (
                            <button
                              key={method._id}
                              type="button"
                              onClick={() =>
                                handleSelectMethod(method.methodId)
                              }
                              className="flex min-h-[82px] cursor-pointer flex-col items-center justify-center rounded-[6px] border transition"
                              style={{
                                backgroundColor: active
                                  ? colors.summaryBg
                                  : colors.inputBg,
                                borderColor: active
                                  ? colors.primaryBg
                                  : colors.cardBorder,
                              }}
                            >
                              <div
                                className="flex h-10 w-10 items-center justify-center overflow-hidden"
                                style={{ backgroundColor: colors.cardBg }}
                              >
                                {method.logoUrl ? (
                                  <img
                                    src={getImageUrl(method.logoUrl)}
                                    alt={name || method.methodId}
                                    className="h-full w-full object-contain"
                                  />
                                ) : (
                                  <Wallet
                                    size={20}
                                    style={{ color: colors.primaryBg }}
                                  />
                                )}
                              </div>

                              <span
                                className="mt-1 line-clamp-1 text-[11px] font-bold"
                                style={{
                                  color: active
                                    ? colors.summaryText
                                    : colors.normalText,
                                }}
                              >
                                {name || method.methodId}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p
                        className="mt-3 text-[13px]"
                        style={{ color: colors.mutedText }}
                      >
                        {t.noMethod}
                      </p>
                    )}
                  </div>

                  <div
                    className="mt-4 rounded-[4px] border p-3 shadow-sm"
                    style={{
                      backgroundColor: colors.cardBg,
                      borderColor: colors.cardBorder,
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div
                        className="flex items-center gap-2"
                        style={{ color: colors.primaryBg }}
                      >
                        <Phone size={18} />
                        <span className="text-[14px] font-bold">
                          {t.wallet}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (walletLimitReached && !showAddWallet) {
                            toast.info(t.maxWalletReached);
                            return;
                          }
                          setShowAddWallet((prev) => !prev);
                        }}
                        className="flex h-[30px] cursor-pointer items-center gap-1 rounded-[4px] px-2 text-[11px] font-bold"
                        style={{
                          backgroundColor: colors.primaryBg,
                          color: colors.primaryText,
                        }}
                      >
                        {showAddWallet ? (
                          <ChevronUp size={14} />
                        ) : (
                          <Plus size={14} />
                        )}
                        {showAddWallet ? t.closeWallet : t.addWallet}
                      </button>
                    </div>

                    <p
                      className="mt-2 rounded p-2 text-[11px] leading-4"
                      style={{
                        backgroundColor: colors.summaryBg,
                        color: colors.summaryText,
                      }}
                    >
                      {t.maxWalletText}
                    </p>

                    {wallets.length ? (
                      <select
                        value={selectedWalletId}
                        onChange={(e) => setSelectedWalletId(e.target.value)}
                        className="mt-3 h-[42px] w-full cursor-pointer rounded-[4px] border px-3 text-[13px] outline-none"
                        style={{
                          backgroundColor: colors.inputBg,
                          color: colors.inputText,
                          borderColor: colors.inputBorder,
                        }}
                      >
                        {wallets.map((wallet) => (
                          <option key={wallet._id} value={wallet._id}>
                            {wallet.walletNumber}
                            {wallet.isAutoRegistration
                              ? ` (${t.registrationNumber})`
                              : wallet.label
                                ? ` (${wallet.label})`
                                : ""}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p
                        className="mt-3 text-[12px]"
                        style={{ color: colors.mutedText }}
                      >
                        {t.noWallet}
                      </p>
                    )}

                    <AddEWalletFlow
                      open={showAddWallet}
                      onClose={() => setShowAddWallet(false)}
                      onCreated={handleWalletCreated}
                      colors={colors}
                      isBangla={isBangla}
                    />
                  </div>

                  <div
                    className="mt-4 rounded-[4px] border p-3 shadow-sm"
                    style={{
                      backgroundColor: colors.cardBg,
                      borderColor: colors.cardBorder,
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div
                        className="flex items-center gap-2"
                        style={{ color: colors.primaryBg }}
                      >
                        <Wallet size={18} />
                        <span className="text-[14px] font-bold">
                          {t.amount}
                        </span>
                      </div>

                      {selectedMethod ? (
                        <span
                          className="text-[11px] font-semibold"
                          style={{ color: colors.mutedText }}
                        >
                          {money(minAmount)} -{" "}
                          {maxAmount > 0 ? money(maxAmount) : "∞"}
                        </span>
                      ) : null}
                    </div>

                    {visiblePresets.length > 0 && (
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        {visiblePresets.map((value) => {
                          const active = String(value) === String(amount);

                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setAmount(String(value))}
                              className="h-[38px] cursor-pointer rounded-[4px] border text-[13px] font-bold transition"
                              style={{
                                backgroundColor: active
                                  ? colors.summaryBg
                                  : colors.inputBg,
                                borderColor: active
                                  ? colors.primaryBg
                                  : colors.cardBorder,
                                color: active
                                  ? colors.summaryText
                                  : colors.normalText,
                              }}
                            >
                              {value.toLocaleString("en-US")}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <input
                      value={amount}
                      onChange={(e) =>
                        setAmount(e.target.value.replace(/[^\d.]/g, ""))
                      }
                      placeholder={t.enterAmount}
                      inputMode="decimal"
                      className="mt-3 h-[42px] w-full rounded-[4px] border px-4 text-[14px] outline-none"
                      style={{
                        backgroundColor: colors.inputBg,
                        color: colors.inputText,
                        borderColor: colors.inputBorder,
                      }}
                    />
                  </div>
                  <div className="mt-4">
                    <EligibilityBox />
                  </div>
                </div>

                <div
                  className="shrink-0 px-4 pb-4"
                  style={{ backgroundColor: colors.modalBg }}
                >
                  <button
                    type="button"
                    onClick={handleWithdraw}
                    disabled={!canWithdraw}
                    className="relative h-[38px] w-full cursor-pointer rounded-[2px] text-[14px] font-medium disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: canWithdraw
                        ? colors.primaryBg
                        : colors.disabledBg,
                      color: canWithdraw
                        ? colors.primaryText
                        : colors.disabledText,
                    }}
                  >
                    {sendingOtp
                      ? t.sendingOtp
                      : submittingWithdraw
                        ? t.processing
                        : t.submit}

                    {!canWithdraw ? (
                      <span
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border"
                        style={{
                          borderColor: colors.normalText,
                          backgroundColor: colors.dangerBg,
                          color: colors.dangerText,
                        }}
                      >
                        <AlertCircle size={15} />
                      </span>
                    ) : (
                      <span
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border"
                        style={{
                          borderColor: colors.successBg,
                          backgroundColor: colors.successBg,
                          color: colors.successText,
                        }}
                      >
                        <CheckCircle2 size={15} />
                      </span>
                    )}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WithdrawModal;
