import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash, FaKey, FaSave, FaSyncAlt, FaTrash } from "react-icons/fa";
import { api } from "../../api/axios";

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

// A single clickable element (not a <label> wrapping a nested <button>) —
// the whole row toggles on click, not just the small switch nub, and it
// avoids the invalid-markup quirks of nesting a button inside a label with
// no associated form control.
const Toggle = ({ checked, onChange, label, description }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl border border-blue-300/20 bg-black/30 p-4 text-left transition hover:bg-blue-900/10"
  >
    <div>
      <p className="text-sm font-semibold text-white">{label}</p>
      {description ? (
        <p className="mt-1 text-xs text-blue-100/60">{description}</p>
      ) : null}
    </div>

    <span
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
        checked ? "bg-[#3ea0ff]" : "bg-white/15"
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </span>
  </button>
);

const OtpSetting = () => {
  const qc = useQueryClient();

  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [registerEnabled, setRegisterEnabled] = useState(true);
  const [forgotPasswordEnabled, setForgotPasswordEnabled] = useState(true);
  const [withdrawEnabled, setWithdrawEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    data: settingRes,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["otp-setting"],
    queryFn: async () => {
      const res = await api.get("/api/otp-setting");
      return res.data;
    },
  });

  useEffect(() => {
    const data = settingRes?.data;
    if (!data) return;

    setApiKey(data.apiKey || "");
    setRegisterEnabled(data.registerEnabled !== false);
    setForgotPasswordEnabled(data.forgotPasswordEnabled !== false);
    setWithdrawEnabled(data.withdrawEnabled !== false);
  }, [settingRes]);

  const handleSave = async () => {
    try {
      setSaving(true);

      await api.put("/api/otp-setting", {
        apiKey,
        registerEnabled,
        forgotPasswordEnabled,
        withdrawEnabled,
      });

      toast.success("OTP setting saved");
      qc.invalidateQueries({ queryKey: ["otp-setting"] });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save setting");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteKey = async () => {
    const ok = window.confirm("Are you sure you want to remove the API key?");
    if (!ok) return;

    try {
      setDeleting(true);

      await api.delete("/api/otp-setting/api-key");
      setApiKey("");

      toast.success("API key removed");
      qc.invalidateQueries({ queryKey: ["otp-setting"] });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove key");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <div className={`${sectionCard} p-5 lg:p-6`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] shadow-lg shadow-blue-500/40">
                <FaKey className="text-2xl text-white" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-white">
                  OTP SMS Settings
                </h1>
                <p className="text-sm text-blue-100/80">
                  SMS API key এখান থেকেই manage করো, আর কোন কোন জায়গায় OTP
                  লাগবে সেটাও এখান থেকে নিয়ন্ত্রণ করো।
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
        </div>

        <div className={`${sectionCard} p-5 lg:p-6`}>
          <h2 className="mb-4 text-xl font-bold">SMS API Key</h2>

          <label className={labelCls}>o-sms.com API Key</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="API key দাও"
                className={inputBase}
                disabled={isLoading}
              />

              <button
                type="button"
                onClick={() => setShowKey((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-blue-100/70"
              >
                {showKey ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button
              type="button"
              onClick={handleDeleteKey}
              disabled={deleting || !apiKey}
              className={btnDanger}
            >
              <span className="flex items-center gap-2">
                <FaTrash />
                Delete
              </span>
            </button>
          </div>

          <p className="mt-2 text-xs text-blue-100/50">
            API key খালি রাখলে .env-এর OTP_API_KEY ব্যবহার হবে (fallback)।
          </p>
        </div>

        <div className={`${sectionCard} p-5 lg:p-6`}>
          <h2 className="mb-4 text-xl font-bold">
            কোন কোন জায়গায় OTP কাজ করবে
          </h2>

          <div className="space-y-3">
            <Toggle
              checked={registerEnabled}
              onChange={setRegisterEnabled}
              label="Register"
              description="নতুন একাউন্ট খোলার সময় ফোন নম্বর OTP দিয়ে verify করতে হবে"
            />

            <Toggle
              checked={forgotPasswordEnabled}
              onChange={setForgotPasswordEnabled}
              label="Forget Password"
              description="পাসওয়ার্ড রিসেট করার সময় OTP verify করতে হবে"
            />

            <Toggle
              checked={withdrawEnabled}
              onChange={setWithdrawEnabled}
              label="Withdraw (E-wallet Add)"
              description="নতুন e-wallet নাম্বার যোগ করার সময় OTP verify করতে হবে"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || isLoading}
          className={`${btnPrimary} flex w-full items-center justify-center gap-2 py-3.5`}
        >
          <FaSave />
          {saving ? "Saving..." : "Save Setting"}
        </button>
      </div>
    </div>
  );
};

export default OtpSetting;
