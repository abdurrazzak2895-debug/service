import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  WalletCards,
  User,
  Phone,
  Mail,
  Landmark,
  BadgeDollarSign,
  Clock3,
  ShieldCheck,
  Sparkles,
  Loader2,
  X,
  FileText,
  CreditCard,
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

const chipClass = (status) => {
  const s = String(status || "pending").toLowerCase();

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

const btnPrimary =
  "group relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-4 py-3 text-sm font-black text-white shadow-[0_18px_50px_rgba(26,121,211,0.22)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60";

const btnGhost =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#1A79D3]/20 bg-white/[0.07] px-4 py-3 text-sm font-bold text-slate-200 transition hover:bg-[#1A79D3]/15 disabled:cursor-not-allowed disabled:opacity-50";

const btnDanger =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50";

const cardClass =
  "rounded-[32px] border border-[#1A79D3]/20 bg-white/[0.07] shadow-2xl shadow-black/40 backdrop-blur-xl";

const InfoCard = ({ icon, title, children }) => (
  <div className={`${cardClass} p-5 md:p-6`}>
    <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#1A79D3]/20 bg-[#1A79D3]/10 px-4 py-3">
      <div className="text-[#1A79D3]">{icon}</div>
      <div>
        <h2 className="text-sm font-bold text-white">{title}</h2>
        <p className="text-xs text-slate-300">Request information</p>
      </div>
    </div>
    {children}
  </div>
);

const Row = ({ label, value, strong = false }) => (
  <div className="flex items-start justify-between gap-4 border-b border-white/10 py-3 last:border-b-0">
    <span className="text-sm font-semibold text-slate-400">{label}</span>
    <span
      className={`max-w-[60%] break-all text-right text-sm ${
        strong ? "font-black text-white" : "font-bold text-slate-200"
      }`}
    >
      {value || "—"}
    </span>
  </div>
);

const ConfirmModal = ({
  open,
  title,
  description,
  confirmText,
  confirmVariant = "approve",
  loading,
  note,
  setNote,
  onClose,
  onConfirm,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.94 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-[520px] rounded-[28px] border border-[#1A79D3]/20 bg-[#050607] p-6 text-white shadow-2xl"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-black">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-300">
                  {description}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="cursor-pointer text-slate-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X size={22} />
              </button>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-200">
                Admin Note optional
              </label>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write a note for user..."
                className="mt-2 min-h-[100px] w-full rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#1A79D3]/60 focus:shadow-[0_0_25px_rgba(26,121,211,0.20)]"
              />
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
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
                className={confirmVariant === "reject" ? btnDanger : btnPrimary}
              >
                {loading ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : confirmVariant === "reject" ? (
                  <XCircle size={17} />
                ) : (
                  <CheckCircle2 size={17} />
                )}
                {loading ? "Processing..." : confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const WithdrawRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [note, setNote] = useState("");
  const [acting, setActing] = useState(false);

  const loadDetails = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/api/admin/withdraw-requests/${id}`);
      setData(res?.data?.data || null);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load withdraw details",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadDetails();
  }, [id]);

  const approveNow = async () => {
    try {
      setActing(true);

      await api.patch(`/api/admin/withdraw-requests/${id}/approve`, {
        adminNote: note,
      });

      toast.success("Withdraw approved");
      setApproveOpen(false);
      setNote("");
      await loadDetails();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Approve failed");
    } finally {
      setActing(false);
    }
  };

  const rejectNow = async () => {
    try {
      setActing(true);

      await api.patch(`/api/admin/withdraw-requests/${id}/reject`, {
        adminNote: note,
      });

      toast.success("Withdraw rejected and balance refunded");
      setRejectOpen(false);
      setNote("");
      await loadDetails();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Reject failed");
    } finally {
      setActing(false);
    }
  };

  const goUserDetails = () => {
    const userMongoId = String(data?.user?._id || data?.user || "").trim();

    if (!userMongoId) {
      toast.error("User id not found");
      return;
    }

    navigate(`/single-user-details/${userMongoId}`);
  };

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#050607] p-4 text-white md:p-6">
        <div className="relative z-10 flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-slate-300">
            <Loader2 className="animate-spin text-[#1A79D3]" />
            Loading withdraw request details...
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#050607] p-4 text-white md:p-6">
        <div className="relative z-10 flex min-h-[60vh] items-center justify-center">
          <div className={`${cardClass} p-8 text-center`}>
            <XCircle className="mx-auto h-12 w-12 text-red-300" />
            <h2 className="mt-4 text-xl font-black">Request not found</h2>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={`${btnGhost} mt-5`}
            >
              <ArrowLeft size={17} />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusText = String(data?.status || "pending").toLowerCase();
  const isPending = statusText === "pending";

  const userId = data?.user?.userId || "—";
  const phone = data?.user?.phone || "—";
  const email = data?.user?.email || "";

  const methodName =
    data?.walletSnapshot?.methodName?.en ||
    data?.walletSnapshot?.methodName?.bn ||
    data?.methodId ||
    "—";

  const walletNumber =
    data?.walletSnapshot?.walletNumber || data?.wallet?.walletNumber || "—";

  const walletType = typeText(
    data?.walletSnapshot?.walletType || data?.wallet?.walletType,
  );

  const walletLabel = data?.walletSnapshot?.label || data?.wallet?.label || "";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050607] p-4 text-white md:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,121,211,0.28),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(26,121,211,0.18),transparent_38%)]" />
      <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#1A79D3]/20 blur-3xl" />
      <div className="absolute -right-24 bottom-16 h-80 w-80 rounded-full bg-[#1A79D3]/15 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35 }}
          className={`${cardClass} p-5 md:p-6`}
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border border-[#1A79D3]/20 bg-white/[0.07] text-slate-200 hover:bg-[#1A79D3]/15"
              >
                <ArrowLeft size={20} />
              </button>

              <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-[#1A79D3]/30 bg-white/10 shadow-[0_0_45px_rgba(26,121,211,0.28)] backdrop-blur">
                <WalletCards className="h-8 w-8 text-[#1A79D3]" />
              </div>

              <div>
                <h1 className="bg-gradient-to-r from-[#6fb5f4] via-[#1A79D3] to-[#3ea0ff] bg-clip-text text-2xl font-black text-transparent md:text-3xl">
                  Withdraw Request Details
                </h1>
                <p className="mt-1 text-sm text-slate-300">
                  Review withdraw information and approve or reject.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black uppercase ${chipClass(
                  statusText,
                )}`}
              >
                {statusText === "approved" ? (
                  <CheckCircle2 size={17} />
                ) : statusText === "rejected" ? (
                  <XCircle size={17} />
                ) : (
                  <Clock3 size={17} />
                )}
                {statusText}
              </span>

              {isPending && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setNote("");
                      setApproveOpen(true);
                    }}
                    className={btnPrimary}
                  >
                    <CheckCircle2 size={17} />
                    Approve
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNote("");
                      setRejectOpen(true);
                    }}
                    className={btnDanger}
                  >
                    <XCircle size={17} />
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <InfoCard icon={<User size={22} />} title="User Information">
            <Row
              label="User ID"
              value={
                <button
                  type="button"
                  onClick={goUserDetails}
                  className="cursor-pointer font-black text-[#6fb5f4] underline decoration-[#1A79D3]/50 underline-offset-4 hover:text-white"
                >
                  {userId}
                </button>
              }
              strong
            />
            <Row label="Phone" value={phone} />
            <Row label="Email" value={email || "—"} />
            <Row label="Role" value={data?.user?.role || "—"} />
            <Row
              label="User Balance"
              value={money(data?.user?.balance || 0)}
              strong
            />
            <Row
              label="User Active"
              value={data?.user?.isActive === false ? "NO" : "YES"}
            />
          </InfoCard>

          <InfoCard icon={<Landmark size={22} />} title="Wallet Information">
            <Row label="Method" value={methodName} strong />
            <Row label="Method ID" value={String(data?.methodId || "—")} />
            <Row label="Wallet Number" value={walletNumber} strong />
            <Row label="Wallet Type" value={walletType} />
            <Row label="Wallet Label" value={walletLabel || "—"} />
            <Row
              label="Wallet Active"
              value={data?.wallet?.isActive === false ? "NO" : "YES"}
            />
          </InfoCard>

          <InfoCard
            icon={<BadgeDollarSign size={22} />}
            title="Amount Information"
          >
            <Row label="Amount" value={money(data?.amount || 0)} strong />
            <Row
              label="Balance Before"
              value={money(data?.balanceBefore || 0)}
            />
            <Row label="Balance After" value={money(data?.balanceAfter || 0)} />
            <Row label="Status" value={statusText.toUpperCase()} strong />
            <Row label="Created At" value={formatDate(data?.createdAt)} />
            <Row label="Updated At" value={formatDate(data?.updatedAt)} />
          </InfoCard>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <InfoCard icon={<FileText size={22} />} title="Admin Information">
            <Row label="Admin Note" value={data?.adminNote || "—"} />
            <Row label="Approved At" value={formatDate(data?.approvedAt)} />
            <Row label="Rejected At" value={formatDate(data?.rejectedAt)} />
            <Row label="Admin ID" value={data?.adminId || "—"} />
          </InfoCard>

          <InfoCard icon={<CreditCard size={22} />} title="Request IDs">
            <Row label="Request ID" value={data?._id || "—"} />
            <Row
              label="User Mongo ID"
              value={data?.user?._id || data?.user || "—"}
            />
            <Row
              label="Wallet ID"
              value={data?.wallet?._id || data?.wallet || "—"}
            />
            <Row label="Method ID" value={data?.methodId || "—"} />
          </InfoCard>
        </div>
      </div>

      <ConfirmModal
        open={approveOpen}
        title="Approve Withdraw Request"
        description={`You are going to approve this request. Amount: ${money(
          data?.amount || 0,
        )}`}
        confirmText="Approve"
        confirmVariant="approve"
        loading={acting}
        note={note}
        setNote={setNote}
        onClose={() => {
          if (acting) return;
          setApproveOpen(false);
        }}
        onConfirm={approveNow}
      />

      <ConfirmModal
        open={rejectOpen}
        title="Reject Withdraw Request"
        description="Rejecting will refund the user's balance."
        confirmText="Reject"
        confirmVariant="reject"
        loading={acting}
        note={note}
        setNote={setNote}
        onClose={() => {
          if (acting) return;
          setRejectOpen(false);
        }}
        onConfirm={rejectNow}
      />
    </div>
  );
};

export default WithdrawRequestDetails;
