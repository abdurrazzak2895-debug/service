import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FaSyncAlt,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaGamepad,
  FaMoneyBillWave,
  FaTrophy,
  FaChartLine,
  FaUsers,
  FaReceipt,
  FaDice,
  FaTimesCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const fmtMoney = (n) => {
  const num = Number(n || 0);
  if (!Number.isFinite(num)) return "0.00";

  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const fmtNumber = (n) => {
  const num = Number(n || 0);
  if (!Number.isFinite(num)) return "0";
  return num.toLocaleString("en-US");
};

const fmtDateTime = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleString();
};

const num = (v) => {
  const n = Number(v || 0);
  return Number.isFinite(n) ? n : 0;
};

const getResultType = (v) => String(v || "").toLowerCase();

const resultClass = (resultType) => {
  const s = getResultType(resultType);

  if (s === "win") {
    return "border border-emerald-400/30 bg-emerald-500/15 text-emerald-200";
  }

  if (s === "loss") {
    return "border border-red-400/30 bg-red-500/15 text-red-200";
  }

  if (s === "push") {
    return "border border-yellow-400/30 bg-yellow-500/15 text-yellow-200";
  }

  return "border border-[#1A79D3]/20 bg-black/35 text-slate-200";
};

const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-3 border-b border-[#1A79D3]/10 py-2 last:border-b-0">
    <div className="text-[12px] font-bold text-slate-400">{label}</div>
    <div className="break-all text-right text-[12px] font-semibold text-white/90">
      {value || "-"}
    </div>
  </div>
);

