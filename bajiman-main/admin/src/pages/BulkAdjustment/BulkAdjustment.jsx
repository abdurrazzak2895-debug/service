import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  User,
  Wallet,
  Zap,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const n = (v) => {
  const num = Number(v || 0);
  return Number.isFinite(num) ? num : 0;
};

const money = (v, currency = "BDT") => {
  const symbol = currency === "USDT" ? "$" : "৳";
  return `${symbol} ${n(v).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const cardCls =
  "rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.07] shadow-2xl shadow-black/50 backdrop-blur-xl";

const btnPrimary =
  "cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-5 py-3 text-sm font-black text-white shadow-[0_18px_50px_rgba(26,121,211,0.25)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60";

const btnGhost =
  "cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-5 py-3 text-sm font-bold text-slate-100 transition hover:bg-[#1A79D3]/20 disabled:cursor-not-allowed disabled:opacity-60";

const inputCls =
  "w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#1A79D3]/60 focus:shadow-[0_0_25px_rgba(26,121,211,0.20)]";

const chipCls = (net) => {
  if (net > 0)
    return "border-emerald-400/30 bg-emerald-500/15 text-emerald-300";
  if (net < 0) return "border-red-400/30 bg-red-500/15 text-red-300";
  return "border-amber-400/30 bg-amber-500/15 text-amber-300";
};

const FieldRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 border-b border-white/10 py-2.5 last:border-b-0">
    <span className="text-xs font-bold text-slate-400">{label}</span>
    <span className="text-right text-xs font-black text-white break-all">
      {value}
    </span>
  </div>
);

const ConfirmModal = ({
  open,
  title,
  desc,
  loading,
  confirmText,
  onClose,
  onConfirm,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className={`${cardCls} w-full max-w-md p-6`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/15">
              <AlertTriangle className="text-amber-300" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white">{title}</h3>
              {desc && (
                <p className="mt-2 text-sm leading-6 text-slate-300">{desc}</p>
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
            className={btnPrimary}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap size={17} />
                {confirmText}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const BulkAdjustment = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adjusting, setAdjusting] = useState(false);

  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");

  const [expandedId, setExpandedId] = useState("");
  const [singleModal, setSingleModal] = useState({ open: false, user: null });
  const [allModal, setAllModal] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const page = pagination.page;
  const limit = pagination.limit;
  const totalPages = pagination.totalPages;

  const computePreview = (user) => {
    const gross =
      n(user?.gameLossCommissionBalance) +
      n(user?.depositCommissionBalance) +
      n(user?.referCommissionBalance);

    const net = gross - n(user?.gameWinCommissionBalance);

    return { gross, net };
  };

  const fetchData = async (
    { page: nextPage = page, limit: nextLimit = limit, query = q } = {},
    isRefresh = false,
  ) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const params = {
        page: nextPage,
        limit: nextLimit,
      };

      if (query) params.q = query;

      const { data } = await api.get("/api/admin/bulk-adjustment/users", {
        params,
      });

      if (!data?.success) {
        throw new Error(data?.message || "Fetch failed");
      }

      setRows(Array.isArray(data.data) ? data.data : []);
      setPagination({
        page: data?.pagination?.page || nextPage,
        limit: data?.pagination?.limit || nextLimit,
        total: data?.pagination?.total || 0,
        totalPages: data?.pagination?.totalPages || 1,
      });

      setExpandedId("");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "Server error",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const headerStats = useMemo(() => {
    let pageGross = 0;
    let pageNet = 0;

    rows.forEach((user) => {
      const { gross, net } = computePreview(user);
      pageGross += gross;
      pageNet += net;
    });

    return {
      showing: rows.length,
      total: n(pagination.total),
      pageGross,
      pageNet,
    };
  }, [rows, pagination.total]);

  const onSearch = (e) => {
    e.preventDefault();
    const query = qInput.trim();
    setQ(query);
    fetchData({ page: 1, query }, true);
  };

  const onRefresh = async () => {
    await fetchData({ page }, true);
    toast.info("Refreshed");
  };

  const onLimitChange = (e) => {
    fetchData({ page: 1, limit: Number(e.target.value) }, true);
  };

  const onPageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    fetchData({ page: nextPage }, true);
  };

  const openSingleAdjust = (user) => {
    setSingleModal({ open: true, user });
  };

  const closeSingleAdjust = () => {
    setSingleModal({ open: false, user: null });
  };

  const doAdjustSingle = async () => {
    const user = singleModal.user;
    if (!user?._id) return;

    try {
      setAdjusting(true);

      const { data } = await api.post(
        `/api/admin/bulk-adjustment/adjust/${user._id}`,
        {},
      );

      if (!data?.success) {
        throw new Error(data?.message || "Adjustment failed");
      }

      toast.success("Single affiliate adjustment completed");
      closeSingleAdjust();
      await fetchData({ page }, true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "Server error",
      );
    } finally {
      setAdjusting(false);
    }
  };

  const doAdjustAll = async () => {
    try {
      setAdjusting(true);

      const body = q ? { q } : {};

      const { data } = await api.post(
        "/api/admin/bulk-adjustment/adjust-all",
        body,
      );

      if (!data?.success) {
        throw new Error(data?.message || "Bulk adjustment failed");
      }

      toast.success(
        `Adjusted ${data?.data?.adjustedUsers ?? 0} affiliate users`,
      );
      setAllModal(false);
      await fetchData({ page: 1 }, true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "Server error",
      );
    } finally {
      setAdjusting(false);
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
                  <ShieldCheck className="h-8 w-8 text-[#1A79D3]" />
                </div>

                <div>
                  <h1 className="bg-gradient-to-r from-[#6fb5f4] via-[#1A79D3] to-[#3ea0ff] bg-clip-text text-2xl font-black text-transparent md:text-3xl">
                    Bulk Adjustment
                  </h1>

                  <p className="mt-1 text-sm text-slate-300">
                    Affiliate commission balance move to wallet balance.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={loading || refreshing}
                  className={btnGhost}
                >
                  <RefreshCw
                    className={refreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"}
                  />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={() => setAllModal(true)}
                  disabled={
                    loading || refreshing || adjusting || rows.length === 0
                  }
                  className={btnPrimary}
                >
                  <Zap size={18} />
                  Adjust All
                </button>
              </div>
            </div>
          </div>

          <div className="border-b border-white/10 bg-black/25 p-5 md:p-6">
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#1A79D3]/20 bg-[#1A79D3]/10 px-4 py-3">
              <Sparkles className="h-5 w-5 text-[#1A79D3]" />
              <div>
                <h2 className="text-sm font-bold text-white">
                  Adjustment Preview
                </h2>
                <p className="text-xs text-slate-300">
                  Gross = game loss + deposit + refer. Net = gross - game win.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
              <form onSubmit={onSearch} className="relative lg:col-span-2">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#1A79D3]" />
                <input
                  value={qInput}
                  onChange={(e) => setQInput(e.target.value)}
                  placeholder="Search by userId / phone / email / name..."
                  className={`${inputCls} pl-12`}
                />
              </form>

              <div>
                <select
                  value={limit}
                  onChange={onLimitChange}
                  className={`${inputCls} cursor-pointer`}
                >
                  <option value={10}>10 Per Page</option>
                  <option value={20}>20 Per Page</option>
                  <option value={30}>30 Per Page</option>
                  <option value={50}>50 Per Page</option>
                </select>
              </div>

              <button type="button" onClick={onSearch} className={btnPrimary}>
                <Search size={18} />
                Search
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs text-slate-400">Showing</p>
                <h3 className="mt-1 text-2xl font-black text-white">
                  {headerStats.showing}
                </h3>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs text-slate-400">Total Affiliate</p>
                <h3 className="mt-1 text-2xl font-black text-white">
                  {headerStats.total}
                </h3>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs text-slate-400">Page Gross</p>
                <h3 className="mt-1 text-xl font-black text-emerald-300">
                  {money(headerStats.pageGross)}
                </h3>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs text-slate-400">Page Net</p>
                <h3 className="mt-1 text-xl font-black text-[#6fb5f4]">
                  {money(headerStats.pageNet)}
                </h3>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-20 text-slate-300">
              <Loader2 className="h-6 w-6 animate-spin text-[#1A79D3]" />
              Loading affiliate users...
            </div>
          ) : rows.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mb-4 text-6xl">📭</div>
              <h3 className="text-2xl font-black text-white">
                No affiliate users found
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Try search or refresh again.
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
                        Wallet
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-black text-slate-300">
                        Gross
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-black text-slate-300">
                        Win Deduct
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-black text-slate-300">
                        Net
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-black text-slate-300">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/10">
                    {rows.map((user) => {
                      const id = String(user._id || "");
                      const isExpanded = expandedId === id;
                      const currency = user.currency || "BDT";
                      const { gross, net } = computePreview(user);

                      return (
                        <React.Fragment key={id}>
                          <tr className="transition hover:bg-[#1A79D3]/5">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#1A79D3]/25 bg-[#1A79D3]/15">
                                  <User className="h-5 w-5 text-[#6fb5f4]" />
                                </div>
                                <div>
                                  <p className="font-black text-white">
                                    {user.fullName || "No Name"}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    {user.userId || "—"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-5 font-black text-white">
                              {money(user.balance, currency)}
                            </td>

                            <td className="px-6 py-5 font-black text-emerald-300">
                              {money(gross, currency)}
                            </td>

                            <td className="px-6 py-5 font-black text-amber-300">
                              {money(user.gameWinCommissionBalance, currency)}
                            </td>

                            <td className="px-6 py-5">
                              <span
                                className={`inline-flex rounded-full border px-4 py-1.5 text-sm font-black ${chipCls(net)}`}
                              >
                                {money(net, currency)}
                              </span>
                            </td>

                            <td className="px-6 py-5 text-right">
                              <div className="flex justify-end gap-3">
                                <button
                                  type="button"
                                  onClick={() => openSingleAdjust(user)}
                                  disabled={adjusting}
                                  className={btnPrimary}
                                >
                                  <Zap size={16} />
                                  Adjust
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedId(isExpanded ? "" : id)
                                  }
                                  className="cursor-pointer rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-[#6fb5f4] transition hover:bg-[#1A79D3]/15"
                                >
                                  {isExpanded ? (
                                    <ChevronUp size={18} />
                                  ) : (
                                    <ChevronDown size={18} />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr>
                              <td colSpan={6} className="bg-black/25 p-6">
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                  <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                                    <h3 className="mb-3 font-black text-[#6fb5f4]">
                                      Affiliate Info
                                    </h3>
                                    <FieldRow
                                      label="Full Name"
                                      value={user.fullName || "—"}
                                    />
                                    <FieldRow
                                      label="User ID"
                                      value={user.userId || "—"}
                                    />
                                    <FieldRow
                                      label="Phone"
                                      value={`${user.countryCode || ""} ${user.phone || "—"}`}
                                    />
                                    <FieldRow
                                      label="Email"
                                      value={user.email || "—"}
                                    />
                                    <FieldRow
                                      label="Referral Code"
                                      value={user.referralCode || "—"}
                                    />
                                    <FieldRow
                                      label="Referral Count"
                                      value={user.referralCount ?? 0}
                                    />
                                  </div>

                                  <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                                    <h3 className="mb-3 font-black text-[#6fb5f4]">
                                      Commission Breakdown
                                    </h3>
                                    <FieldRow
                                      label="Game Loss"
                                      value={money(
                                        user.gameLossCommissionBalance,
                                        currency,
                                      )}
                                    />
                                    <FieldRow
                                      label="Deposit"
                                      value={money(
                                        user.depositCommissionBalance,
                                        currency,
                                      )}
                                    />
                                    <FieldRow
                                      label="Refer"
                                      value={money(
                                        user.referCommissionBalance,
                                        currency,
                                      )}
                                    />
                                    <FieldRow
                                      label="Game Win Deduct"
                                      value={money(
                                        user.gameWinCommissionBalance,
                                        currency,
                                      )}
                                    />
                                    <FieldRow
                                      label="Gross"
                                      value={money(gross, currency)}
                                    />
                                    <FieldRow
                                      label="Net"
                                      value={money(net, currency)}
                                    />
                                    <FieldRow
                                      label="Current Balance"
                                      value={money(user.balance, currency)}
                                    />
                                    <FieldRow
                                      label="Expected Balance"
                                      value={money(
                                        n(user.balance) + net,
                                        currency,
                                      )}
                                    />
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="space-y-4 p-4 lg:hidden">
                {rows.map((user) => {
                  const id = String(user._id || "");
                  const isExpanded = expandedId === id;
                  const currency = user.currency || "BDT";
                  const { gross, net } = computePreview(user);

                  return (
                    <div
                      key={id}
                      className="rounded-[24px] border border-white/10 bg-black/25 p-4"
                    >
                      <div className="flex justify-between gap-4">
                        <div className="flex min-w-0 gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#1A79D3]/25 bg-[#1A79D3]/15">
                            <User className="h-5 w-5 text-[#6fb5f4]" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate font-black text-white">
                              {user.fullName || "No Name"}
                            </h3>
                            <p className="text-xs text-slate-400">
                              {user.userId || "—"}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`h-fit rounded-full border px-3 py-1 text-xs font-black ${chipCls(net)}`}
                        >
                          {money(net, currency)}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                          <p className="text-xs text-slate-400">Wallet</p>
                          <p className="mt-1 text-sm font-black text-white">
                            {money(user.balance, currency)}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                          <p className="text-xs text-slate-400">Gross</p>
                          <p className="mt-1 text-sm font-black text-emerald-300">
                            {money(gross, currency)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-3">
                        <button
                          type="button"
                          onClick={() => openSingleAdjust(user)}
                          disabled={adjusting}
                          className={`${btnPrimary} flex-1`}
                        >
                          <Zap size={16} />
                          Adjust
                        </button>

                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? "" : id)}
                          className="cursor-pointer rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-[#6fb5f4]"
                        >
                          {isExpanded ? <ChevronUp /> : <ChevronDown />}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
                          <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
                            <h3 className="mb-3 font-black text-[#6fb5f4]">
                              User Info
                            </h3>
                            <FieldRow
                              label="Phone"
                              value={`${user.countryCode || ""} ${user.phone || "—"}`}
                            />
                            <FieldRow label="Email" value={user.email || "—"} />
                            <FieldRow
                              label="Referral Code"
                              value={user.referralCode || "—"}
                            />
                          </div>

                          <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
                            <h3 className="mb-3 font-black text-[#6fb5f4]">
                              Adjustment Preview
                            </h3>
                            <FieldRow
                              label="Game Loss"
                              value={money(
                                user.gameLossCommissionBalance,
                                currency,
                              )}
                            />
                            <FieldRow
                              label="Deposit"
                              value={money(
                                user.depositCommissionBalance,
                                currency,
                              )}
                            />
                            <FieldRow
                              label="Refer"
                              value={money(
                                user.referCommissionBalance,
                                currency,
                              )}
                            />
                            <FieldRow
                              label="Game Win"
                              value={money(
                                user.gameWinCommissionBalance,
                                currency,
                              )}
                            />
                            <FieldRow
                              label="Net"
                              value={money(net, currency)}
                            />
                            <FieldRow
                              label="Expected Wallet"
                              value={money(n(user.balance) + net, currency)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 bg-black/25 px-5 py-5 md:flex-row">
                  <p className="text-sm text-slate-400">
                    Showing{" "}
                    <span className="font-black text-white">
                      {(page - 1) * limit + 1}
                    </span>{" "}
                    -{" "}
                    <span className="font-black text-white">
                      {Math.min(page * limit, pagination.total)}
                    </span>{" "}
                    of{" "}
                    <span className="font-black text-white">
                      {pagination.total}
                    </span>
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onPageChange(page - 1)}
                      disabled={page === 1 || refreshing}
                      className={btnGhost}
                    >
                      Previous
                    </button>

                    <span className="rounded-2xl border border-white/10 bg-black/35 px-5 py-3 text-sm font-black text-white">
                      {page} / {totalPages}
                    </span>

                    <button
                      type="button"
                      onClick={() => onPageChange(page + 1)}
                      disabled={page === totalPages || refreshing}
                      className={btnGhost}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>

      <ConfirmModal
        open={singleModal.open}
        title={`Adjust ${singleModal.user?.userId || "Affiliate User"}?`}
        desc={
          singleModal.user
            ? `Net amount ${money(
                computePreview(singleModal.user).net,
                singleModal.user.currency || "BDT",
              )} will be added to wallet and commission balances will reset to 0.`
            : ""
        }
        loading={adjusting}
        confirmText="Adjust Now"
        onClose={adjusting ? undefined : closeSingleAdjust}
        onConfirm={doAdjustSingle}
      />

      <ConfirmModal
        open={allModal}
        title="Adjust All Affiliates?"
        desc={
          q
            ? `This will adjust all affiliate users matching "${q}".`
            : "This will adjust all affiliate users. Net amounts will be added to wallet and commission balances will reset to 0."
        }
        loading={adjusting}
        confirmText="Confirm Adjust All"
        onClose={adjusting ? undefined : () => setAllModal(false)}
        onConfirm={doAdjustAll}
      />
    </div>
  );
};

export default BulkAdjustment;
