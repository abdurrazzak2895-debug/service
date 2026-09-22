import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FaGift, FaPlus, FaSave, FaSyncAlt, FaTrash, FaBan } from "react-icons/fa";
import { api } from "../../api/axios";
import EligibleProvidersPicker from "../../components/EligibleProvidersPicker/EligibleProvidersPicker";
import { sumEligibleProvidersPercent } from "../../components/EligibleProvidersPicker/eligibleProvidersUtils";

const sectionCard =
  "rounded-2xl border border-blue-300/20 bg-gradient-to-br from-black via-[#2f79c9]/20 to-black shadow-lg shadow-blue-900/20";

const inputBase =
  "w-full h-11 rounded-xl border border-blue-300/20 bg-black/40 px-4 text-white placeholder-blue-100/40 outline-none transition-all focus:border-[#63a8ee] focus:ring-2 focus:ring-[#63a8ee]/20";

const labelCls = "mb-2 block text-sm font-medium text-blue-100";

const btnBase =
  "cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60";

const btnPrimary = `${btnBase} bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] text-white hover:from-[#7bb7f1] hover:to-[#3b88db] shadow-lg shadow-blue-700/30`;

const btnGhost = `${btnBase} border border-blue-300/20 bg-black/30 text-blue-100 hover:bg-blue-900/20`;

const btnDanger = `${btnBase} border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20`;

const emptyForm = () => ({
  titleBn: "",
  titleEn: "",
  bonusAmount: 0,
  turnoverMultiplier: 1,
  endDate: "",
  eligibleProviders: [],
});

const toDatetimeLocalValue = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000).toISOString().slice(0, 16);
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const addDaysToNow = (days) => {
  const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return toDatetimeLocalValue(date);
};

