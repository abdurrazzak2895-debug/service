import React, { useMemo, useState } from "react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  FaSyncAlt,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaChartLine,
  FaMoneyBillWave,
  FaCheckCircle,
  FaHourglassHalf,
  FaWallet,
} from "react-icons/fa";
import { api } from "../../api/axios";

const money = (value) => {
  const n = Number(value || 0);
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const number = (value) => {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n.toLocaleString("en-US") : "0";
};

const dateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
};

const percent = (progress, required) => {
  const p = Number(progress || 0);
  const r = Number(required || 0);
  if (!r) return 0;
  return Math.min(100, Math.round((p / r) * 100));
};

const sourceLabel = (value) => {
  const s = String(value || "");
  if (s === "auto-deposit") return "Auto Deposit";
  if (s === "auto-personal-deposit") return "Auto Personal Deposit";
  if (s === "register-bonus") return "Register Bonus";
  if (s === "admin-manual-deposit") return "Admin Manual Deposit";
  if (s === "deposit") return "Deposit";
  return s || "-";
};

const statusClass = (status) => {
  const s = String(status || "").toLowerCase();

  if (s === "completed") {
    return "border-emerald-400/30 bg-emerald-500/15 text-emerald-200";
  }

  if (s === "running") {
    return "border-yellow-400/30 bg-yellow-500/15 text-yellow-200";
  }

  return "border-[#1A79D3]/20 bg-[#1A79D3]/15 text-[#6fb5f4]";
};

