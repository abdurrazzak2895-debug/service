import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FaWallet,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaSearch,
  FaFilter,
  FaSyncAlt,
  FaChevronLeft,
  FaChevronRight,
  FaMoneyBillWave,
  FaGift,
} from "react-icons/fa";
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
  const s = String(status).toUpperCase();

  if (s === "PAID") return "border-green-400/40 bg-green-500/15 text-green-300";
  if (s === "FAILED") return "border-red-400/40 bg-red-500/15 text-red-300";

  return "border-yellow-400/40 bg-yellow-500/15 text-yellow-300";
};

const emptySummary = {
  paidAmount: 0,
  pendingAmount: 0,
  failedAmount: 0,
  paidCount: 0,
  pendingCount: 0,
  failedCount: 0,
};

const buildFallbackSummary = (items = []) => {
  return items.reduce(
    (acc, item) => {
      const st = String(item?.status || "PENDING").toUpperCase();
      const amount = Number(item?.calc?.creditedAmount || item?.amount || 0);

      if (st === "PAID") {
        acc.paidAmount += amount;
        acc.paidCount += 1;
      } else if (st === "FAILED") {
        acc.failedAmount += amount;
        acc.failedCount += 1;
      } else {
        acc.pendingAmount += amount;
        acc.pendingCount += 1;
      }

      return acc;
    },
    { ...emptySummary },
  );
};

const SummaryCard = ({ icon, label, count, amount, subText }) => {
  return (
    <div className="rounded-2xl border border-blue-300/20 bg-black/40 p-4 shadow-lg shadow-blue-900/10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-blue-100/70">{label}</p>
          <h3 className="mt-1 text-2xl font-black text-white">{count || 0}</h3>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] text-white shadow-lg">
          {icon}
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-blue-300/10 bg-black/35 px-3 py-2 text-sm font-bold text-[#8fc2f5]">
        {money(amount)}
      </div>

      {subText ? (
        <div className="mt-2 text-xs font-semibold text-blue-100/55">
          {subText}
        </div>
      ) : null}
    </div>
  );
};

