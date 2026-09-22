import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  History,
  Wallet,
  BanknoteArrowDown,
  Gamepad2,
  Landmark,
  RotateCcw,
  Clock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import api from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";
import AutoDepositModalHistory from "../AutoDepositModalHistory/AutoDepositModalHistory";
import WithdrawHistoryModal from "../WithdrawHistoryModal/WithdrawHistoryModal";
import TurnoverHistoryModal from "../TurnoverHistoryModal/TurnoverHistoryModal";
import BetHistoryModal from "../BetHistoryModal/BetHistoryModal";
import { selectTransactionHistoryColorSetting } from "../../features/global/globalSelectors";

const defaultHistoryColors = {
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

  successBg: "#dcfce7",
  successText: "#15803d",

  warningBg: "#fef9c3",
  warningText: "#a16207",

  dangerBg: "#fee2e2",
  dangerText: "#b91c1c",

  disabledBg: "#a6a6a6",
  disabledText: "#ffffff",
};

const money = (value) => {
  const num = Number(value || 0);
  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusStyle = (status, colors) => {
  const s = String(status || "").toLowerCase();

  if (s === "approved") {
    return {
      backgroundColor: colors.successBg,
      color: colors.successText,
      borderColor: colors.successBg,
    };
  }

  if (s === "rejected") {
    return {
      backgroundColor: colors.dangerBg,
      color: colors.dangerText,
      borderColor: colors.dangerBg,
    };
  }

  return {
    backgroundColor: colors.warningBg,
    color: colors.warningText,
    borderColor: colors.warningBg,
  };
};

const getTransactionText = (item) => {
  return (
    item?.fields?.transactionId ||
    item?.fields?.trxId ||
    item?.fields?.trx_id ||
    item?.fields?.reference ||
    item?.fields?.senderNumber ||
    item?._id ||
    "N/A"
  );
};

const DepositHistoryModal = ({ open, onClose, onBackToDeposit }) => {
  const { isBangla, language } = useLanguage();

  const transactionHistoryColorSetting = useSelector(
    selectTransactionHistoryColorSetting,
  );

  const colors = {
    ...defaultHistoryColors,
    ...(transactionHistoryColorSetting || {}),
  };

  const [activeTab, setActiveTab] = useState("deposit");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const limit = 10;

  const t = {
    withdrawHistory: isBangla ? "উইথড্র হিস্টোরি" : "Withdraw History",
    betHistory: isBangla ? "বেট হিস্টোরি" : "Bet History",
    depositHistory: isBangla ? "ডিপোজিট হিস্টোরি" : "Deposit History",
    autoDepositHistory: isBangla
      ? "অটো ডিপোজিট হিস্টোরি"
      : "Auto Deposit History",
    turnoverHistory: isBangla ? "টার্নওভার হিস্টোরি" : "Turnover History",

    subtitle: isBangla
      ? "আপনার ডিপোজিট রিকোয়েস্ট লিস্ট"
      : "Your deposit request list",
    all: isBangla ? "সব" : "All",
    pending: isBangla ? "পেন্ডিং" : "Pending",
    approved: isBangla ? "অ্যাপ্রুভড" : "Approved",
    rejected: isBangla ? "রিজেক্টেড" : "Rejected",
    searchPlaceholder: isBangla
      ? "ট্রানজেকশন / মেথড / চ্যানেল"
      : "Transaction / Method / Channel",
    loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
    noData: isBangla
      ? "কোনো ডিপোজিট হিস্টোরি পাওয়া যায়নি"
      : "No deposit history found",
    channel: isBangla ? "চ্যানেল" : "Channel",
    amount: isBangla ? "এমাউন্ট" : "Amount",
    bonus: isBangla ? "বোনাস" : "Bonus",
    credited: isBangla ? "ক্রেডিটেড" : "Credited",
    turnover: isBangla ? "টার্নওভার" : "Turnover",
    transaction: isBangla ? "ট্রানজেকশন" : "Transaction",
    date: isBangla ? "তারিখ" : "Date",
    page: isBangla ? "পেজ" : "Page",
    of: isBangla ? "এর" : "of",
    prev: isBangla ? "আগের" : "Prev",
    next: isBangla ? "পরের" : "Next",
    total: isBangla ? "মোট" : "Total",
    depositAgain: isBangla ? "আবার ডিপোজিট" : "Deposit Again",
    comingSoon: isBangla ? "শীঘ্রই আসছে" : "Coming Soon",
    comingSoonText: isBangla
      ? "এই হিস্টোরি সার্ভিস খুব শীঘ্রই চালু হবে।"
      : "This history service will be available soon.",
  };

  const tabs = [
    {
      key: "withdraw",
      label: t.withdrawHistory,
      icon: <BanknoteArrowDown size={16} />,
    },
    {
      key: "bet",
      label: t.betHistory,
      icon: <Gamepad2 size={16} />,
    },
    {
      key: "deposit",
      label: t.depositHistory,
      icon: <Wallet size={16} />,
    },
    {
      key: "autoDeposit",
      label: t.autoDepositHistory,
      icon: <Landmark size={16} />,
    },
    {
      key: "turnover",
      label: t.turnoverHistory,
      icon: <RotateCcw size={16} />,
    },
  ];

  const title = useMemo(() => {
    return tabs.find((tab) => tab.key === activeTab)?.label || t.depositHistory;
  }, [activeTab, tabs, t.depositHistory]);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    params.append("page", String(page));
    params.append("limit", String(limit));

    if (status !== "all") {
      params.append("status", status);
    }

    return params.toString();
  }, [page, status]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["deposit-history-modal", queryParams],
    queryFn: async () => {
      const res = await api.get(`/api/deposit-requests/my?${queryParams}`);
      return res.data;
    },
    enabled: open && activeTab === "deposit",
    keepPreviousData: true,
    staleTime: 15000,
  });

  const rows = useMemo(() => {
    const list = Array.isArray(data?.data) ? data.data : [];

    if (!search.trim()) return list;

    const q = search.trim().toLowerCase();

    return list.filter((item) => {
      const transaction = getTransactionText(item).toLowerCase();
      const method = String(item?.methodId || "").toLowerCase();
      const channel = String(item?.channelId || "").toLowerCase();
      const methodNameBn = String(
        item?.display?.methodName?.bn || "",
      ).toLowerCase();
      const methodNameEn = String(
        item?.display?.methodName?.en || "",
      ).toLowerCase();

      return (
        transaction.includes(q) ||
        method.includes(q) ||
        channel.includes(q) ||
        methodNameBn.includes(q) ||
        methodNameEn.includes(q)
      );
    });
  }, [data, search]);

  const meta = data?.meta || {};
  const total = Number(meta.total || rows.length || 0);
  const totalPages = Math.max(
    1,
    Math.ceil(Number(meta.total || 0) / Number(meta.limit || limit)) || 1,
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleRefresh = async () => {
    try {
      await refetch();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Refresh failed");
    }
  };

  const getMethodName = (item) => {
    return language === "Bangla"
      ? item?.display?.methodName?.bn ||
          item?.display?.methodName?.en ||
          item?.methodId ||
          "—"
      : item?.display?.methodName?.en ||
          item?.display?.methodName?.bn ||
          item?.methodId ||
          "—";
  };

  const getChannelName = (item) => {
    return language === "Bangla"
      ? item?.display?.channelName?.bn ||
          item?.display?.channelName?.en ||
          item?.channelId ||
          "—"
      : item?.display?.channelName?.en ||
          item?.display?.channelName?.bn ||
          item?.channelId ||
          "—";
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(1);
    setSearch("");
    setSearchInput("");
  };

  const TransactionTab = () => {
    return (
      <div
        className="shrink-0 px-3 pb-3"
        style={{ backgroundColor: colors.headerBg }}
      >
        <div className="overflow-x-auto">
          <div className="flex min-w-max items-center gap-2">
            {tabs.map((tab) => {
              const active = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleTabChange(tab.key)}
                  className="flex h-[36px] cursor-pointer items-center gap-2 rounded-[4px] px-3 text-[12px] font-bold transition"
                  style={{
                    backgroundColor: active
                      ? colors.secondaryBg
                      : colors.inactiveTabBg,
                    color: active
                      ? colors.secondaryText
                      : colors.inactiveTabText,
                  }}
                >
                  {tab.icon}
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const ComingSoon = () => {
    return (
      <div
        className="flex flex-1 items-center justify-center px-5"
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
            className="mt-5 text-[24px] font-bold"
            style={{ color: colors.primaryBg }}
          >
            {t.comingSoon}
          </h3>

          <p
            className="mx-auto mt-2 max-w-[280px] text-[14px] leading-6"
            style={{ color: colors.mutedText }}
          >
            {t.comingSoonText}
          </p>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center px-0 backdrop-blur-[3px] sm:px-4"
          style={{ background: colors.pageOverlayBg }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative flex h-screen w-full flex-col overflow-hidden shadow-2xl sm:h-[700px] sm:max-w-[430px] sm:rounded-[8px]"
            style={{ backgroundColor: colors.modalBg }}
          >
            <div
              className="relative flex h-[50px] shrink-0 items-center justify-center"
              style={{
                backgroundColor: colors.headerBg,
                color: colors.headerText,
              }}
            >
              <h2 className="text-[18px] font-semibold">{title}</h2>

              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center"
                style={{ color: colors.closeIconColor }}
              >
                <X size={24} />
              </button>
            </div>

            <TransactionTab />

            {activeTab === "deposit" ? (
              <>
                <div
                  className="shrink-0 px-4 pb-4"
                  style={{ backgroundColor: colors.headerBg }}
                >
                  <div
                    className="rounded-[4px] px-4 py-3"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.10)",
                      color: colors.headerText,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                        <History size={20} />
                      </div>

                      <div>
                        <p className="text-[14px] font-bold">{t.subtitle}</p>
                        <p className="mt-1 text-[12px] opacity-80">
                          {t.total}: {total}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="shrink-0 border-b px-4 py-3"
                  style={{
                    backgroundColor: colors.modalBg,
                    borderColor: colors.sectionBorder,
                  }}
                >
                  <div className="grid grid-cols-1 gap-2">
                    <form onSubmit={handleSearch} className="relative">
                      <Search
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: colors.primaryBg }}
                      />

                      <input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder={t.searchPlaceholder}
                        className="h-[40px] w-full rounded-[4px] border pl-10 pr-3 text-[13px] outline-none"
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
                          e.currentTarget.style.borderColor =
                            colors.inputBorder;
                        }}
                      />
                    </form>

                    <div className="grid grid-cols-[1fr_42px] gap-2">
                      <select
                        value={status}
                        onChange={(e) => {
                          setPage(1);
                          setStatus(e.target.value);
                        }}
                        className="h-[40px] cursor-pointer rounded-[4px] border px-3 text-[13px] outline-none"
                        style={{
                          backgroundColor: colors.inputBg,
                          color: colors.inputText,
                          borderColor: colors.inputBorder,
                        }}
                      >
                        <option value="all">{t.all}</option>
                        <option value="pending">{t.pending}</option>
                        <option value="approved">{t.approved}</option>
                        <option value="rejected">{t.rejected}</option>
                      </select>

                      <button
                        type="button"
                        onClick={handleRefresh}
                        className="flex h-[40px] cursor-pointer items-center justify-center rounded-[4px]"
                        style={{
                          backgroundColor: colors.primaryBg,
                          color: colors.primaryText,
                        }}
                      >
                        <RefreshCw
                          size={18}
                          className={isFetching ? "animate-spin" : ""}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className="flex-1 overflow-y-auto px-4 py-4"
                  style={{ backgroundColor: colors.sectionBg }}
                >
                  {isLoading ? (
                    <div
                      className="rounded-[6px] p-6 text-center text-[13px] shadow-sm"
                      style={{
                        backgroundColor: colors.cardBg,
                        color: colors.mutedText,
                      }}
                    >
                      {t.loading}
                    </div>
                  ) : rows.length ? (
                    <div className="space-y-3">
                      {rows.map((item) => {
                        const statusText = String(item?.status || "pending");

                        return (
                          <div
                            key={item._id}
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
                                  {getMethodName(item)}
                                </p>

                                <p
                                  className="mt-1 text-[12px]"
                                  style={{ color: colors.mutedText }}
                                >
                                  {t.channel}: {getChannelName(item)}
                                </p>

                                <p
                                  className="mt-1 break-all text-[12px]"
                                  style={{ color: colors.mutedText }}
                                >
                                  {t.transaction}: {getTransactionText(item)}
                                </p>
                              </div>

                              <span
                                className="shrink-0 rounded-full border px-2 py-1 text-[11px] font-bold capitalize"
                                style={getStatusStyle(statusText, colors)}
                              >
                                {statusText}
                              </span>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
                              <div
                                className="rounded-[4px] p-2"
                                style={{ backgroundColor: colors.summaryBg }}
                              >
                                <p style={{ color: colors.mutedText }}>
                                  {t.amount}
                                </p>
                                <p
                                  className="mt-1 font-bold"
                                  style={{ color: colors.normalText }}
                                >
                                  {money(item?.amount)}
                                </p>
                              </div>

                              <div
                                className="rounded-[4px] p-2"
                                style={{ backgroundColor: colors.summaryBg }}
                              >
                                <p style={{ color: colors.mutedText }}>
                                  {t.bonus}
                                </p>
                                <p
                                  className="mt-1 font-bold"
                                  style={{ color: colors.summaryText }}
                                >
                                  {money(item?.calc?.totalBonus)}
                                </p>
                              </div>

                              <div
                                className="rounded-[4px] p-2"
                                style={{ backgroundColor: colors.summaryBg }}
                              >
                                <p style={{ color: colors.mutedText }}>
                                  {t.credited}
                                </p>
                                <p
                                  className="mt-1 font-bold"
                                  style={{ color: colors.successText }}
                                >
                                  {money(item?.calc?.creditedAmount)}
                                </p>
                              </div>

                              <div
                                className="rounded-[4px] p-2"
                                style={{ backgroundColor: colors.summaryBg }}
                              >
                                <p style={{ color: colors.mutedText }}>
                                  {t.turnover}
                                </p>
                                <p
                                  className="mt-1 font-bold"
                                  style={{ color: colors.normalText }}
                                >
                                  x{item?.calc?.turnoverMultiplier ?? 1}
                                </p>
                              </div>
                            </div>

                            <p
                              className="mt-3 text-[12px]"
                              style={{ color: colors.mutedText }}
                            >
                              {t.date}: {formatDate(item?.createdAt)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div
                      className="rounded-[6px] p-8 text-center text-[13px] shadow-sm"
                      style={{
                        backgroundColor: colors.cardBg,
                        color: colors.mutedText,
                      }}
                    >
                      {t.noData}
                    </div>
                  )}
                </div>

                <div
                  className="shrink-0 border-t px-4 py-3"
                  style={{
                    backgroundColor: colors.modalBg,
                    borderColor: colors.sectionBorder,
                  }}
                >
                  <div
                    className="mb-3 flex items-center justify-between text-[12px]"
                    style={{ color: colors.mutedText }}
                  >
                    <span>
                      {t.page} {page} {t.of} {totalPages}
                    </span>
                    <span>
                      {t.total}: {total}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      disabled={page <= 1 || isFetching}
                      className="flex h-[38px] cursor-pointer items-center justify-center gap-1 rounded-[4px] border text-[13px] disabled:cursor-not-allowed disabled:opacity-50"
                      style={{
                        backgroundColor: colors.cardBg,
                        borderColor: colors.cardBorder,
                        color: colors.normalText,
                      }}
                    >
                      <ChevronLeft size={16} />
                      {t.prev}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onClose?.();
                        onBackToDeposit?.();
                      }}
                      className="h-[38px] cursor-pointer rounded-[4px] text-[13px] font-bold"
                      style={{
                        backgroundColor: colors.primaryBg,
                        color: colors.primaryText,
                      }}
                    >
                      {t.depositAgain}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={page >= totalPages || isFetching}
                      className="flex h-[38px] cursor-pointer items-center justify-center gap-1 rounded-[4px] border text-[13px] disabled:cursor-not-allowed disabled:opacity-50"
                      style={{
                        backgroundColor: colors.cardBg,
                        borderColor: colors.cardBorder,
                        color: colors.normalText,
                      }}
                    >
                      {t.next}
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </>
            ) : activeTab === "autoDeposit" ? (
              <AutoDepositModalHistory
                onBackToDeposit={() => {
                  onClose?.();
                  onBackToDeposit?.();
                }}
              />
            ) : activeTab === "withdraw" ? (
              <WithdrawHistoryModal
                onBackToWithdraw={() => {
                  onClose?.();
                }}
              />
            ) : activeTab === "bet" ? (
              <BetHistoryModal />
            ) : activeTab === "turnover" ? (
              <TurnoverHistoryModal
                onBackToDeposit={() => {
                  onClose?.();
                  onBackToDeposit?.();
                }}
              />
            ) : (
              <ComingSoon />
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DepositHistoryModal;
