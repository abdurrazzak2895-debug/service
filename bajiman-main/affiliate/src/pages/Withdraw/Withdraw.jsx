import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  HelpCircle,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { api } from "../../api/axios";
import {
  selectAffiliateUser,
  selectAffiliateToken,
  selectIsAuthenticated,
} from "../../features/auth/authSelectors";

const API_URL = import.meta.env.VITE_API_URL || "";

const money = (value, currency = "BDT") => {
  const symbol = String(currency || "BDT").toUpperCase() === "USDT" ? "$" : "৳";
  const num = Number(value || 0);

  return `${symbol} ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const cardCls =
  "rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.07] shadow-2xl shadow-black/50 backdrop-blur-xl";

const inputCls =
  "mt-2 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#1A79D3]/60 focus:shadow-[0_0_25px_rgba(26,121,211,0.20)] disabled:cursor-not-allowed disabled:opacity-60";

const btnPrimary =
  "cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-5 py-3 text-sm font-black text-white shadow-[0_18px_50px_rgba(26,121,211,0.25)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60";

const btnGhost =
  "cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-5 py-3 text-sm font-bold text-slate-100 transition hover:bg-[#1A79D3]/20 disabled:cursor-not-allowed disabled:opacity-60";

const labelCls = "mb-2 block text-sm font-bold text-slate-200";

const MiniCard = ({ label, value, icon, color = "text-[#6fb5f4]" }) => (
  <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-bold text-slate-400">{label}</p>
        <h3 className={`mt-1 text-2xl font-black ${color}`}>{value}</h3>
      </div>

      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#1A79D3]/25 bg-[#1A79D3]/15 text-[#6fb5f4]">
        {icon}
      </div>
    </div>
  </div>
);

const NoticeBox = ({ type = "info", title, message }) => {
  const cls = {
    success: "border-emerald-400/30 bg-emerald-500/15 text-emerald-200",
    danger: "border-red-400/30 bg-red-500/15 text-red-200",
    warning: "border-amber-400/30 bg-amber-500/15 text-amber-200",
    info: "border-[#1A79D3]/25 bg-[#1A79D3]/10 text-slate-200",
  };

  return (
    <div className={`mt-5 rounded-3xl border p-4 ${cls[type] || cls.info}`}>
      <h3 className="text-sm font-black">{title}</h3>
      <p className="mt-1 text-sm opacity-90">{message}</p>
    </div>
  );
};

const Withdraw = () => {
  const navigate = useNavigate();

  const token = useSelector(selectAffiliateToken);
  const user = useSelector(selectAffiliateUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const accountOk = !!token && !!isAuthenticated;
  const currency = user?.currency || "BDT";

  const [methods, setMethods] = useState([]);
  const [loadingMethods, setLoadingMethods] = useState(false);

  const [eligLoading, setEligLoading] = useState(false);
  const [elig, setElig] = useState({
    eligible: false,
    remaining: 0,
    message: "",
    required: 5,
    activeReferralCount: 0,
    depositedReferralCount: 0,
    remainingReferralCount: 5,
  });

  const [selectedId, setSelectedId] = useState("");
  const [formValues, setFormValues] = useState({});
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const notices = [
    {
      title: "Referral Requirement",
      body: "Withdraw করতে হলে required referral condition complete থাকতে হবে.",
    },
    {
      title: "Bulk Adjustment First",
      body: "Affiliate commission wallet balance এ move না হলে withdraw করা যাবে না.",
    },
    {
      title: "Correct Account Information",
      body: "ভুল wallet/account information দিলে withdraw delay বা reject হতে পারে.",
    },
    {
      title: "Pending Request",
      body: "একটি pending withdraw request থাকলে নতুন request submit করা যাবে না.",
    },
  ];

  const loadMethods = async () => {
    try {
      setLoadingMethods(true);

      const { data } = await api.get("/api/aff-withdraw-methods");
      const rows = Array.isArray(data?.data) ? data.data : [];

      setMethods(rows);
    } catch (error) {
      setMethods([]);
      toast.error(
        error?.response?.data?.message || "Failed to load withdraw methods",
      );
    } finally {
      setLoadingMethods(false);
    }
  };

  const loadEligibility = async () => {
    if (!accountOk) {
      setElig({
        eligible: false,
        remaining: 0,
        message: "Please login to withdraw.",
        required: 5,
        activeReferralCount: 0,
        depositedReferralCount: 0,
        remainingReferralCount: 5,
      });
      return;
    }

    try {
      setEligLoading(true);

      const { data } = await api.get("/api/aff-withdraw-requests/eligibility");
      const payload = data?.data || {};

      setElig({
        eligible: !!payload.eligible,
        remaining: Number(payload.remaining || 0),
        message: payload.message || "",
        required: Number(payload.required || 5),
        activeReferralCount: Number(payload.activeReferralCount || 0),
        depositedReferralCount: Number(payload.depositedReferralCount || 0),
        remainingReferralCount: Number(payload.remainingReferralCount || 0),
      });
    } catch (error) {
      setElig({
        eligible: false,
        remaining: 0,
        message:
          error?.response?.data?.message || "Unable to check eligibility.",
        required: 5,
        activeReferralCount: 0,
        depositedReferralCount: 0,
        remainingReferralCount: 5,
      });
    } finally {
      setEligLoading(false);
    }
  };

  useEffect(() => {
    loadMethods();
  }, []);

  useEffect(() => {
    loadEligibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isAuthenticated]);

  const selectedMethod = useMemo(() => {
    return (
      methods.find(
        (method) => String(method.methodId) === String(selectedId),
      ) || null
    );
  }, [methods, selectedId]);

  useEffect(() => {
    if (!selectedId && methods.length) {
      setSelectedId(methods[0]?.methodId || "");
    }
  }, [methods, selectedId]);

  useEffect(() => {
    if (!selectedMethod) return;

    const next = {};

    (selectedMethod.fields || []).forEach((field) => {
      next[field.key] = "";
    });

    setFormValues(next);
  }, [selectedMethod?._id]);

  const min = Number(selectedMethod?.minimumWithdrawAmount || 0);
  const max = Number(selectedMethod?.maximumWithdrawAmount || 0);
  const hasMax = max > 0;
  const amountNum = Number(amount || 0);

  const fieldErrors = useMemo(() => {
    const errors = {};

    (selectedMethod?.fields || []).forEach((field) => {
      const value = String(formValues?.[field.key] || "").trim();

      if (field.required !== false && !value) {
        errors[field.key] = "This field is required";
        return;
      }

      if (!value) return;

      if (field.type === "email") {
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        if (!ok) errors[field.key] = "Enter a valid email";
      }

      if (field.type === "number") {
        const num = Number(value);
        if (!Number.isFinite(num)) errors[field.key] = "Numbers only";
      }

      if (field.type === "tel") {
        const bdOk = /^01[3-9]\d{8}$/.test(value);
        if (value.startsWith("01") && value.length >= 11 && !bdOk) {
          errors[field.key] = "Enter a valid Bangladeshi phone number";
        }
      }
    });

    return errors;
  }, [selectedMethod, formValues]);

  const allRequiredOk = useMemo(() => {
    for (const field of selectedMethod?.fields || []) {
      if (field.required !== false) {
        const value = String(formValues?.[field.key] || "").trim();
        if (!value) return false;
      }
    }

    return true;
  }, [selectedMethod, formValues]);

  const amountErrorText = useMemo(() => {
    if (!amount) return "";

    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return "Enter a valid amount.";
    }

    if (amountNum < min) {
      return `Minimum withdraw amount is ${money(min, currency)}.`;
    }

    if (hasMax && amountNum > max) {
      return `Maximum withdraw amount is ${money(max, currency)}.`;
    }

    if (amountNum > Number(elig.remaining || 0)) {
      return `You cannot withdraw more than ${money(elig.remaining, currency)}.`;
    }

    return "";
  }, [amount, amountNum, min, max, hasMax, elig.remaining, currency]);

  const validAmount =
    Number.isFinite(amountNum) &&
    amountNum > 0 &&
    amountNum >= min &&
    (!hasMax || amountNum <= max) &&
    amountNum <= Number(elig.remaining || 0);

  const noTypeErrors = Object.keys(fieldErrors).length === 0;

  const canSubmit =
    accountOk &&
    !!selectedMethod &&
    elig.eligible &&
    validAmount &&
    allRequiredOk &&
    noTypeErrors &&
    !eligLoading &&
    !submitting;

  const setVal = (key, value) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const refreshAll = () => {
    loadMethods();
    loadEligibility();
  };

  const onSubmit = async () => {
    if (!canSubmit) return;

    try {
      setSubmitting(true);

      await api.post("/api/aff-withdraw-requests", {
        methodId: selectedMethod.methodId,
        amount: amountNum,
        fields: { ...formValues },
      });

      toast.success("Withdraw request submitted successfully");

      setAmount("");

      const next = {};
      (selectedMethod?.fields || []).forEach((field) => {
        next[field.key] = "";
      });
      setFormValues(next);

      navigate("/dashboard/withdraw-history");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Withdraw request failed");
      loadEligibility();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050607] p-4 text-white md:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,121,211,0.28),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(26,121,211,0.18),transparent_38%)]" />

      <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#1A79D3]/20 blur-3xl" />
      <div className="absolute -right-24 bottom-16 h-80 w-80 rounded-full bg-[#1A79D3]/15 blur-3xl" />
      <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-[#1A79D3]/15 blur-3xl" />

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className={`${cardCls} p-5 md:p-8`}
        >
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-[#1A79D3]/30 bg-white/10 shadow-[0_0_45px_rgba(26,121,211,0.28)]">
                <Wallet className="h-8 w-8 text-[#1A79D3]" />
              </div>

              <div>
                <h1 className="bg-gradient-to-r from-[#6fb5f4] via-[#1A79D3] to-[#3ea0ff] bg-clip-text text-2xl font-black text-transparent md:text-3xl">
                  Withdraw
                </h1>

                <p className="mt-1 text-sm text-slate-300">
                  Submit your affiliate withdraw request.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={refreshAll}
              disabled={loadingMethods || eligLoading}
              className={btnGhost}
            >
              <RefreshCw
                className={
                  loadingMethods || eligLoading
                    ? "h-4 w-4 animate-spin"
                    : "h-4 w-4"
                }
              />
              Refresh
            </button>
          </div>

          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#1A79D3]/20 bg-[#1A79D3]/10 px-4 py-3">
            <Sparkles className="h-5 w-5 text-[#1A79D3]" />

            <div>
              <h2 className="text-sm font-bold text-white">
                Affiliate Withdraw Panel
              </h2>
              <p className="text-xs text-slate-300">
                Select method, fill account info and submit request.
              </p>
            </div>
          </div>

          {!accountOk && (
            <NoticeBox
              type="warning"
              title="Login Required"
              message="Please login to submit a withdraw request."
            />
          )}

          {accountOk && eligLoading && (
            <div className="mt-5 flex items-center gap-2 text-sm text-slate-300">
              <Loader2 className="h-4 w-4 animate-spin text-[#1A79D3]" />
              Checking eligibility...
            </div>
          )}

          {accountOk && !eligLoading && (
            <>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MiniCard
                  label="Required"
                  value={elig.required}
                  icon={<Users size={21} />}
                />

                <MiniCard
                  label="Active Referrals"
                  value={elig.activeReferralCount}
                  icon={<UserCheck size={21} />}
                  color="text-emerald-300"
                />

                <MiniCard
                  label="Deposited Referrals"
                  value={elig.depositedReferralCount}
                  icon={<CheckCircle size={21} />}
                  color="text-emerald-300"
                />

                <MiniCard
                  label="Remaining"
                  value={elig.remainingReferralCount}
                  icon={
                    elig.remainingReferralCount > 0 ? (
                      <XCircle size={21} />
                    ) : (
                      <CheckCircle size={21} />
                    )
                  }
                  color={
                    elig.remainingReferralCount > 0
                      ? "text-red-300"
                      : "text-emerald-300"
                  }
                />
              </div>

              {!elig.eligible ? (
                <NoticeBox
                  type="danger"
                  title="Withdrawal Not Allowed"
                  message={elig.message || "You are not eligible right now."}
                />
              ) : (
                <NoticeBox
                  type="success"
                  title="Withdrawal Allowed"
                  message="You are eligible to submit withdraw request."
                />
              )}

              <div className="mt-5 rounded-3xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 p-5">
                <p className="text-sm font-bold text-slate-300">
                  Withdrawable Balance
                </p>
                <h3 className="mt-1 text-2xl font-black text-white">
                  {money(elig.remaining || 0, currency)}
                </h3>
              </div>
            </>
          )}

          <div className="mt-7">
            <label className={labelCls}>Withdrawal Options *</label>

            <div className="mt-3 flex flex-wrap gap-3">
              {loadingMethods ? (
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Loader2 className="h-4 w-4 animate-spin text-[#1A79D3]" />
                  Loading methods...
                </div>
              ) : methods.length ? (
                methods.map((method) => {
                  const active = String(selectedId) === String(method.methodId);
                  const logo = method.logoUrl
                    ? `${API_URL}${method.logoUrl}`
                    : "";

                  return (
                    <button
                      key={method._id || method.methodId}
                      type="button"
                      onClick={() => setSelectedId(method.methodId)}
                      disabled={!accountOk}
                      className={`h-[82px] w-[185px] rounded-3xl border bg-black/35 p-3 transition ${
                        active
                          ? "border-[#6fb5f4] shadow-[0_0_35px_rgba(26,121,211,0.22)]"
                          : "border-white/10 hover:border-[#1A79D3]/50 hover:bg-[#1A79D3]/10"
                      } ${
                        accountOk
                          ? "cursor-pointer"
                          : "cursor-not-allowed opacity-60"
                      }`}
                      title={method?.name?.en || method.methodId}
                    >
                      {logo ? (
                        <img
                          src={logo}
                          alt={method?.name?.en || method.methodId}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-sm font-black text-white">
                          {method?.name?.en || method.methodId}
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <p className="text-sm text-slate-400">
                  No withdraw methods found.
                </p>
              )}
            </div>

            {selectedMethod && (
              <p className="mt-3 text-sm text-slate-400">
                Selected:{" "}
                <span className="font-black text-[#6fb5f4]">
                  {selectedMethod?.name?.en || selectedMethod.methodId}
                </span>
              </p>
            )}
          </div>

          {selectedMethod?.fields?.length > 0 && (
            <div className="mt-7">
              <h3 className="text-base font-black text-white">
                Account Information *
              </h3>

              <div className="mt-4 max-w-xl space-y-4">
                {selectedMethod.fields.map((field) => {
                  const label = field?.label?.en || field.key;
                  const placeholder = field?.placeholder?.en || "";
                  const error = fieldErrors?.[field.key];

                  return (
                    <div key={field.key}>
                      <label className={labelCls}>
                        {label}{" "}
                        {field.required !== false && (
                          <span className="text-red-400">*</span>
                        )}
                      </label>

                      <input
                        disabled={!accountOk}
                        type={field.type === "number" ? "text" : field.type}
                        inputMode={
                          field.type === "number" ? "numeric" : undefined
                        }
                        value={formValues?.[field.key] || ""}
                        onChange={(e) => setVal(field.key, e.target.value)}
                        placeholder={placeholder}
                        className={inputCls}
                      />

                      {error && (
                        <p className="mt-2 text-xs font-bold text-red-300">
                          {error}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-7 max-w-xl">
            <div className="flex items-center justify-between">
              <label className={labelCls}>Withdraw Amount *</label>
              <HelpCircle className="h-5 w-5 text-slate-400" />
            </div>

            <input
              disabled={!accountOk}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={
                hasMax
                  ? `Min ${money(min, currency)} - Max ${money(max, currency)}`
                  : `Min ${money(min, currency)}`
              }
              inputMode="numeric"
              className={inputCls}
            />

            {amountErrorText && (
              <p className="mt-2 text-xs font-bold text-red-300">
                {amountErrorText}
              </p>
            )}
          </div>

          <div className="mt-7 max-w-xl">
            <button
              type="button"
              onClick={onSubmit}
              disabled={!canSubmit}
              className={`${btnPrimary} w-full`}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" />
                  Submit Withdraw Request
                </>
              )}
            </button>

            {!canSubmit && !submitting && (
              <p className="mt-3 text-xs text-slate-400">
                {!accountOk
                  ? "Please login."
                  : eligLoading
                    ? "Checking eligibility."
                    : !elig.eligible
                      ? elig.message || "Not eligible right now."
                      : !selectedMethod
                        ? "Select a withdraw method."
                        : !allRequiredOk
                          ? "Fill all required fields."
                          : !noTypeErrors
                            ? "Some fields are invalid."
                            : !validAmount
                              ? "Amount is invalid."
                              : ""}
              </p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.05 }}
          className={`${cardCls} h-fit p-5`}
        >
          <h3 className="text-lg font-black text-white">Important Notice</h3>

          <div className="mt-4 space-y-4">
            {notices.map((notice, index) => (
              <div
                key={index}
                className="rounded-3xl border border-white/10 bg-black/30 p-4"
              >
                <h4 className="text-sm font-black text-[#6fb5f4]">
                  {index + 1}. {notice.title}
                </h4>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {notice.body}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Withdraw;