const SummaryCard = ({ icon: Icon, label, value, sub, tone = "blue" }) => {
  const tones = {
    blue: "border-[#1A79D3]/20 bg-[#1A79D3]/15 text-[#6fb5f4] shadow-black/40",
    green:
      "border-emerald-300/20 bg-emerald-500/15 text-emerald-100 shadow-black/40",
    red: "border-red-300/20 bg-red-500/15 text-red-100 shadow-black/40",
    yellow:
      "border-yellow-300/20 bg-yellow-500/15 text-yellow-100 shadow-black/40",
    purple:
      "border-purple-300/20 bg-purple-500/15 text-purple-100 shadow-black/40",
  };

  return (
    <div
      className={`rounded-2xl border p-4 shadow-lg ${
        tones[tone] || tones.blue
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-400">{label}</p>

          <p className="mt-2 break-words text-xl font-black text-white md:text-2xl">
            {value}
          </p>

          {sub ? <p className="mt-1 text-xs text-slate-500">{sub}</p> : null}
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/35">
          <Icon className="text-xl" />
        </div>
      </div>
    </div>
  );
};

const AllGameHistory = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [limit] = useState(15);

  const [resultType, setResultType] = useState("");
  const [search, setSearch] = useState("");

  const params = useMemo(
    () => ({
      page,
      limit,
      resultType: resultType || undefined,
      q: search || undefined,
    }),
    [page, limit, resultType, search],
  );

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["all-game-history", params],
    queryFn: async () => {
      const res = await api.get("/api/game-history/admin", { params });
      return res.data;
    },
    staleTime: 10_000,
    retry: 1,
  });

  const rows = data?.data || [];
  const meta = data?.meta || {};

  const total = Number(meta?.total || 0);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const apiSummary = data?.summary || {};

  const summary = {
    totalBetAmount: apiSummary.totalBetAmount || 0,
    totalWinAmount: apiSummary.totalWinAmount || 0,
    totalNetAmount: apiSummary.totalNetAmount || 0,
    siteProfit: apiSummary.siteProfit || 0,
    totalTransactions: apiSummary.totalTransactions || total,
    pageRecords: rows.length,
    totalWinCount: apiSummary.totalWinCount || 0,
    totalLossCount: apiSummary.totalLossCount || 0,
    totalPushCount: apiSummary.totalPushCount || 0,
  };
  const clearFilters = () => {
    setPage(1);
    setResultType("");
    setSearch("");
  };

  const goUserDetails = (row) => {
    const userMongoId = String(row?.user?._id || row?.user || "").trim();

    if (!userMongoId) {
      toast.error("User id not found");
      return;
    }

    navigate(`/single-user-details/${userMongoId}`);
  };

  return (
    <div className="relative min-h-[calc(100vh-120px)] overflow-hidden text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,121,211,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(26,121,211,0.12),transparent_38%)]" />

      <div className="relative z-10">
        <div className="mb-5 rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.05] p-4 shadow-2xl shadow-black/50 backdrop-blur-xl md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1A79D3]/30 bg-[#1A79D3]/15 text-[#3ea0ff] shadow-[0_0_35px_rgba(26,121,211,0.22)]">
                <FaGamepad className="text-xl" />
              </div>

              <div>
                <h1 className="bg-gradient-to-r from-[#6fb5f4] via-[#1A79D3] to-[#3ea0ff] bg-clip-text text-xl font-black tracking-tight text-transparent md:text-2xl">
                  All Game History
                </h1>
                <p className="mt-1 text-sm text-slate-300">
                  Monitor all user game rounds, bet, win, net amount and
                  balances.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#1A79D3]/20 bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-5 py-3 text-sm font-bold text-white shadow-[0_18px_50px_rgba(26,121,211,0.25)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaSyncAlt className={isFetching ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={FaReceipt}
            label="All Bet Amount"
            value={`৳ ${fmtMoney(summary.totalBetAmount)}`}
            sub="All filtered bet amount"
            tone="blue"
          />

          <SummaryCard
            icon={FaTrophy}
            label="All Win Amount"
            value={`৳ ${fmtMoney(summary.totalWinAmount)}`}
            sub="All filtered win amount"
            tone="green"
          />

          <SummaryCard
            icon={FaMoneyBillWave}
            label="All Net Amount"
            value={`৳ ${fmtMoney(summary.totalNetAmount)}`}
            sub="All filtered player net"
            tone={summary.totalNetAmount >= 0 ? "green" : "red"}
          />

          <SummaryCard
            icon={FaChartLine}
            label="All Site Profit"
            value={`৳ ${fmtMoney(summary.siteProfit)}`}
            sub={summary.siteProfit >= 0 ? "House profit" : "House loss"}
            tone={summary.siteProfit >= 0 ? "green" : "red"}
          />

          <SummaryCard
            icon={FaUsers}
            label="Total Records"
            value={fmtNumber(summary.totalTransactions)}
            sub="All matched records"
            tone="purple"
          />

          <SummaryCard
            icon={FaDice}
            label="Page Records"
            value={fmtNumber(summary.pageRecords)}
            sub="Current page records"
            tone="blue"
          />

          <SummaryCard
            icon={FaTrophy}
            label="All Win Count"
            value={fmtNumber(summary.totalWinCount)}
            sub="All filtered win count"
            tone="green"
          />

          <SummaryCard
            icon={FaTimesCircle}
            label="All Loss Count"
            value={fmtNumber(summary.totalLossCount)}
            sub={`Push: ${fmtNumber(summary.totalPushCount)}`}
            tone="red"
          />
        </div>

        <div className="mb-5 rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.05] p-4 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-200">
            <FaFilter className="text-[#3ea0ff]" />
            Filters
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="relative xl:col-span-2">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3ea0ff]" />
              <input
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                placeholder="Search userId, gameplay name, phone, email, game UID, round, serial..."
                className="h-11 w-full rounded-2xl border border-[#1A79D3]/20 bg-black/50 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-[#1A79D3]/70 focus:ring-2 focus:ring-[#1A79D3]/30"
              />
            </div>

            <select
              value={resultType}
              onChange={(e) => {
                setPage(1);
                setResultType(e.target.value);
              }}
              className="h-11 cursor-pointer rounded-2xl border border-[#1A79D3]/20 bg-black/50 px-3 text-sm text-white outline-none transition focus:border-[#1A79D3]/70 focus:ring-2 focus:ring-[#1A79D3]/30"
            >
              <option value="">All Results</option>
              <option value="win">Win</option>
              <option value="loss">Loss</option>
              <option value="push">Push</option>
            </select>

            <button
              type="button"
              onClick={clearFilters}
              className="h-11 cursor-pointer rounded-2xl border border-[#1A79D3]/20 bg-black/50 px-5 text-sm font-bold text-white transition hover:border-[#1A79D3]/70 hover:bg-[#1A79D3]/15"
            >
              Clear Filter
            </button>
          </div>

          <div className="mt-4 text-xs text-slate-500">
            Search works from backend query: userId, userGamePlayName, phone,
            email, member account, game UID, game round and serial number.
          </div>
        </div>

        <div className="hidden overflow-hidden rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.05] shadow-2xl shadow-black/50 backdrop-blur-xl lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1550px]">
              <thead>
                <tr className="bg-gradient-to-r from-[#1A79D3]/35 to-[#3ea0ff]/20 text-left">
                  {[
                    "Time",
                    "User",
                    "Gameplay",
                    "Game Name",
                    "Game UID",
                    "Round",
                    "Serial",
                    "Result",
                    "Bet",
                    "Win",
                    "Net",
                    "Before",
                    "After",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-4 text-sm font-semibold text-white"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan="13"
                      className="px-5 py-10 text-center text-slate-300"
                    >
                      Loading game history...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td
                      colSpan="13"
                      className="px-5 py-10 text-center text-red-300"
                    >
                      Failed to load game history.
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan="13"
                      className="px-5 py-10 text-center text-slate-300"
                    >
                      No game history found.
                    </td>
                  </tr>
                ) : (
                  rows.map((x, idx) => (
                    <tr
                      key={x._id || x.serial_number || `${x.createdAt}-${idx}`}
                      className={`border-t border-[#1A79D3]/10 text-sm transition hover:bg-[#1A79D3]/10 ${
                        idx % 2 === 0 ? "bg-black/20" : "bg-transparent"
                      }`}
                    >
                      <td className="px-4 py-3 text-slate-200">
                        {fmtDateTime(x.createdAt)}
                      </td>

                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => goUserDetails(x)}
                          className="cursor-pointer text-left font-bold text-white underline decoration-[#3ea0ff]/40 underline-offset-4 transition hover:text-[#6fb5f4]"
                          title="View user details"
                        >
                          {x.userId || x.user?.userId || "-"}
                        </button>

                        <div className="mt-1 text-xs text-slate-400">
                          {x.phone ||
                            x.user?.phone ||
                            x.email ||
                            x.user?.email ||
                            x.member_account ||
                            "-"}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-slate-200">
                        <div className="font-bold text-white">
                          {x.userGamePlayName ||
                            x.user?.userGamePlayName ||
                            "-"}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          {x.member_account || "-"}
                        </div>
                      </td>

                      <td className="max-w-[170px] break-all px-4 py-3 text-sm font-bold text-white">
                        {x.game_name || "-"}
                      </td>

                      <td className="max-w-[170px] break-all px-4 py-3 text-xs text-slate-300">
                        {x.game_uid || "-"}
                      </td>

                      <td className="max-w-[170px] break-all px-4 py-3 text-xs text-slate-300">
                        {x.game_round || "-"}
                      </td>

                      <td className="max-w-[170px] break-all px-4 py-3 text-xs text-slate-300">
                        {x.serial_number || "-"}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-md px-2 py-[3px] text-[12px] font-bold uppercase ${resultClass(
                            x.resultType,
                          )}`}
                        >
                          {x.resultType || "-"}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-bold text-white">
                        ৳ {fmtMoney(x.bet_amount)}
                      </td>

                      <td className="px-4 py-3 text-slate-200">
                        ৳ {fmtMoney(x.win_amount)}
                      </td>

                      <td
                        className={`px-4 py-3 font-bold ${
                          num(x.net_amount) >= 0
                            ? "text-emerald-200"
                            : "text-red-200"
                        }`}
                      >
                        ৳ {fmtMoney(x.net_amount)}
                      </td>

                      <td className="px-4 py-3 text-slate-200">
                        ৳ {fmtMoney(x.balance_before)}
                      </td>

                      <td className="px-4 py-3 text-slate-200">
                        ৳ {fmtMoney(x.balance_after)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3 lg:hidden">
          {isLoading ? (
            <div className="rounded-2xl border border-[#1A79D3]/20 bg-black/50 p-6 text-center text-slate-300">
              Loading game history...
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-6 text-center text-red-200">
              Failed to load game history.
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-2xl border border-[#1A79D3]/20 bg-black/50 p-6 text-center text-slate-300">
              No game history found.
            </div>
          ) : (
            rows.map((x, idx) => (
              <div
                key={x._id || x.serial_number || `${x.createdAt}-${idx}`}
                className="overflow-hidden rounded-[24px] border border-[#1A79D3]/20 bg-white/[0.05] shadow-xl shadow-black/40 backdrop-blur-xl"
              >
                <div className="border-b border-[#1A79D3]/10 bg-black/35 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[12px] font-bold text-slate-400">
                      {fmtDateTime(x.createdAt)}
                    </div>

                    <span
                      className={`rounded-md px-2 py-[3px] text-[11px] font-bold uppercase ${resultClass(
                        x.resultType,
                      )}`}
                    >
                      {x.resultType || "-"}
                    </span>
                  </div>

                  <div className="mt-2 break-all text-[14px] font-black text-white">
                    {x.game_name || x.game_uid || "-"}
                  </div>

                  {x.game_name && (
                    <div className="mt-0.5 break-all text-[11px] text-slate-400">
                      {x.game_uid || "-"}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => goUserDetails(x)}
                    className="mt-1 cursor-pointer text-left text-xs font-bold text-[#6fb5f4] underline decoration-[#3ea0ff]/40 underline-offset-4"
                  >
                    User: {x.userId || x.user?.userId || "-"}
                  </button>
                </div>

                <div className="p-4">
                  <InfoRow
                    label="Gameplay Name"
                    value={x.userGamePlayName || x.user?.userGamePlayName}
                  />
                  <InfoRow label="Member Account" value={x.member_account} />
                  <InfoRow label="Phone" value={x.phone || x.user?.phone} />
                  <InfoRow label="Email" value={x.email || x.user?.email} />
                  <InfoRow label="Round" value={x.game_round} />
                  <InfoRow label="Serial" value={x.serial_number} />
                  <InfoRow
                    label="Bet Amount"
                    value={`৳ ${fmtMoney(x.bet_amount)}`}
                  />
                  <InfoRow
                    label="Win Amount"
                    value={`৳ ${fmtMoney(x.win_amount)}`}
                  />
                  <InfoRow
                    label="Net Amount"
                    value={`৳ ${fmtMoney(x.net_amount)}`}
                  />
                  <InfoRow
                    label="Balance Before"
                    value={`৳ ${fmtMoney(x.balance_before)}`}
                  />
                  <InfoRow
                    label="Balance After"
                    value={`৳ ${fmtMoney(x.balance_after)}`}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-5 rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.05] p-4 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-center text-sm text-slate-300 md:text-left">
              Showing{" "}
              <span className="font-semibold text-white">
                {rows.length === 0 ? 0 : (page - 1) * limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-white">
                {Math.min(page * limit, total)}
              </span>{" "}
              of <span className="font-semibold text-white">{total}</span>{" "}
              records
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#1A79D3]/20 bg-black/50 px-4 py-2 text-white transition hover:bg-[#1A79D3]/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaChevronLeft />
                Prev
              </button>

              <div className="rounded-2xl border border-[#1A79D3]/20 bg-[#1A79D3]/20 px-4 py-2 text-sm font-medium text-white">
                Page {page} / {totalPages}
              </div>

              <button
                type="button"
                onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
                disabled={page >= totalPages}
                className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#1A79D3]/20 bg-black/50 px-4 py-2 text-white transition hover:bg-[#1A79D3]/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllGameHistory;
