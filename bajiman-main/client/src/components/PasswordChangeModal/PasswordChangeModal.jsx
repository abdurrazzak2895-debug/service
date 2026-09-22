import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Lock, Eye, EyeOff, Save, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import api from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";
import { logout } from "../../features/auth/authSlice";
import { selectModalColorSetting } from "../../features/global/globalSelectors";

const defaultModalColors = {
  modalBg: "#ffffff",
  pageOverlayBg: "rgba(0,0,0,0.45)",
  headerBg: "#0865a9",
  headerText: "#ffffff",
  closeIconColor: "#ffffff",
  primaryBg: "#0865a9",
  primaryText: "#ffffff",
  sectionBg: "#eef4ff",
  sectionBorder: "#97b6e9",
  sectionText: "#2451cc",
  cardBg: "#ffffff",
  cardBorder: "#dce8f5",
  inputBg: "#eeeeee",
  inputText: "#222222",
  inputBorder: "#d7d7d7",
  inputFocusBorder: "#0865a9",
  labelText: "#333333",
  normalText: "#333333",
  mutedText: "#777777",
  summaryBg: "#eef7ff",
  summaryText: "#0865a9",
  disabledBg: "#a6a6a6",
  disabledText: "#ffffff",
};

const PasswordInput = ({
  name,
  label,
  placeholder,
  value,
  showPassword,
  saving,
  onChange,
  onToggleShow,
  colors,
}) => {
  return (
    <div>
      <label
        className="mb-1.5 block text-[13px] font-bold"
        style={{ color: colors.labelText }}
      >
        {label}
      </label>

      <div className="relative">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: colors.primaryBg }}
        >
          <Lock size={17} />
        </span>

        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          disabled={saving}
          autoComplete="new-password"
          className="h-[42px] w-full rounded-[4px] border pl-10 pr-11 text-[14px] outline-none disabled:cursor-not-allowed"
          style={{
            backgroundColor: colors.inputBg,
            color: saving ? colors.mutedText : colors.inputText,
            borderColor: colors.inputBorder,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = colors.inputFocusBorder;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = colors.inputBorder;
          }}
        />

        <button
          type="button"
          onClick={() => onToggleShow(name)}
          disabled={saving}
          className="absolute right-2 top-1/2 flex h-[28px] w-[28px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-[4px] disabled:cursor-not-allowed disabled:opacity-60"
          style={{ color: colors.primaryBg }}
        >
          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
};

