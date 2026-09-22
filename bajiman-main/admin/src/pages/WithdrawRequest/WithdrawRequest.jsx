import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  WalletCards,
  ShieldCheck,
  Sparkles,
  Loader2,
  X,
  User,
  Phone,
  Mail,
  Landmark,
  BadgeDollarSign,
  Clock3,
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

const inputWrap =
  "flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 transition focus-within:border-[#1A79D3]/60 focus-within:shadow-[0_0_25px_rgba(26,121,211,0.20)]";

const inputClass =
  "w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500";

const btnPrimary =
  "group relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-4 py-3 text-sm font-black text-white shadow-[0_18px_50px_rgba(26,121,211,0.22)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60";

const btnGhost =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#1A79D3]/20 bg-white/[0.07] px-4 py-3 text-sm font-bold text-slate-200 transition hover:bg-[#1A79D3]/15 disabled:cursor-not-allowed disabled:opacity-50";

const btnDanger =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50";

const cardClass =
  "rounded-[32px] border border-[#1A79D3]/20 bg-white/[0.07] shadow-2xl shadow-black/40 backdrop-blur-xl";

const SummaryCard = ({ title, value, icon, tone = "blue", sub }) => {
  const toneCls =
    tone === "green"
      ? "text-emerald-300"
      : tone === "yellow"
        ? "text-yellow-300"
        : tone === "red"
          ? "text-red-300"
          : "text-[#6fb5f4]";

  return (
    <div className="rounded-[26px] border border-[#1A79D3]/20 bg-black/35 p-5 shadow-xl shadow-black/25">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">
            {title}
          </p>

          <h3 className={`mt-2 text-2xl font-black ${toneCls}`}>{value}</h3>

          {sub ? <p className="mt-2 text-xs text-slate-400">{sub}</p> : null}
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1A79D3]/30 bg-[#1A79D3]/15 text-[#6fb5f4]">
          {icon}
        </div>
      </div>
    </div>
  );
};

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

