import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ChevronDown,
  BadgePercent,
  AlertCircle,
  Info,
  Wallet,
  Gift,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import api from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";
import { selectIsAuth, selectUser } from "../../features/auth/authSelectors";
import { selectModalColorSetting } from "../../features/global/globalSelectors";

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

  promotionBg: "#e9b20d",
  promotionText: "#ffffff",

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

const n = (value) => {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num : 0;
};

const calcBonus = (amount, selectedBonus) => {
  const amountNum = Math.floor(n(amount));

  if (!selectedBonus || selectedBonus?._id === "none") {
    return {
      bonusAmount: 0,
      creditedAmount: amountNum,
      turnoverMultiplier: 1,
      targetTurnover: amountNum,
    };
  }

  const bonusType = String(selectedBonus?.bonusType || "fixed").toLowerCase();
  const bonusValue = n(selectedBonus?.bonusValue);
  const turnoverMultiplier = n(selectedBonus?.turnoverMultiplier ?? 1);

  const bonusAmount =
    bonusType === "percent"
      ? Math.floor((amountNum * bonusValue) / 100)
      : Math.floor(bonusValue);

  const creditedAmount = amountNum + bonusAmount;
  const targetTurnover = Math.floor(creditedAmount * turnoverMultiplier);

  return {
    bonusAmount,
    creditedAmount,
    turnoverMultiplier,
    targetTurnover,
  };
};

const getBonusText = (bonus) => {
  if (!bonus || bonus?._id === "none") return "";

  if (bonus.bonusType === "percent") {
    return `+${Number(bonus.bonusValue || 0)}%`;
  }

  return `+${money(bonus.bonusValue)}`;
};

