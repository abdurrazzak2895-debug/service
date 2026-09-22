import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  FaGift,
  FaPlus,
  FaSave,
  FaSyncAlt,
  FaTrash,
  FaImage,
} from "react-icons/fa";
import { api } from "../../api/axios";
import EligibleProvidersPicker from "../../components/EligibleProvidersPicker/EligibleProvidersPicker";
import { sumEligibleProvidersPercent } from "../../components/EligibleProvidersPicker/eligibleProvidersUtils";

const emptyBi = { bn: "", en: "" };

const defaultChannel = () => ({
  id: "",
  name: { ...emptyBi },
  tagText: "+0%",
  bonusTitle: { ...emptyBi },
  bonusPercent: 0,
  isActive: true,
});

const defaultPromotion = () => ({
  id: "",
  name: { ...emptyBi },
  bonusType: "fixed",
  bonusValue: 0,
  turnoverMultiplier: 1,
  bonusScope: "all-time",
  isActive: true,
  sort: 0,
  eligibleProviders: [],
});

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

const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${import.meta.env.VITE_API_URL}${url}`;
};

const BiInput = ({
  title,
  value,
  onChangeBn,
  onChangeEn,
  bnPlaceholder,
  enPlaceholder,
}) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <div>
      <label className={labelCls}>{title} (BN)</label>
      <input
        className={inputBase}
        value={value?.bn || ""}
        onChange={(e) => onChangeBn(e.target.value)}
        placeholder={bnPlaceholder}
      />
    </div>

    <div>
      <label className={labelCls}>{title} (EN)</label>
      <input
        className={inputBase}
        value={value?.en || ""}
        onChange={(e) => onChangeEn(e.target.value)}
        placeholder={enPlaceholder}
      />
    </div>
  </div>
);

const makeSafeId = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");

const AddDepositBonusTurnover = () => {
  const qc = useQueryClient();

  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [turnoverMultiplier, setTurnoverMultiplier] = useState(1);
  const [eligibleProviders, setEligibleProviders] = useState([]);
  const [channels, setChannels] = useState([defaultChannel()]);
  const [promotions, setPromotions] = useState([defaultPromotion()]);
  const [saving, setSaving] = useState(false);

  const {
    data: methodsRes = {},
    isLoading: methodsLoading,
    refetch: refetchMethods,
  } = useQuery({
    queryKey: ["deposit-methods"],
    queryFn: async () => {
      const res = await api.get("/api/deposit-methods");
      return res.data;
    },
  });

  const methods = useMemo(() => methodsRes?.data || [], [methodsRes]);

  const selectedMethod = useMemo(
    () => methods.find((m) => m._id === selectedMethodId) || null,
    [methods, selectedMethodId],
  );

  const {
    data: bonusRes,
    refetch: refetchBonus,
    isFetching,
  } = useQuery({
    queryKey: ["deposit-bonus-turnover", selectedMethodId],
    queryFn: async () => {
      const res = await api.get(
        `/api/deposit-bonus-turnover/method/${selectedMethodId}`,
      );
      return res.data;
    },
    enabled: !!selectedMethodId,
  });

  useEffect(() => {
    const data = bonusRes?.data;

    if (!selectedMethodId) {
      setTurnoverMultiplier(1);
      setEligibleProviders([]);
      setChannels([defaultChannel()]);
      setPromotions([defaultPromotion()]);
      return;
    }

    if (!data) {
      setTurnoverMultiplier(1);
      setEligibleProviders([]);
      setChannels([defaultChannel()]);
      setPromotions([defaultPromotion()]);
      return;
    }

    setTurnoverMultiplier(Number(data.turnoverMultiplier ?? 1));
    setEligibleProviders(
      Array.isArray(data.eligibleProviders) ? data.eligibleProviders : [],
    );
    setChannels(data.channels?.length ? data.channels : [defaultChannel()]);
    setPromotions(
      data.promotions?.length
        ? data.promotions.map((item) => ({
            ...item,
            eligibleProviders: Array.isArray(item.eligibleProviders)
              ? item.eligibleProviders
              : [],
          }))
        : [defaultPromotion()],
    );
  }, [bonusRes, selectedMethodId]);

  const patchChannel = (idx, key, value) => {
    setChannels((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [key]: value } : item)),
    );
  };

  const patchChannelBi = (idx, key, lang, value) => {
    setChannels((prev) =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              [key]: {
                ...(item[key] || emptyBi),
                [lang]: value,
              },
            }
          : item,
      ),
    );
  };

  const patchPromotion = (idx, key, value) => {
    setPromotions((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [key]: value } : item)),
    );
  };

  const patchPromotionBi = (idx, key, lang, value) => {
    setPromotions((prev) =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              [key]: {
                ...(item[key] || emptyBi),
                [lang]: value,
              },
            }
          : item,
      ),
    );
  };

  const validateBeforeSave = () => {
    if (!selectedMethodId) return "আগে deposit method select করো";

    if (Number(turnoverMultiplier) < 0) {
      return "Default turnover multiplier 0 এর কম হতে পারবে না";
    }

    if (sumEligibleProvidersPercent(eligibleProviders) > 100) {
      return "Default eligible providers এর percent যোগফল ১০০%-এর বেশি হতে পারবে না";
    }

    if (!channels.length) return "কমপক্ষে ১টা channel লাগবে";

    const channelIds = new Set();

    for (const channel of channels) {
      const id = String(channel.id || "").trim();

      if (!id) return "সব channel এর ID লাগবে";

      if (channelIds.has(id)) return `Duplicate channel ID পাওয়া গেছে: ${id}`;

      channelIds.add(id);

      if (!channel.name?.bn?.trim() || !channel.name?.en?.trim()) {
        return `Channel "${id}" এর name BN / EN দুটোই লাগবে`;
      }

      if (Number(channel.bonusPercent || 0) < 0) {
        return `Channel "${id}" এর bonus percent 0 এর কম হতে পারবে না`;
      }
    }

    const promoIds = new Set();

    for (const promo of promotions) {
      const id = String(promo.id || "").trim();

      if (!id) continue;

      if (promoIds.has(id)) return `Duplicate promotion ID পাওয়া গেছে: ${id}`;

      promoIds.add(id);

      if (!promo.name?.bn?.trim() || !promo.name?.en?.trim()) {
        return `Promotion "${id}" এর name BN / EN দুটোই লাগবে`;
      }

      if (!["fixed", "percent"].includes(promo.bonusType)) {
        return `Promotion "${id}" এর bonus type invalid`;
      }

      if (Number(promo.bonusValue || 0) < 0) {
        return `Promotion "${id}" এর bonus value 0 এর কম হতে পারবে না`;
      }

      if (Number(promo.turnoverMultiplier || 0) < 0) {
        return `Promotion "${id}" এর turnover multiplier 0 এর কম হতে পারবে না`;
      }

      if (sumEligibleProvidersPercent(promo.eligibleProviders) > 100) {
        return `Promotion "${id}" এর eligible providers percent যোগফল ১০০%-এর বেশি হতে পারবে না`;
      }
    }

    return null;
  };

  const handleSave = async () => {
    const errorMessage = validateBeforeSave();

    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        depositMethod: selectedMethodId,
        turnoverMultiplier: Number(turnoverMultiplier ?? 1),
        eligibleProviders,

        channels: channels.map((item, index) => ({
          id: String(item.id || `channel-${index + 1}`).trim(),
          name: item.name || { bn: "", en: "" },
          tagText: String(item.tagText || "+0%").trim(),
          bonusTitle: item.bonusTitle || { bn: "", en: "" },
          bonusPercent: Number(item.bonusPercent || 0),
          isActive: item.isActive !== false,
        })),

        promotions: promotions
          .filter((item) => String(item.id || "").trim())
          .map((item, index) => ({
            id: String(item.id || `promotion-${index + 1}`)
              .trim()
              .toLowerCase(),
            name: item.name || { bn: "", en: "" },
            bonusType: item.bonusType === "percent" ? "percent" : "fixed",
            bonusValue: Number(item.bonusValue || 0),
            turnoverMultiplier: Number(item.turnoverMultiplier ?? 1),
            bonusScope:
              item.bonusScope === "first-deposit"
                ? "first-deposit"
                : "all-time",
            isActive: item.isActive !== false,
            sort: Number(item.sort ?? index),
            eligibleProviders: item.eligibleProviders || [],
          })),
      };

      const res = await api.post("/api/deposit-bonus-turnover", payload);

      toast.success(res?.data?.message || "Bonus & turnover config saved");

      await qc.invalidateQueries({
        queryKey: ["deposit-bonus-turnover", selectedMethodId],
      });

      await refetchBonus();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    await refetchMethods();

    if (selectedMethodId) {
      await refetchBonus();
    }
  };

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className={`${sectionCard} p-5 lg:p-6`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] shadow-lg shadow-blue-500/40">
                <FaGift className="text-3xl text-white" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-white">
                  Deposit Bonus & Turnover
                </h1>
                <p className="text-sm text-blue-100/80">
                  Method অনুযায়ী channel bonus, promotion এবং turnover manage
                  করো
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleRefresh}
                className={btnGhost}
              >
                <span className="flex items-center gap-2">
                  <FaSyncAlt />
                  Refresh
                </span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !selectedMethodId}
                className={btnPrimary}
              >
                <span className="flex items-center gap-2">
                  <FaSave />
                  {saving ? "Saving..." : "Save Config"}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className={`${sectionCard} p-5 lg:p-6`}>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">
              Select Deposit Method
            </h2>
            <p className="mt-1 text-sm text-blue-100/70">
              আগে method select করো, তারপর bonus/turnover configure করো
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <label className={labelCls}>Deposit Method</label>
              <select
                value={selectedMethodId}
                onChange={(e) => setSelectedMethodId(e.target.value)}
                className={inputBase}
              >
                <option value="">Select Deposit Method</option>
                {methods.map((method) => (
                  <option key={method._id} value={method._id}>
                    {method.methodName?.bn ||
                      method.methodName?.en ||
                      method.methodId}{" "}
                    — {method.methodId}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-blue-300/20 bg-black/30 p-4">
              <p className="text-sm font-semibold text-blue-100">
                Selected Method
              </p>

              {selectedMethod ? (
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-blue-300/20 bg-black/50">
                    {selectedMethod.logoUrl ? (
                      <img
                        src={getImageUrl(selectedMethod.logoUrl)}
                        alt={selectedMethod.methodId}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <FaImage className="text-2xl text-blue-200/60" />
                    )}
                  </div>

                  <div>
                    <p className="font-bold text-white">
                      {selectedMethod.methodName?.bn ||
                        selectedMethod.methodName?.en ||
                        selectedMethod.methodId}
                    </p>
                    <p className="text-xs text-blue-100/70">
                      {selectedMethod.methodType} / {selectedMethod.methodId}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-blue-100/60">
                  কোনো method select করা হয়নি
                </p>
              )}
            </div>
          </div>
        </div>

        <div className={`${sectionCard} p-5 lg:p-6`}>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">
              Default Turnover Setting
            </h2>
            <p className="mt-1 text-sm text-blue-100/70">
              কোনো promotion select না করলে এই turnover multiplier apply হবে
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className={labelCls}>Turnover Multiplier</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputBase}
                value={turnoverMultiplier}
                onChange={(e) =>
                  setTurnoverMultiplier(Number(e.target.value || 0))
                }
                placeholder="e.g. 1"
              />
            </div>

            <div className="rounded-2xl border border-blue-300/20 bg-black/30 p-4">
              <p className="text-sm text-blue-100/80">
                Example: Deposit + Bonus ={" "}
                <span className="font-bold text-white">৳1000</span>
              </p>
              <p className="mt-1 text-sm text-blue-100/80">
                Required Turnover ={" "}
                <span className="font-bold text-white">
                  ৳{Number(1000 * Number(turnoverMultiplier || 0)).toFixed(2)}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-5">
            <label className={labelCls}>
              Default Eligible Providers (কোনো promotion select না করলে এটা
              apply হবে)
            </label>
            <EligibleProvidersPicker
              value={eligibleProviders}
              onChange={setEligibleProviders}
            />
          </div>
        </div>

        <div className={`${sectionCard} p-5 lg:p-6`}>
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Deposit Channels</h2>
              <p className="mt-1 text-sm text-blue-100/70">
                Channel bonus যেমন +1%, +2% এগুলো manage করো
              </p>
            </div>

            <button
              type="button"
              onClick={() => setChannels((prev) => [...prev, defaultChannel()])}
              className={btnGhost}
            >
              <span className="flex items-center gap-2">
                <FaPlus />
                Add Channel
              </span>
            </button>
          </div>

          {!selectedMethodId ? (
            <div className="rounded-2xl border border-dashed border-blue-300/20 bg-black/20 p-10 text-center text-blue-100/70">
              আগে deposit method select করো
            </div>
          ) : isFetching || methodsLoading ? (
            <div className="rounded-2xl border border-blue-300/20 bg-black/20 p-10 text-center text-blue-100/70">
              Loading config...
            </div>
          ) : (
            <div className="space-y-5">
              {channels.map((channel, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-blue-300/20 bg-gradient-to-br from-black/80 to-[#2f79c9]/10 p-4"
                >
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <h3 className="text-lg font-bold text-blue-100">
                      Channel #{idx + 1}
                    </h3>

                    <button
                      type="button"
                      onClick={() =>
                        setChannels((prev) => prev.filter((_, i) => i !== idx))
                      }
                      disabled={channels.length === 1}
                      className={btnDanger}
                    >
                      <span className="flex items-center gap-2">
                        <FaTrash />
                        Remove
                      </span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                    <div>
                      <label className={labelCls}>Channel ID</label>
                      <input
                        className={inputBase}
                        value={channel.id || ""}
                        onChange={(e) =>
                          patchChannel(idx, "id", makeSafeId(e.target.value))
                        }
                        placeholder="cashout / send-money"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Tag Text</label>
                      <input
                        className={inputBase}
                        value={channel.tagText || ""}
                        onChange={(e) =>
                          patchChannel(idx, "tagText", e.target.value)
                        }
                        placeholder="+1%"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Bonus Percent</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={inputBase}
                        value={Number(channel.bonusPercent || 0)}
                        onChange={(e) =>
                          patchChannel(
                            idx,
                            "bonusPercent",
                            Number(e.target.value || 0),
                          )
                        }
                        placeholder="1"
                      />
                    </div>

                    <div className="lg:col-span-3">
                      <BiInput
                        title="Channel Name"
                        value={channel.name}
                        bnPlaceholder="যেমন: সেন্ড মানি"
                        enPlaceholder="e.g. Send Money"
                        onChangeBn={(value) =>
                          patchChannelBi(idx, "name", "bn", value)
                        }
                        onChangeEn={(value) =>
                          patchChannelBi(idx, "name", "en", value)
                        }
                      />
                    </div>

                    <div className="lg:col-span-3">
                      <BiInput
                        title="Bonus Title"
                        value={channel.bonusTitle}
                        bnPlaceholder="যেমন: অতিরিক্ত বোনাস"
                        enPlaceholder="e.g. Extra Bonus"
                        onChangeBn={(value) =>
                          patchChannelBi(idx, "bonusTitle", "bn", value)
                        }
                        onChangeEn={(value) =>
                          patchChannelBi(idx, "bonusTitle", "en", value)
                        }
                      />
                    </div>

                    <div className="flex items-end">
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={channel.isActive !== false}
                          onChange={(e) =>
                            patchChannel(idx, "isActive", e.target.checked)
                          }
                          className="h-5 w-5 cursor-pointer accent-[#63a8ee]"
                        />
                        <span className="font-medium text-blue-100">
                          Active
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`${sectionCard} p-5 lg:p-6`}>
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Promotions</h2>
              <p className="mt-1 text-sm text-blue-100/70">
                Fixed / percent bonus এবং promotion wise turnover set করো
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setPromotions((prev) => [...prev, defaultPromotion()])
              }
              className={btnGhost}
            >
              <span className="flex items-center gap-2">
                <FaPlus />
                Add Promotion
              </span>
            </button>
          </div>

          {!selectedMethodId ? (
            <div className="rounded-2xl border border-dashed border-blue-300/20 bg-black/20 p-10 text-center text-blue-100/70">
              আগে deposit method select করো
            </div>
          ) : (
            <div className="space-y-5">
              {promotions.map((promo, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-blue-300/20 bg-gradient-to-br from-black/80 to-[#2f79c9]/10 p-4"
                >
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <h3 className="text-lg font-bold text-blue-100">
                      Promotion #{idx + 1}
                    </h3>

                    <button
                      type="button"
                      onClick={() =>
                        setPromotions((prev) =>
                          prev.filter((_, i) => i !== idx),
                        )
                      }
                      disabled={promotions.length === 1}
                      className={btnDanger}
                    >
                      <span className="flex items-center gap-2">
                        <FaTrash />
                        Remove
                      </span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                    <div>
                      <label className={labelCls}>Promotion ID</label>
                      <input
                        className={inputBase}
                        value={promo.id || ""}
                        onChange={(e) =>
                          patchPromotion(idx, "id", makeSafeId(e.target.value))
                        }
                        placeholder="welcome-bonus"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Bonus Type</label>
                      <select
                        className={inputBase}
                        value={promo.bonusType || "fixed"}
                        onChange={(e) =>
                          patchPromotion(idx, "bonusType", e.target.value)
                        }
                      >
                        <option value="fixed">fixed</option>
                        <option value="percent">percent</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>
                        Bonus Value{" "}
                        {promo.bonusType === "percent" ? "(%)" : "(৳)"}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={inputBase}
                        value={Number(promo.bonusValue || 0)}
                        onChange={(e) =>
                          patchPromotion(
                            idx,
                            "bonusValue",
                            Number(e.target.value || 0),
                          )
                        }
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
                        value={Number(promo.turnoverMultiplier ?? 1)}
                        onChange={(e) =>
                          patchPromotion(
                            idx,
                            "turnoverMultiplier",
                            Number(e.target.value || 0),
                          )
                        }
                        placeholder="1"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Bonus Scope</label>
                      <select
                        className={inputBase}
                        value={promo.bonusScope || "all-time"}
                        onChange={(e) =>
                          patchPromotion(idx, "bonusScope", e.target.value)
                        }
                      >
                        <option value="all-time">all-time</option>
                        <option value="first-deposit">first-deposit</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>Sort</label>
                      <input
                        type="number"
                        className={inputBase}
                        value={Number(promo.sort ?? idx)}
                        onChange={(e) =>
                          patchPromotion(
                            idx,
                            "sort",
                            Number(e.target.value || 0),
                          )
                        }
                      />
                    </div>

                    <div className="lg:col-span-3">
                      <BiInput
                        title="Promotion Name"
                        value={promo.name}
                        bnPlaceholder="যেমন: ওয়েলকাম বোনাস"
                        enPlaceholder="e.g. Welcome Bonus"
                        onChangeBn={(value) =>
                          patchPromotionBi(idx, "name", "bn", value)
                        }
                        onChangeEn={(value) =>
                          patchPromotionBi(idx, "name", "en", value)
                        }
                      />
                    </div>

                    <div className="flex items-end">
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={promo.isActive !== false}
                          onChange={(e) =>
                            patchPromotion(idx, "isActive", e.target.checked)
                          }
                          className="h-5 w-5 cursor-pointer accent-[#63a8ee]"
                        />
                        <span className="font-medium text-blue-100">
                          Active
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className={labelCls}>
                      Eligible Providers (খালি রাখলে default setting inherit
                      করবে)
                    </label>
                    <EligibleProvidersPicker
                      value={promo.eligibleProviders || []}
                      onChange={(next) =>
                        patchPromotion(idx, "eligibleProviders", next)
                      }
                      compact
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !selectedMethodId}
              className={btnPrimary}
            >
              <span className="flex items-center gap-2">
                <FaSave />
                {saving ? "Saving..." : "Save Config"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDepositBonusTurnover;
