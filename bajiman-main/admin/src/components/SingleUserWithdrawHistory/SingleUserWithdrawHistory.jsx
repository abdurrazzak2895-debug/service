import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  WalletCards,
  CheckCircle2,
  Clock3,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Landmark,
  Phone,
} from "lucide-react";
import { api } from "../../api/axios";

const money = (value) => {
  const num = Number(value || 0);

  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (date) => {
  if (!date) return "—";

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusClass = (status = "") => {
  const s = String(status).toLowerCase();

  if (s === "approved") {
    return "border-emerald-400/30 bg-emerald-500/15 text-emerald-200";
  }

  if (s === "rejected") {
    return "border-red-400/30 bg-red-500/15 text-red-200";
  }

  return "border-yellow-400/30 bg-yellow-500/15 text-yellow-200";
};

const typeText = (type = "") => {
  const v = String(type || "").toLowerCase();

  if (v === "personal") return "Personal";
  if (v === "agent") return "Agent";
  if (v === "merchant") return "Merchant";

  return "—";
};

const cardClass =
  "rounded-[26px] border border-[#1A79D3]/20 bg-white/[0.07] shadow-2xl shadow-black/35 backdrop-blur-xl";

const btnGhost =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#1A79D3]/20 bg-white/[0.07] px-4 py-3 text-sm font-bold text-slate-200 transition hover:bg-[#1A79D3]/15 disabled:cursor-not-allowed disabled:opacity-50";

const btnPrimary =
  "group relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-5 py-3 text-sm font-black text-white shadow-[0_18px_50px_rgba(26,121,211,0.22)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60";

const inputWrap =
  "flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 transition focus-within:border-[#1A79D3]/60 focus-within:shadow-[0_0_25px_rgba(26,121,211,0.20)]";

const inputClass =
  "w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500";

const SummaryCard = ({ icon, label, count, amount, tone = "blue" }) => {
  const toneCls =
    tone === "green"
      ? "text-emerald-300"
      : tone === "yellow"
        ? "text-yellow-300"
        : tone === "red"
          ? "text-red-300"
          : "text-[#6fb5f4]";

  return (
    <div className="rounded-[24px] border border-[#1A79D3]/20 bg-black/35 p-5 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <h3 className="mt-2 text-2xl font-black text-white">{count || 0}</h3>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1A79D3]/30 bg-[#1A79D3]/15 text-[#6fb5f4]">
          {icon}
        </div>
      </div>

      <div className={`mt-3 text-sm font-black ${toneCls}`}>
        {money(amount)}
      </div>
    </div>
  );
};

const SingleUserWithdrawHistory = ({ userId }) => {
  const [page, setPage] = useState(1);
  const limit = 15;

  const [status, setStatus] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    params.set("page", String(page));
    params.set("limit", String(limit));

    if (status !== "all") params.set("status", status);
    if (search.trim()) params.set("search", search.trim());

    return params.toString();
  }, [page, limit, status, search]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      "admin-single-user-withdraw-history",
      userId,
      page,
      limit,
      status,
      search,
    ],
    queryFn: async () => {
      const res = await api.get(
        `/api/admin/users/${userId}/withdraw-history?${queryParams}`,
      );
      return res.data;
    },
    enabled: !!userId,
    keepPreviousData: true,
    staleTime: 15000,
    retry: 1,
  });

  const rows = Array.isArray(data?.data) ? data.data : [];
  const summary = data?.summary || {};
  const meta = data?.meta || {};
  const totalPages = Math.max(Number(meta?.totalPages || 1), 1);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleReset = () => {
    setPage(1);
    setStatus("all");
    setSearchInput("");
    setSearch("");
  };

  return (
    <div className="mt-6 text-white">
      <div className="relative overflow-hidden rounded-[32px] border border-[#1A79D3]/20 bg-[#050607] p-4 shadow-2xl shadow-black/40 md:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,121,211,0.22),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(26,121,211,0.14),transparent_40%)]" />

        <div className="relative z-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-[#1A79D3]/30 bg-white/10 shadow-[0_0_45px_rgba(26,121,211,0.25)] backdrop-blur">
                <WalletCards className="h-7 w-7 text-[#1A79D3]" />
              </div>

              <div>
                <h2 className="bg-gradient-to-r from-[#6fb5f4] via-[#1A79D3] to-[#3ea0ff] bg-clip-text text-xl font-black text-transparent md:text-2xl">
                  Withdraw History
                </h2>

                <p className="mt-1 text-sm text-slate-300">
                  Single user withdraw summary and request history
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => refetch()}
              className={btnGhost}
            >
              <RefreshCw
                size={17}
                className={isFetching ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              icon={<WalletCards size={22} />}
              label="Total Withdraw"
              count={summary?.total?.count || 0}
              amount={summary?.total?.amount || 0}
            />

            <SummaryCard
              icon={<CheckCircle2 size={22} />}
              label="Approved"
              count={summary?.approved?.count || 0}
              amount={summary?.approved?.amount || 0}
              tone="green"
            />

            <SummaryCard
              icon={<Clock3 size={22} />}
              label="Pending"
              count={summary?.pending?.count || 0}
              amount={summary?.pending?.amount || 0}
              tone="yellow"
            />

            <SummaryCard
              icon={<XCircle size={22} />}
              label="Rejected"
              count={summary?.rejected?.count || 0}
              amount={summary?.rejected?.amount || 0}
              tone="red"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px_auto_auto]">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-200">
                <Search size={16} />
                Search
              </label>

              <div className={inputWrap}>
                <Search className="h-5 w-5 text-[#1A79D3]" />

                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  placeholder="Method / Wallet Type / Wallet Number"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-200">
                <Filter size={16} />
                Status
              </label>

              <select
                value={status}
                onChange={(e) => {
                  setPage(1);
                  setStatus(e.target.value);
                }}
                className="h-[50px] w-full cursor-pointer rounded-2xl border border-white/10 bg-black/35 px-4 text-sm font-bold text-white outline-none focus:border-[#1A79D3]/60"
              >
                <option className="bg-black" value="all">
                  All
                </option>
                <option className="bg-black" value="pending">
                  Pending
                </option>
                <option className="bg-black" value="approved">
                  Approved
                </option>
                <option className="bg-black" value="rejected">
                  Rejected
                </option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleSearch}
                className={btnPrimary}
              >
                <Search size={17} />
                Search
              </button>
            </div>

            <div className="flex items-end">
              <button type="button" onClick={handleReset} className={btnGhost}>
                Reset
              </button>
            </div>
          </div>

          <div className={`${cardClass} mt-6 overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1150px]">
                <thead>
                  <tr className="border-b border-[#1A79D3]/20 bg-black/50 text-left">
                    <th className="px-4 py-4 text-xs font-black uppercase tracking-wide text-slate-300">
                      #
                    </th>
                    <th className="px-4 py-4 text-xs font-black uppercase tracking-wide text-slate-300">
                      Date
                    </th>
                    <th className="px-4 py-4 text-xs font-black uppercase tracking-wide text-slate-300">
                      Method
                    </th>
                    <th className="px-4 py-4 text-xs font-black uppercase tracking-wide text-slate-300">
                      Wallet
                    </th>
                    <th className="px-4 py-4 text-xs font-black uppercase tracking-wide text-slate-300">
                      Amount
                    </th>
                    <th className="px-4 py-4 text-xs font-black uppercase tracking-wide text-slate-300">
                      Balance
                    </th>
                    <th className="px-4 py-4 text-xs font-black uppercase tracking-wide text-slate-300">
                      Admin Note
                    </th>
                    <th className="px-4 py-4 text-xs font-black uppercase tracking-wide text-slate-300">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-black/25">
                  {isLoading ? (
                    [...Array(6)].map((_, index) => (
                      <tr key={index}>
                        <td colSpan={8} className="px-4 py-4">
                          <div className="h-14 animate-pulse rounded-2xl bg-[#1A79D3]/10" />
                        </td>
                      </tr>
                    ))
                  ) : rows.length ? (
                    rows.map((item, index) => {
                      const methodName =
                        item?.walletSnapshot?.methodName?.en ||
                        item?.walletSnapshot?.methodName?.bn ||
                        item?.methodId ||
                        "—";

                      const walletNumber =
                        item?.walletSnapshot?.walletNumber ||
                        item?.wallet?.walletNumber ||
                        "—";

                      const walletType = typeText(
                        item?.walletSnapshot?.walletType ||
                          item?.wallet?.walletType,
                      );

                      const walletLabel =
                        item?.walletSnapshot?.label ||
                        item?.wallet?.label ||
                        "";

                      return (
                        <tr
                          key={item._id || index}
                          className="border-b border-[#1A79D3]/10 transition hover:bg-[#1A79D3]/10"
                        >
                          <td className="px-4 py-4 text-sm font-bold text-slate-200">
                            {(page - 1) * limit + index + 1}
                          </td>

                          <td className="px-4 py-4 text-sm font-semibold text-slate-300">
                            {formatDate(item.createdAt)}
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2 text-sm font-black text-white">
                              <Landmark size={15} className="text-[#1A79D3]" />
                              {methodName}
                            </div>

                            <div className="mt-1 text-xs uppercase text-slate-400">
                              {item.methodId || "—"}
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2 text-sm font-black text-white">
                              <Phone size={15} className="text-[#1A79D3]" />
                              {walletNumber}
                            </div>

                            <div className="mt-1 text-xs text-slate-400">
                              {walletType}
                            </div>

                            {walletLabel ? (
                              <div className="mt-1 text-xs text-slate-500">
                                {walletLabel}
                              </div>
                            ) : null}
                          </td>

                          <td className="px-4 py-4 text-sm font-black text-[#6fb5f4]">
                            {money(item.amount)}
                          </td>

                          <td className="px-4 py-4">
                            <div className="text-xs text-slate-400">
                              Before: {money(item.balanceBefore)}
                            </div>

                            <div className="mt-1 text-xs text-slate-400">
                              After: {money(item.balanceAfter)}
                            </div>
                          </td>

                          <td className="max-w-[220px] px-4 py-4 text-sm font-semibold text-slate-300">
                            <span className="line-clamp-2 break-all">
                              {item.adminNote || "—"}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase ${getStatusClass(
                                item.status,
                              )}`}
                            >
                              {item.status || "pending"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center">
                        <div className="text-sm font-bold text-slate-400">
                          No withdraw history found
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-[24px] border border-[#1A79D3]/20 bg-black/35 p-4 sm:flex-row">
            <div className="text-sm font-semibold text-slate-400">
              Total:{" "}
              <span className="font-black text-[#6fb5f4]">
                {meta?.total || 0}
              </span>{" "}
              items
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className={btnGhost}
              >
                <ChevronLeft size={16} />
              </button>

              <div className="rounded-2xl border border-[#1A79D3]/20 bg-black/35 px-4 py-3 text-sm font-black text-[#6fb5f4]">
                Page {page} / {totalPages}
              </div>

              <button
                type="button"
                disabled={page >= totalPages || isFetching}
                onClick={() =>
                  setPage((prev) => (prev < totalPages ? prev + 1 : prev))
                }
                className={btnGhost}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleUserWithdrawHistory;