const AutoDepositModal = ({ open, onClose, onDepositClick }) => {
  const promoBoxRef = useRef(null);
  const { isBangla, language } = useLanguage();

  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuth);

  const modalColorSetting = useSelector(selectModalColorSetting);
  const colors = {
    ...defaultModalColors,
    ...(modalColorSetting || {}),
  };

  const userMongoId = user?._id || user?.id || "";
  const userId = user?.userId || "";
  const phone = user?.phone || "";

  const [loadingStatus, setLoadingStatus] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [minAmount, setMinAmount] = useState(5);
  const [maxAmount, setMaxAmount] = useState(0);
  const [bonuses, setBonuses] = useState([]);

  const [amount, setAmount] = useState("");
  const [selectedBonusId, setSelectedBonusId] = useState("none");
  const [bonusOpen, setBonusOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const t = {
    title: isBangla ? "ফান্ডস" : "Funds",
    deposit: isBangla ? "ডিপোজিট" : "Deposit",
    autoDeposit: isBangla ? "অটো ডিপোজিট" : "Auto Deposit",

    selectBonus: isBangla ? "বোনাস নির্বাচন করুন" : "Select Bonus",
    noBonus: isBangla ? "কোনো বোনাস নয়" : "No Bonus",
    amount: isBangla ? "ডিপোজিট এমাউন্ট" : "Deposit Amount",
    enterAmount: isBangla ? "এমাউন্ট লিখুন" : "Enter amount",
    min: isBangla ? "সর্বনিম্ন" : "Min",
    max: isBangla ? "সর্বোচ্চ" : "Max",
    bonus: isBangla ? "বোনাস" : "Bonus",
    credited: isBangla ? "ক্রেডিট হবে" : "Credited",
    turnover: isBangla ? "টার্নওভার" : "Turnover",
    submit: isBangla ? "সাবমিট" : "Submit",
    processing: isBangla ? "প্রসেস হচ্ছে..." : "Processing...",

    loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
    disabledTitle: isBangla ? "অটো ডিপোজিট বন্ধ" : "Auto Deposit Disabled",
    disabledText: isBangla
      ? "এই মুহূর্তে অটো ডিপোজিট সার্ভিস বন্ধ আছে।"
      : "Auto deposit service is currently disabled.",
    loginRequired: isBangla
      ? "অটো ডিপোজিট করতে আগে লগইন করুন"
      : "Please login first to use auto deposit.",
    invalidAmount: isBangla ? "সঠিক এমাউন্ট দিন" : "Enter valid amount",
    firstDepositOnly: isBangla ? "শুধু প্রথম ডিপোজিট" : "First Deposit Only",
    allTime: isBangla ? "সবসময়" : "All Time",
    paymentFailed: isBangla
      ? "পেমেন্ট লিংক তৈরি করা যায়নি"
      : "Payment link create failed",
    secureText: isBangla
      ? "নিরাপদ OraclePay auto deposit gateway"
      : "Secure OraclePay auto deposit gateway",
    firstDepositNote: isBangla
      ? "আপনি যদি আগে অটো ডিপোজিট করে থাকেন, তাহলে First Deposit bonus নিতে পারবেন না।"
      : "If you already made an auto deposit before, First Deposit bonus will not be available.",
  };

  useEffect(() => {
    if (!open) return;

    const loadStatus = async () => {
      try {
        setLoadingStatus(true);

        const { data } = await api.get("/api/auto-deposit/status");

        setEnabled(!!data?.data?.enabled);
        setMinAmount(Number(data?.data?.minAmount || 5));
        setMaxAmount(Number(data?.data?.maxAmount || 0));

        const list = Array.isArray(data?.data?.bonuses)
          ? data.data.bonuses
          : [];

        setBonuses(
          list.map((item) => ({
            _id: String(item?._id || ""),
            title: {
              bn: item?.title?.bn || "",
              en: item?.title?.en || "",
            },
            bonusType: item?.bonusType === "percent" ? "percent" : "fixed",
            bonusScope:
              item?.bonusScope === "first-deposit"
                ? "first-deposit"
                : "all-time",
            bonusValue: Number(item?.bonusValue || 0),
            turnoverMultiplier: Number(item?.turnoverMultiplier ?? 1),
          })),
        );
      } catch (error) {
        setEnabled(false);
        setBonuses([]);
      } finally {
        setLoadingStatus(false);
      }
    };

    loadStatus();
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!promoBoxRef.current) return;

      if (!promoBoxRef.current.contains(event.target)) {
        setBonusOpen(false);
      }
    };

    if (bonusOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [bonusOpen]);

  const bonusOptions = useMemo(() => {
    return [
      {
        _id: "none",
        title: {
          bn: t.noBonus,
          en: t.noBonus,
        },
        bonusType: "fixed",
        bonusScope: "all-time",
        bonusValue: 0,
        turnoverMultiplier: 1,
      },
      ...bonuses,
    ];
  }, [bonuses, t.noBonus]);

  useEffect(() => {
    const exists = bonusOptions.some(
      (item) => String(item._id) === String(selectedBonusId),
    );

    if (!exists) {
      setSelectedBonusId("none");
    }
  }, [bonusOptions, selectedBonusId]);

  const selectedBonus = useMemo(() => {
    return (
      bonusOptions.find((item) => String(item._id) === selectedBonusId) ||
      bonusOptions[0]
    );
  }, [bonusOptions, selectedBonusId]);

  const amountNum = Math.floor(n(amount));

  const calculation = useMemo(() => {
    return calcBonus(amountNum, selectedBonus);
  }, [amountNum, selectedBonus]);

  const selectedBonusName = useMemo(() => {
    if (!selectedBonus) return t.noBonus;

    return language === "Bangla"
      ? selectedBonus?.title?.bn || selectedBonus?.title?.en || t.noBonus
      : selectedBonus?.title?.en || selectedBonus?.title?.bn || t.noBonus;
  }, [selectedBonus, language, t.noBonus]);

  const amountValid =
    amountNum > 0 &&
    amountNum >= Number(minAmount || 0) &&
    (Number(maxAmount || 0) <= 0 || amountNum <= Number(maxAmount || 0));

  const canSubmit =
    enabled && isAuthenticated && !!userMongoId && amountValid && !processing;

  const handleSubmit = async () => {
    if (!enabled) {
      toast.error(t.disabledText);
      return;
    }

    if (!isAuthenticated || !userMongoId) {
      toast.error(t.loginRequired);
      return;
    }

    if (!amountValid) {
      toast.error(t.invalidAmount);
      return;
    }

    try {
      setProcessing(true);

      const invoiceNumber = `AUTO-${userMongoId}-${Date.now()}`;

      const { data } = await api.post("/api/auto-deposit/create", {
        amount: amountNum,
        invoiceNumber,
        selectedBonusId:
          selectedBonus && selectedBonus._id !== "none"
            ? selectedBonus._id
            : "",
        checkoutItems: {
          type: "deposit",
          method: "auto",
          gateway: "oraclepay",
          userId: userId || "",
          phone: phone || "",
          username: userId || "",
          selectedBonusId:
            selectedBonus && selectedBonus._id !== "none"
              ? selectedBonus._id
              : "",
          selectedBonusScope:
            selectedBonus && selectedBonus._id !== "none"
              ? selectedBonus.bonusScope
              : "",
        },
      });

      if (data?.success && data?.payment_page_url) {
        window.location.href = data.payment_page_url;
        return;
      }

      toast.error(data?.message || t.paymentFailed);
    } catch (error) {
      toast.error(error?.response?.data?.message || t.paymentFailed);
    } finally {
      setProcessing(false);
    }
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
            className="relative flex h-screen w-full flex-col overflow-hidden shadow-2xl sm:h-[700px] sm:max-w-[375px] sm:rounded-[8px]"
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
                {t.autoDeposit}
              </button>
            </div>

            {loadingStatus ? (
              <div
                className="flex flex-1 items-center justify-center px-5"
                style={{ backgroundColor: colors.modalBg }}
              >
                <div
                  className="text-center text-[14px] font-semibold"
                  style={{ color: colors.primaryBg }}
                >
                  {t.loading}
                </div>
              </div>
            ) : !enabled ? (
              <div
                className="flex flex-1 items-center justify-center px-5"
                style={{ backgroundColor: colors.modalBg }}
              >
                <div className="text-center">
                  <div
                    className="mx-auto flex h-20 w-20 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: colors.summaryBg,
                      color: colors.summaryText,
                    }}
                  >
                    <AlertCircle size={42} />
                  </div>

                  <h3
                    className="mt-5 text-[24px] font-bold"
                    style={{ color: colors.primaryBg }}
                  >
                    {t.disabledTitle}
                  </h3>

                  <p
                    className="mx-auto mt-2 max-w-[280px] text-[14px] leading-6"
                    style={{ color: colors.mutedText }}
                  >
                    {t.disabledText}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div
                  className="flex-1 overflow-y-auto px-4 pb-5 pt-3"
                  style={{ backgroundColor: colors.modalBg }}
                >
                  <div ref={promoBoxRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setBonusOpen((prev) => !prev)}
                      className="flex h-[40px] w-full cursor-pointer items-center justify-between rounded-[3px] px-3"
                      style={{
                        backgroundColor: colors.promotionBg,
                        color: colors.promotionText,
                      }}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <BadgePercent size={18} />

                        <span className="shrink-0 text-[14px] font-medium">
                          {t.selectBonus}
                        </span>

                        <span className="truncate text-[12px] font-bold">
                          {selectedBonus?._id !== "none"
                            ? selectedBonusName
                            : ""}
                        </span>
                      </div>

                      <ChevronDown size={18} />
                    </button>

                    {bonusOpen && (
                      <div
                        className="absolute left-0 right-0 top-[44px] z-30 max-h-[260px] overflow-y-auto rounded-[3px] border shadow-xl"
                        style={{
                          backgroundColor: colors.cardBg,
                          borderColor: colors.cardBorder,
                        }}
                      >
                        {bonusOptions.map((bonus) => {
                          const active =
                            String(selectedBonusId) === String(bonus._id);

                          const bonusName =
                            language === "Bangla"
                              ? bonus?.title?.bn || bonus?.title?.en
                              : bonus?.title?.en || bonus?.title?.bn;

                          return (
                            <button
                              key={bonus._id}
                              type="button"
                              onClick={() => {
                                setSelectedBonusId(bonus._id);
                                setBonusOpen(false);
                              }}
                              className="flex w-full cursor-pointer items-start justify-between gap-3 px-3 py-3 text-left text-[13px]"
                              style={{
                                backgroundColor: active
                                  ? colors.summaryBg
                                  : colors.cardBg,
                                color: active
                                  ? colors.summaryText
                                  : colors.normalText,
                              }}
                            >
                              <div className="min-w-0">
                                <div className="font-semibold">{bonusName}</div>

                                {bonus._id !== "none" ? (
                                  <div
                                    className="mt-1 text-[11px]"
                                    style={{ color: colors.mutedText }}
                                  >
                                    {bonus.bonusScope === "first-deposit"
                                      ? t.firstDepositOnly
                                      : t.allTime}
                                  </div>
                                ) : null}
                              </div>

                              <span className="shrink-0 text-[12px] font-bold">
                                {bonus._id === "none"
                                  ? "x1"
                                  : `${getBonusText(bonus)} | x${
                                      bonus.turnoverMultiplier
                                    }`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div
                    className="mt-4 rounded-[4px] border p-3"
                    style={{
                      backgroundColor: colors.sectionBg,
                      borderColor: colors.sectionBorder,
                    }}
                  >
                    <div
                      className="flex items-start gap-2"
                      style={{ color: colors.sectionText }}
                    >
                      <Info size={17} className="mt-[1px] shrink-0" />
                      <p className="text-[13px] leading-[18px]">
                        {t.firstDepositNote}
                      </p>
                    </div>
                  </div>

                  <div
                    className="mt-4 rounded-[4px] border p-3 shadow-sm"
                    style={{
                      backgroundColor: colors.cardBg,
                      borderColor: colors.cardBorder,
                    }}
                  >
                    <div
                      className="flex items-center gap-2"
                      style={{ color: colors.primaryBg }}
                    >
                      <Wallet size={18} />
                      <span className="text-[14px] font-bold">{t.amount}</span>
                    </div>

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
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor =
                          colors.inputFocusBorder;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = colors.inputBorder;
                      }}
                    />

                    <div
                      className="mt-2 text-[12px]"
                      style={{ color: colors.mutedText }}
                    >
                      {t.min}: {money(minAmount)} | {t.max}:{" "}
                      {Number(maxAmount || 0) > 0 ? money(maxAmount) : "∞"}
                    </div>
                  </div>

                  <div
                    className="mt-4 rounded-[4px] p-3 text-[12px]"
                    style={{
                      backgroundColor: colors.summaryBg,
                      color: colors.summaryText,
                    }}
                  >
                    <div className="flex justify-between">
                      <span>{t.bonus}</span>
                      <span>{money(calculation.bonusAmount)}</span>
                    </div>

                    <div className="mt-1 flex justify-between font-bold">
                      <span>{t.credited}</span>
                      <span>{money(calculation.creditedAmount)}</span>
                    </div>

                    <div className="mt-1 flex justify-between">
                      <span>{t.turnover}</span>
                      <span>
                        x{calculation.turnoverMultiplier} /{" "}
                        {money(calculation.targetTurnover)}
                      </span>
                    </div>
                  </div>

                  {selectedBonus?._id !== "none" ? (
                    <div
                      className="mt-4 rounded-[4px] border p-3"
                      style={{
                        backgroundColor: colors.cardBg,
                        borderColor: colors.cardBorder,
                      }}
                    >
                      <div
                        className="flex items-center gap-2"
                        style={{ color: colors.primaryBg }}
                      >
                        <Gift size={17} />
                        <span className="text-[14px] font-bold">
                          {selectedBonusName}
                        </span>
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-2 text-[12px]">
                        <div
                          className="rounded p-2"
                          style={{ backgroundColor: colors.summaryBg }}
                        >
                          <p style={{ color: colors.mutedText }}>{t.bonus}</p>
                          <p
                            className="font-bold"
                            style={{ color: colors.summaryText }}
                          >
                            {getBonusText(selectedBonus)}
                          </p>
                        </div>

                        <div
                          className="rounded p-2"
                          style={{ backgroundColor: colors.summaryBg }}
                        >
                          <p style={{ color: colors.mutedText }}>
                            {isBangla ? "ধরণ" : "Scope"}
                          </p>
                          <p
                            className="font-bold"
                            style={{ color: colors.summaryText }}
                          >
                            {selectedBonus.bonusScope === "first-deposit"
                              ? t.firstDepositOnly
                              : t.allTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div
                  className="shrink-0 px-4 pb-4"
                  style={{ backgroundColor: colors.modalBg }}
                >
                  <div
                    className="mb-3 flex items-center justify-center gap-2 text-[12px]"
                    style={{ color: colors.mutedText }}
                  >
                    <ShieldCheck size={14} />
                    <span>{t.secureText}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="relative h-[38px] w-full cursor-pointer rounded-[2px] text-[14px] font-medium disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: canSubmit
                        ? colors.primaryBg
                        : colors.disabledBg,
                      color: canSubmit
                        ? colors.primaryText
                        : colors.disabledText,
                    }}
                  >
                    {processing ? t.processing : t.submit}

                    {!canSubmit && (
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
                    )}

                    {canSubmit && (
                      <span
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border"
                        style={{
                          borderColor: colors.successBg,
                          backgroundColor: colors.successBg,
                          color: colors.successText,
                        }}
                      >
                        <CheckCircle size={15} />
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

export default AutoDepositModal;
