import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaSyncAlt,
  FaMoneyBillWave,
  FaSave,
  FaImage,
  FaUser,
} from "react-icons/fa";
import { api } from "../../api/axios";

const sectionCard =
  "rounded-2xl border border-blue-300/20 bg-gradient-to-br from-black via-[#2f79c9]/20 to-black shadow-lg shadow-blue-900/20";

const inputBase =
  "w-full h-11 rounded-xl border border-blue-300/20 bg-black/40 px-4 text-white placeholder-blue-100/40 outline-none transition-all focus:border-[#63a8ee] focus:ring-2 focus:ring-[#63a8ee]/20";

const textAreaBase =
  "w-full min-h-[100px] rounded-xl border border-blue-300/20 bg-black/40 px-4 py-3 text-white placeholder-blue-100/40 outline-none transition-all focus:border-[#63a8ee] focus:ring-2 focus:ring-[#63a8ee]/20";

const labelCls = "mb-2 block text-sm font-medium text-blue-100";

const btnBase =
  "cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60";

const btnPrimary = `${btnBase} bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] text-white hover:from-[#7bb7f1] hover:to-[#3b88db] shadow-lg shadow-blue-700/30`;

const btnGhost = `${btnBase} border border-blue-300/20 bg-black/30 text-blue-100 hover:bg-blue-900/20`;