const PasswordChangeModal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { isBangla } = useLanguage();

  const modalColorSetting = useSelector(selectModalColorSetting);
  const colors = {
    ...defaultModalColors,
    ...(modalColorSetting || {}),
  };

  const [saving, setSaving] = useState(false);

  const [show, setShow] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const t = {
    title: isBangla ? "পাসওয়ার্ড পরিবর্তন" : "Change Password",
    subtitle: isBangla
      ? "আপনার অ্যাকাউন্ট সুরক্ষিত রাখতে নিয়মিত পাসওয়ার্ড পরিবর্তন করুন।"
      : "Change your password regularly to keep your account secure.",
    currentPassword: isBangla ? "বর্তমান পাসওয়ার্ড" : "Current Password",
    newPassword: isBangla ? "নতুন পাসওয়ার্ড" : "New Password",
    confirmPassword: isBangla ? "কনফার্ম পাসওয়ার্ড" : "Confirm Password",
    currentPlaceholder: isBangla
      ? "বর্তমান পাসওয়ার্ড লিখুন"
      : "Enter current password",
    newPlaceholder: isBangla ? "নতুন পাসওয়ার্ড লিখুন" : "Enter new password",
    confirmPlaceholder: isBangla
      ? "আবার নতুন পাসওয়ার্ড লিখুন"
      : "Re-enter new password",
    save: isBangla ? "পাসওয়ার্ড আপডেট করুন" : "Update Password",
    saving: isBangla ? "আপডেট হচ্ছে..." : "Updating...",
    required: isBangla
      ? "সব পাসওয়ার্ড ফিল্ড পূরণ করুন"
      : "Fill all password fields",
    min: isBangla
      ? "নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"
      : "New password must be at least 6 characters",
    notMatch: isBangla
      ? "কনফার্ম পাসওয়ার্ড মিলছে না"
      : "Confirm password does not match",
    same: isBangla
      ? "নতুন পাসওয়ার্ড বর্তমান পাসওয়ার্ডের মতো হতে পারবে না"
      : "New password must be different from current password",
    success: isBangla
      ? "পাসওয়ার্ড আপডেট হয়েছে, আবার লগইন করুন"
      : "Password updated, please login again",
    failed: isBangla
      ? "পাসওয়ার্ড আপডেট করা যায়নি"
      : "Failed to update password",
    note: isBangla
      ? "পাসওয়ার্ড সফলভাবে পরিবর্তন হলে আপনাকে স্বয়ংক্রিয়ভাবে লগআউট করা হবে।"
      : "After changing password successfully, you will be logged out automatically.",
  };

  const setField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleShow = (key) => {
    setShow((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const resetForm = () => {
    setForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setShow({
      currentPassword: false,
      newPassword: false,
      confirmPassword: false,
    });
  };

  const handleClose = () => {
    if (saving) return;
    resetForm();
    onClose?.();
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    if (
      !form.currentPassword.trim() ||
      !form.newPassword.trim() ||
      !form.confirmPassword.trim()
    ) {
      toast.error(t.required);
      return;
    }

    if (form.newPassword.length < 6) {
      toast.error(t.min);
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error(t.notMatch);
      return;
    }

    if (form.currentPassword === form.newPassword) {
      toast.error(t.same);
      return;
    }

    try {
      setSaving(true);

      const res = await api.patch("/api/user-info/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });

      toast.success(res?.data?.message || t.success);

      resetForm();
      onClose?.();
      dispatch(logout());
    } catch (error) {
      toast.error(error?.response?.data?.message || t.failed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center px-0 backdrop-blur-[3px] sm:px-4"
          style={{ background: colors.pageOverlayBg }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative flex h-dvh w-full flex-col overflow-hidden shadow-2xl sm:h-[700px] sm:max-w-[430px] sm:rounded-[8px]"
            style={{ backgroundColor: colors.modalBg }}
          >
            <div
              className="relative flex h-[50px] shrink-0 items-center justify-center"
              style={{
                backgroundColor: colors.headerBg,
                color: colors.headerText,
              }}
            >
              <h2 className="text-[18px] font-semibold">{t.title}</h2>

              <button
                type="button"
                onClick={handleClose}
                disabled={saving}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
                style={{ color: colors.closeIconColor }}
              >
                <X size={24} />
              </button>
            </div>

            <div
              className="shrink-0 px-4 pb-4"
              style={{ backgroundColor: colors.headerBg }}
            >
              <div
                className="rounded-[4px] px-4 py-3"
                style={{
                  backgroundColor: "rgba(255,255,255,0.10)",
                  color: colors.headerText,
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
                    <ShieldCheck size={24} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[15px] font-bold">{t.title}</p>
                    <p className="mt-1 text-[12px] leading-5 opacity-80">
                      {t.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="flex-1 overflow-y-auto px-4 py-4"
              style={{ backgroundColor: colors.sectionBg }}
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div
                  className="rounded-[6px] border p-4 shadow-sm"
                  style={{
                    backgroundColor: colors.cardBg,
                    borderColor: colors.cardBorder,
                  }}
                >
                  <PasswordInput
                    name="currentPassword"
                    label={t.currentPassword}
                    placeholder={t.currentPlaceholder}
                    value={form.currentPassword}
                    showPassword={show.currentPassword}
                    saving={saving}
                    onChange={setField}
                    onToggleShow={toggleShow}
                    colors={colors}
                  />
                </div>

                <div
                  className="rounded-[6px] border p-4 shadow-sm"
                  style={{
                    backgroundColor: colors.cardBg,
                    borderColor: colors.cardBorder,
                  }}
                >
                  <PasswordInput
                    name="newPassword"
                    label={t.newPassword}
                    placeholder={t.newPlaceholder}
                    value={form.newPassword}
                    showPassword={show.newPassword}
                    saving={saving}
                    onChange={setField}
                    onToggleShow={toggleShow}
                    colors={colors}
                  />
                </div>

                <div
                  className="rounded-[6px] border p-4 shadow-sm"
                  style={{
                    backgroundColor: colors.cardBg,
                    borderColor: colors.cardBorder,
                  }}
                >
                  <PasswordInput
                    name="confirmPassword"
                    label={t.confirmPassword}
                    placeholder={t.confirmPlaceholder}
                    value={form.confirmPassword}
                    showPassword={show.confirmPassword}
                    saving={saving}
                    onChange={setField}
                    onToggleShow={toggleShow}
                    colors={colors}
                  />
                </div>

                <div
                  className="rounded-[6px] border p-4 text-[12px] leading-6"
                  style={{
                    backgroundColor: colors.summaryBg,
                    borderColor: colors.cardBorder,
                    color: colors.summaryText,
                  }}
                >
                  {t.note}
                </div>
              </form>
            </div>

            <div
              className="shrink-0 border-t px-4 py-3"
              style={{
                backgroundColor: colors.modalBg,
                borderColor: colors.cardBorder,
              }}
            >
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="flex h-[42px] w-full cursor-pointer items-center justify-center gap-2 rounded-[4px] text-[14px] font-bold disabled:cursor-not-allowed"
                style={{
                  backgroundColor: saving
                    ? colors.disabledBg
                    : colors.primaryBg,
                  color: saving ? colors.disabledText : colors.primaryText,
                }}
              >
                {saving ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    {t.saving}
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    {t.save}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PasswordChangeModal;
