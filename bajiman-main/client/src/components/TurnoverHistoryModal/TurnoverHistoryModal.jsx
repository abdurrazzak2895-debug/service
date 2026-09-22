import React, { useMemo, useState } from "react";
import {
  Clock3,
  CheckCircle2,
  Receipt,
  Wallet,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Target,
  TrendingUp,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import api from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";
import { selectTransactionHistoryColorSetting } from "../../features/global/globalSelectors";
import { selectGameProviders } from "../../features/globalGame/globalGameSelectors";

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
  progressBg: "#0865a9",
  progressTrackBg: "#ffffff",
  successBg: "#dcfce7",
  successText: "#15803d",
  warningBg: "#fef9c3",
  warningText: "#a16207",
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

const sourceText = (sourceType = "", isBangla = false) => {
  const v = String(sourceType || "").toLowerCase();

  if (v === "deposit") return isBangla ? "ডিপোজিট" : "Deposit";
  if (v === "auto-deposit") return isBangla ? "অটো ডিপোজিট" : "Auto Deposit";
  if (v === "auto-personal-deposit")
    return isBangla ? "অটো পার্সোনাল ডিপোজিট" : "Auto Personal Deposit";
  if (v === "register-bonus")
    return isBangla ? "রেজিস্টার বোনাস" : "Register Bonus";
  if (v === "admin-manual-deposit")
    return isBangla ? "এডমিন ম্যানুয়াল ডিপোজিট" : "Admin Manual Deposit";

  return sourceType || "—";
};

const percent = (progress, required) => {
  const p = Number(progress || 0);
  const r = Number(required || 0);
  if (!r || r <= 0) return 0;
  return Math.min(100, Math.max(0, Math.floor((p / r) * 100)));
};

const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

// eligibleProviders is snapshotted per-turnover (from whichever deposit/
// bonus config generated it — see server/models/TurnOver.js), so each
// card can have its own restriction. This just attaches display name/
// icon from the already-loaded live provider catalog.
const mapEligibleProviders = (rawList, gameProviders) => {
  const list = Array.isArray(rawList) ? rawList : [];

  return list
    .map((item) => {
      const code = String(item?.providerCode || "").toUpperCase();
      const providerInfo = (
        Array.isArray(gameProviders) ? gameProviders : []
      ).find((p) => String(p?.providerCode || "").toUpperCase() === code);

      return {
        code,
        percent: Number(item?.percent ?? 100),
        name: providerInfo?.providerName || code,
        iconUrl: providerInfo?.providerIconUrl || "",
      };
    })
    .filter((item) => item.code);
};

// Each eligible provider's percent is a dedicated minimum share of this
// turnover's required amount — build one progress bucket per provider
// plus, if their percents don't add up to 100, one "open" bucket any
// provider can fill. Mirrors the exact allocation logic in
// server/routes/callbackRoutes.js.
const buildProviderBreakdown = (item, eligibleProviders, openLabel) => {
  if (!eligibleProviders.length) return [];

  const required = Number(item?.required || 0);
  const providerProgressList = Array.isArray(item?.providerProgress)
    ? item.providerProgress
    : [];

  const sumProviderProgress = providerProgressList.reduce(
    (sum, entry) => sum + Number(entry?.progress || 0),
    0,
  );

  const totalEligiblePercent = Math.min(
    100,
    eligibleProviders.reduce((sum, provider) => sum + provider.percent, 0),
  );
  const openPercent = Math.max(0, 100 - totalEligiblePercent);
  const openDone = Math.max(0, round2(Number(item?.progress || 0) - sumProviderProgress));

  const buckets = eligibleProviders.map((provider) => {
    const entry = providerProgressList.find(
      (p) => String(p?.providerCode || "").toUpperCase() === provider.code,
    );
    const quota = round2((required * provider.percent) / 100);
    const done = round2(Math.min(quota, Number(entry?.progress || 0)));

    return {
      key: provider.code,
      name: provider.name,
      iconUrl: provider.iconUrl,
      quota,
      done,
    };
  });

  if (openPercent > 0) {
    const openQuota = round2((required * openPercent) / 100);

    buckets.push({
      key: "__open__",
      name: openLabel,
      iconUrl: "",
      quota: openQuota,
      done: round2(Math.min(openQuota, openDone)),
    });
  }

  return buckets;
};

const TurnoverHistoryModal = ({ onBackToDeposit }) => {
  const { isBangla } = useLanguage();

  const transactionHistoryColorSetting = useSelector(
    selectTransactionHistoryColorSetting,
  );

  const colors = {
    ...defaultHistoryColors,
    ...(transactionHistoryColorSetting || {}),
  };

  const gameProviders = useSelector(selectGameProviders);

  const [page, setPage] = useState(1);
  const limit = 10;

  const t = {
    subtitle: isBangla ? "আপনার টার্নওভার হিস্টোরি" : "Your turnover history",
    loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
    noData: isBangla
      ? "কোনো টার্নওভার হিস্টোরি পাওয়া যায়নি"
      : "No turnover history found",
    total: isBangla ? "মোট" : "Total",
    source: isBangla ? "সোর্স" : "Source",
    required: isBangla ? "প্রয়োজনীয়" : "Required",
    progress: isBangla ? "প্রগ্রেস" : "Progress",
    creditedAmount: isBangla ? "ক্রেডিট এমাউন্ট" : "Credited Amount",
    status: isBangla ? "স্ট্যাটাস" : "Status",
    date: isBangla ? "তারিখ" : "Date",
    completedAt: isBangla ? "সম্পন্ন হয়েছে" : "Completed At",
    page: isBangla ? "পেজ" : "Page",
    of: isBangla ? "এর" : "of",
    prev: isBangla ? "আগের" : "Prev",
    next: isBangla ? "পরের" : "Next",
    back: isBangla ? "ডিপোজিটে যান" : "Back To Deposit",
    running: isBangla ? "চলমান" : "Running",
    completed: isBangla ? "সম্পন্ন" : "Completed",
    refresh: isBangla ? "রিফ্রেশ" : "Refresh",
    openBucket: isBangla ? "অন্য যেকোনো প্রোভাইডার" : "Any other provider",
    providerBreakdown: isBangla
      ? "প্রোভাইডার অনুযায়ী অগ্রগতি"
      : "Progress by provider",
  };

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    params.append("page", String(page));
    params.append("limit", String(limit));

    return params.toString();
  }, [page]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["turnover-history-modal", queryParams],
    queryFn: async () => {
      const res = await api.get(`/api/turnovers/my?${queryParams}`);
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

  const statusBadge = (statusValue) => {
    const s = String(statusValue || "running").toLowerCase();

    if (s === "completed") {
      return {
        label: t.completed,
        bg: colors.successBg,
        text: colors.successText,
        icon: <CheckCircle2 size={14} />,
      };
    }

    return {
      label: t.running,
      bg: colors.warningBg,
      text: colors.warningText,
      icon: <Clock3 size={14} />,
    };
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
              const statusInfo = statusBadge(item?.status);
              const progressPercent = percent(item?.progress, item?.required);
              const itemEligibleProviders = mapEligibleProviders(
                item?.eligibleProviders,
                gameProviders,
              );

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
                        {sourceText(item?.sourceType, isBangla)}
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
                        <Target size={13} />
                        <span>{t.required}</span>
                      </div>

                      <p
                        className="mt-1 font-bold"
                        style={{ color: colors.summaryText }}
                      >
                        {money(item?.required)}
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
                        <span>{t.progress}</span>
                      </div>

                      <p
                        className="mt-1 font-bold"
                        style={{ color: colors.normalText }}
                      >
                        {money(item?.progress)}
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
                        <Wallet size={13} />
                        <span>{t.creditedAmount}</span>
                      </div>

                      <p
                        className="mt-1 font-bold"
                        style={{ color: colors.normalText }}
                      >
                        {money(item?.creditedAmount)}
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
                        <CheckCircle2 size={13} />
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
                    className="mt-3 rounded-[4px] p-3"
                    style={{ backgroundColor: colors.summaryBg }}
                  >
                    <div
                      className="mb-2 flex items-center justify-between text-[12px] font-bold"
                      style={{ color: colors.summaryText }}
                    >
                      <span>{t.progress}</span>
                      <span>{progressPercent}%</span>
                    </div>

                    <div
                      className="h-[8px] overflow-hidden rounded-full"
                      style={{ backgroundColor: colors.progressTrackBg }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${progressPercent}%`,
                          backgroundColor: colors.progressBg,
                        }}
                      />
                    </div>
                  </div>

                  {itemEligibleProviders.length ? (
                    <div className="mt-3">
                      <p
                        className="mb-2 text-[11px] font-bold"
                        style={{ color: colors.mutedText }}
                      >
                        {t.providerBreakdown}
                      </p>

                      <div className="space-y-2">
                        {buildProviderBreakdown(
                          item,
                          itemEligibleProviders,
                          t.openBucket,
                        ).map((bucket) => {
                          const bucketPercent =
                            bucket.quota > 0
                              ? Math.min(
                                  100,
                                  Math.floor((bucket.done / bucket.quota) * 100),
                                )
                              : 0;
                          const bucketDone =
                            bucket.quota > 0 && bucket.done >= bucket.quota;

                          return (
                            <div
                              key={bucket.key}
                              className="rounded-[4px] p-2"
                              style={{ backgroundColor: colors.inputBg }}
                            >
                              <div className="flex items-center justify-between gap-2 text-[11px]">
                                <div className="flex min-w-0 items-center gap-1.5">
                                  {bucket.iconUrl ? (
                                    <img
                                      src={bucket.iconUrl}
                                      alt={bucket.name}
                                      className="h-4 w-4 shrink-0 rounded object-contain"
                                    />
                                  ) : null}

                                  <span
                                    className="truncate font-bold"
                                    style={{ color: colors.normalText }}
                                  >
                                    {bucket.name}
                                  </span>

                                  {bucketDone ? (
                                    <CheckCircle2
                                      size={12}
                                      style={{ color: colors.successText }}
                                    />
                                  ) : null}
                                </div>

                                <span
                                  className="shrink-0 font-bold"
                                  style={{ color: colors.normalText }}
                                >
                                  {money(bucket.done)} / {money(bucket.quota)}
                                </span>
                              </div>

                              <div
                                className="mt-1 h-[5px] overflow-hidden rounded-full"
                                style={{
                                  backgroundColor: colors.progressTrackBg,
                                }}
                              >
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${bucketPercent}%`,
                                    backgroundColor: bucketDone
                                      ? colors.successText
                                      : colors.progressBg,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  <div
                    className="mt-3 grid grid-cols-2 gap-2 text-[11px]"
                    style={{ color: colors.mutedText }}
                  >
                    <div
                      className="rounded p-2"
                      style={{ backgroundColor: colors.inputBg }}
                    >
                      {t.completedAt}:{" "}
                      <span
                        className="font-bold"
                        style={{ color: colors.normalText }}
                      >
                        {formatDate(item?.completedAt)}
                      </span>
                    </div>

                    <div
                      className="rounded p-2 text-right"
                      style={{ backgroundColor: colors.inputBg }}
                    >
                      ID:{" "}
                      <span
                        className="font-bold"
                        style={{ color: colors.normalText }}
                      >
                        {String(item?._id || "").slice(-8)}
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
            onClick={onBackToDeposit}
            className="h-[38px] cursor-pointer rounded-[4px] text-[13px] font-bold"
            style={{
              backgroundColor: colors.primaryBg,
              color: colors.primaryText,
            }}
          >
            {t.back}
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

export default TurnoverHistoryModal;