const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${import.meta.env.VITE_API_URL}${url}`;
};

const money = (value) => {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return "0";
  return num.toLocaleString("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const n = (value) => {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num : 0;
};

const getChannelPercent = (channel = {}) => {
  const direct = n(channel?.bonusPercent);
  if (direct > 0) return direct;

  const tagText = String(channel?.tagText || "");
  if (!tagText.includes("%")) return 0;

  const parsed = parseFloat(tagText.replace("+", "").replace("%", ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const ManualDeposit = () => {
  const [q, setQ] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const [methodId, setMethodId] = useState("");
  const [channelId, setChannelId] = useState("");
  const [promoId, setPromoId] = useState("none");
  const [amount, setAmount] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    data: usersRes = {},
    isFetching: usersLoading,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["manual-deposit-users", q],
    queryFn: async () => {
      const res = await api.get("/api/admin/manual-deposits/users", {
        params: { q },
      });
      return res.data;
    },
    enabled: q.trim().length > 0,
  });

  const {
    data: optionsRes = {},
    isLoading: optionsLoading,
    refetch: refetchOptions,
  } = useQuery({
    queryKey: ["manual-deposit-options"],
    queryFn: async () => {
      const res = await api.get("/api/admin/manual-deposits/options");
      return res.data;
    },
  });

  const users = useMemo(() => usersRes?.data || [], [usersRes]);
  const methods = useMemo(() => optionsRes?.data || [], [optionsRes]);

  const selectedMethod = useMemo(
    () => methods.find((m) => m.methodId === methodId) || null,
    [methods, methodId],
  );

  const activeChannels = useMemo(() => {
    if (!selectedMethod?.channels?.length) return [];
    return selectedMethod.channels.filter((c) => c?.isActive !== false);
  }, [selectedMethod]);

  const activePromotions = useMemo(() => {
    if (!selectedMethod?.promotions?.length) return [];
    return selectedMethod.promotions
      .filter((p) => p?.isActive !== false)
      .sort((a, b) => n(a?.sort) - n(b?.sort));
  }, [selectedMethod]);

  const selectedChannel = useMemo(
    () => activeChannels.find((c) => c.id === channelId) || null,
    [activeChannels, channelId],
  );

  const selectedPromo = useMemo(
    () => activePromotions.find((p) => p.id === promoId) || null,
    [activePromotions, promoId],
  );

  const calculation = useMemo(() => {
    const amountNum = n(amount);
    const channelPercent = getChannelPercent(selectedChannel);
    const percentBonus = (amountNum * channelPercent) / 100;

    let promoBonus = 0;

    if (selectedPromo) {
      if (selectedPromo.bonusType === "percent") {
        promoBonus = (amountNum * n(selectedPromo.bonusValue)) / 100;
      } else {
        promoBonus = n(selectedPromo.bonusValue);
      }
    }

    const totalBonus = percentBonus + promoBonus;

    const turnoverMultiplier = selectedPromo
      ? n(selectedPromo.turnoverMultiplier ?? 1)
      : n(selectedMethod?.turnoverMultiplier ?? 1);

    const creditedAmount = amountNum + totalBonus;
    const targetTurnover = creditedAmount * turnoverMultiplier;

    return {
      amountNum,
      channelPercent,
      percentBonus,
      promoBonus,
      totalBonus,
      turnoverMultiplier,
      creditedAmount,
      targetTurnover,
    };
  }, [amount, selectedChannel, selectedPromo, selectedMethod]);

  const resetForm = () => {
    setSelectedUser(null);
    setQ("");
    setMethodId("");
    setChannelId("");
    setPromoId("none");
    setAmount("");
    setAdminNote("");
  };

  const handleSubmit = async () => {
    if (!selectedUser?._id) {
      toast.error("আগে user select করো");
      return;
    }

    if (!methodId) {
      toast.error("Deposit method select করো");
      return;
    }

    if (!channelId) {
      toast.error("Deposit channel select করো");
      return;
    }

    if (calculation.amountNum <= 0) {
      toast.error("Valid amount দাও");
      return;
    }

    try {
      setSubmitting(true);

      const res = await api.post("/api/admin/manual-deposits/credit", {
        userId: selectedUser._id,
        methodId,
        channelId,
        promoId,
        amount: calculation.amountNum,
        adminNote,
      });

      toast.success(res?.data?.message || "Manual deposit credited");

      resetForm();
      await refetchOptions();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Manual deposit failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className={`${sectionCard} p-5 lg:p-6`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] shadow-lg shadow-blue-500/40">
                <FaMoneyBillWave className="text-3xl text-white" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-white">
                  Manual Deposit
                </h1>
                <p className="text-sm text-blue-100/80">
                  Admin panel থেকে user account এ deposit credit করো
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={refetchOptions}
                className={btnGhost}
              >
                <span className="flex items-center gap-2">
                  <FaSyncAlt />
                  Refresh
                </span>
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className={btnPrimary}
              >
                <span className="flex items-center gap-2">
                  <FaSave />
                  {submitting ? "Processing..." : "Credit Deposit"}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className={`${sectionCard} p-5 lg:p-6`}>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Search User</h2>
            <p className="mt-1 text-sm text-blue-100/70">
              User ID, phone অথবা email দিয়ে user search করো
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <label className={labelCls}>Search</label>
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-200" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") refetchUsers();
                  }}
                  className={`${inputBase} pl-12`}
                  placeholder="userId / phone / email"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={refetchUsers}
                disabled={!q.trim()}
                className={btnPrimary}
              >
                Search User
              </button>
            </div>
          </div>

          <div className="mt-5">
            {usersLoading ? (
              <div className="rounded-2xl border border-blue-300/20 bg-black/20 p-6 text-center text-blue-100/70">
                Searching users...
              </div>
            ) : q.trim() && users.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-blue-300/20 bg-black/20 p-6 text-center text-blue-100/70">
                কোনো user পাওয়া যায়নি
              </div>
            ) : users.length ? (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {users.map((user) => (
                  <button
                    type="button"
                    key={user._id}
                    onClick={() => setSelectedUser(user)}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      selectedUser?._id === user._id
                        ? "border-[#63a8ee] bg-[#1A79D3]/25"
                        : "border-blue-300/20 bg-black/30 hover:bg-blue-900/20"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9]">
                        <FaUser />
                      </div>

                      <div>
                        <p className="font-bold text-white">{user.userId}</p>
                        <p className="text-sm text-blue-100/75">
                          {user.phone || user.email || "No contact"}
                        </p>
                        <p className="text-sm text-blue-100/75">
                          Balance: ৳ {money(user.balance)}
                        </p>
                      </div>

                      <span
                        className={`ml-auto rounded-full px-3 py-1 text-xs font-bold ${
                          user.isActive
                            ? "border border-green-500/30 bg-green-500/20 text-green-300"
                            : "border border-red-500/30 bg-red-500/20 text-red-300"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {selectedUser && (
            <div className="mt-5 rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
              <p className="text-sm text-green-100">
                Selected User:{" "}
                <span className="font-bold text-white">
                  {selectedUser.userId}
                </span>{" "}
                | Balance:{" "}
                <span className="font-bold text-white">
                  ৳ {money(selectedUser.balance)}
                </span>
              </p>
            </div>
          )}
        </div>

        <div className={`${sectionCard} p-5 lg:p-6`}>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">
              Deposit Information
            </h2>
            <p className="mt-1 text-sm text-blue-100/70">
              Method, channel, promotion এবং amount select করো
            </p>
          </div>

          {optionsLoading ? (
            <div className="rounded-2xl border border-blue-300/20 bg-black/20 p-8 text-center text-blue-100/70">
              Loading deposit options...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div>
                <label className={labelCls}>Deposit Method</label>
                <select
                  value={methodId}
                  onChange={(e) => {
                    setMethodId(e.target.value);
                    setChannelId("");
                    setPromoId("none");
                  }}
                  className={inputBase}
                >
                  <option value="">Select Method</option>
                  {methods.map((method) => (
                    <option key={method._id} value={method.methodId}>
                      {method.methodName?.bn ||
                        method.methodName?.en ||
                        method.methodId}{" "}
                      — {method.methodId}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Channel</label>
                <select
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  className={inputBase}
                  disabled={!methodId}
                >
                  <option value="">Select Channel</option>
                  {activeChannels.map((channel) => (
                    <option key={channel.id} value={channel.id}>
                      {channel.name?.bn || channel.name?.en || channel.id}{" "}
                      {channel.tagText ? `(${channel.tagText})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Promotion</label>
                <select
                  value={promoId}
                  onChange={(e) => setPromoId(e.target.value)}
                  className={inputBase}
                  disabled={!methodId}
                >
                  <option value="none">No Promotion</option>
                  {activePromotions.map((promo) => (
                    <option key={promo.id} value={promo.id}>
                      {promo.name?.bn || promo.name?.en || promo.id} —{" "}
                      {promo.bonusType === "percent"
                        ? `${promo.bonusValue}%`
                        : `৳ ${promo.bonusValue}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Amount</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={inputBase}
                  placeholder="e.g. 1000"
                />
              </div>

              <div className="lg:col-span-2">
                <label className={labelCls}>Admin Note</label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className={textAreaBase}
                  placeholder="Optional note..."
                />
              </div>
            </div>
          )}
        </div>

        <div className={`${sectionCard} p-5 lg:p-6`}>
          <h2 className="mb-5 text-xl font-bold text-white">
            Calculation Preview
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-blue-300/20 bg-black/30 p-4">
              <p className="text-sm text-blue-100/70">Deposit Amount</p>
              <p className="mt-2 text-2xl font-bold text-white">
                ৳ {money(calculation.amountNum)}
              </p>
            </div>

            <div className="rounded-2xl border border-blue-300/20 bg-black/30 p-4">
              <p className="text-sm text-blue-100/70">
                Channel Bonus ({calculation.channelPercent}%)
              </p>
              <p className="mt-2 text-2xl font-bold text-white">
                ৳ {money(calculation.percentBonus)}
              </p>
            </div>

            <div className="rounded-2xl border border-blue-300/20 bg-black/30 p-4">
              <p className="text-sm text-blue-100/70">Promotion Bonus</p>
              <p className="mt-2 text-2xl font-bold text-white">
                ৳ {money(calculation.promoBonus)}
              </p>
            </div>

            <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
              <p className="text-sm text-green-100/80">Credited Amount</p>
              <p className="mt-2 text-2xl font-bold text-white">
                ৳ {money(calculation.creditedAmount)}
              </p>
            </div>

            <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 md:col-span-2 xl:col-span-4">
              <p className="text-sm text-yellow-100/80">
                Turnover Multiplier:{" "}
                <span className="font-bold text-white">
                  {calculation.turnoverMultiplier}x
                </span>
              </p>
              <p className="mt-2 text-2xl font-bold text-white">
                Required Turnover: ৳ {money(calculation.targetTurnover)}
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className={btnPrimary}
            >
              <span className="flex items-center gap-2">
                <FaSave />
                {submitting ? "Processing..." : "Credit Deposit"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualDeposit;
