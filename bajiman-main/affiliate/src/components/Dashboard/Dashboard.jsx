import React, { useEffect, useMemo, useState } from "react";
import {
  Copy,
  Eye,
  Loader2,
  RefreshCw,
  Share2,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import {
  selectAffiliateToken,
  selectAffiliateUser,
} from "../../features/auth/authSelectors";
import api from "../../api/axios";

const money = (value = 0, currency = "BDT") => {
  const symbol = currency === "USDT" ? "$" : "৳";
  return `${symbol} ${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const Dashboard = () => {
  const token = useSelector(selectAffiliateToken);
  const user = useSelector(selectAffiliateUser);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [dash, setDash] = useState(null);
  const [copied, setCopied] = useState(false);

  const baseUrl = (import.meta.env.VITE_CLIENT_URL || window.location.origin)
    .trim()
    .replace(/\/+$/, "");

  const referralLink = useMemo(() => {
    const code = user?.referralCode || dash?.affiliate?.referralCode || "";
    return code
      ? `${baseUrl}/?ref=${encodeURIComponent(code)}`
      : `${baseUrl}/register`;
  }, [baseUrl, user?.referralCode, dash?.affiliate?.referralCode]);

  const fetchDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const { data } = await api.get("/api/affiliate/dashboard/me");

      if (!data?.success) {
        throw new Error(data?.message || "Dashboard load failed");
      }

      setDash(data.data);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load dashboard",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) fetchDashboard(false);
  }, [token]);

  const currency = dash?.affiliate?.currency || user?.currency || "BDT";
  const statsData = dash?.stats || {};

  const totalCommission =
    Number(statsData.referCommissionBalance || 0) +
    Number(statsData.depositCommissionBalance || 0) +
    Number(statsData.gameLossCommissionBalance || 0) +
    Number(statsData.gameWinCommissionBalance || 0);

  const stats = [
    {
      title: "Total Referrals",
      value: String(statsData.totalReferrals || 0),
      hint: `+${statsData.thisMonthNewReferrals || 0} this month`,
      icon: Users,
    },
    {
      title: "Active Referrals",
      value: String(statsData.activeReferrals || 0),
      hint: "Active users",
      icon: Eye,
    },
    {
      title: "Total Commission",
      value: money(totalCommission, currency),
      hint: "Total wallet",
      icon: Wallet,
    },
    {
      title: "This Month Earnings",
      value: money(statsData.thisMonthEarnings || 0, currency),
      hint: "Monthly income",
      icon: TrendingUp,
    },
  ];

  const copyReferral = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Referral link copied");
      setTimeout(() => setCopied(false), 2200);
    } catch {
      toast.error("Copy failed");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-[#1A79D3]/20 bg-white/[0.07] px-6 py-4 text-slate-200">
          <Loader2 className="h-5 w-5 animate-spin text-[#1A79D3]" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="mb-6 flex flex-col gap-4 rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.07] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-[#6fb5f4] via-[#1A79D3] to-[#3ea0ff] bg-clip-text text-2xl font-black text-transparent md:text-4xl">
              Affiliate Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Welcome back, {user?.userId || "Affiliate"}! Track your referrals
              and commission overview.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-5 py-3 text-sm font-black text-white shadow-[0_18px_50px_rgba(26,121,211,0.28)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        <div className="mb-6 rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.07] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <h3 className="mb-3 text-lg font-black text-[#6fb5f4]">
            Your Referral Link
          </h3>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="min-w-0 flex-1 break-all rounded-2xl border border-white/10 bg-black/35 px-4 py-3 font-mono text-sm text-slate-200">
              {referralLink}
            </div>

            <button
              type="button"
              onClick={copyReferral}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-5 py-3 text-sm font-black text-white transition hover:scale-[1.01]"
            >
              <Copy className="h-4 w-4" />
              {copied ? "Copied!" : "Copy Link"}
            </button>

            <button
              type="button"
              onClick={copyReferral}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/35 px-5 py-3 text-sm font-black text-white transition hover:border-[#1A79D3]/40 hover:bg-[#1A79D3]/10"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="rounded-[24px] border border-[#1A79D3]/20 bg-white/[0.07] p-5 shadow-xl shadow-black/30 backdrop-blur-xl transition hover:bg-[#1A79D3]/10"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-400">
                      {item.title}
                    </p>
                    <h3 className="mt-2 break-words text-2xl font-black text-white">
                      {item.value}
                    </h3>
                  </div>

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1A79D3]/15 text-[#6fb5f4]">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>

                <p className="mt-4 text-sm text-slate-400">{item.hint}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.07] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <h3 className="mb-5 text-xl font-black text-[#6fb5f4]">
              Commission Overview
            </h3>

            <div className="space-y-3">
              <CommissionRow
                label="Refer Commission"
                value={money(statsData.referCommissionBalance || 0, currency)}
              />
              <CommissionRow
                label="Deposit Commission"
                value={money(statsData.depositCommissionBalance || 0, currency)}
              />
              <CommissionRow
                label="Game Loss Commission"
                value={money(
                  statsData.gameLossCommissionBalance || 0,
                  currency,
                )}
              />
              <CommissionRow
                label="Game Win Commission"
                value={money(statsData.gameWinCommissionBalance || 0, currency)}
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.07] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h3 className="text-xl font-black text-[#6fb5f4]">
                Recent Referrals
              </h3>

              <Link
                to="/dashboard/my-users"
                className="cursor-pointer rounded-xl bg-[#1A79D3]/15 px-4 py-2 text-sm font-bold text-[#6fb5f4] transition hover:bg-[#1A79D3]/25"
              >
                View All
              </Link>
            </div>

            {(dash?.recentReferrals || []).length ? (
              <div className="space-y-3">
                {dash.recentReferrals.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-white">
                        {item.userId || "Unknown"}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {item.phone || "N/A"}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black ${
                        item.isActive
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                          : "border-red-500/40 bg-red-500/10 text-red-300"
                      }`}
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-black/25 p-8 text-center text-slate-400">
                No referrals found
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const CommissionRow = ({ label, value }) => {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
      <span className="text-sm font-bold text-slate-300">{label}</span>
      <span className="text-sm font-black text-[#6fb5f4]">{value}</span>
    </div>
  );
};

export default Dashboard;
