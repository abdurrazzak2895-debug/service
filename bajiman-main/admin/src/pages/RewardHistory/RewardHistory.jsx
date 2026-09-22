// src/pages/RewardHistory/RewardHistory.jsx

import React, { useCallback, useEffect, useState } from "react";
import {
  FaCoins,
  FaHistory,
  FaSearch,
  FaSyncAlt,
  FaUsers,
  FaWallet,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const STATUS_OPTIONS = ["all", "completed", "processing", "failed"];
const PRIZE_TYPE_OPTIONS = ["all", "balance", "reward_coin", "no_prize"];

const RewardHistory = () => {
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState({
    totalSpins: 0,
    totalCoinSpent: 0,
    totalBalancePrize: 0,
    totalRewardCoinPrize: 0,
    uniqueUsers: 0,
  });

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [prizeType, setPrizeType] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 450);

    return () => clearTimeout(timer);
  }, [search]);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: 20,
      };

      if (debouncedSearch) params.search = debouncedSearch;
      if (status !== "all") params.status = status;
      if (prizeType !== "all") params.prizeType = prizeType;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const { data } = await api.get("/api/admin/wheel-spin-history", {
        params,
      });

      setHistory(data?.history || []);

      setSummary(
        data?.summary || {
          totalSpins: 0,
          totalCoinSpent: 0,
          totalBalancePrize: 0,
          totalRewardCoinPrize: 0,
          uniqueUsers: 0,
        },
      );

      setPagination({
        page: Number(data?.pagination?.page || currentPage),
        limit: Number(data?.pagination?.limit || 20),
        total: Number(data?.pagination?.total || 0),
        totalPages: Math.max(Number(data?.pagination?.totalPages || 1), 1),
      });
    } catch (error) {
      setHistory([]);

      toast.error(
        error?.response?.data?.message || "Failed to load Reward History",
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, status, prizeType, startDate, endDate]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const formatAmount = (item) => {
    const prize = item.prizeSnapshot || {};

    if (prize.prizeType === "no_prize") return "—";

    const amount = Number(prize.amount || 0).toLocaleString();

    return prize.prizeType === "reward_coin"
      ? `${amount} Coins`
      : `৳${amount}`;
  };

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("en-BD", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const statusBadge = (value) => {
    const map = {
      completed: "bg-emerald-500/20 text-emerald-400",
      processing: "bg-amber-500/20 text-amber-400",
      failed: "bg-red-500/20 text-red-400",
    };

    return (
      <span
        className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
          map[value] || "bg-gray-500/20 text-gray-400"
        }`}
      >
        {value}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#2f79c9]/20 to-black p-4 text-white lg:p-6">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-6">
          <h1 className="bg-gradient-to-r from-[#8fc2f5] via-white to-[#63a8ee] bg-clip-text text-2xl font-black text-transparent lg:text-3xl">
            Wheel Reward History
          </h1>

          <p className="mt-2 text-sm text-blue-100/80">
            All Wheel of Fortune Spin activity across every user.
          </p>
        </div>

        {/* Summary */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryCard
            icon={<FaHistory />}
            label="Total Spins"
            value={summary.totalSpins.toLocaleString()}
          />

          <SummaryCard
            icon={<FaCoins />}
            label="Coins Spent"
            value={summary.totalCoinSpent.toLocaleString()}
          />

          <SummaryCard
            icon={<FaWallet />}
            label="Balance Prizes"
            value={`৳${summary.totalBalancePrize.toLocaleString()}`}
          />

          <SummaryCard
            icon={<FaCoins />}
            label="Reward Coin Prizes"
            value={summary.totalRewardCoinPrize.toLocaleString()}
          />

          <SummaryCard
            icon={<FaUsers />}
            label="Unique Players"
            value={summary.uniqueUsers.toLocaleString()}
          />
        </div>

        {/* Filters */}
        <div className="mb-5 rounded-2xl border border-blue-300/20 bg-black/40 p-4 shadow-xl">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="relative lg:col-span-2">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8fc2f5]/60" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by username, phone, spin id..."
                className="h-11 w-full rounded-xl border border-blue-300/25 bg-black/50 pl-10 pr-3 text-sm outline-none focus:border-[#63a8ee]"
              />
            </div>

            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setCurrentPage(1);
              }}
              className="h-11 cursor-pointer rounded-xl border border-blue-300/25 bg-black/50 px-3 text-sm"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "All Status" : option}
                </option>
              ))}
            </select>

            <select
              value={prizeType}
              onChange={(event) => {
                setPrizeType(event.target.value);
                setCurrentPage(1);
              }}
              className="h-11 cursor-pointer rounded-xl border border-blue-300/25 bg-black/50 px-3 text-sm"
            >
              {PRIZE_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "All Prize Types" : option}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(event) => {
                  setStartDate(event.target.value);
                  setCurrentPage(1);
                }}
                className="h-11 w-full rounded-xl border border-blue-300/25 bg-black/50 px-2 text-xs outline-none"
              />

              <input
                type="date"
                value={endDate}
                onChange={(event) => {
                  setEndDate(event.target.value);
                  setCurrentPage(1);
                }}
                className="h-11 w-full rounded-xl border border-blue-300/25 bg-black/50 px-2 text-xs outline-none"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-blue-300/20 bg-black/40 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-blue-300/20 bg-black/40 text-xs font-bold uppercase text-blue-100/70">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Wheel</th>
                  <th className="px-4 py-3">Prize</th>
                  <th className="px-4 py-3">Spin Cost</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Spun At</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center">
                      <FaSyncAlt className="mx-auto animate-spin text-2xl text-[#63a8ee]" />
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-blue-100/60"
                    >
                      No Spin history found
                    </td>
                  </tr>
                ) : (
                  history.map((item) => (
                    <tr
                      key={item._id}
                      className="border-b border-white/5 transition hover:bg-white/5"
                    >
                      <td className="px-4 py-3">
                        <p className="font-bold text-white">
                          {item.user?.username || "User"}
                        </p>
                        <p className="text-[11px] text-blue-100/50">
                          {item.user?.phone || item.user?.email || ""}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-blue-100/80">
                        {item.wheel?.title?.en || item.wheelSnapshot?.title?.en || "-"}
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-bold text-[#8fc2f5]">
                          {formatAmount(item)}
                        </p>
                        <p className="text-[11px] text-blue-100/50">
                          {item.prizeSnapshot?.text?.en || ""}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-blue-100/80">
                        {item.spinCost} Coins
                      </td>

                      <td className="px-4 py-3">{statusBadge(item.status)}</td>

                      <td className="px-4 py-3 text-blue-100/70">
                        {formatDate(item.spunAt || item.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((page) => page - 1)}
              className="cursor-pointer rounded-lg bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <span className="rounded-lg bg-black/50 px-4 py-2 text-white">
              {currentPage} / {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= pagination.totalPages}
              onClick={() => setCurrentPage((page) => page + 1)}
              className="cursor-pointer rounded-lg bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({ icon, label, value }) => (
  <div className="rounded-xl border border-blue-300/20 bg-black/40 p-4 shadow-lg">
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2f79c9]/15 text-xl text-[#63a8ee]">
        {icon}
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase text-blue-100/70">
          {label}
        </p>

        <p className="mt-1 text-lg font-extrabold text-white">{value}</p>
      </div>
    </div>
  </div>
);

export default RewardHistory;
