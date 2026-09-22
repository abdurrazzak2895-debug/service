import React, { useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Wallet,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Gift,
  Gamepad2,
  Coins,
  Loader2,
  BadgeDollarSign,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const money = (value, currency = "BDT") => {
  const symbol = String(currency).toUpperCase() === "USDT" ? "$" : "৳";
  const num = Number(value || 0);

  return `${symbol} ${
    Number.isFinite(num)
      ? num.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "0.00"
  }`;
};

const toNum = (value) => {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num : 0;
};

const CommissionStatus = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await api.get("/api/affiliate/commission-status");

      if (!res?.data?.success) {
        throw new Error(
          res?.data?.message || "Failed to load commission status",
        );
      }

      setData(res.data.data || null);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load commission status",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(false);
  }, []);

  const currency = data?.currency || "BDT";

  const summary = useMemo(() => {
    const mainBalance = toNum(data?.mainBalance);
    const commissionBalance = toNum(data?.commissionBalance);

    const gameLossCommission = toNum(data?.gameLossCommission);
    const gameWinCommission = toNum(data?.gameWinCommission);
    const referCommission = toNum(data?.referCommission);
    const depositCommission = toNum(data?.depositCommission);

    const gameWinCommissionBalance = toNum(data?.gameWinCommissionBalance);
    const referCommissionBalance = toNum(data?.referCommissionBalance);
    const depositCommissionBalance = toNum(data?.depositCommissionBalance);
    const gameLossCommissionBalance = toNum(data?.gameLossCommissionBalance);

    const totalRate =
      gameLossCommission +
      gameWinCommission +
      referCommission +
      depositCommission;

    const totalCommissionBalance =
      referCommissionBalance +
      depositCommissionBalance +
      gameLossCommissionBalance +
      gameWinCommissionBalance;

    return {
      mainBalance,
      commissionBalance,
      totalRate,
      totalCommissionBalance,
      gameLossCommission,
      gameWinCommission,
      referCommission,
      depositCommission,
      gameWinCommissionBalance,
      referCommissionBalance,
      depositCommissionBalance,
      gameLossCommissionBalance,
    };
  }, [data]);

  return (
    <div className="min-h-screen text-white">
      <div className="rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.07] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-2xl border border-[#1A79D3]/20 bg-[#1A79D3]/10 px-4 py-2">
              <Coins className="h-4 w-4 text-[#1A79D3]" />
              <span className="text-xs font-bold text-[#6fb5f4]">
                Affiliate Commission
              </span>
            </div>

            <h1 className="bg-gradient-to-r from-[#6fb5f4] via-[#1A79D3] to-[#3ea0ff] bg-clip-text text-2xl font-black text-transparent md:text-3xl">
              Commission Status
            </h1>

            <p className="mt-2 text-sm text-slate-300">
              View your commission rates, commission balances and wallet
              summary.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchData(true)}
            disabled={loading || refreshing}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-5 py-3 text-sm font-black text-white shadow-[0_18px_50px_rgba(26,121,211,0.30)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <MainCard
            title="Main Balance"
            value={money(summary.mainBalance, currency)}
            subtitle="Current playable wallet balance"
            icon={<Wallet className="h-7 w-7" />}
          />

          <MainCard
            title="Commission Summary"
            value={money(summary.totalCommissionBalance, currency)}
            subtitle={`Total Rate Sum: ${money(summary.totalRate, currency)} | Available Commission: ${money(summary.commissionBalance, currency)}`}
            icon={<TrendingUp className="h-7 w-7" />}
          />
        </div>
      )}

      <Section
        title="Commission Rates"
        icon={<BadgeDollarSign className="h-5 w-5" />}
      >
        {loading ? (
          <GridSkeleton />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <InfoCard
              title="Game Loss Commission"
              value={money(summary.gameLossCommission, currency)}
              subtitle="Game loss commission rate/value"
              icon={<ArrowUp className="h-6 w-6" />}
            />
            <InfoCard
              title="Game Win Commission"
              value={money(summary.gameWinCommission, currency)}
              subtitle="Game win commission rate/value"
              icon={<ArrowDown className="h-6 w-6" />}
            />
            <InfoCard
              title="Refer Commission"
              value={money(summary.referCommission, currency)}
              subtitle="Referral commission per user"
              icon={<Gift className="h-6 w-6" />}
            />
            <InfoCard
              title="Deposit Commission"
              value={money(summary.depositCommission, currency)}
              subtitle="Deposit commission rate/value"
              icon={<Wallet className="h-6 w-6" />}
            />
          </div>
        )}
      </Section>

      <Section
        title="Commission Balances"
        icon={<Gamepad2 className="h-5 w-5" />}
      >
        {loading ? (
          <GridSkeleton />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <InfoCard
              title="Game Win Commission Balance"
              value={money(summary.gameWinCommissionBalance, currency)}
              subtitle="Pending game win commission"
              icon={<ArrowDown className="h-6 w-6" />}
            />
            <InfoCard
              title="Refer Commission Balance"
              value={money(summary.referCommissionBalance, currency)}
              subtitle="Pending referral commission"
              icon={<Gift className="h-6 w-6" />}
            />
            <InfoCard
              title="Deposit Commission Balance"
              value={money(summary.depositCommissionBalance, currency)}
              subtitle="Pending deposit commission"
              icon={<Wallet className="h-6 w-6" />}
            />
            <InfoCard
              title="Game Loss Commission Balance"
              value={money(summary.gameLossCommissionBalance, currency)}
              subtitle="Pending game loss commission"
              icon={<ArrowUp className="h-6 w-6" />}
            />
          </div>
        )}
      </Section>
    </div>
  );
};

const MainCard = ({ title, value, subtitle, icon }) => (
  <div className="rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.07] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
    <div className="flex items-center gap-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#1A79D3]/15 text-[#6fb5f4]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-400">{title}</p>
        <h2 className="mt-1 break-words text-3xl font-black text-white">
          {value}
        </h2>
        <p className="mt-2 text-xs text-slate-400">{subtitle}</p>
      </div>
    </div>
  </div>
);

const Section = ({ title, icon, children }) => (
  <div className="mt-5 rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.07] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
    <div className="mb-5 flex items-center gap-3">
      <div className="text-[#6fb5f4]">{icon}</div>
      <h2 className="text-xl font-black text-[#6fb5f4]">{title}</h2>
    </div>
    {children}
  </div>
);

const InfoCard = ({ title, value, subtitle, icon }) => (
  <div className="rounded-2xl border border-[#1A79D3]/20 bg-black/35 p-5 transition hover:border-[#1A79D3]/50 hover:bg-[#1A79D3]/10">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[13px] font-bold text-slate-400">{title}</p>
        <h3 className="mt-2 break-words text-2xl font-black text-white">
          {value}
        </h3>
        <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
      </div>

      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1A79D3]/15 text-[#6fb5f4]">
        {icon}
      </div>
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="h-[135px] animate-pulse rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.07]" />
);

const GridSkeleton = () => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
    {[1, 2, 3, 4].map((item) => (
      <SkeletonCard key={item} />
    ))}
  </div>
);

export default CommissionStatus;
