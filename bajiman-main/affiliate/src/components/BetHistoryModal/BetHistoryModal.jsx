import React, { useMemo, useState } from "react";
import {
  Clock3,
  CheckCircle2,
  XCircle,
  Receipt,
  Wallet,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  TrendingUp,
  Hash,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import api from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";
import { selectTransactionHistoryColorSetting } from "../../features/global/globalSelectors";

const defaultHistoryColors = {
  modalBg: "#ffffff",
  headerBg: "#0865a9",
  headerText: "#ffffff",
  primaryBg: "#0865a9",
  primaryText: "#ffffff",
  sectionBg: "#f3f7fb",
  sectionBorder: "#e5e5e5",
  cardBg: "#ffffff",
  cardBorder: "#dce8f5",
  inputBg: "#eeeeee",
  inputText: "#222222",
  inputBorder: "#d7d7d7",
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

const BetHistoryModal = () => {
  const { isBangla } = useLanguage();

  const transactionHistoryColorSetting = useSelector(
    selectTransactionHistoryColorSetting,
  );

  const colors = {
    ...defaultHistoryColors,
    ...(transactionHistoryColorSetting || {}),
  };

  const [page, setPage] = useState(1);
  const [resultType, setResultType] = useState("");
  const limit = 10;

  const t = {
    subtitle: isBangla ? "আপনার বেট হিস্টোরি" : "Your bet history",
    loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
    noData: isBangla ? "কোনো বেট হিস্টোরি পাওয়া যায়নি" : "No bet history found",
    total: isBangla ? "মোট" : "Total",
    bet: isBangla ? "বেট" : "Bet",
    win: isBangla ? "উইন" : "Win",
    net: isBangla ? "নেট" : "Net",
    game: isBangla ? "গেম" : "Game",
    round: isBangla ? "রাউন্ড" : "Round",
    serial: isBangla ? "সিরিয়াল" : "Serial",
    status: isBangla ? "স্ট্যাটাস" : "Status",
    date: isBangla ? "তারিখ" : "Date",
    balanceBefore: isBangla ? "আগের ব্যালেন্স" : "Balance Before",
    balanceAfter: isBangla ? "পরের ব্যালেন্স" : "Balance After",
    page: isBangla ? "পেজ" : "Page",
    of: isBangla ? "এর" : "of",
    prev: isBangla ? "আগের" : "Prev",
    next: isBangla ? "পরের" : "Next",
    all: isBangla ? "সব" : "All",
    won: isBangla ? "জিতেছে" : "Won",
    lost: isBangla ? "হেরেছে" : "Lost",
    push: isBangla ? "পুশ" : "Push",
  };

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    params.append("page", String(page));
    params.append("limit", String(limit));

    if (resultType) {
      params.append("resultType", resultType);
    }

    return params.toString();
  }, [page, resultType]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["bet-history-modal", queryParams],
    queryFn: async () => {
      const res = await api.get(`/api/game-history/my?${queryParams}`);
      return res.data;
    },
    keepPreviousData: true,
    staleTime: 15000,
  });

  const rows = Array.isArray(data?.data) ? data.data : [];
  const meta = data?.meta || {};

  const total = Number(meta.total || rows.length || 0);
  const totalPages = Math.max(
    1,
    Math.ceil(Number(meta.total || 0) / Number(meta.limit || limit)) || 1,
  );

  const handleRefresh = async () => {
    try {
      await refetch();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Refresh failed");
    }
  };

  const statusBadge = (value) => {
    const s = String(value || "push").toLowerCase();

    if (s === "win") {
      return {
        label: t.won,
        bg: colors.successBg,
        text: colors.successText,
        icon: <CheckCircle2 size={14} />,
      };
    }

    if (s === "loss") {
      return {
        label: t.lost,
        bg: colors.dangerBg,
        text: colors.dangerText,
        icon: <XCircle size={14} />,
      };
    }

    return {
      label: t.push,
      bg: colors.warningBg,
      text: colors.warningText,
      icon: <Clock3 size={14} />,
    };
  };

  const netColor = (value) => {
    const num = Number(value || 0);

    if (num > 0) return colors.successText;
    if (num < 0) return colors.dangerText;

    return colors.normalText;
  };

  return (
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
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                <Receipt size={20} />
              </div>

              <div className="min-w-0">
                <p className="text-[14px] font-bold">{t.subtitle}</p>
                <p className="mt-1 text-[12px] opacity-80">
                  {t.total}: {total}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[4px] bg-white/15"
              style={{ color: colors.headerText }}
            >
              <RefreshCw
                size={17}
                className={isFetching ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>
      </div>

      <div
        className="shrink-0 px-4 py-3"
        style={{ backgroundColor: colors.sectionBg }}
      >
        <select
          value={resultType}
          onChange={(e) => {
            setResultType(e.target.value);
            setPage(1);
          }}
          className="h-[36px] w-full cursor-pointer rounded-[4px] border px-3 text-[13px] outline-none"
          style={{
            backgroundColor: colors.inputBg,
            color: colors.inputText,
            borderColor: colors.inputBorder,
          }}
        >
          <option value="">{t.all}</option>
          <option value="win">{t.won}</option>
          <option value="loss">{t.lost}</option>
          <option value="push">{t.push}</option>
        </select>
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
              const statusInfo = statusBadge(item?.resultType);

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
                        {t.game}: {item?.game_uid || "—"}
                      </p>

                      <p
                        className="mt-1 text-[12px]"
                        style={{ color: colors.mutedText }}
                      >
                        {t.date}: {formatDate(item?.createdAt)}
                      </p>
                    </div>

                    <span
                      className="flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-bold"
                      style={{
                        backgroundColor: statusInfo.bg,
                        color: statusInfo.text,
                        borderColor: statusInfo.bg,
                      }}
                    >
                      {statusInfo.icon}
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
                    <div
                      className="rounded-[4px] p-2"
                      style={{ backgroundColor: colors.summaryBg }}
                    >
                      <div
                        className="flex items-center gap-1"
                        style={{ color: colors.mutedText }}
                      >
                        <Wallet size={13} />
                        <span>{t.bet}</span>
                      </div>
                      <p
                        className="mt-1 font-bold"
                        style={{ color: colors.summaryText }}
                      >
                        {money(item?.bet_amount)}
                      </p>
                    </div>

                    <div
                      className="rounded-[4px] p-2"
                      style={{ backgroundColor: colors.summaryBg }}
                    >
                      <div
                        className="flex items-center gap-1"
                        style={{ color: colors.mutedText }}
                      >
                        <TrendingUp size={13} />
                        <span>{t.win}</span>
                      </div>
                      <p
                        className="mt-1 font-bold"
                        style={{ color: colors.normalText }}
                      >
                        {money(item?.win_amount)}
                      </p>
                    </div>

                    <div
                      className="rounded-[4px] p-2"
                      style={{ backgroundColor: colors.summaryBg }}
                    >
                      <div
                        className="flex items-center gap-1"
                        style={{ color: colors.mutedText }}
                      >
                        <Gamepad2 size={13} />
                        <span>{t.net}</span>
                      </div>
                      <p
                        className="mt-1 font-bold"
                        style={{ color: netColor(item?.net_amount) }}
                      >
                        {money(item?.net_amount)}
                      </p>
                    </div>

                    <div
                      className="rounded-[4px] p-2"
                      style={{ backgroundColor: colors.summaryBg }}
                    >
                      <div
                        className="flex items-center gap-1"
                        style={{ color: colors.mutedText }}
                      >
                        <Hash size={13} />
                        <span>{t.status}</span>
                      </div>
                      <p
                        className="mt-1 font-bold"
                        style={{ color: colors.normalText }}
                      >
                        {statusInfo.label}
                      </p>
                    </div>
                  </div>

                  <div
                    className="mt-3 rounded-[4px] p-3 text-[12px]"
                    style={{
                      backgroundColor: colors.summaryBg,
                      color: colors.mutedText,
                    }}
                  >
                    <p className="truncate">
                      {t.round}:{" "}
                      <span
                        className="font-bold"
                        style={{ color: colors.normalText }}
                      >
                        {item?.game_round || "—"}
                      </span>
                    </p>

                    <p className="mt-1 truncate">
                      {t.serial}:{" "}
                      <span
                        className="font-bold"
                        style={{ color: colors.normalText }}
                      >
                        {item?.serial_number || "—"}
                      </span>
                    </p>
                  </div>

                  <div
                    className="mt-3 grid grid-cols-2 gap-2 text-[11px]"
                    style={{ color: colors.mutedText }}
                  >
                    <div
                      className="rounded p-2"
                      style={{ backgroundColor: colors.inputBg }}
                    >
                      {t.balanceBefore}:{" "}
                      <span
                        className="font-bold"
                        style={{ color: colors.normalText }}
                      >
                        {money(item?.balance_before)}
                      </span>
                    </div>

                    <div
                      className="rounded p-2 text-right"
                      style={{ backgroundColor: colors.inputBg }}
                    >
                      {t.balanceAfter}:{" "}
                      <span
                        className="font-bold"
                        style={{ color: colors.normalText }}
                      >
                        {money(item?.balance_after)}
                      </span>
                    </div>
                  </div>
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

        <div className="grid grid-cols-2 gap-2">
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
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
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
  );
};

export default BetHistoryModal;
