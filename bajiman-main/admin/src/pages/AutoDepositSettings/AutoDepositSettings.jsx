import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { api } from "../../api/axios";
import {
  FaCog,
  FaKey,
  FaToggleOn,
  FaToggleOff,
  FaSave,
  FaSyncAlt,
  FaTrash,
  FaPlus,
  FaGift,
  FaPercentage,
  FaShieldAlt,
  FaMoneyBillWave,
  FaBullseye,
} from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import EligibleProvidersPicker from "../../components/EligibleProvidersPicker/EligibleProvidersPicker";
import { sumEligibleProvidersPercent } from "../../components/EligibleProvidersPicker/eligibleProvidersUtils";

const emptyBonus = () => ({
  _id: `${Date.now()}-${Math.random()}`,
  title: { bn: "", en: "" },
  bonusType: "fixed",
  bonusScope: "all-time",
  bonusValue: 0,
  turnoverMultiplier: 1,
  isActive: true,
  order: 0,
  eligibleProviders: [],
});

const cardClass =
  "rounded-3xl border border-blue-200/15 bg-black/30 backdrop-blur-xl shadow-[0_20px_80px_rgba(47,121,201,0.18)]";

const inputClass =
  "w-full rounded-2xl border border-blue-200/15 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/25 placeholder:text-blue-100/35";

const labelClass =
  "text-[12px] font-extrabold uppercase tracking-wide text-blue-100/70";

const AutoDepositSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [bonuses, setBonuses] = useState([]);
  const [deleteId, setDeleteId] = useState("");

  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      businessToken: "",
      active: false,
      minAmount: 5,
      maxAmount: 500000,
    },
  });

  const active = watch("active");

  const loadSettings = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/api/auto-deposit/admin");

      if (!data?.success) {
        throw new Error(data?.message || "Failed to load settings");
      }

      reset({
        businessToken: data?.data?.businessToken || "",
        active: !!data?.data?.active,
        minAmount: Number(data?.data?.minAmount || 5),
        maxAmount: Number(data?.data?.maxAmount || 500000),
      });

      setBonuses(
        Array.isArray(data?.data?.bonuses)
          ? data.data.bonuses.map((item, idx) => ({
              _id: item?._id || `${Date.now()}-${idx}`,
              title: {
                bn: item?.title?.bn || "",
                en: item?.title?.en || "",
              },
              bonusType: item?.bonusType === "percent" ? "percent" : "fixed",
              bonusScope:
                item?.bonusScope === "first-deposit"
                  ? "first-deposit"
                  : "all-time",
              bonusValue: Number(item?.bonusValue || 0),
              turnoverMultiplier: Number(item?.turnoverMultiplier ?? 1),
              isActive: item?.isActive !== false,
              order: Number(item?.order ?? idx),
              eligibleProviders: Array.isArray(item?.eligibleProviders)
                ? item.eligibleProviders
                : [],
            }))
          : [],
      );
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Load failed",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const addBonus = () => {
    setBonuses((prev) => [...prev, { ...emptyBonus(), order: prev.length }]);
  };

  const updateBonus = (id, key, value) => {
    setBonuses((prev) =>
      prev.map((item) => {
        if (item._id !== id) return item;

        if (key === "title.bn") {
          return {
            ...item,
            title: { ...item.title, bn: value },
          };
        }

        if (key === "title.en") {
          return {
            ...item,
            title: { ...item.title, en: value },
          };
        }

        return {
          ...item,
          [key]: value,
        };
      }),
    );
  };

  const confirmDeleteBonus = () => {
    setBonuses((prev) =>
      prev
        .filter((item) => item._id !== deleteId)
        .map((item, idx) => ({ ...item, order: idx })),
    );

    setDeleteId("");
    toast.info("Bonus removed");
  };

  const onSubmit = async (values) => {
    try {
      setSaving(true);

      const min = Math.floor(Number(values.minAmount || 0));
      const max = Math.floor(Number(values.maxAmount || 0));

      if (!min || min < 1) {
        toast.error("Minimum amount invalid");
        return;
      }

      if (max > 0 && min > max) {
        toast.error("Minimum cannot be greater than maximum");
        return;
      }

      const sanitizedBonuses = bonuses.map((item, idx) => ({
        _id: item._id,
        title: {
          bn: String(item?.title?.bn || "").trim(),
          en: String(item?.title?.en || "").trim(),
        },
        bonusType: item?.bonusType === "percent" ? "percent" : "fixed",
        bonusScope:
          item?.bonusScope === "first-deposit" ? "first-deposit" : "all-time",
        bonusValue: Math.max(0, Number(item?.bonusValue || 0)),
        turnoverMultiplier: Math.max(0, Number(item?.turnoverMultiplier || 0)),
        isActive: item?.isActive !== false,
        order: idx,
        eligibleProviders: item?.eligibleProviders || [],
      }));

      for (const item of sanitizedBonuses) {
        if (!item.title.bn || !item.title.en) {
          toast.error("Every bonus needs Bangla and English title");
          return;
        }

        if (sumEligibleProvidersPercent(item.eligibleProviders) > 100) {
          toast.error(
            `Bonus "${item.title.bn}" eligible providers percent যোগফল ১০০%-এর বেশি হতে পারবে না`,
          );
          return;
        }
      }

      const { data } = await api.put("/api/auto-deposit/admin", {
        businessToken: String(values.businessToken || "").trim(),
        active: !!values.active,
        minAmount: min,
        maxAmount: max,
        bonuses: sanitizedBonuses,
      });

      if (!data?.success) {
        throw new Error(data?.message || "Save failed");
      }

      toast.success("Auto deposit settings updated");
      await loadSettings();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Save failed",
      );
    } finally {
      setSaving(false);
    }
  };

  const activeCount = useMemo(
    () => bonuses.filter((item) => item.isActive).length,
    [bonuses],
  );

  const firstDepositCount = useMemo(
    () => bonuses.filter((item) => item.bonusScope === "first-deposit").length,
    [bonuses],
  );

  if (loading) {
    return (
      <div className="p-4 lg:p-6">
        <div className={`${cardClass} p-8 text-center text-blue-100`}>
          Loading auto deposit settings...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="overflow-hidden rounded-[28px] border border-blue-200/15 bg-gradient-to-r from-black/80 via-[#2f79c9]/40 to-black/80 text-white shadow-[0_20px_80px_rgba(47,121,201,0.22)] backdrop-blur-xl">
          <div className="px-5 py-5 md:px-6 md:py-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] shadow-lg shadow-blue-700/40">
                  <FaCog className="text-2xl text-white" />
                </div>

                <div>
                  <h1 className="text-2xl font-black tracking-tight md:text-3xl">
                    Auto Deposit Settings
                  </h1>
                  <p className="mt-1 text-sm font-medium text-blue-100/75">
                    Manage OraclePay token, deposit limits, bonus scope and
                    turnover.
                  </p>
                </div>
              </div>

              <div
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black ${
                  active
                    ? "border-emerald-300/30 bg-emerald-400/15 text-emerald-200"
                    : "border-red-300/30 bg-red-400/15 text-red-200"
                }`}
              >
                {active ? <FaToggleOn /> : <FaToggleOff />}
                {active ? "AUTO DEPOSIT ACTIVE" : "AUTO DEPOSIT INACTIVE"}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className={`${cardClass} p-5 md:p-6`}>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] shadow-lg shadow-blue-700/30">
                  <FaKey className="text-lg text-white" />
                </div>

                <div>
                  <div className="text-lg font-black">Business Token</div>
                  <div className="text-xs font-medium text-blue-100/65">
                    OraclePay business token for payment page generation.
                  </div>
                </div>
              </div>

              <div className="relative mt-5">
                <input
                  {...register("businessToken")}
                  type={showToken ? "text" : "password"}
                  placeholder="Paste your business token"
                  className={`${inputClass} pr-14 font-mono text-sm`}
                />

                <button
                  type="button"
                  onClick={() => setShowToken((v) => !v)}
                  className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-xl border border-blue-200/15 bg-white/5 text-blue-100 transition hover:bg-white/10"
                >
                  {showToken ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="mt-5 rounded-2xl border border-blue-200/10 bg-gradient-to-r from-[#63a8ee]/10 to-[#2f79c9]/10 p-4">
                <label className="inline-flex cursor-pointer items-center gap-3 font-bold text-white">
                  <input
                    type="checkbox"
                    {...register("active")}
                    className="h-5 w-5 cursor-pointer accent-[#2f79c9]"
                  />
                  <span>Enable Auto Deposit</span>
                </label>

                <p className="mt-2 text-sm text-blue-100/65">
                  When enabled, users can generate auto deposit payment links.
                </p>
              </div>
            </div>

            <div className={`${cardClass} p-5 md:p-6`}>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] shadow-lg shadow-blue-700/30">
                  <FaMoneyBillWave className="text-lg text-white" />
                </div>

                <div>
                  <div className="text-lg font-black">Deposit Limits</div>
                  <div className="text-xs font-medium text-blue-100/65">
                    Minimum and maximum allowed deposit amount.
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label className={labelClass}>Minimum Amount</label>
                  <input
                    {...register("minAmount")}
                    type="number"
                    placeholder="Minimum deposit amount"
                    className={`${inputClass} mt-2`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Maximum Amount</label>
                  <input
                    {...register("maxAmount")}
                    type="number"
                    placeholder="Maximum deposit amount"
                    className={`${inputClass} mt-2`}
                  />
                </div>

                <div className="rounded-2xl border border-blue-200/10 bg-white/5 p-4 text-sm text-blue-100/70">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <FaShieldAlt className="text-[#8fc2f5]" />
                    Limit Note
                  </div>
                  <p className="mt-2">
                    If maximum amount is 0, it will be treated as unlimited.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={`${cardClass} overflow-hidden`}>
            <div className="flex flex-col gap-3 border-b border-blue-200/10 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
              <div>
                <h2 className="text-xl font-black">Bonus Configuration</h2>
                <p className="mt-1 text-sm text-blue-100/65">
                  Active bonus: {activeCount} / Total bonus: {bonuses.length} /
                  First deposit bonus: {firstDepositCount}
                </p>
              </div>

              <button
                type="button"
                onClick={addBonus}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-5 py-3 font-extrabold text-white shadow-lg shadow-blue-700/30 transition hover:from-[#7bb7f1] hover:to-[#3b88db]"
              >
                <FaPlus />
                Add Bonus
              </button>
            </div>

            <div className="space-y-4 p-5 md:p-6">
              {bonuses.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-blue-200/15 bg-black/20 p-10 text-center text-blue-100/55">
                  No bonus configured yet
                </div>
              ) : (
                bonuses.map((item, idx) => (
                  <div
                    key={item._id}
                    className="rounded-3xl border border-blue-200/12 bg-gradient-to-br from-black/35 via-[#2f79c9]/10 to-black/35 p-4 md:p-5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-lg font-black text-white">
                          Bonus #{idx + 1}
                        </div>
                        <div className="text-sm text-blue-100/60">
                          Configure title, type, scope, amount and turnover.
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-blue-200/15 bg-white/5 px-3 py-2 text-sm font-bold">
                          <input
                            type="checkbox"
                            checked={item.isActive}
                            onChange={(e) =>
                              updateBonus(
                                item._id,
                                "isActive",
                                e.target.checked,
                              )
                            }
                            className="h-4 w-4 cursor-pointer accent-[#2f79c9]"
                          />
                          <span>{item.isActive ? "Active" : "Inactive"}</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => setDeleteId(item._id)}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-red-300/20 bg-red-500/10 px-4 py-2.5 font-bold text-red-200 transition hover:bg-red-500/20"
                        >
                          <FaTrash />
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
                      <div>
                        <label className={labelClass}>Bangla Title</label>
                        <input
                          value={item.title.bn}
                          onChange={(e) =>
                            updateBonus(item._id, "title.bn", e.target.value)
                          }
                          placeholder="বাংলা title"
                          className={`${inputClass} mt-2`}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>English Title</label>
                        <input
                          value={item.title.en}
                          onChange={(e) =>
                            updateBonus(item._id, "title.en", e.target.value)
                          }
                          placeholder="English title"
                          className={`${inputClass} mt-2`}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Bonus Type</label>
                        <select
                          value={item.bonusType}
                          onChange={(e) =>
                            updateBonus(item._id, "bonusType", e.target.value)
                          }
                          className={`${inputClass} mt-2 cursor-pointer`}
                        >
                          <option value="fixed">Fixed</option>
                          <option value="percent">Percent</option>
                        </select>
                      </div>

                      <div>
                        <label className={labelClass}>Bonus Scope</label>
                        <select
                          value={item.bonusScope || "all-time"}
                          onChange={(e) =>
                            updateBonus(item._id, "bonusScope", e.target.value)
                          }
                          className={`${inputClass} mt-2 cursor-pointer`}
                        >
                          <option value="all-time">All Time</option>
                          <option value="first-deposit">First Deposit</option>
                        </select>
                      </div>

                      <div>
                        <label className={labelClass}>
                          {item.bonusType === "percent"
                            ? "Bonus Percentage"
                            : "Fixed Amount"}
                        </label>
                        <input
                          type="number"
                          value={item.bonusValue}
                          onChange={(e) =>
                            updateBonus(
                              item._id,
                              "bonusValue",
                              Number(e.target.value || 0),
                            )
                          }
                          className={`${inputClass} mt-2`}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Turnover Multiplier
                        </label>
                        <input
                          type="number"
                          value={item.turnoverMultiplier}
                          onChange={(e) =>
                            updateBonus(
                              item._id,
                              "turnoverMultiplier",
                              Number(e.target.value || 0),
                            )
                          }
                          className={`${inputClass} mt-2`}
                        />
                      </div>
                    </div>

                    <div className="mt-5">
                      <label className={labelClass}>Eligible Providers</label>
                      <div className="mt-2">
                        <EligibleProvidersPicker
                          value={item.eligibleProviders || []}
                          onChange={(next) =>
                            updateBonus(item._id, "eligibleProviders", next)
                          }
                          compact
                        />
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-blue-200/12 bg-white/5 p-4">
                      <div className="flex flex-wrap items-center gap-3 font-extrabold text-white">
                        <span className="inline-flex items-center gap-2">
                          {item.bonusType === "percent" ? (
                            <>
                              <FaPercentage className="text-[#8fc2f5]" />
                              Percent Bonus
                            </>
                          ) : (
                            <>
                              <FaGift className="text-[#8fc2f5]" />
                              Fixed Bonus
                            </>
                          )}
                        </span>

                        <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/15 bg-black/25 px-3 py-1 text-xs text-blue-100">
                          <FaBullseye className="text-[#8fc2f5]" />
                          {item.bonusScope === "first-deposit"
                            ? "First Deposit Only"
                            : "All Time"}
                        </span>
                      </div>

                      <div className="mt-2 text-sm text-blue-100/75">
                        {item.title.bn || "—"} / {item.title.en || "—"} |{" "}
                        {item.bonusType === "percent"
                          ? `${Number(item.bonusValue || 0)}%`
                          : `৳${Number(item.bonusValue || 0).toLocaleString(
                              "en-US",
                            )}`}{" "}
                        | x{Number(item.turnoverMultiplier || 0)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={loadSettings}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-blue-200/15 bg-black/35 px-5 py-3 font-extrabold text-blue-50 transition hover:bg-white/10"
            >
              <FaSyncAlt />
              Refresh
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-6 py-3 font-extrabold text-white shadow-lg shadow-blue-700/30 transition hover:from-[#7bb7f1] hover:to-[#3b88db] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaSave />
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>

      {deleteId ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setDeleteId("")}
          />

          <div className="relative w-full max-w-md rounded-[28px] border border-red-300/20 bg-gradient-to-br from-black via-[#2f79c9]/20 to-black p-6 text-white shadow-2xl">
            <div className="text-2xl font-black">Delete Bonus?</div>
            <div className="mt-2 text-sm text-blue-100/70">
              এই bonus delete করলে এটা permanently remove হয়ে যাবে।
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteId("")}
                className="cursor-pointer rounded-2xl border border-blue-200/15 bg-white/5 px-4 py-3 font-bold transition hover:bg-white/10"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteBonus}
                className="cursor-pointer rounded-2xl bg-red-500 px-4 py-3 font-extrabold text-white transition hover:bg-red-400"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AutoDepositSettings;
