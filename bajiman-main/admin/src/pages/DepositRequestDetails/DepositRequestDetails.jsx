import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaWallet,
  FaClock,
  FaSyncAlt,
  FaClipboardList,
} from "react-icons/fa";
import { api } from "../../api/axios";

const money = (value) => {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return "৳ 0.00";

  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const chipClass = (status) => {
  if (status === "approved") {
    return "border-emerald-400/30 bg-emerald-500/15 text-emerald-200";
  }

  if (status === "rejected") {
    return "border-red-400/30 bg-red-500/15 text-red-200";
  }

  return "border-yellow-400/30 bg-yellow-500/15 text-yellow-200";
};

const ConfirmModal = ({
  open,
  title,
  description,
  confirmText,
  confirmVariant = "approve",
  note,
  setNote,
  loading,
  onClose,
  onConfirm,
}) => {
  if (!open) return null;

  const btnClass =
    confirmVariant === "reject"
      ? "from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400"
      : "from-[#2f79c9] to-[#5aa1ee] hover:from-[#2569b0] hover:to-[#6eaef1]";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-[520px] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
        <div className="bg-[#0f172a] p-5">
          <div className="text-xl font-black text-white">{title}</div>
          <div className="mt-1 text-[13px] text-slate-300">{description}</div>

          <div className="mt-4">
            <label className="text-[12px] font-bold text-slate-300">
              Admin Note (optional)
            </label>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#2f79c9]/40"
              placeholder="Write note..."
            />
          </div>

          <div className="mt-5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-xl border border-white/10 px-4 py-2 text-slate-200 transition hover:bg-white/5"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`cursor-pointer rounded-xl bg-gradient-to-r px-4 py-2 font-black text-white shadow-lg ${btnClass}`}
            >
              {loading ? "Processing..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FieldRow = ({ k, v }) => (
  <div className="flex items-start justify-between gap-4 border-b border-white/10 py-2 last:border-b-0">
    <div className="text-[12px] font-black text-slate-300">{k}</div>
    <div className="break-all text-right text-[13px] font-bold text-white">
      {v}
    </div>
  </div>
);

const DepositRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState("approve");
  const [note, setNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const canAction = useMemo(() => doc?.status === "pending", [doc?.status]);

  const fetchOne = async () => {
    try {
      setLoading(true);

      const { data } = await api.get(`/api/deposit-requests/admin/${id}`);
      setDoc(data?.data || null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load request");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOne();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const openConfirm = (type) => {
    setConfirmType(type);
    setNote("");
    setConfirmOpen(true);
  };

  const doAction = async () => {
    if (!doc?._id) return;

    try {
      setActionLoading(true);

      if (confirmType === "approve") {
        await api.post(`/api/deposit-requests/admin/${doc._id}/approve`, {
          adminNote: note,
        });

        toast.success("Deposit approved successfully");
      } else {
        await api.post(`/api/deposit-requests/admin/${doc._id}/reject`, {
          adminNote: note,
        });

        toast.success("Deposit rejected successfully");
      }

      setConfirmOpen(false);
      await fetchOne();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="w-full text-white">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="cursor-pointer rounded-xl border border-white/10 px-4 py-2 text-slate-100 transition hover:bg-white/5"
        >
          <span className="inline-flex items-center gap-2">
            <FaArrowLeft />
            Back
          </span>
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={fetchOne}
            className="cursor-pointer rounded-xl border border-white/10 px-4 py-2 text-slate-100 transition hover:bg-white/5"
          >
            <span className="inline-flex items-center gap-2">
              <FaSyncAlt />
              Refresh
            </span>
          </button>

          <button
            type="button"
            onClick={() => openConfirm("approve")}
            disabled={!canAction}
            className={`rounded-xl px-4 py-2 font-black text-white shadow-lg ${
              canAction
                ? "cursor-pointer bg-gradient-to-r from-[#2f79c9] to-[#5aa1ee] hover:from-[#2569b0] hover:to-[#6eaef1]"
                : "cursor-not-allowed bg-slate-600/50 text-white/50"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <FaCheckCircle />
              Approve
            </span>
          </button>

          <button
            type="button"
            onClick={() => openConfirm("reject")}
            disabled={!canAction}
            className={`rounded-xl px-4 py-2 font-black text-white shadow-lg ${
              canAction
                ? "cursor-pointer bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400"
                : "cursor-not-allowed bg-slate-600/50 text-white/50"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <FaTimesCircle />
              Reject
            </span>
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0f172a] shadow-2xl">
        <div className="p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2f79c9] to-[#5aa1ee] text-white shadow-lg">
                <FaClipboardList className="text-2xl" />
              </div>

              <div>
                <div className="text-2xl font-black tracking-tight text-white">
                  Deposit Request Details
                </div>
                <div className="mt-1 text-[13px] text-slate-300">
                  Request ID:{" "}
                  <span className="font-black text-white">{id}</span>
                </div>
              </div>
            </div>

            <span
              className={`inline-flex items-center rounded-full border px-4 py-2 text-[12px] font-black ${chipClass(
                doc?.status || "pending",
              )}`}
            >
              {String(doc?.status || "pending").toUpperCase()}
            </span>
          </div>

          <div className="mt-5 h-px bg-white/10" />

          {loading ? (
            <div className="py-12 text-center text-slate-300">Loading...</div>
          ) : !doc ? (
            <div className="py-12 text-center text-slate-300">Not found.</div>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2f79c9] to-[#5aa1ee] text-white shadow-lg">
                    <FaUser />
                  </div>

                  <div>
                    <div className="text-[16px] font-black text-white">
                      {doc?.user?.userId || "—"}
                    </div>

                    <div className="text-[12px] text-slate-300">
                      {doc?.user?.phone || ""}
                    </div>

                    {doc?.user?.email ? (
                      <div className="text-[12px] text-slate-400">
                        {doc.user.email}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                  <div className="flex items-center gap-2 text-[12px] font-black text-slate-300">
                    <FaClock />
                    Timeline
                  </div>

                  <div className="mt-2 text-[12px] text-slate-300">
                    Created:{" "}
                    <span className="font-bold text-white">
                      {doc?.createdAt
                        ? new Date(doc.createdAt).toLocaleString()
                        : "—"}
                    </span>
                  </div>

                  {doc?.approvedAt ? (
                    <div className="mt-1 text-[12px] text-slate-300">
                      Approved:{" "}
                      <span className="font-bold text-white">
                        {new Date(doc.approvedAt).toLocaleString()}
                      </span>
                    </div>
                  ) : null}

                  {doc?.rejectedAt ? (
                    <div className="mt-1 text-[12px] text-slate-300">
                      Rejected:{" "}
                      <span className="font-bold text-white">
                        {new Date(doc.rejectedAt).toLocaleString()}
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                  <div className="text-[12px] font-black text-slate-300">
                    User Account
                  </div>

                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                      <div className="text-[11px] text-slate-400">Role</div>
                      <div className="text-[13px] font-bold text-white">
                        {doc?.user?.role || "—"}
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                      <div className="text-[11px] text-slate-400">Balance</div>
                      <div className="text-[13px] font-bold text-white">
                        {money(doc?.user?.balance || 0)}
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                      <div className="text-[11px] text-slate-400">Active</div>
                      <div className="text-[13px] font-bold text-white">
                        {doc?.user?.isActive ? "Yes" : "No"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-[13px] font-black text-slate-300">
                    Submitted Fields
                  </div>

                  <div className="mt-2 rounded-xl border border-white/10 bg-black/20 px-4 py-2">
                    {doc?.fields && Object.keys(doc.fields).length ? (
                      Object.keys(doc.fields).map((key) => (
                        <FieldRow
                          key={key}
                          k={key}
                          v={String(doc.fields[key] ?? "")}
                        />
                      ))
                    ) : (
                      <div className="py-3 text-[12px] text-slate-300">
                        No fields submitted.
                      </div>
                    )}
                  </div>

                  {doc?.adminNote ? (
                    <div className="mt-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                      <div className="text-[12px] font-black text-slate-300">
                        Admin Note
                      </div>
                      <div className="mt-1 text-[13px] text-white/90">
                        {doc.adminNote}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2f79c9] to-[#5aa1ee] text-white shadow-lg">
                    <FaWallet />
                  </div>

                  <div>
                    <div className="text-[16px] font-black text-white">
                      Payment Summary
                    </div>

                    <div className="text-[12px] text-slate-300">
                      Method:{" "}
                      <span className="font-bold text-white">
                        {doc?.display?.methodName?.bn ||
                          doc?.display?.methodName?.en ||
                          String(doc.methodId || "").toUpperCase()}
                      </span>
                    </div>

                    <div className="text-[12px] text-slate-300">
                      Channel:{" "}
                      <span className="font-bold text-white">
                        {doc?.display?.channelName?.bn ||
                          doc?.display?.channelName?.en ||
                          doc.channelId ||
                          "—"}
                      </span>
                    </div>

                    <div className="text-[12px] text-slate-300">
                      Number:{" "}
                      <span className="font-bold text-white">
                        {doc?.display?.channelNumber ||
                          doc?.display?.contactNumber ||
                          "—"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                  <FieldRow k="Deposit Amount" v={money(doc.amount)} />
                  <FieldRow
                    k="Channel Bonus"
                    v={`${doc?.calc?.channelPercent || 0}% / ${money(
                      doc?.calc?.percentBonus || 0,
                    )}`}
                  />
                  <FieldRow
                    k="Promo Bonus"
                    v={money(doc?.calc?.promoBonus || 0)}
                  />
                  <FieldRow
                    k="Total Bonus"
                    v={money(doc?.calc?.totalBonus || 0)}
                  />
                  <FieldRow
                    k="Credited Amount"
                    v={money(doc?.calc?.creditedAmount || 0)}
                  />
                  <FieldRow
                    k="Turnover Multiplier"
                    v={`x${doc?.calc?.turnoverMultiplier ?? 1}`}
                  />
                  <FieldRow
                    k="Target Turnover"
                    v={money(doc?.calc?.targetTurnover || 0)}
                  />
                </div>

                {doc?.calc?.affiliateDepositCommission?.commissionAmount > 0 ? (
                  <div className="mt-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                    <div className="text-[12px] font-black text-slate-300">
                      Affiliate Deposit Commission
                    </div>

                    <div className="mt-2 space-y-2">
                      <FieldRow
                        k="Affiliator User ID"
                        v={
                          doc?.calc?.affiliateDepositCommission
                            ?.affiliatorUserId || "—"
                        }
                      />
                      <FieldRow
                        k="Percent"
                        v={`${
                          doc?.calc?.affiliateDepositCommission?.percent || 0
                        }%`}
                      />
                      <FieldRow
                        k="Base Amount"
                        v={money(
                          doc?.calc?.affiliateDepositCommission?.baseAmount ||
                            0,
                        )}
                      />
                      <FieldRow
                        k="Commission Amount"
                        v={money(
                          doc?.calc?.affiliateDepositCommission
                            ?.commissionAmount || 0,
                        )}
                      />
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 text-[12px] text-slate-300">
                  {doc.status === "pending"
                    ? "Pending request. You can approve or reject this request."
                    : "This request is already processed."}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title={
          confirmType === "approve" ? "Approve Deposit?" : "Reject Deposit?"
        }
        description={
          confirmType === "approve"
            ? "This will add credited amount to user balance and create turnover."
            : "This will reject the request. No balance will be added."
        }
        confirmText={confirmType === "approve" ? "Yes, Approve" : "Yes, Reject"}
        confirmVariant={confirmType}
        note={note}
        setNote={setNote}
        loading={actionLoading}
        onClose={() => {
          if (actionLoading) return;
          setConfirmOpen(false);
        }}
        onConfirm={doAction}
      />
    </div>
  );
};

export default DepositRequestDetails;
