import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  User,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

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

const inputCls =
  "w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#1A79D3]/60 focus:shadow-[0_0_25px_rgba(26,121,211,0.20)]";

const btnGhost =
  "cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-5 py-3 text-sm font-bold text-slate-100 transition hover:bg-[#1A79D3]/20 disabled:cursor-not-allowed disabled:opacity-60";

const btnApprove =
  "cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-500/15 px-5 py-3 text-sm font-black text-emerald-200 transition hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-50";

const btnReject =
  "cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl border border-red-400/30 bg-red-500/15 px-5 py-3 text-sm font-black text-red-200 transition hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-50";

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

const ConfirmModal = ({
  open,
  type,
  row,
  note,
  setNote,
  loading,
  onClose,
  onConfirm,
}) => {
  if (!open) return null;

  const isApprove = type === "approve";
  const currency = row?.user?.currency || "BDT";

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className={`${cardCls} w-full max-w-lg p-6`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${
                isApprove
                  ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-300"
                  : "border-red-400/30 bg-red-500/15 text-red-300"
              }`}
            >
              {isApprove ? <CheckCircle /> : <XCircle />}
            </div>

            <div>
              <h3 className="text-xl font-black text-white">
                {isApprove ? "Approve Request?" : "Reject Request?"}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Amount:{" "}
                <span className="font-black text-[#6fb5f4]">
                  {money(row?.amount || 0, currency)}
                </span>
              </p>

              {!isApprove && (
                <p className="mt-1 text-xs text-red-200">
                  Reject করলে affiliate user এর balance refund হবে।
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="cursor-pointer rounded-xl p-2 text-slate-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-5">
          <label className="mb-2 block text-sm font-bold text-slate-200">
            Admin Note Optional
          </label>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write admin note..."
            className={`${inputCls} min-h-[110px] resize-none`}
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={btnGhost}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={isApprove ? btnApprove : btnReject}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : isApprove ? (
              <>
                <CheckCircle size={16} />
                Approve
              </>
            ) : (
              <>
                <XCircle size={16} />
                Reject
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const AffWithdrawRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState(false);

  const [modal, setModal] = useState({
    open: false,
    type: "",
  });

  const [note, setNote] = useState("");

  const currency = row?.user?.currency || "BDT";
  const status = String(row?.status || "pending").toLowerCase();
  const isPending = status === "pending";

  const fields = useMemo(() => row?.fields || {}, [row]);

  const fetchDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);

      const { data } = await api.get(`/api/admin/aff-withdraw-requests/${id}`);

      setRow(data?.data || null);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load withdraw request",
      );
      setRow(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const openModal = (type) => {
    setModal({
      open: true,
      type,
    });
    setNote("");
  };

  const closeModal = () => {
    if (acting) return;

    setModal({
      open: false,
      type: "",
    });
    setNote("");
  };

  const approveNow = async () => {
    if (!id) return;

    try {
      setActing(true);

      await api.patch(`/api/admin/aff-withdraw-requests/${id}/approve`, {
        adminNote: note,
      });

      toast.success("Withdraw request approved");
      closeModal();
      fetchDetails();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Approve failed");
    } finally {
      setActing(false);
    }
  };

  const rejectNow = async () => {
    if (!id) return;

    try {
      setActing(true);

      await api.patch(`/api/admin/aff-withdraw-requests/${id}/reject`, {
        adminNote: note,
      });

      toast.success("Withdraw request rejected");
      closeModal();
      fetchDetails();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Reject failed");
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050607] p-4 text-white md:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,121,211,0.28),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(26,121,211,0.18),transparent_38%)]" />

      <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#1A79D3]/20 blur-3xl" />
      <div className="absolute -right-24 bottom-16 h-80 w-80 rounded-full bg-[#1A79D3]/15 blur-3xl" />
      <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-[#1A79D3]/15 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl">
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
                    Affiliate Withdraw Details
                  </h1>

                  <p className="mt-1 text-sm text-slate-300">
                    View, approve or reject affiliate withdrawal request.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/aff-withdraw-requests")}
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

                {isPending && (
                  <>
                    <button
                      type="button"
                      onClick={() => openModal("approve")}
                      disabled={acting}
                      className={btnApprove}
                    >
                      <CheckCircle size={17} />
                      Approve
                    </button>

                    <button
                      type="button"
                      onClick={() => openModal("reject")}
                      disabled={acting}
                      className={btnReject}
                    >
                      <XCircle size={17} />
                      Reject
                    </button>
                  </>
                )}
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
              Loading withdraw request...
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
              <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-4">
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

                <StatCard
                  label="User"
                  value={row?.user?.userId || "—"}
                  color="text-emerald-300"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <User className="h-5 w-5 text-[#6fb5f4]" />
                    <h3 className="text-lg font-black text-white">
                      Affiliate User
                    </h3>
                  </div>

                  <InfoRow
                    label="Full Name"
                    value={row?.user?.fullName || "No Name"}
                  />
                  <InfoRow label="User ID" value={row?.user?.userId || "—"} />
                  <InfoRow label="Phone" value={row?.user?.phone || "—"} />
                  <InfoRow label="Email" value={row?.user?.email || "—"} />
                  <InfoRow
                    label="Current Balance"
                    value={money(row?.user?.balance || 0, currency)}
                  />
                  <InfoRow label="Currency" value={currency} />
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-[#6fb5f4]" />
                    <h3 className="text-lg font-black text-white">
                      Request Details
                    </h3>
                  </div>

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
                    label="Balance Before"
                    value={money(row?.balanceBefore || 0, currency)}
                  />
                  <InfoRow
                    label="Balance After"
                    value={money(row?.balanceAfter || 0, currency)}
                  />
                  <InfoRow
                    label="Created At"
                    value={
                      row?.createdAt
                        ? new Date(row.createdAt).toLocaleString()
                        : "—"
                    }
                  />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                  <h3 className="mb-3 text-lg font-black text-white">
                    Submitted Account Information
                  </h3>

                  {Object.keys(fields).length > 0 ? (
                    Object.entries(fields).map(([key, value]) => (
                      <InfoRow
                        key={key}
                        label={key}
                        value={String(value || "—")}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">
                      No account information submitted.
                    </p>
                  )}
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                  <h3 className="mb-3 text-lg font-black text-white">
                    Admin Action
                  </h3>

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

                  {isPending && (
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => openModal("approve")}
                        disabled={acting}
                        className={btnApprove}
                      >
                        <CheckCircle size={17} />
                        Approve Now
                      </button>

                      <button
                        type="button"
                        onClick={() => openModal("reject")}
                        disabled={acting}
                        className={btnReject}
                      >
                        <XCircle size={17} />
                        Reject Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <ConfirmModal
        open={modal.open}
        type={modal.type}
        row={row}
        note={note}
        setNote={setNote}
        loading={acting}
        onClose={closeModal}
        onConfirm={modal.type === "approve" ? approveNow : rejectNow}
      />
    </div>
  );
};

export default AffWithdrawRequestDetails;
