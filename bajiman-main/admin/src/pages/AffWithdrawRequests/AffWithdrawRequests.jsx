import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  Clock,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
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

const statusChip = (status) => {
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

  if (s === "approved") return <CheckCircle size={15} />;
  if (s === "rejected") return <XCircle size={15} />;
  return <Clock size={15} />;
};

const cardCls =
  "rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.07] shadow-2xl shadow-black/50 backdrop-blur-xl";

const inputCls =
  "w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#1A79D3]/60 focus:shadow-[0_0_25px_rgba(26,121,211,0.20)]";

const btnPrimary =
  "cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-5 py-3 text-sm font-black text-white shadow-[0_18px_50px_rgba(26,121,211,0.25)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60";

const btnGhost =
  "cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-5 py-3 text-sm font-bold text-slate-100 transition hover:bg-[#1A79D3]/20 disabled:cursor-not-allowed disabled:opacity-60";

const btnApprove =
  "cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-2.5 text-xs font-black text-emerald-200 transition hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-50";

const btnReject =
  "cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl border border-red-400/30 bg-red-500/15 px-4 py-2.5 text-xs font-black text-red-200 transition hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-50";

const ConfirmModal = ({
  open,
  type,
  selected,
  note,
  setNote,
  loading,
  onClose,
  onConfirm,
}) => {
  if (!open) return null;

  const isApprove = type === "approve";

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
                {isApprove
                  ? "Approve Withdraw Request"
                  : "Reject Withdraw Request"}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Amount:{" "}
                <span className="font-black text-[#6fb5f4]">
                  {money(
                    selected?.amount || 0,
                    selected?.user?.currency || "BDT",
                  )}
                </span>
              </p>
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

const AffWithdrawRequests = () => {
  const navigate = useNavigate();

  const [list, setList] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState(false);

  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const [modal, setModal] = useState({
    open: false,
    type: "",
    selected: null,
  });

  const [note, setNote] = useState("");

  const pageCount = useMemo(() => {
    return Math.max(
      1,
      Math.ceil(Number(meta.total || 0) / Number(meta.limit || 10)),
    );
  }, [meta.total, meta.limit]);

  const stats = useMemo(() => {
    const totalAmount = list.reduce(
      (sum, item) => sum + Number(item?.amount || 0),
      0,
    );
    const pending = list.filter((x) => String(x?.status) === "pending").length;
    const approved = list.filter(
      (x) => String(x?.status) === "approved",
    ).length;
    const rejected = list.filter(
      (x) => String(x?.status) === "rejected",
    ).length;

    return { totalAmount, pending, approved, rejected };
  }, [list]);

  const fetchData = async (
    page = meta.page,
    nextQ = q,
    nextStatus = status,
  ) => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: meta.limit,
      };

      if (nextQ) params.q = nextQ;
      if (nextStatus !== "all") params.status = nextStatus;

      const { data } = await api.get("/api/admin/aff-withdraw-requests", {
        params,
      });

      const rows = Array.isArray(data?.data) ? data.data : [];

      setList(rows);
      setMeta((prev) => ({
        ...prev,
        page: data?.meta?.page || page,
        limit: data?.meta?.limit || prev.limit,
        total: data?.meta?.total ?? rows.length,
      }));
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load withdraw requests",
      );
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (e) => {
    e.preventDefault();

    const query = qInput.trim();
    setQ(query);
    fetchData(1, query, status);
  };

  const onStatusChange = (e) => {
    const next = e.target.value;
    setStatus(next);
    fetchData(1, q, next);
  };

  const onLimitChange = (e) => {
    const nextLimit = Number(e.target.value || 10);

    setMeta((prev) => ({
      ...prev,
      limit: nextLimit,
    }));

    setTimeout(() => {
      fetchData(1, q, status);
    }, 0);
  };

  const openModal = (type, selected) => {
    setModal({
      open: true,
      type,
      selected,
    });
    setNote("");
  };

  const closeModal = () => {
    if (acting) return;

    setModal({
      open: false,
      type: "",
      selected: null,
    });
    setNote("");
  };

  const approveNow = async () => {
    if (!modal.selected?._id) return;

    try {
      setActing(true);

      await api.patch(
        `/api/admin/aff-withdraw-requests/${modal.selected._id}/approve`,
        { adminNote: note },
      );

      toast.success("Withdraw request approved");
      closeModal();
      fetchData(meta.page, q, status);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Approve failed");
    } finally {
      setActing(false);
    }
  };

  const rejectNow = async () => {
    if (!modal.selected?._id) return;

    try {
      setActing(true);

      await api.patch(
        `/api/admin/aff-withdraw-requests/${modal.selected._id}/reject`,
        { adminNote: note },
      );

      toast.success("Withdraw request rejected");
      closeModal();
      fetchData(meta.page, q, status);
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

      <div className="relative z-10 mx-auto max-w-screen-2xl">
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
                    Affiliate Withdraw Requests
                  </h1>

                  <p className="mt-1 text-sm text-slate-300">
                    Approve or reject affiliate withdrawal requests.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => fetchData(meta.page, q, status)}
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

          <div className="border-b border-white/10 bg-black/25 p-5 md:p-6">
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#1A79D3]/20 bg-[#1A79D3]/10 px-4 py-3">
              <Sparkles className="h-5 w-5 text-[#1A79D3]" />

              <div>
                <h2 className="text-sm font-bold text-white">
                  Withdraw Request Management
                </h2>
                <p className="text-xs text-slate-300">
                  Search by userId, phone, email, name or method.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_180px_170px_150px]">
              <form onSubmit={onSearch} className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#1A79D3]" />

                <input
                  value={qInput}
                  onChange={(e) => setQInput(e.target.value)}
                  placeholder="Search withdraw requests..."
                  className={`${inputCls} pl-12`}
                />
              </form>

              <select
                value={status}
                onChange={onStatusChange}
                className={`${inputCls} cursor-pointer`}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={meta.limit}
                onChange={onLimitChange}
                className={`${inputCls} cursor-pointer`}
              >
                <option value={10}>10 Per Page</option>
                <option value={20}>20 Per Page</option>
                <option value={30}>30 Per Page</option>
                <option value={50}>50 Per Page</option>
                <option value={100}>100 Per Page</option>
              </select>

              <button type="button" onClick={onSearch} className={btnPrimary}>
                <Search size={18} />
                Search
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs text-slate-400">Total Requests</p>
                <h3 className="mt-1 text-2xl font-black text-white">
                  {meta.total || 0}
                </h3>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs text-slate-400">Pending On Page</p>
                <h3 className="mt-1 text-2xl font-black text-amber-300">
                  {stats.pending}
                </h3>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs text-slate-400">Approved On Page</p>
                <h3 className="mt-1 text-2xl font-black text-emerald-300">
                  {stats.approved}
                </h3>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs text-slate-400">Page Amount</p>
                <h3 className="mt-1 text-xl font-black text-[#6fb5f4]">
                  {money(stats.totalAmount)}
                </h3>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-20 text-slate-300">
              <Loader2 className="h-6 w-6 animate-spin text-[#1A79D3]" />
              Loading withdraw requests...
            </div>
          ) : list.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mb-4 text-6xl">📭</div>
              <h3 className="text-2xl font-black text-white">
                No withdraw requests found
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Try changing search or status filter.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-full divide-y divide-white/10">
                  <thead className="bg-black/30">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-black text-slate-300">
                        Affiliate
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-black text-slate-300">
                        Method
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-black text-slate-300">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-black text-slate-300">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-black text-slate-300">
                        Date
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-black text-slate-300">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/10">
                    {list.map((row) => {
                      const rowStatus = String(row?.status || "pending");
                      const isPending = rowStatus === "pending";
                      const currency = row?.user?.currency || "BDT";
                      const date = row?.createdAt
                        ? new Date(row.createdAt).toLocaleString()
                        : "—";

                      return (
                        <tr
                          key={row._id}
                          className="transition hover:bg-[#1A79D3]/5"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#1A79D3]/25 bg-[#1A79D3]/15">
                                <ShieldCheck className="h-5 w-5 text-[#6fb5f4]" />
                              </div>

                              <div>
                                <p className="font-black text-white">
                                  {row?.user?.fullName || "No Name"}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {row?.user?.userId || "—"}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {row?.user?.phone || "—"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5 font-black text-white">
                            {String(row?.methodId || "—").toUpperCase()}
                          </td>

                          <td className="px-6 py-5 font-black text-[#6fb5f4]">
                            {money(row?.amount || 0, currency)}
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-black ${statusChip(
                                rowStatus,
                              )}`}
                            >
                              {statusIcon(rowStatus)}
                              {rowStatus.toUpperCase()}
                            </span>
                          </td>

                          <td className="px-6 py-5 text-xs font-bold text-slate-400">
                            {date}
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(
                                    `/aff-withdraw-requests-details/${row._id}`,
                                  )
                                }
                                className={btnGhost}
                              >
                                <Eye size={16} />
                                Details
                              </button>

                              <button
                                type="button"
                                onClick={() => openModal("approve", row)}
                                disabled={!isPending || acting}
                                className={btnApprove}
                              >
                                <CheckCircle size={16} />
                                Approve
                              </button>

                              <button
                                type="button"
                                onClick={() => openModal("reject", row)}
                                disabled={!isPending || acting}
                                className={btnReject}
                              >
                                <XCircle size={16} />
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="space-y-4 p-4 lg:hidden">
                {list.map((row) => {
                  const rowStatus = String(row?.status || "pending");
                  const isPending = rowStatus === "pending";
                  const currency = row?.user?.currency || "BDT";
                  const date = row?.createdAt
                    ? new Date(row.createdAt).toLocaleString()
                    : "—";

                  return (
                    <div
                      key={row._id}
                      className="rounded-[24px] border border-white/10 bg-black/25 p-4"
                    >
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-black text-white">
                            {row?.user?.fullName || "No Name"}
                          </h3>
                          <p className="mt-1 text-xs text-slate-400">
                            ID: {row?.user?.userId || "—"}
                          </p>
                          <p className="text-xs text-slate-500">
                            Phone: {row?.user?.phone || "—"}
                          </p>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-black ${statusChip(
                            rowStatus,
                          )}`}
                        >
                          {statusIcon(rowStatus)}
                          {rowStatus.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                          <p className="text-xs text-slate-400">Method</p>
                          <p className="mt-1 text-sm font-black text-white">
                            {String(row?.methodId || "—").toUpperCase()}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                          <p className="text-xs text-slate-400">Amount</p>
                          <p className="mt-1 text-sm font-black text-[#6fb5f4]">
                            {money(row?.amount || 0, currency)}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-slate-500">{date}</p>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/aff-withdraw-request-details/${row._id}`)
                          }
                          className={btnGhost}
                        >
                          <Eye size={16} />
                          Details
                        </button>

                        <button
                          type="button"
                          onClick={() => openModal("approve", row)}
                          disabled={!isPending || acting}
                          className={btnApprove}
                        >
                          <CheckCircle size={16} />
                          Approve
                        </button>

                        <button
                          type="button"
                          onClick={() => openModal("reject", row)}
                          disabled={!isPending || acting}
                          className={btnReject}
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 bg-black/25 px-5 py-5 md:flex-row">
                <p className="text-sm text-slate-400">
                  Page{" "}
                  <span className="font-black text-white">{meta.page}</span> of{" "}
                  <span className="font-black text-white">{pageCount}</span> —
                  Total{" "}
                  <span className="font-black text-white">{meta.total}</span>
                </p>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      fetchData(Math.max(1, meta.page - 1), q, status)
                    }
                    disabled={meta.page <= 1 || loading}
                    className={btnGhost}
                  >
                    Previous
                  </button>

                  <span className="rounded-2xl border border-white/10 bg-black/35 px-5 py-3 text-sm font-black text-white">
                    {meta.page} / {pageCount}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      fetchData(Math.min(pageCount, meta.page + 1), q, status)
                    }
                    disabled={meta.page >= pageCount || loading}
                    className={btnGhost}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>

      <ConfirmModal
        open={modal.open}
        type={modal.type}
        selected={modal.selected}
        note={note}
        setNote={setNote}
        loading={acting}
        onClose={closeModal}
        onConfirm={modal.type === "approve" ? approveNow : rejectNow}
      />
    </div>
  );
};

export default AffWithdrawRequests;
