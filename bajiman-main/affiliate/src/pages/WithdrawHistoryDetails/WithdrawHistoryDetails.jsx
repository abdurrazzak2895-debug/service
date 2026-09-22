import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Loader2,
  RefreshCw,
  Sparkles,
  Wallet,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { api } from "../../api/axios";
import {
  selectAffiliateToken,
  selectAffiliateUser,
} from "../../features/auth/authSelectors";

const money = (value, currency = "BDT") => {
  const symbol = String(currency || "BDT").toUpperCase() === "USDT" ? "$" : "৳";
  const num = Number(value || 0);

  return `${symbol} ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const cardCls =
  "rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.07] shadow-2xl shadow-black/50 backdrop-blur-xl";

const btnGhost =
  "cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-5 py-3 text-sm font-bold text-slate-100 transition hover:bg-[#1A79D3]/20 disabled:cursor-not-allowed disabled:opacity-60";

const chipCls = (status) => {
  const s = String(status || "pending").toLowerCase();

  if (s === "approved") {
    return "border-emerald-400/30 bg-emerald-500/15 text-emerald-300";
  }

  if (s === "rejected") {
    return "border-red-400/30 bg-red-500/15 text-red-300";
  }

  return "border-amber-400/30 bg-amber-500/15 text-amber-300";
};

const statusIcon = (status) => {
  const s = String(status || "pending").toLowerCase();

  if (s === "approved") return <CheckCircle size={16} />;
  if (s === "rejected") return <XCircle size={16} />;

  return <Clock size={16} />;
};

const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 border-b border-white/10 py-3 last:border-b-0">
    <span className="text-xs font-bold text-slate-400">{label}</span>
    <span className="text-right text-xs font-black text-white break-all">
      {value || "—"}
    </span>
  </div>
);

const StatCard = ({ label, value, color = "text-[#6fb5f4]" }) => (
  <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
    <p className="text-xs font-bold text-slate-400">{label}</p>
    <h3 className={`mt-1 text-xl font-black ${color}`}>{value}</h3>
  </div>
);

const WithdrawHistoryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = useSelector(selectAffiliateToken);
  const user = useSelector(selectAffiliateUser);
  const currency = user?.currency || "BDT";

  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(false);

  const fields = useMemo(() => row?.fields || {}, [row]);

  const fetchDetails = async () => {
    if (!token || !id) return;

    try {
      setLoading(true);

      const { data } = await api.get(`/api/aff-withdraw-requests/my/${id}`);

      setRow(data?.data || null);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load withdraw details",
      );
      setRow(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, id]);

  const status = String(row?.status || "pending").toLowerCase();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050607] p-4 text-white md:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,121,211,0.28),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(26,121,211,0.18),transparent_38%)]" />

      <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#1A79D3]/20 blur-3xl" />
      <div className="absolute -right-24 bottom-16 h-80 w-80 rounded-full bg-[#1A79D3]/15 blur-3xl" />
      <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-[#1A79D3]/15 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className={`${cardCls} overflow-hidden`}
        >
          <div className="border-b border-[#1A79D3]/20 bg-[#1A79D3]/10 p-5 md:p-7">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-[#1A79D3]/30 bg-white/10 shadow-[0_0_45px_rgba(26,121,211,0.28)]">
                  <Wallet className="h-8 w-8 text-[#1A79D3]" />
                </div>

                <div>
                  <h1 className="bg-gradient-to-r from-[#6fb5f4] via-[#1A79D3] to-[#3ea0ff] bg-clip-text text-2xl font-black text-transparent md:text-3xl">
                    Withdraw Details
                  </h1>

                  <p className="mt-1 text-sm text-slate-300">
                    View your affiliate withdraw request details.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/withdraw-history")}
                  className={btnGhost}
                >
                  <ArrowLeft size={17} />
                  Back
                </button>

                <button
                  type="button"
                  onClick={fetchDetails}
                  disabled={loading}
                  className={btnGhost}
                >
                  <RefreshCw
                    className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"}
                  />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          <div className="border-b border-white/10 bg-black/25 p-5 md:p-6">
            <div className="flex items-center gap-3 rounded-2xl border border-[#1A79D3]/20 bg-[#1A79D3]/10 px-4 py-3">
              <Sparkles className="h-5 w-5 text-[#1A79D3]" />

              <div>
                <h2 className="text-sm font-bold text-white">
                  Request Information
                </h2>
                <p className="text-xs text-slate-300">
                  Request ID: {id || "—"}
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-20 text-slate-300">
              <Loader2 className="h-6 w-6 animate-spin text-[#1A79D3]" />
              Loading withdraw details...
            </div>
          ) : !row ? (
            <div className="py-20 text-center">
              <div className="mb-4 text-6xl">📭</div>
              <h3 className="text-2xl font-black text-white">
                Withdraw request not found
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Please go back and try again.
              </p>
            </div>
          ) : (
            <div className="p-5 md:p-6">
              <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                <StatCard
                  label="Amount"
                  value={money(row?.amount || 0, currency)}
                />

                <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
                  <p className="text-xs font-bold text-slate-400">Status</p>
                  <span
                    className={`mt-2 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-black ${chipCls(
                      status,
                    )}`}
                  >
                    {statusIcon(status)}
                    {status.toUpperCase()}
                  </span>
                </div>

                <StatCard
                  label="Method"
                  value={String(row?.methodId || "—").toUpperCase()}
                  color="text-white"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                  <h3 className="mb-3 text-lg font-black text-white">
                    Basic Details
                  </h3>

                  <InfoRow label="Request ID" value={row?._id || "—"} />
                  <InfoRow
                    label="Method ID"
                    value={String(row?.methodId || "—").toUpperCase()}
                  />
                  <InfoRow
                    label="Amount"
                    value={money(row?.amount || 0, currency)}
                  />
                  <InfoRow
                    label="Status"
                    value={String(row?.status || "pending").toUpperCase()}
                  />
                  <InfoRow
                    label="Created At"
                    value={
                      row?.createdAt
                        ? new Date(row.createdAt).toLocaleString()
                        : "—"
                    }
                  />
                  <InfoRow
                    label="Updated At"
                    value={
                      row?.updatedAt
                        ? new Date(row.updatedAt).toLocaleString()
                        : "—"
                    }
                  />
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                  <h3 className="mb-3 text-lg font-black text-white">
                    Balance Details
                  </h3>

                  <InfoRow
                    label="Balance Before"
                    value={money(row?.balanceBefore || 0, currency)}
                  />
                  <InfoRow
                    label="Withdraw Amount"
                    value={money(row?.amount || 0, currency)}
                  />
                  <InfoRow
                    label="Balance After"
                    value={money(row?.balanceAfter || 0, currency)}
                  />
                  <InfoRow
                    label="Approved At"
                    value={
                      row?.approvedAt
                        ? new Date(row.approvedAt).toLocaleString()
                        : "—"
                    }
                  />
                  <InfoRow
                    label="Rejected At"
                    value={
                      row?.rejectedAt
                        ? new Date(row.rejectedAt).toLocaleString()
                        : "—"
                    }
                  />
                  <InfoRow label="Admin Note" value={row?.adminNote || "—"} />
                </div>
              </div>

              <div className="mt-5 rounded-3xl border border-white/10 bg-black/30 p-5">
                <h3 className="mb-3 text-lg font-black text-white">
                  Submitted Account Information
                </h3>

                {Object.keys(fields).length > 0 ? (
                  <div>
                    {Object.entries(fields).map(([key, value]) => (
                      <InfoRow
                        key={key}
                        label={key}
                        value={String(value || "—")}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">
                    No account information submitted.
                  </p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default WithdrawHistoryDetails;
