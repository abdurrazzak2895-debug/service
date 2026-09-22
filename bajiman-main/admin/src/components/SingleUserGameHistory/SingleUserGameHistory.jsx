import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaSyncAlt,
  FaDice,
  FaArrowDown,
  FaArrowUp,
  FaFilter,
} from "react-icons/fa";
import { api } from "../../api/axios";

const SingleUserGameHistory = () => {
  const { id } = useParams();

  const [histories, setHistories] = useState([]);
  const [summary, setSummary] = useState({
    totalBetAmount: 0,
    totalWinAmount: 0,
    totalNetAmount: 0,
    totalWinCount: 0,
    totalLossCount: 0,
    totalPushCount: 0,
    totalRecords: 0,
    siteProfit: 0,
  });

  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [resultType, setResultType] = useState("");
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    limit: 10,
  });

  const cardClass =
    "rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.05] shadow-2xl shadow-black/50 backdrop-blur-xl";

  const inputClass =
    "w-full px-4 py-3 rounded-2xl bg-black/50 border border-[#1A79D3]/20 text-white placeholder-slate-500 outline-none transition focus:ring-2 focus:ring-[#1A79D3]/30 focus:border-[#1A79D3]/70";

  const money = (value) => {
    const n = Number(value || 0);
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const fetchGameHistory = async () => {
    try {
      setLoading(true);

      const { data } = await api.get(`/api/game-history/admin/user/${id}`, {
        params: {
          q: search,
          resultType,
          page,
          limit: 10,
        },
      });

      if (data?.success) {
        setHistories(data.data || []);
        setSummary(data.summary || {});
        setPagination(data.pagination || {});
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load game history",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGameHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, search, resultType, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(q.trim());
  };

  const clearFilter = () => {
    setQ("");
    setSearch("");
    setResultType("");
    setPage(1);
  };

  const userNetAmount = useMemo(() => {
    return Number(summary?.totalNetAmount || 0);
  }, [summary]);

  return (
    <div className="relative mt-6 min-h-[calc(100vh-120px)] overflow-hidden text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,121,211,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(26,121,211,0.12),transparent_38%)]" />

      <div className="relative z-10">
        <div className={`${cardClass} mb-6 p-4 md:p-6`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="flex items-center gap-2 bg-gradient-to-r from-[#6fb5f4] via-[#1A79D3] to-[#3ea0ff] bg-clip-text text-2xl font-black text-transparent md:text-3xl">
                <FaDice className="text-[#3ea0ff]" />
                Single User Game History
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                Search by game UID, game round, serial number or member account.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchGameHistory}
              disabled={loading}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#1A79D3]/20 bg-black/50 px-4 py-3 text-white transition hover:bg-[#1A79D3]/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaSyncAlt className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <SummaryCard
            title="Total Bet Amount"
            value={`৳ ${money(summary?.totalBetAmount)}`}
            sub={`${summary?.totalRecords || 0} total records`}
            icon={<FaArrowDown />}
            color="text-[#6fb5f4]"
          />

          <SummaryCard
            title="Total Win Amount"
            value={`৳ ${money(summary?.totalWinAmount)}`}
            sub={`${summary?.totalWinCount || 0} win records`}
            icon={<FaArrowUp />}
            color="text-emerald-300"
          />

          <SummaryCard
            title="User Net Result"
            value={`৳ ${money(userNetAmount)}`}
            sub={userNetAmount >= 0 ? "User profit" : "User loss"}
            icon={<FaFilter />}
            color={userNetAmount >= 0 ? "text-emerald-300" : "text-red-300"}
          />
        </div>

        <div className={`${cardClass} mb-6 p-4 md:p-5`}>
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 gap-3 lg:grid-cols-12"
          >
            <div className="relative lg:col-span-7">
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search game_uid, game_round, serial_number, member_account"
                className={`${inputClass} pl-11`}
              />
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3ea0ff]" />
            </div>

            <div className="lg:col-span-2">
              <select
                value={resultType}
                onChange={(e) => {
                  setPage(1);
                  setResultType(e.target.value);
                }}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="">All Results</option>
                <option value="win">Win</option>
                <option value="loss">Loss</option>
                <option value="push">Push</option>
              </select>
            </div>

            <button
              type="submit"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-5 py-3 font-bold text-white shadow-[0_18px_50px_rgba(26,121,211,0.25)] transition hover:scale-[1.01] lg:col-span-2"
            >
              <FaSearch />
              Search
            </button>

            <button
              type="button"
              onClick={clearFilter}
              className="cursor-pointer rounded-2xl border border-[#1A79D3]/20 bg-black/50 px-5 py-3 text-white transition hover:bg-[#1A79D3]/15 lg:col-span-1"
            >
              Clear
            </button>
          </form>
        </div>

        <div className={`${cardClass} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-sm">
              <thead className="bg-gradient-to-r from-[#1A79D3]/35 to-[#3ea0ff]/20 text-white">
                <tr>
                  <Th>Date</Th>
                  <Th>Game Name</Th>
                  <Th>Game UID</Th>
                  <Th>Round</Th>
                  <Th>Serial</Th>
                  <Th>Result</Th>
                  <Th>Bet Amount</Th>
                  <Th>Win Amount</Th>
                  <Th>Net Amount</Th>
                  <Th>Balance Before</Th>
                  <Th>Balance After</Th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="11" className="p-6 text-center text-slate-300">
                      Loading game history...
                    </td>
                  </tr>
                ) : histories.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="p-6 text-center text-slate-300">
                      No game history found.
                    </td>
                  </tr>
                ) : (
                  histories.map((item) => (
                    <tr
                      key={item._id}
                      className="border-t border-[#1A79D3]/10 transition hover:bg-[#1A79D3]/10"
                    >
                      <Td>{formatDate(item.createdAt)}</Td>
                      <Td className="font-semibold text-white">
                        {item.game_name || "—"}
                      </Td>
                      <Td>{item.game_uid || "—"}</Td>
                      <Td>{item.game_round || "—"}</Td>
                      <Td>{item.serial_number || "—"}</Td>
                      <Td>
                        <StatusBadge status={item.resultType} />
                      </Td>
                      <Td className="font-semibold text-[#6fb5f4]">
                        ৳ {money(item.bet_amount)}
                      </Td>
                      <Td className="font-semibold text-emerald-300">
                        ৳ {money(item.win_amount)}
                      </Td>
                      <Td
                        className={
                          Number(item.net_amount || 0) >= 0
                            ? "font-semibold text-emerald-300"
                            : "font-semibold text-red-300"
                        }
                      >
                        ৳ {money(item.net_amount)}
                      </Td>
                      <Td>৳ {money(item.balance_before)}</Td>
                      <Td>৳ {money(item.balance_after)}</Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#1A79D3]/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-300">
              Total: {pagination?.total || 0} records
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="cursor-pointer rounded-2xl border border-[#1A79D3]/20 bg-black/50 px-4 py-2 text-white transition hover:bg-[#1A79D3]/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Prev
              </button>

              <span className="rounded-2xl border border-[#1A79D3]/20 bg-[#1A79D3]/20 px-4 py-2 text-white">
                {page} / {pagination?.totalPages || 1}
              </span>

              <button
                type="button"
                disabled={page >= (pagination?.totalPages || 1) || loading}
                onClick={() => setPage((prev) => prev + 1)}
                className="cursor-pointer rounded-2xl border border-[#1A79D3]/20 bg-black/50 px-4 py-2 text-white transition hover:bg-[#1A79D3]/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, sub, icon, color }) => {
  return (
    <div className="rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.05] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <h3 className={`mt-2 text-2xl font-black ${color}`}>{value}</h3>
          <p className="mt-2 text-xs text-slate-500">{sub}</p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1A79D3]/20 bg-black/50 ${color}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

const Th = ({ children }) => {
  return (
    <th className="whitespace-nowrap px-4 py-4 text-left font-semibold">
      {children}
    </th>
  );
};

const Td = ({ children, className = "" }) => {
  return (
    <td className={`whitespace-nowrap px-4 py-4 text-slate-200 ${className}`}>
      {children}
    </td>
  );
};

const StatusBadge = ({ status }) => {
  const s = String(status || "").toLowerCase();

  const cls =
    s === "win"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      : s === "loss"
        ? "bg-red-500/15 text-red-300 border-red-500/30"
        : s === "push"
          ? "bg-yellow-500/15 text-yellow-300 border-yellow-500/30"
          : "bg-[#1A79D3]/15 text-[#6fb5f4] border-[#1A79D3]/30";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${cls}`}>
      {status || "—"}
    </span>
  );
};

const formatDate = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
};

export default SingleUserGameHistory;
