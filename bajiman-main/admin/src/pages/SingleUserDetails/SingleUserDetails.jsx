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
  Wallet,
} from "lucide-react";
import { api } from "../../api/axios";
import SingleUserManualDepositHistory from "../../components/SingleUserManualDepositHistory/SingleUserManualDepositHistory";
import SingleUserAutoDepositHistory from "../../components/SingleUserAutoDepositHistory/SingleUserAutoDepositHistory";
import SingleUserWithdrawHistory from "../../components/SingleUserWithdrawHistory/SingleUserWithdrawHistory";
import SingleUserGameHistory from "../../components/SingleUserGameHistory/SingleUserGameHistory";
import SingleUserTurnOverHistory from "../../components/SingleUserTurnOverHistory/SingleUserTurnOverHistory";

const SingleUserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    userId: "",
    email: "",
    phone: "",
    countryCode: "+880",
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
    userGamePlayName: "",
    referralCount: 0,
    referredByUserId: "",
    referredByPhone: "",
    referredByEmail: "",
    referredByCode: "",
    createdAt: "",
    updatedAt: "",
  });

  const fetchDetails = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const { data } = await api.get(`/api/users/admin/users/${id}/details`);

      const user = data?.data?.user;

      if (data?.success && user) {
        setFormData({
          userId: user?.userId || "",
          email: user?.email || "",
          phone: user?.phone || "",
          countryCode: user?.countryCode || "+880",
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          password: "",
          isActive: Boolean(user?.isActive),
          currency: user?.currency || "BDT",
          balance: Number(user?.balance || 0),

          commissionBalance: Number(user?.commissionBalance || 0),
          gameLossCommission: Number(user?.gameLossCommission || 0),
          depositCommission: Number(user?.depositCommission || 0),
          referCommission: Number(user?.referCommission || 0),
          gameWinCommission: Number(user?.gameWinCommission || 0),

          gameLossCommissionBalance: Number(
            user?.gameLossCommissionBalance || 0,
          ),
          depositCommissionBalance: Number(user?.depositCommissionBalance || 0),
          referCommissionBalance: Number(user?.referCommissionBalance || 0),
          gameWinCommissionBalance: Number(user?.gameWinCommissionBalance || 0),

          role: user?.role || "user",
          referralCode: user?.referralCode || "",
          userGamePlayName: user?.userGamePlayName || "",
          referralCount: Number(user?.referralCount || 0),
          referredByUserId: user?.referredBy?.userId || "",
          referredByPhone: user?.referredBy?.phone || "",
          referredByEmail: user?.referredBy?.email || "",
          referredByCode: user?.referredBy?.referralCode || "",
          createdAt: user?.createdAt || "",
          updatedAt: user?.updatedAt || "",
        });
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load user details",
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
        label: "Referral Count",
        value: formData.referralCount,
        icon: BadgeCheck,
      },
      {
        label: "Account Status",
        value: formData.isActive ? "Active" : "Inactive",
        icon: formData.isActive ? UserCheck : UserX,
      },
    ],
    [formData],
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

  const handleCountryCodeChange = (e) => {
    let value = e.target.value.replace(/[^\d+]/g, "");

    if (value && !value.startsWith("+")) {
      value = `+${value}`;
    }

    setFormData((prev) => ({
      ...prev,
      countryCode: value.slice(0, 8),
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

      if (!formData.countryCode.trim()) {
        toast.error("Country code is required");
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
        countryCode: formData.countryCode.trim(),
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
        `/api/users/admin/users/${id}/details`,
        payload,
      );

      if (data?.success) {
        toast.success(data?.message || "User updated successfully");
        fetchDetails(true);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-[#1A79D3]/20 bg-white/[0.07] px-6 py-4 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <Loader2 className="h-6 w-6 animate-spin text-[#1A79D3]" />
          Loading user details...
        </div>
      </div>
    );
  }

  return (
    <>
      {" "}
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
                    User Management
                  </span>
                </div>

                <h1 className="bg-gradient-to-r from-[#6fb5f4] via-[#1A79D3] to-[#3ea0ff] bg-clip-text text-2xl font-black text-transparent md:text-3xl">
                  Single User Details
                </h1>

                <p className="mt-2 text-sm text-slate-300">
                  Update user information, wallet balance, account status and
                  commission settings.
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

          <Section title="Editable User Information">
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

              <InputField label="Country Code">
                <input
                  type="text"
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleCountryCodeChange}
                  placeholder="+880"
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
                label="Refer Commission"
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

          <Section title="Read Only User Information">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <ReadOnlyField label="Role" value={formData.role || "user"} />
              <ReadOnlyField
                label="Game Play Name"
                value={formData.userGamePlayName || "N/A"}
              />
              <ReadOnlyField
                label="Referral Code"
                value={formData.referralCode || "N/A"}
              />
              <ReadOnlyField
                label="Referral Count"
                value={formData.referralCount}
              />
              <ReadOnlyField
                label="Referred By User"
                value={formData.referredByUserId || "N/A"}
              />
              <ReadOnlyField
                label="Referred By Phone"
                value={formData.referredByPhone || "N/A"}
              />
              <ReadOnlyField
                label="Referred By Email"
                value={formData.referredByEmail || "N/A"}
              />
              <ReadOnlyField
                label="Referred By Code"
                value={formData.referredByCode || "N/A"}
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
        </motion.div>
      </div>
      <SingleUserGameHistory userId={id} />
      <SingleUserManualDepositHistory userId={id} />
      <SingleUserAutoDepositHistory userId={id} />
      <SingleUserTurnOverHistory userId={id} />
      <SingleUserWithdrawHistory userId={id} />
    </>
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

export default SingleUserDetails;
