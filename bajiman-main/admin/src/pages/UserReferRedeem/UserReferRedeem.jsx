import React, { useEffect, useMemo, useState } from "react";
import {
  FaGift,
  FaSave,
  FaSyncAlt,
  FaUsers,
  FaHistory,
  FaSearch,
  FaCoins,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const money = (n) => {
  const num = Number(n || 0);
  if (!Number.isFinite(num)) return "৳ 0.00";
  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const num = (v) => {
  const n = Number(v || 0);
  return Number.isFinite(n) ? n : 0;
};

const UserReferRedeem = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [q, setQ] = useState("");
  const [histories, setHistories] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const [form, setForm] = useState({
    referAmountForAllUsers: 0,
    minimumRedeemAmount: 100,
    maximumRedeemAmount: 1000,
    redeemPoint: 1000,
    redeemMoney: 100,
    isActive: true,
  });

  const conversionPreview = useMemo(() => {
    const point = num(form.redeemPoint);
    const taka = num(form.redeemMoney);

    if (point <= 0 || taka <= 0) return "Invalid conversion";

    return `${point.toLocaleString("en-US")} Point = ${money(taka)}`;
  }, [form.redeemPoint, form.redeemMoney]);

  const updateField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/admin/refer-redeem/settings");

      const s = data?.data || {};

      setForm({
        referAmountForAllUsers: s.referAmountForAllUsers ?? 0,
        minimumRedeemAmount: s.minimumRedeemAmount ?? 100,
        maximumRedeemAmount: s.maximumRedeemAmount ?? 1000,
        redeemPoint: s.redeemPoint ?? 1000,
        redeemMoney: s.redeemMoney ?? 100,
        isActive: Boolean(s.isActive),
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to load refer redeem settings",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchHistories = async (page = 1, search = q) => {
    try {
      setHistoryLoading(true);

      const { data } = await api.get("/api/admin/refer-redeem/histories", {
        params: {
          page,
          limit: pagination.limit,
          q: search,
        },
      });

      setHistories(Array.isArray(data?.data) ? data.data : []);
      setPagination(
        data?.pagination || {
          page,
          limit: 20,
          total: 0,
          totalPages: 1,
        },
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load redeem histories",
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchHistories(1, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validate = () => {
    if (num(form.referAmountForAllUsers) < 0) {
      toast.error("Refer amount cannot be negative");
      return false;
    }

    if (
      num(form.minimumRedeemAmount) < 0 ||
      num(form.maximumRedeemAmount) < 0
    ) {
      toast.error("Minimum and maximum redeem amount cannot be negative");
      return false;
    }

    if (
      num(form.maximumRedeemAmount) > 0 &&
      num(form.maximumRedeemAmount) < num(form.minimumRedeemAmount)
    ) {
      toast.error("Maximum redeem amount must be greater than minimum amount");
      return false;
    }

    if (num(form.redeemPoint) <= 0 || num(form.redeemMoney) <= 0) {
      toast.error("Redeem point and redeem money must be greater than 0");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setSaving(true);

      const payload = {
        referAmountForAllUsers: num(form.referAmountForAllUsers),
        minimumRedeemAmount: num(form.minimumRedeemAmount),
        maximumRedeemAmount: num(form.maximumRedeemAmount),
        redeemPoint: num(form.redeemPoint),
        redeemMoney: num(form.redeemMoney),
        isActive: Boolean(form.isActive),
      };

      const { data } = await api.put(
        "/api/admin/refer-redeem/settings",
        payload,
      );

      toast.success(data?.message || "Settings updated successfully");
      fetchSettings();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleApplyToUsers = async () => {
    const ok = window.confirm(
      "Are you sure? This will update referCommission for all normal users.",
    );

    if (!ok) return;

    try {
      setApplying(true);

      const { data } = await api.post("/api/admin/refer-redeem/apply-to-users");

      toast.success(data?.message || "Refer amount applied to all users");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to apply refer amount",
      );
    } finally {
      setApplying(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHistories(1, q);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050607] p-4 text-white md:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,121,211,0.28),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(26,121,211,0.18),transparent_38%)]" />
      <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#1A79D3]/20 blur-3xl" />
      <div className="absolute -right-24 bottom-16 h-80 w-80 rounded-full bg-[#1A79D3]/15 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-6 flex flex-col gap-4 rounded-[32px] border border-[#1A79D3]/20 bg-white/[0.07] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-[#1A79D3]/30 bg-[#1A79D3]/10 shadow-[0_0_45px_rgba(26,121,211,0.28)]">
              <FaGift className="text-2xl text-[#3ea0ff]" />
            </div>

            <div>
              <h1 className="bg-gradient-to-r from-[#6fb5f4] via-[#1A79D3] to-[#3ea0ff] bg-clip-text text-2xl font-black text-transparent md:text-3xl">
                User Refer & Redeem
              </h1>
              <p className="text-sm font-medium text-slate-300">
                Control user referral point and redeem conversion system
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchSettings}
            disabled={loading}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-5 py-3 font-bold text-white transition hover:bg-[#1A79D3]/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <div className="rounded-[32px] border border-[#1A79D3]/20 bg-white/[0.07] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
              <div className="mb-5 flex items-center gap-3">
                <FaCoins className="text-2xl text-[#3ea0ff]" />
                <h2 className="text-xl font-black">Redeem Settings</h2>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputBox
                  label="Refer Amount For All Users"
                  value={form.referAmountForAllUsers}
                  onChange={(v) => updateField("referAmountForAllUsers", v)}
                  hint="This amount will be user referCommission"
                />

                <InputBox
                  label="Minimum Redeem Amount"
                  value={form.minimumRedeemAmount}
                  onChange={(v) => updateField("minimumRedeemAmount", v)}
                  hint="User cannot redeem below this amount"
                />

                <InputBox
                  label="Maximum Redeem Amount"
                  value={form.maximumRedeemAmount}
                  onChange={(v) => updateField("maximumRedeemAmount", v)}
                  hint="0 means no maximum limit"
                />

                <InputBox
                  label="Redeem Point"
                  value={form.redeemPoint}
                  onChange={(v) => updateField("redeemPoint", v)}
                  hint="Example: 1000 point"
                />

                <InputBox
                  label="Redeem Money"
                  value={form.redeemMoney}
                  onChange={(v) => updateField("redeemMoney", v)}
                  hint="Example: 100 taka"
                />

                <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                  <p className="mb-2 text-sm font-bold text-slate-300">
                    System Status
                  </p>

                  <button
                    type="button"
                    onClick={() => updateField("isActive", !form.isActive)}
                    className={`flex w-full cursor-pointer items-center justify-between rounded-2xl px-4 py-3 font-black transition ${
                      form.isActive
                        ? "bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30"
                        : "bg-red-500/20 text-red-100 hover:bg-red-500/30"
                    }`}
                  >
                    <span>{form.isActive ? "Active" : "Inactive"}</span>
                    {form.isActive ? (
                      <FaToggleOn className="text-3xl" />
                    ) : (
                      <FaToggleOff className="text-3xl" />
                    )}
                  </button>

                  <p className="mt-2 text-xs font-medium text-slate-400">
                    If inactive, users cannot redeem points.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 p-4">
                <p className="text-sm font-bold text-slate-300">
                  Conversion Preview
                </p>
                <h3 className="mt-1 text-2xl font-black text-white">
                  {conversionPreview}
                </h3>
              </div>

              <div className="mt-5 flex flex-col gap-3 md:flex-row">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-6 py-3 font-black text-white shadow-[0_18px_50px_rgba(26,121,211,0.30)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FaSave />
                  {saving ? "Saving..." : "Save Settings"}
                </button>

                <button
                  type="button"
                  onClick={handleApplyToUsers}
                  disabled={applying}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-6 py-3 font-black text-white transition hover:bg-[#1A79D3]/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FaUsers />
                  {applying ? "Applying..." : "Apply Refer Amount To All Users"}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-[#1A79D3]/20 bg-white/[0.07] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <h2 className="mb-4 text-xl font-black">Current Summary</h2>

            <SummaryCard
              label="User Refer Commission"
              value={money(form.referAmountForAllUsers)}
            />
            <SummaryCard
              label="Minimum Redeem"
              value={money(form.minimumRedeemAmount)}
            />
            <SummaryCard
              label="Maximum Redeem"
              value={
                num(form.maximumRedeemAmount) > 0
                  ? money(form.maximumRedeemAmount)
                  : "No Limit"
              }
            />
            <SummaryCard label="Conversion" value={conversionPreview} />
            <SummaryCard
              label="Status"
              value={form.isActive ? "Active" : "Inactive"}
              good={form.isActive}
            />
          </div>
        </div>

        <div className="mt-6 rounded-[32px] border border-[#1A79D3]/20 bg-white/[0.07] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <FaHistory className="text-2xl text-[#3ea0ff]" />
              <div>
                <h2 className="text-xl font-black">Redeem History</h2>
                <p className="text-sm text-slate-300">
                  User redeem transactions and point usage
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSearch}
              className="flex w-full gap-2 md:w-auto"
            >
              <div className="relative flex-1 md:w-80">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search userId or note..."
                  className="w-full rounded-2xl border border-white/10 bg-black/35 py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-500 focus:border-[#1A79D3]/60"
                />
              </div>

              <button
                type="submit"
                className="cursor-pointer rounded-2xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-5 py-3 font-black text-white shadow-[0_18px_50px_rgba(26,121,211,0.20)] transition hover:scale-[1.01]"
              >
                Search
              </button>
            </form>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="min-w-[1000px] w-full border-collapse">
              <thead>
                <tr className="bg-[#1A79D3]/10 text-left text-sm text-slate-200">
                  <Th>User</Th>
                  <Th>Points Used</Th>
                  <Th>Redeem Amount</Th>
                  <Th>Balance</Th>
                  <Th>Points</Th>
                  <Th>Status</Th>
                  <Th>Date</Th>
                </tr>
              </thead>

              <tbody>
                {historyLoading ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center font-bold">
                      Loading histories...
                    </td>
                  </tr>
                ) : histories.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center font-bold">
                      No redeem history found
                    </td>
                  </tr>
                ) : (
                  histories.map((item) => (
                    <tr
                      key={item._id}
                      className="border-t border-white/10 transition hover:bg-white/5"
                    >
                      <Td>
                        <div>
                          <p className="font-black">{item.userId}</p>
                          <p className="text-xs text-slate-400">
                            {item?.user?.countryCode || ""}{" "}
                            {item?.user?.phone || ""}
                          </p>
                        </div>
                      </Td>

                      <Td>{Number(item.pointsUsed || 0).toLocaleString()}</Td>
                      <Td>{money(item.redeemAmount)}</Td>

                      <Td>
                        <div className="text-sm">
                          <p>Before: {money(item.balanceBefore)}</p>
                          <p>After: {money(item.balanceAfter)}</p>
                        </div>
                      </Td>

                      <Td>
                        <div className="text-sm">
                          <p>Before: {Number(item.pointsBefore || 0)}</p>
                          <p>After: {Number(item.pointsAfter || 0)}</p>
                        </div>
                      </Td>

                      <Td>
                        <span className="rounded-full border border-emerald-300/20 bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-100">
                          {item.status}
                        </span>
                      </Td>

                      <Td>
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString()
                          : "-"}
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-col items-center justify-between gap-3 md:flex-row">
            <p className="text-sm font-bold text-slate-300">
              Total: {pagination.total || 0}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => fetchHistories(pagination.page - 1, q)}
                className="cursor-pointer rounded-xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-4 py-2 font-bold transition hover:bg-[#1A79D3]/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Prev
              </button>

              <span className="rounded-xl bg-[#1A79D3]/10 px-4 py-2 font-black">
                {pagination.page} / {pagination.totalPages || 1}
              </span>

              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchHistories(pagination.page + 1, q)}
                className="cursor-pointer rounded-xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-4 py-2 font-bold transition hover:bg-[#1A79D3]/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputBox = ({ label, value, onChange, hint }) => {
  return (
    <label className="block rounded-2xl border border-white/10 bg-black/35 p-4">
      <span className="mb-2 block text-sm font-bold text-slate-300">
        {label}
      </span>

      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 font-black text-white outline-none transition placeholder:text-slate-500 focus:border-[#1A79D3]/60 focus:shadow-[0_0_25px_rgba(26,121,211,0.20)]"
      />

      {hint && (
        <p className="mt-2 text-xs font-medium text-slate-500">{hint}</p>
      )}
    </label>
  );
};

const SummaryCard = ({ label, value, good }) => {
  return (
    <div className="mb-3 rounded-2xl border border-white/10 bg-black/35 p-4">
      <p className="text-sm font-bold text-slate-400">{label}</p>
      <p
        className={`mt-1 text-xl font-black ${
          good === true
            ? "text-emerald-200"
            : good === false
              ? "text-red-200"
              : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
};

const Th = ({ children }) => {
  return <th className="px-4 py-4 font-black">{children}</th>;
};

const Td = ({ children }) => {
  return (
    <td className="px-4 py-4 text-sm font-semibold text-slate-100">
      {children}
    </td>
  );
};

export default UserReferRedeem;