const SummaryCard = ({ icon: Icon, label, value, sub, tone = "blue" }) => {
  const tones = {
    blue: "border-[#1A79D3]/20 bg-[#1A79D3]/15 text-[#6fb5f4]",
    green: "border-emerald-300/20 bg-emerald-500/15 text-emerald-100",
    yellow: "border-yellow-300/20 bg-yellow-500/15 text-yellow-100",
    purple: "border-purple-300/20 bg-purple-500/15 text-purple-100",
  };

  return (
    <div className={`rounded-2xl border p-4 shadow-lg shadow-black/40 ${tones[tone] || tones.blue}`}>
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

const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-3 border-b border-[#1A79D3]/10 py-2 last:border-b-0">
    <div className="text-[12px] font-bold text-slate-400">{label}</div>
    <div className="break-all text-right text-[12px] font-semibold text-white/90">
      {value || "-"}
    </div>
  </div>
);

const SingleUserTurnOverHistory = () => {
  const { id } = useParams();

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [status, setStatus] = useState("");
  const [sourceType, setSourceType] = useState("");

  const params = useMemo(
    () => ({
      page,
      limit,
      status: status || undefined,
      sourceType: sourceType || undefined,
    }),
    [page, limit, status, sourceType],
  );

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["single-user-turnover-history", id, params],
    queryFn: async () => {
      const res = await api.get(`/api/turnovers/admin/user/${id}`, { params });
      return res.data;
    },
    enabled: Boolean(id),
    staleTime: 10_000,
    retry: 1,
  });

  const rows = data?.data || [];
  const meta = data?.meta || {};
  const summary = data?.summary || {};

  const total = Number(meta?.total || 0);
  const totalPages = Number(meta?.totalPages || Math.max(1, Math.ceil(total / limit)));
  const firstUser = rows?.[0]?.user || {};

  const clearFilters = () => {
    setPage(1);
    setStatus("");
    setSourceType("");
  };

  return (
    <div className="relative min-h-[calc(100vh-120px)] overflow-hidden text-white mt-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,121,211,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(26,121,211,0.12),transparent_38%)]" />

      <div className="relative z-10">
        <div className="mb-5 rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.05] p-4 shadow-2xl shadow-black/50 backdrop-blur-xl md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="bg-gradient-to-r from-[#6fb5f4] via-[#1A79D3] to-[#3ea0ff] bg-clip-text text-xl font-black text-transparent md:text-2xl">
                Single User Turnover History
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                {firstUser?.userId ? `User: ${firstUser.userId}` : "User turnover summary and history"}
              </p>
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
            icon={FaMoneyBillWave}
            label="All Required Turnover"
            value={`৳ ${money(summary.totalRequired)}`}
            sub="All filtered required turnover"
          />

          <SummaryCard
            icon={FaChartLine}
            label="All Progress Turnover"
            value={`৳ ${money(summary.totalProgress)}`}
            sub="All filtered progress turnover"
            tone="green"
          />

          <SummaryCard
            icon={FaWallet}
            label="All Credited Amount"
            value={`৳ ${money(summary.totalCreditedAmount)}`}
            sub="All filtered credited amount"
            tone="purple"
          />

          <SummaryCard
            icon={FaHourglassHalf}
            label="Running Count"
            value={number(summary.runningCount)}
            sub="All filtered running"
            tone="yellow"
          />

          <SummaryCard
            icon={FaCheckCircle}
            label="Completed Count"
            value={number(summary.completedCount)}
            sub="All filtered completed"
            tone="green"
          />

          <SummaryCard
            icon={FaFilter}
            label="Total Records"
            value={number(summary.totalRecords)}
            sub="All matched records"
            tone="purple"
          />

          <SummaryCard
            icon={FaFilter}
            label="Page Records"
            value={number(summary.pageRecords || rows.length)}
            sub="Only current page records"
          />

          <SummaryCard
            icon={FaChartLine}
            label="Completion Ratio"
            value={`${summary.totalRecords ? Math.round((Number(summary.completedCount || 0) / Number(summary.totalRecords || 1)) * 100) : 0}%`}
            sub="Completed from all filtered"
            tone="green"
          />
        </div>

        <div className="mb-5 rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.05] p-4 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-200">
            <FaFilter className="text-[#3ea0ff]" />
            Filters
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <select
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
              className="h-11 cursor-pointer rounded-2xl border border-[#1A79D3]/20 bg-black/50 px-3 text-sm text-white outline-none transition focus:border-[#1A79D3]/70 focus:ring-2 focus:ring-[#1A79D3]/30"
            >
              <option value="">All Status</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={sourceType}
              onChange={(e) => {
                setPage(1);
                setSourceType(e.target.value);
              }}
              className="h-11 cursor-pointer rounded-2xl border border-[#1A79D3]/20 bg-black/50 px-3 text-sm text-white outline-none transition focus:border-[#1A79D3]/70 focus:ring-2 focus:ring-[#1A79D3]/30"
            >
              <option value="">All Sources</option>
              <option value="deposit">Deposit</option>
              <option value="auto-deposit">Auto Deposit</option>
              <option value="auto-personal-deposit">Auto Personal Deposit</option>
              <option value="register-bonus">Register Bonus</option>
              <option value="admin-manual-deposit">Admin Manual Deposit</option>
            </select>

            <button
              type="button"
              onClick={clearFilters}
              className="h-11 cursor-pointer rounded-2xl border border-[#1A79D3]/20 bg-black/50 px-5 text-sm font-bold text-white transition hover:border-[#1A79D3]/70 hover:bg-[#1A79D3]/15"
            >
              Clear Filter
            </button>
          </div>
        </div>

        <div className="hidden overflow-hidden rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.05] shadow-2xl shadow-black/50 backdrop-blur-xl lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="bg-gradient-to-r from-[#1A79D3]/35 to-[#3ea0ff]/20 text-left">
                  {[
                    "Date",
                    "Source",
                    "Required",
                    "Progress",
                    "Percent",
                    "Credited",
                    "Status",
                    "Completed At",
                  ].map((h) => (
                    <th key={h} className="px-4 py-4 text-sm font-semibold text-white">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="px-5 py-10 text-center text-slate-300">
                      Loading turnover history...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan="8" className="px-5 py-10 text-center text-red-300">
                      Failed to load turnover history.
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-5 py-10 text-center text-slate-300">
                      No turnover history found.
                    </td>
                  </tr>
                ) : (
                  rows.map((x, idx) => {
                    const p = percent(x.progress, x.required);

                    return (
                      <tr
                        key={x._id}
                        className={`border-t border-[#1A79D3]/10 text-sm transition hover:bg-[#1A79D3]/10 ${
                          idx % 2 === 0 ? "bg-black/20" : "bg-transparent"
                        }`}
                      >
                        <td className="px-4 py-3 text-slate-200">{dateTime(x.createdAt)}</td>
                        <td className="px-4 py-3 text-slate-200">{sourceLabel(x.sourceType)}</td>
                        <td className="px-4 py-3 font-bold text-white">৳ {money(x.required)}</td>
                        <td className="px-4 py-3 text-emerald-200">৳ {money(x.progress)}</td>

                        <td className="px-4 py-3">
                          <div className="mb-1 text-xs text-slate-300">{p}%</div>
                          <div className="h-2 w-28 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8]"
                              style={{ width: `${p}%` }}
                            />
                          </div>
                        </td>

                        <td className="px-4 py-3 text-slate-200">৳ {money(x.creditedAmount)}</td>

                        <td className="px-4 py-3">
                          <span className={`rounded-md px-2 py-[3px] text-[12px] font-bold uppercase ${statusClass(x.status)}`}>
                            {x.status || "-"}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-slate-200">{dateTime(x.completedAt)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3 lg:hidden">
          {isLoading ? (
            <div className="rounded-2xl border border-[#1A79D3]/20 bg-black/50 p-6 text-center text-slate-300">
              Loading turnover history...
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-2xl border border-[#1A79D3]/20 bg-black/50 p-6 text-center text-slate-300">
              No turnover history found.
            </div>
          ) : (
            rows.map((x) => (
              <div
                key={x._id}
                className="overflow-hidden rounded-[24px] border border-[#1A79D3]/20 bg-white/[0.05] shadow-xl shadow-black/40 backdrop-blur-xl"
              >
                <div className="border-b border-[#1A79D3]/10 bg-black/35 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-bold text-slate-400">{dateTime(x.createdAt)}</div>
                    <span className={`rounded-md px-2 py-[3px] text-[11px] font-bold uppercase ${statusClass(x.status)}`}>
                      {x.status || "-"}
                    </span>
                  </div>

                  <div className="mt-2 text-sm font-black text-white">
                    {sourceLabel(x.sourceType)}
                  </div>
                </div>

                <div className="p-4">
                  <InfoRow label="Required" value={`৳ ${money(x.required)}`} />
                  <InfoRow label="Progress" value={`৳ ${money(x.progress)}`} />
                  <InfoRow label="Progress %" value={`${percent(x.progress, x.required)}%`} />
                  <InfoRow label="Credited Amount" value={`৳ ${money(x.creditedAmount)}`} />
                  <InfoRow label="Completed At" value={dateTime(x.completedAt)} />
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
              of <span className="font-semibold text-white">{total}</span> records
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

export default SingleUserTurnOverHistory;