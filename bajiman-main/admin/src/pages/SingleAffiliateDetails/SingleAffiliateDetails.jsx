import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  Save,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
  Wallet,
} from "lucide-react";
import { api } from "../../api/axios";

const SingleAffiliateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [referredUsers, setReferredUsers] = useState([]);
  const REFERRED_USERS_PER_PAGE = 20;

  const [referredCurrentPage, setReferredCurrentPage] = useState(1);

  const referredTotalPages =
    Math.ceil(referredUsers.length / REFERRED_USERS_PER_PAGE) || 1;

  const paginatedReferredUsers = useMemo(() => {
    const start = (referredCurrentPage - 1) * REFERRED_USERS_PER_PAGE;
    return referredUsers.slice(start, start + REFERRED_USERS_PER_PAGE);
  }, [referredUsers, referredCurrentPage]);

  useEffect(() => {
    setReferredCurrentPage(1);
  }, [referredUsers.length]);

  useEffect(() => {
    if (referredCurrentPage > referredTotalPages) {
      setReferredCurrentPage(referredTotalPages);
    }
  }, [referredCurrentPage, referredTotalPages]);

  const [formData, setFormData] = useState({
    userId: "",
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    password: "",
    isActive: false,
    currency: "BDT",
    balance: 0,
    commissionBalance: 0,
    gameLossCommission: 0,
    depositCommission: 0,
    referCommission: 0,
    gameWinCommission: 0,
    gameLossCommissionBalance: 0,
    depositCommissionBalance: 0,
    referCommissionBalance: 0,
    gameWinCommissionBalance: 0,
    role: "",
    referralCode: "",
    referralCount: 0,
    createdAt: "",
    updatedAt: "",
  });

  const fetchDetails = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const { data } = await api.get(
        `/api/affiliate/admin/affiliate-users/${id}/details`,
      );

      const affiliate = data?.data?.affiliate;
      const users = data?.data?.referredUsers || [];

      if (data?.success && affiliate) {
        setFormData({
          userId: affiliate?.userId || "",
          email: affiliate?.email || "",
          phone: affiliate?.phone || "",
          firstName: affiliate?.firstName || "",
          lastName: affiliate?.lastName || "",
          password: "",
          isActive: Boolean(affiliate?.isActive),
          currency: affiliate?.currency || "BDT",
          balance: Number(affiliate?.balance || 0),
          commissionBalance: Number(affiliate?.commissionBalance || 0),
          gameLossCommission: Number(affiliate?.gameLossCommission || 0),
          depositCommission: Number(affiliate?.depositCommission || 0),
          referCommission: Number(affiliate?.referCommission || 0),
          gameWinCommission: Number(affiliate?.gameWinCommission || 0),
          gameLossCommissionBalance: Number(
            affiliate?.gameLossCommissionBalance || 0,
          ),
          depositCommissionBalance: Number(
            affiliate?.depositCommissionBalance || 0,
          ),
          referCommissionBalance: Number(
            affiliate?.referCommissionBalance || 0,
          ),
          gameWinCommissionBalance: Number(
            affiliate?.gameWinCommissionBalance || 0,
          ),
          role: affiliate?.role || "aff-user",
          referralCode: affiliate?.referralCode || "",
          referralCount: Number(affiliate?.referralCount || users.length || 0),
          createdAt: affiliate?.createdAt || "",
          updatedAt: affiliate?.updatedAt || "",
        });

        setReferredUsers(users);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to load affiliate user details",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDetails(false);
  }, [id]);

  const money = (value) => {
    const symbol = formData.currency === "USDT" ? "$" : "৳";

    return `${symbol}${Number(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const stats = useMemo(
    () => [
      {
        label: "Total Referred Users",
        value: referredUsers.length,
        icon: Users,
      },
      {
        label: "Main Balance",
        value: money(formData.balance),
        icon: Wallet,
      },
      {
        label: "Commission Balance",
        value: money(formData.commissionBalance),
        icon: BadgeCheck,
      },
      {
        label: "Account Status",
        value: formData.isActive ? "Active" : "Inactive",
        icon: formData.isActive ? UserCheck : UserX,
      },
    ],
    [formData, referredUsers.length],
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? value === ""
              ? ""
              : Number(value)
            : value,
    }));
  };

  const handlePhoneChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      phone: e.target.value.replace(/\D/g, "").slice(0, 15),
    }));
  };

  const handleUserIdChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      userId: e.target.value
        .toLowerCase()
        .replace(/\s/g, "")
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 15),
    }));
  };

  const handleUpdate = async () => {
    try {
      if (!formData.userId.trim()) {
        toast.error("Username is required");
        return;
      }

      if (formData.userId.length < 4 || formData.userId.length > 15) {
        toast.error("Username must be 4-15 characters");
        return;
      }

      if (!formData.phone.trim()) {
        toast.error("Phone number is required");
        return;
      }

      if (
        formData.email.trim() &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
      ) {
        toast.error("Enter a valid email address");
        return;
      }

      if (formData.password.trim() && formData.password.trim().length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }

      setSaving(true);

      const payload = {
        userId: formData.userId.trim().toLowerCase(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        isActive: Boolean(formData.isActive),
        currency: formData.currency,
        balance: Number(formData.balance) || 0,
        commissionBalance: Number(formData.commissionBalance) || 0,
        gameLossCommission: Number(formData.gameLossCommission) || 0,
        depositCommission: Number(formData.depositCommission) || 0,
        referCommission: Number(formData.referCommission) || 0,
        gameWinCommission: Number(formData.gameWinCommission) || 0,
        gameLossCommissionBalance:
          Number(formData.gameLossCommissionBalance) || 0,
        depositCommissionBalance:
          Number(formData.depositCommissionBalance) || 0,
        referCommissionBalance: Number(formData.referCommissionBalance) || 0,
        gameWinCommissionBalance:
          Number(formData.gameWinCommissionBalance) || 0,
      };

      if (formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      const { data } = await api.patch(
        `/api/affiliate/admin/affiliate-users/${id}/details`,
        payload,
      );

      if (data?.success) {
        toast.success(data?.message || "Affiliate user updated successfully");
        fetchDetails(true);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update affiliate user",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-[#1A79D3]/20 bg-white/[0.07] px-6 py-4 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <Loader2 className="h-6 w-6 animate-spin text-[#1A79D3]" />
          Loading affiliate details...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050607] p-4 text-white md:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,121,211,0.25),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(26,121,211,0.14),transparent_38%)]" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10"
      >
        <div className="mb-5 rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.07] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-2xl border border-[#1A79D3]/20 bg-[#1A79D3]/10 px-4 py-2">
                <ShieldCheck className="h-4 w-4 text-[#1A79D3]" />
                <span className="text-xs font-bold text-[#6fb5f4]">
                  Affiliate Management
                </span>
              </div>

              <h1 className="bg-gradient-to-r from-[#6fb5f4] via-[#1A79D3] to-[#3ea0ff] bg-clip-text text-2xl font-black text-transparent md:text-3xl">
                Single Affiliate Details
              </h1>

              <p className="mt-2 text-sm text-slate-300">
                Update affiliate information, commission settings, wallet
                balances and view all referred users.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-bold text-white transition hover:border-[#1A79D3]/40 hover:bg-[#1A79D3]/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <button
                type="button"
                onClick={() => fetchDetails(true)}
                disabled={refreshing || saving}
                className="flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-bold text-white transition hover:border-[#1A79D3]/40 hover:bg-[#1A79D3]/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={handleUpdate}
                disabled={saving || refreshing}
                className="flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-5 py-3 text-sm font-black text-white shadow-[0_18px_50px_rgba(26,121,211,0.30)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-[24px] border border-[#1A79D3]/20 bg-white/[0.07] p-5 shadow-xl shadow-black/30 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-400">
                      {item.label}
                    </p>
                    <h3 className="mt-2 truncate text-2xl font-black text-white">
                      {item.value}
                    </h3>
                  </div>

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1A79D3]/15 text-[#6fb5f4]">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Section title="Editable Affiliate Information">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <InputField label="Username">
              <input
                type="text"
                name="userId"
                value={formData.userId}
                onChange={handleUserIdChange}
                placeholder="Enter username"
                className={inputClass}
              />
            </InputField>

            <InputField label="Email Address">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className={inputClass}
              />
            </InputField>

            <InputField label="Phone Number">
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="Enter phone number"
                className={inputClass}
              />
            </InputField>

            <InputField label="First Name">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                className={inputClass}
              />
            </InputField>

            <InputField label="Last Name">
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                className={inputClass}
              />
            </InputField>

            <InputField label="Currency">
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="BDT">BDT</option>
                <option value="USDT">USDT</option>
              </select>
            </InputField>

            <InputField label="New Password">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current password"
                  className={`${inputClass} pr-12`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 transition hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </InputField>

            <InputField label="Account Status">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: !prev.isActive,
                  }))
                }
                className={`flex h-[46px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-black transition ${
                  formData.isActive
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                    : "border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                }`}
              >
                {formData.isActive ? (
                  <>
                    <UserCheck className="h-5 w-5" />
                    Active
                  </>
                ) : (
                  <>
                    <UserX className="h-5 w-5" />
                    Inactive
                  </>
                )}
              </button>
            </InputField>
          </div>
        </Section>

        <Section title="Wallet & Commission Balance">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <NumberField
              label="Main Balance"
              name="balance"
              value={formData.balance}
              onChange={handleChange}
            />

            <NumberField
              label="Commission Balance"
              name="commissionBalance"
              value={formData.commissionBalance}
              onChange={handleChange}
            />

            <NumberField
              label="Refer Commission Balance"
              name="referCommissionBalance"
              value={formData.referCommissionBalance}
              onChange={handleChange}
            />

            <NumberField
              label="Deposit Commission Balance"
              name="depositCommissionBalance"
              value={formData.depositCommissionBalance}
              onChange={handleChange}
            />

            <NumberField
              label="Game Loss Commission Balance"
              name="gameLossCommissionBalance"
              value={formData.gameLossCommissionBalance}
              onChange={handleChange}
            />

            <NumberField
              label="Game Win Commission Balance"
              name="gameWinCommissionBalance"
              value={formData.gameWinCommissionBalance}
              onChange={handleChange}
            />
          </div>
        </Section>

        <Section title="Commission Settings">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <NumberField
              label="Refer Commission Per User"
              name="referCommission"
              value={formData.referCommission}
              onChange={handleChange}
            />

            <NumberField
              label="Deposit Commission"
              name="depositCommission"
              value={formData.depositCommission}
              onChange={handleChange}
            />

            <NumberField
              label="Game Loss Commission"
              name="gameLossCommission"
              value={formData.gameLossCommission}
              onChange={handleChange}
            />

            <NumberField
              label="Game Win Commission"
              name="gameWinCommission"
              value={formData.gameWinCommission}
              onChange={handleChange}
            />
          </div>
        </Section>

        <Section title="Read Only Affiliate Information">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ReadOnlyField label="Role" value={formData.role || "aff-user"} />
            <ReadOnlyField
              label="Referral Code"
              value={formData.referralCode || "N/A"}
            />
            <ReadOnlyField
              label="Referral Count"
              value={formData.referralCount}
            />
            <ReadOnlyField
              label="Created At"
              value={
                formData.createdAt
                  ? new Date(formData.createdAt).toLocaleString()
                  : "N/A"
              }
            />
            <ReadOnlyField
              label="Updated At"
              value={
                formData.updatedAt
                  ? new Date(formData.updatedAt).toLocaleString()
                  : "N/A"
              }
            />
          </div>
        </Section>

        <Section title="Users Registered With This Affiliate Refer Code">
          <div className="overflow-hidden rounded-[24px] border border-[#1A79D3]/20 bg-black/25">
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[950px]">
                <thead>
                  <tr className="border-b border-[#1A79D3]/20 bg-[#1A79D3]/10 text-left">
                    {[
                      "Username",
                      "Phone",
                      "Email",
                      "Balance",
                      "Currency",
                      "Status",
                      "Joined",
                    ].map((item) => (
                      <th
                        key={item}
                        className="px-5 py-4 text-sm font-black text-slate-100"
                      >
                        {item}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {paginatedReferredUsers.length ? (
                    paginatedReferredUsers.map((user, index) => (
                      <tr
                        key={user._id}
                        className={`border-b border-white/5 transition hover:bg-[#1A79D3]/10 ${
                          index % 2 === 0 ? "bg-black/15" : "bg-transparent"
                        }`}
                      >
                        <td className="px-5 py-4 text-sm font-bold text-white">
                          {user.userId || "N/A"}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-300">
                          {user.phone || "N/A"}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-300">
                          {user.email || "N/A"}
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-[#6fb5f4]">
                          {money(user.balance)}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-300">
                          {user.currency || "BDT"}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge active={user.isActive} />
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-300">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-5 py-10 text-center text-slate-400"
                      >
                        No referred users found for this affiliate.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-3 lg:hidden">
              {paginatedReferredUsers.length ? (
                paginatedReferredUsers.map((user) => (
                  <div
                    key={user._id}
                    className="rounded-2xl border border-white/10 bg-black/30 p-4"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-black text-white">
                          {user.userId || "N/A"}
                        </h4>
                        <p className="mt-1 text-xs text-slate-400">
                          {user.phone || "N/A"}
                        </p>
                      </div>

                      <StatusBadge active={user.isActive} />
                    </div>

                    <InfoRow label="Email" value={user.email || "N/A"} />
                    <InfoRow label="Balance" value={money(user.balance)} />
                    <InfoRow label="Currency" value={user.currency || "BDT"} />
                    <InfoRow
                      label="Joined"
                      value={
                        user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "N/A"
                      }
                    />
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-black/25 p-8 text-center text-slate-400">
                  No referred users found for this affiliate.
                </div>
              )}
            </div>

            {referredUsers.length > 0 && (
              <div className="flex flex-col items-center justify-between gap-4 border-t border-[#1A79D3]/20 bg-black/20 p-4 md:flex-row">
                <p className="text-center text-sm text-slate-400 md:text-left">
                  Showing{" "}
                  <span className="font-black text-white">
                    {(referredCurrentPage - 1) * REFERRED_USERS_PER_PAGE + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-black text-white">
                    {Math.min(
                      referredCurrentPage * REFERRED_USERS_PER_PAGE,
                      referredUsers.length,
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-black text-white">
                    {referredUsers.length}
                  </span>{" "}
                  referred users
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setReferredCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={referredCurrentPage === 1}
                    className="cursor-pointer rounded-xl border border-white/10 bg-black/35 px-4 py-2 text-sm font-bold text-white transition hover:border-[#1A79D3]/40 hover:bg-[#1A79D3]/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Prev
                  </button>

                  <span className="rounded-xl border border-[#1A79D3]/30 bg-[#1A79D3]/10 px-4 py-2 text-sm font-black text-[#6fb5f4]">
                    Page {referredCurrentPage} / {referredTotalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setReferredCurrentPage((prev) =>
                        Math.min(prev + 1, referredTotalPages),
                      )
                    }
                    disabled={referredCurrentPage === referredTotalPages}
                    className="cursor-pointer rounded-xl border border-white/10 bg-black/35 px-4 py-2 text-sm font-bold text-white transition hover:border-[#1A79D3]/40 hover:bg-[#1A79D3]/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </Section>
      </motion.div>
    </div>
  );
};

const inputClass =
  "h-[46px] w-full rounded-2xl border border-white/10 bg-black/35 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#1A79D3]/60 focus:shadow-[0_0_25px_rgba(26,121,211,0.20)]";

const InputField = ({ label, children }) => (
  <div>
    <label className="mb-2 block text-sm font-bold text-slate-200">
      {label}
    </label>
    {children}
  </div>
);

const NumberField = ({ label, name, value, onChange }) => (
  <InputField label={label}>
    <input
      type="number"
      name={name}
      value={value}
      min="0"
      step="0.01"
      onChange={onChange}
      placeholder={`Enter ${label}`}
      className={inputClass}
    />
  </InputField>
);

const ReadOnlyField = ({ label, value }) => (
  <InputField label={label}>
    <input
      type="text"
      value={value}
      readOnly
      className="h-[46px] w-full cursor-not-allowed rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-slate-400 outline-none"
    />
  </InputField>
);

const Section = ({ title, children }) => (
  <div className="mb-5 rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.07] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
    <h2 className="mb-5 text-lg font-black text-[#6fb5f4] md:text-xl">
      {title}
    </h2>
    {children}
  </div>
);

const StatusBadge = ({ active }) => (
  <span
    className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${
      active
        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
        : "border-red-500/40 bg-red-500/10 text-red-300"
    }`}
  >
    {active ? "Active" : "Inactive"}
  </span>
);

const InfoRow = ({ label, value }) => (
  <div className="mb-2 flex items-center justify-between gap-3 rounded-xl bg-black/25 px-3 py-2 text-sm last:mb-0">
    <span className="font-bold text-slate-400">{label}</span>
    <span className="text-right font-bold text-white">{value}</span>
  </div>
);

export default SingleAffiliateDetails;