const SingleUserAutoDepositHistory = ({ userId }) => {
  const [page, setPage] = useState(1);
  const limit = 15;

  const [status, setStatus] = useState("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    params.set("page", String(page));
    params.set("limit", String(limit));
    params.set("userId", String(userId || ""));

    if (status !== "ALL") params.set("status", status);
    if (search.trim()) params.set("q", search.trim());

    return params.toString();
  }, [page, limit, userId, status, search]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      "admin-single-user-auto-deposit-history",
      userId,
      page,
      limit,
      status,
      search,
    ],
    queryFn: async () => {
      const res = await api.get(
        `/api/auto-deposit/deposits/admin?${queryParams}`,
      );
      return res.data;
    },
    enabled: !!userId,
    keepPreviousData: true,
    staleTime: 15000,
    retry: 1,
  });

  const rows = Array.isArray(data?.data) ? data.data : [];
  const serverSummary = data?.summary || {};
  const fallbackSummary = buildFallbackSummary(rows);

  const summary = {
    paidAmount: Number(serverSummary.paidAmount ?? fallbackSummary.paidAmount),
    pendingAmount: Number(
      serverSummary.pendingAmount ?? fallbackSummary.pendingAmount,
    ),
    failedAmount: Number(
      serverSummary.failedAmount ?? fallbackSummary.failedAmount,
    ),
    paidCount: Number(serverSummary.paidCount ?? fallbackSummary.paidCount),
    pendingCount: Number(
      serverSummary.pendingCount ?? fallbackSummary.pendingCount,
    ),
    failedCount: Number(
      serverSummary.failedCount ?? fallbackSummary.failedCount,
    ),
  };

  const meta = data?.pagination || data?.meta || {};
  const totalPages = Math.max(Number(meta?.totalPages || 1), 1);

  const totalCount =
    Number(summary.paidCount || 0) +
    Number(summary.pendingCount || 0) +
    Number(summary.failedCount || 0);

  const totalAmount =
    Number(summary.paidAmount || 0) +
    Number(summary.pendingAmount || 0) +
    Number(summary.failedAmount || 0);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleReset = () => {
    setPage(1);
    setStatus("ALL");
    setSearchInput("");
    setSearch("");
  };

  return (
    <div className="mt-6 text-white">
      <div className="rounded-2xl border border-blue-300/20 bg-gradient-to-b from-black/95 via-[#2f79c9]/15 to-black/95 p-4 shadow-lg shadow-blue-900/20 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-[#8fc2f5] md:text-2xl">
              <FaWallet />
              Auto Deposit History
            </h2>
            <p className="mt-1 text-sm text-blue-100/70">
              Single user auto deposit summary, bonus and payment history
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-blue-300/20 bg-black/50 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-900/20"
          >
            <FaSyncAlt className={isFetching ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={<FaMoneyBillWave />}
            label="Total Auto Deposit"
            count={totalCount}
            amount={totalAmount}
            subText="All status included"
          />

          <SummaryCard
            icon={<FaCheckCircle />}
            label="Paid"
            count={summary.paidCount}
            amount={summary.paidAmount}
          />

          <SummaryCard
            icon={<FaClock />}
            label="Pending"
            count={summary.pendingCount}
            amount={summary.pendingAmount}
          />

          <SummaryCard
            icon={<FaTimesCircle />}
            label="Failed"
            count={summary.failedCount}
            amount={summary.failedAmount}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px_auto_auto]">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-100">
              <FaSearch />
              Search
            </label>

            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              placeholder="Invoice / Transaction / Bonus / Session"
              className="w-full rounded-xl border border-blue-300/20 bg-black/60 px-4 py-3 text-white placeholder-blue-100/40 outline-none focus:border-[#63a8ee] focus:ring-2 focus:ring-[#63a8ee]/30"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-100">
              <FaFilter />
              Status
            </label>

            <select
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
              className="w-full cursor-pointer rounded-xl border border-blue-300/20 bg-black/60 px-4 py-3 text-white outline-none focus:border-[#63a8ee] focus:ring-2 focus:ring-[#63a8ee]/30"
            >
              <option className="bg-black" value="ALL">
                All
              </option>
              <option className="bg-black" value="PENDING">
                Pending
              </option>
              <option className="bg-black" value="PAID">
                Paid
              </option>
              <option className="bg-black" value="FAILED">
                Failed
              </option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleSearch}
              className="h-[48px] w-full cursor-pointer rounded-xl bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-5 text-sm font-bold text-white shadow-lg shadow-blue-700/30 hover:from-[#7ab6f2] hover:to-[#3c88db]"
            >
              Search
            </button>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleReset}
              className="h-[48px] w-full cursor-pointer rounded-xl border border-blue-300/20 bg-black/50 px-5 text-sm font-bold text-white hover:bg-blue-900/20"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-blue-300/20 bg-black/35">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1350px]">
              <thead>
                <tr className="border-b border-blue-300/20 bg-[#2f79c9]/40 text-left">
                  <th className="px-4 py-4 text-sm font-black text-white">#</th>
                  <th className="px-4 py-4 text-sm font-black text-white">
                    Date
                  </th>
                  <th className="px-4 py-4 text-sm font-black text-white">
                    Invoice
                  </th>
                  <th className="px-4 py-4 text-sm font-black text-white">
                    Transaction
                  </th>
                  <th className="px-4 py-4 text-sm font-black text-white">
                    Bank
                  </th>
                  <th className="px-4 py-4 text-sm font-black text-white">
                    Amount
                  </th>
                  <th className="px-4 py-4 text-sm font-black text-white">
                    Bonus
                  </th>
                  <th className="px-4 py-4 text-sm font-black text-white">
                    Credited
                  </th>
                  <th className="px-4 py-4 text-sm font-black text-white">
                    Turnover
                  </th>
                  <th className="px-4 py-4 text-sm font-black text-white">
                    Bonus Scope
                  </th>
                  <th className="px-4 py-4 text-sm font-black text-white">
                    Bonus Title
                  </th>
                  <th className="px-4 py-4 text-sm font-black text-white">
                    Balance Added
                  </th>
                  <th className="px-4 py-4 text-sm font-black text-white">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  [...Array(6)].map((_, index) => (
                    <tr key={index}>
                      <td colSpan={13} className="px-4 py-4">
                        <div className="h-12 animate-pulse rounded-xl bg-blue-300/10" />
                      </td>
                    </tr>
                  ))
                ) : rows.length ? (
                  rows.map((item, index) => {
                    const bonusTitle =
                      item?.selectedBonus?.title?.en ||
                      item?.selectedBonus?.title?.bn ||
                      "No Bonus";

                    return (
                      <tr
                        key={item._id || index}
                        className="border-b border-blue-300/10 transition hover:bg-[#2f79c9]/10"
                      >
                        <td className="px-4 py-4 text-sm font-bold text-blue-50">
                          {(page - 1) * limit + index + 1}
                        </td>

                        <td className="px-4 py-4 text-sm font-semibold text-blue-50/80">
                          {formatDate(item.createdAt)}
                        </td>

                        <td className="max-w-[180px] px-4 py-4 text-sm font-black text-[#8fc2f5]">
                          <span className="line-clamp-2 break-all">
                            {item.invoiceNumber || "—"}
                          </span>
                        </td>

                        <td className="max-w-[160px] px-4 py-4 text-sm font-semibold text-blue-50/80">
                          <span className="line-clamp-2 break-all">
                            {item.transactionId || item.sessionCode || "—"}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-sm font-semibold text-blue-50/80">
                          {item.bank || "—"}
                        </td>

                        <td className="px-4 py-4 text-sm font-black text-[#8fc2f5]">
                          {money(item.amount)}
                        </td>

                        <td className="px-4 py-4 text-sm font-bold text-blue-50/80">
                          <div className="flex items-center gap-2">
                            <FaGift className="text-[#8fc2f5]" />
                            {money(item?.calc?.bonusAmount || 0)}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-sm font-black text-white">
                          {money(item?.calc?.creditedAmount || item.amount)}
                        </td>

                        <td className="px-4 py-4 text-sm font-bold text-blue-50/80">
                          {money(item?.calc?.targetTurnover || item.amount)}
                        </td>

                        <td className="px-4 py-4 text-sm font-semibold text-blue-50/80">
                          {item?.selectedBonus?.bonusScope || "none"}
                        </td>

                        <td className="max-w-[180px] px-4 py-4 text-sm font-semibold text-blue-50/80">
                          <span className="line-clamp-2 break-all">
                            {bonusTitle}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-sm font-bold text-blue-50/80">
                          {item.balanceAdded ? "YES" : "NO"}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-black capitalize ${getStatusClass(
                              item.status,
                            )}`}
                          >
                            {item.status || "PENDING"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={13} className="px-4 py-12 text-center">
                      <div className="text-base font-bold text-blue-100/60">
                        No auto deposit history found
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-2xl border border-blue-300/20 bg-black/35 p-4 sm:flex-row">
          <div className="text-sm font-semibold text-blue-100/70">
            Total:{" "}
            <span className="font-black text-[#8fc2f5]">
              {meta?.total || 0}
            </span>{" "}
            items
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-[#2f79c9] text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FaChevronLeft />
            </button>

            <div className="rounded-xl border border-blue-300/20 bg-black/50 px-4 py-2 text-sm font-black text-[#8fc2f5]">
              Page {page} / {totalPages}
            </div>

            <button
              type="button"
              disabled={page >= totalPages || isFetching}
              onClick={() =>
                setPage((prev) => (prev < totalPages ? prev + 1 : prev))
              }
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-[#2f79c9] text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleUserAutoDepositHistory;