const WithdrawRequest = () => {
  const navigate = useNavigate();

  const [list, setList] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("all");
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [acting, setActing] = useState(false);

  const pageCount = useMemo(() => {
    const total = Number(meta.total || 0);
    const limit = Number(meta.limit || 10);
    return Math.max(1, Math.ceil(total / limit));
  }, [meta.total, meta.limit]);

  const summary = useMemo(() => {
    const pending = list.filter((x) => x?.status === "pending");
    const approved = list.filter((x) => x?.status === "approved");
    const rejected = list.filter((x) => x?.status === "rejected");

    const sumAmount = (arr) =>
      arr.reduce((total, item) => total + Number(item?.amount || 0), 0);

    return {
      pageTotal: list.length,
      pendingCount: pending.length,
      approvedCount: approved.length,
      rejectedCount: rejected.length,
      pendingAmount: sumAmount(pending),
      approvedAmount: sumAmount(approved),
      rejectedAmount: sumAmount(rejected),
    };
  }, [list]);

  const fetchData = async (
    page = meta.page,
    searchQ = q,
    nextStatus = status,
  ) => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: meta.limit,
      };

      if (searchQ) params.q = searchQ;
      if (nextStatus !== "all") params.status = nextStatus;

      const { data } = await api.get("/api/admin/withdraw-requests", {
        params,
      });

      const items = Array.isArray(data?.data) ? data.data : [];
      const total = Number(data?.meta?.total ?? items.length);

      setList(items);

      setMeta((prev) => ({
        ...prev,
        page: Number(data?.meta?.page || page),
        limit: Number(data?.meta?.limit || prev.limit),
        total,
      }));
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to load withdraw requests",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, q, status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (e) => {
    e.preventDefault();

    const next = qInput.trim();
    setQ(next);
    fetchData(1, next, status);
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    fetchData(1, q, value);
  };

  const openApprove = (row) => {
    setSelected(row);
    setNote("");
    setApproveOpen(true);
  };

  const openReject = (row) => {
    setSelected(row);
    setNote("");
    setRejectOpen(true);
  };

  const approveNow = async () => {
    if (!selected?._id) return;

    try {
      setActing(true);

      await api.patch(`/api/admin/withdraw-requests/${selected._id}/approve`, {
        adminNote: note,
      });

      toast.success("Withdraw approved");
      setApproveOpen(false);
      setSelected(null);
      await fetchData(meta.page, q, status);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Approve failed");
    } finally {
      setActing(false);
    }
  };

  const rejectNow = async () => {
    if (!selected?._id) return;

    try {
      setActing(true);

      await api.patch(`/api/admin/withdraw-requests/${selected._id}/reject`, {
        adminNote: note,
      });

      toast.success("Withdraw rejected");
      setRejectOpen(false);
      setSelected(null);
      await fetchData(meta.page, q, status);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Reject failed");
    } finally {
      setActing(false);
    }
  };

  const goUserDetails = (row) => {
    const userMongoId = String(
      row?.user?._id || row?.user || row?.userId || "",
    ).trim();

    if (!userMongoId) {
      toast.error("User id not found");
      return;
    }

    navigate(`/single-user-details/${userMongoId}`);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050607] p-4 text-white md:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,121,211,0.28),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(26,121,211,0.18),transparent_38%)]" />

      <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#1A79D3]/20 blur-3xl" />
      <div className="absolute -right-24 bottom-16 h-80 w-80 rounded-full bg-[#1A79D3]/15 blur-3xl" />
      <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-[#1A79D3]/15 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35 }}
          className={`${cardClass} p-5 md:p-6`}
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-[#1A79D3]/30 bg-white/10 shadow-[0_0_45px_rgba(26,121,211,0.28)] backdrop-blur">
                <WalletCards className="h-8 w-8 text-[#1A79D3]" />
              </div>

              <div>
                <h1 className="bg-gradient-to-r from-[#6fb5f4] via-[#1A79D3] to-[#3ea0ff] bg-clip-text text-2xl font-black text-transparent md:text-3xl">
                  Withdraw Requests
                </h1>
                <p className="mt-1 text-sm text-slate-300">
                  Approve, reject and manage user withdraw requests.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => fetchData(meta.page, q, status)}
              className={btnGhost}
              disabled={loading}
            >
              <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Showing"
            value={summary.pageTotal}
            icon={<ShieldCheck size={22} />}
            sub={`Filtered total: ${meta.total || 0}`}
          />

          <SummaryCard
            title="Pending"
            value={summary.pendingCount}
            icon={<Clock3 size={22} />}
            tone="yellow"
            sub={money(summary.pendingAmount)}
          />

          <SummaryCard
            title="Approved"
            value={summary.approvedCount}
            icon={<CheckCircle2 size={22} />}
            tone="green"
            sub={money(summary.approvedAmount)}
          />

          <SummaryCard
            title="Rejected"
            value={summary.rejectedCount}
            icon={<XCircle size={22} />}
            tone="red"
            sub={money(summary.rejectedAmount)}
          />
        </div>

        <div className={`${cardClass} overflow-hidden`}>
          <div className="border-b border-[#1A79D3]/20 p-5 md:p-6">
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#1A79D3]/20 bg-[#1A79D3]/10 px-4 py-3">
              <Sparkles className="h-5 w-5 text-[#1A79D3]" />
              <div>
                <h2 className="text-sm font-bold text-white">
                  Request Filters
                </h2>
                <p className="text-xs text-slate-300">
                  Search by user id, phone or email and filter request status.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px_160px]">
              <form onSubmit={onSearch}>
                <div className={inputWrap}>
                  <Search className="h-5 w-5 text-[#1A79D3]" />
                  <input
                    value={qInput}
                    onChange={(e) => setQInput(e.target.value)}
                    placeholder="Search: userId / phone / email..."
                    className={inputClass}
                  />
                </div>
              </form>

              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="h-[50px] cursor-pointer rounded-2xl border border-white/10 bg-black/35 px-4 text-sm font-bold text-white outline-none focus:border-[#1A79D3]/60"
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

              <button type="button" onClick={onSearch} className={btnPrimary}>
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition duration-700 group-hover:translate-x-full" />
                <Search size={17} />
                Search
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px]">
              <thead>
                <tr className="border-b border-[#1A79D3]/20 bg-black/50 text-left">
                  <th className="px-4 py-4 text-xs font-black uppercase tracking-wide text-slate-300">
                    User
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
                    Status
                  </th>
                  <th className="px-4 py-4 text-xs font-black uppercase tracking-wide text-slate-300">
                    Date
                  </th>
                  <th className="px-4 py-4 text-xs font-black uppercase tracking-wide text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-black/25">
                {loading ? (
                  [...Array(5)].map((_, index) => (
                    <tr key={index}>
                      <td colSpan={7} className="px-4 py-4">
                        <div className="h-16 animate-pulse rounded-2xl bg-[#1A79D3]/10" />
                      </td>
                    </tr>
                  ))
                ) : list.length ? (
                  list.map((row) => {
                    const statusText = String(row?.status || "pending");
                    const isPending = statusText === "pending";

                    const userId = row?.user?.userId || "—";
                    const phone = row?.user?.phone || "";
                    const email = row?.user?.email || "";

                    const methodName =
                      row?.walletSnapshot?.methodName?.en ||
                      row?.walletSnapshot?.methodName?.bn ||
                      row?.methodId ||
                      "—";

                    const walletType = typeText(
                      row?.walletSnapshot?.walletType ||
                        row?.wallet?.walletType,
                    );

                    const walletNumber =
                      row?.walletSnapshot?.walletNumber ||
                      row?.wallet?.walletNumber ||
                      "—";

                    const walletLabel =
                      row?.walletSnapshot?.label || row?.wallet?.label || "";

                    return (
                      <tr
                        key={row._id}
                        className="border-b border-[#1A79D3]/10 transition hover:bg-[#1A79D3]/10"
                      >
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => goUserDetails(row)}
                            className="cursor-pointer text-left text-sm font-black text-white underline decoration-[#1A79D3]/50 underline-offset-4 transition hover:text-[#6fb5f4]"
                          >
                            <span className="inline-flex items-center gap-2">
                              <User size={14} className="text-[#1A79D3]" />
                              {userId}
                            </span>
                          </button>

                          <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                            <Phone size={12} />
                            {phone || "—"}
                          </div>

                          {email ? (
                            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                              <Mail size={12} />
                              {email}
                            </div>
                          ) : null}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 text-sm font-black text-white">
                            <Landmark size={15} className="text-[#1A79D3]" />
                            {methodName}
                          </div>

                          <div className="mt-1 text-xs uppercase text-slate-400">
                            {String(row?.methodId || "—").toUpperCase()}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="text-sm font-black text-white">
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

                        <td className="px-4 py-4">
                          <div className="inline-flex items-center gap-2 text-sm font-black text-[#6fb5f4]">
                            <BadgeDollarSign size={15} />
                            {money(row?.amount || 0)}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase ${chipClass(
                              statusText,
                            )}`}
                          >
                            {statusText}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-xs font-semibold text-slate-400">
                          {formatDate(row?.createdAt)}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/withdraw-request-details/${row._id}`)
                              }
                              className={btnGhost}
                            >
                              <Eye size={15} />
                              Details
                            </button>

                            <button
                              type="button"
                              onClick={() => openApprove(row)}
                              disabled={!isPending}
                              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <CheckCircle2 size={15} />
                              Approve
                            </button>

                            <button
                              type="button"
                              onClick={() => openReject(row)}
                              disabled={!isPending}
                              className={btnDanger}
                            >
                              <XCircle size={15} />
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-14 text-center text-sm font-bold text-slate-400"
                    >
                      No withdraw requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#1A79D3]/20 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-400">
              Page <span className="font-black text-white">{meta.page}</span> of{" "}
              <span className="font-black text-white">{pageCount}</span> | Total{" "}
              <span className="font-black text-[#6fb5f4]">
                {meta.total || 0}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchData(Math.max(1, meta.page - 1), q, status)}
                disabled={meta.page <= 1 || loading}
                className={btnGhost}
              >
                <ChevronLeft size={16} />
                Prev
              </button>

              <button
                type="button"
                onClick={() =>
                  fetchData(Math.min(pageCount, meta.page + 1), q, status)
                }
                disabled={meta.page >= pageCount || loading}
                className={btnGhost}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={approveOpen}
        title="Approve Withdraw Request"
        description={`You are going to approve this request. Amount: ${money(
          selected?.amount || 0,
        )}`}
        confirmText="Approve"
        confirmVariant="approve"
        loading={acting}
        note={note}
        setNote={setNote}
        onClose={() => {
          if (acting) return;
          setApproveOpen(false);
          setSelected(null);
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
          setSelected(null);
        }}
        onConfirm={rejectNow}
      />
    </div>
  );
};

export default WithdrawRequest;