const RegisterBonusCampaign = () => {
  const qc = useQueryClient();

  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const {
    data: campaignsRes,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["register-bonus-campaigns"],
    queryFn: async () => {
      const res = await api.get("/api/register-bonus-campaigns");
      return res.data;
    },
  });

  const campaigns = useMemo(
    () => campaignsRes?.data || [],
    [campaignsRes],
  );

  const activeCampaign = useMemo(
    () => campaigns.find((c) => c.status === "active") || null,
    [campaigns],
  );

  const setValue = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm());
  };

  const startEdit = (campaign) => {
    setEditingId(campaign._id);
    setForm({
      titleBn: campaign.title?.bn || "",
      titleEn: campaign.title?.en || "",
      bonusAmount: Number(campaign.bonusAmount || 0),
      turnoverMultiplier: Number(campaign.turnoverMultiplier ?? 1),
      endDate: toDatetimeLocalValue(campaign.endDate),
      eligibleProviders: Array.isArray(campaign.eligibleProviders)
        ? campaign.eligibleProviders
        : [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validate = () => {
    if (!form.titleBn.trim() || !form.titleEn.trim()) {
      return "Title (Bangla + English) দুটোই লাগবে";
    }

    if (!(Number(form.bonusAmount) > 0)) {
      return "Bonus amount 0 এর বেশি হতে হবে";
    }

    if (Number(form.turnoverMultiplier) < 0) {
      return "Turnover multiplier 0 এর কম হতে পারবে না";
    }

    if (!form.endDate) {
      return "End date দিতে হবে";
    }

    if (new Date(form.endDate) <= new Date() && !editingId) {
      return "End date ভবিষ্যতের হতে হবে";
    }

    if (sumEligibleProvidersPercent(form.eligibleProviders) > 100) {
      return "Eligible providers এর percent যোগফল ১০০%-এর বেশি হতে পারবে না";
    }

    return null;
  };

  const handleSubmit = async () => {
    const errorMessage = validate();

    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: { bn: form.titleBn.trim(), en: form.titleEn.trim() },
        bonusAmount: Number(form.bonusAmount),
        turnoverMultiplier: Number(form.turnoverMultiplier),
        endDate: new Date(form.endDate).toISOString(),
        eligibleProviders: form.eligibleProviders,
      };

      if (editingId) {
        await api.put(`/api/register-bonus-campaigns/${editingId}`, payload);
        toast.success("Campaign updated");
      } else {
        await api.post("/api/register-bonus-campaigns", payload);
        toast.success("Campaign created");
      }

      resetForm();
      await qc.invalidateQueries({ queryKey: ["register-bonus-campaigns"] });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = async (id) => {
    const ok = window.confirm("এই campaign টা এখনই বন্ধ করে দিতে চাও?");
    if (!ok) return;

    try {
      await api.post(`/api/register-bonus-campaigns/${id}/close`);
      toast.success("Campaign closed");
      await qc.invalidateQueries({ queryKey: ["register-bonus-campaigns"] });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Close failed");
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("এই campaign টা permanently delete করতে চাও?");
    if (!ok) return;

    try {
      await api.delete(`/api/register-bonus-campaigns/${id}`);
      toast.success("Campaign deleted");
      if (editingId === id) resetForm();
      await qc.invalidateQueries({ queryKey: ["register-bonus-campaigns"] });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className={`${sectionCard} p-5 lg:p-6`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] shadow-lg shadow-blue-500/40">
                <FaGift className="text-2xl text-white" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-white">
                  Register Bonus Campaign
                </h1>
                <p className="text-sm text-blue-100/80">
                  নতুন user register করলে bonus + turnover অটো যোগ হবে। একসাথে
                  শুধু ১টা campaign active থাকতে পারবে।
                </p>
              </div>
            </div>

            <button type="button" onClick={() => refetch()} className={btnGhost}>
              <span className="flex items-center gap-2">
                <FaSyncAlt />
                Refresh
              </span>
            </button>
          </div>

          {activeCampaign ? (
            <div className="mt-5 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
              <p className="text-sm font-bold text-emerald-200">
                বর্তমানে চলমান: {activeCampaign.title?.bn} /{" "}
                {activeCampaign.title?.en} — ৳{activeCampaign.bonusAmount},
                শেষ হবে {formatDate(activeCampaign.endDate)}
              </p>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-blue-300/20 bg-black/30 p-4">
              <p className="text-sm text-blue-100/70">
                এখন কোনো active campaign নেই — নিচে থেকে নতুন একটা তৈরি করো।
              </p>
            </div>
          )}
        </div>

        <div className={`${sectionCard} p-5 lg:p-6`}>
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white">
                {editingId ? "Update Campaign" : "Create Campaign"}
              </h2>
              <p className="mt-1 text-sm text-blue-100/70">
                Title, bonus amount, end date আর eligible provider সেট করো
              </p>
            </div>

            {editingId ? (
              <button type="button" onClick={resetForm} className={btnGhost}>
                Cancel Edit
              </button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className={labelCls}>Title (BN)</label>
              <input
                className={inputBase}
                value={form.titleBn}
                onChange={(e) => setValue("titleBn", e.target.value)}
                placeholder="যেমন: স্বাগতম বোনাস"
              />
            </div>

            <div>
              <label className={labelCls}>Title (EN)</label>
              <input
                className={inputBase}
                value={form.titleEn}
                onChange={(e) => setValue("titleEn", e.target.value)}
                placeholder="e.g. Welcome Bonus"
              />
            </div>

            <div>
              <label className={labelCls}>Bonus Amount (৳)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputBase}
                value={form.bonusAmount}
                onChange={(e) => setValue("bonusAmount", Number(e.target.value || 0))}
                placeholder="100"
              />
            </div>

            <div>
              <label className={labelCls}>Turnover Multiplier</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputBase}
                value={form.turnoverMultiplier}
                onChange={(e) =>
                  setValue("turnoverMultiplier", Number(e.target.value || 0))
                }
                placeholder="1"
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelCls}>End Date</label>
              <input
                type="datetime-local"
                className={inputBase}
                value={form.endDate}
                onChange={(e) => setValue("endDate", e.target.value)}
              />

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setValue("endDate", addDaysToNow(7))}
                  className={`${btnGhost} !px-3 !py-2 text-xs`}
                >
                  +7 দিন
                </button>
                <button
                  type="button"
                  onClick={() => setValue("endDate", addDaysToNow(12))}
                  className={`${btnGhost} !px-3 !py-2 text-xs`}
                >
                  +12 দিন
                </button>
                <button
                  type="button"
                  onClick={() => setValue("endDate", addDaysToNow(30))}
                  className={`${btnGhost} !px-3 !py-2 text-xs`}
                >
                  +30 দিন
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className={labelCls}>Eligible Providers</label>
              <EligibleProvidersPicker
                value={form.eligibleProviders}
                onChange={(next) => setValue("eligibleProviders", next)}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className={btnPrimary}
            >
              <span className="flex items-center gap-2">
                {editingId ? <FaSave /> : <FaPlus />}
                {saving ? "Saving..." : editingId ? "Update Campaign" : "Create Campaign"}
              </span>
            </button>
          </div>
        </div>

        <div className={`${sectionCard} p-5 lg:p-6`}>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-white">All Campaigns</h2>
            <p className="mt-1 text-sm text-blue-100/70">
              Total {campaigns.length} campaign(s)
            </p>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-blue-300/20 bg-black/20 p-10 text-center text-blue-100/70">
              Loading...
            </div>
          ) : campaigns.length ? (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div
                  key={campaign._id}
                  className="rounded-2xl border border-blue-300/20 bg-black/30 p-4"
                >
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-white">
                          {campaign.title?.bn} / {campaign.title?.en}
                        </p>

                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            campaign.status === "active"
                              ? "bg-emerald-500/20 text-emerald-200"
                              : "bg-red-500/15 text-red-200"
                          }`}
                        >
                          {campaign.status === "active"
                            ? "ACTIVE"
                            : `CLOSED${
                                campaign.closedReason
                                  ? ` (${campaign.closedReason})`
                                  : ""
                              }`}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-blue-100/70">
                        ৳{campaign.bonusAmount} · x{campaign.turnoverMultiplier}{" "}
                        turnover · Ends {formatDate(campaign.endDate)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(campaign)}
                        className={`${btnGhost} !px-3 !py-2 text-xs`}
                      >
                        Edit
                      </button>

                      {campaign.status === "active" ? (
                        <button
                          type="button"
                          onClick={() => handleClose(campaign._id)}
                          className={`${btnGhost} !px-3 !py-2 text-xs`}
                        >
                          <span className="flex items-center gap-1.5">
                            <FaBan />
                            Close
                          </span>
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => handleDelete(campaign._id)}
                        className={`${btnDanger} !px-3 !py-2 text-xs`}
                      >
                        <span className="flex items-center gap-1.5">
                          <FaTrash />
                          Delete
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-blue-100/60">No campaigns found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterBonusCampaign;
