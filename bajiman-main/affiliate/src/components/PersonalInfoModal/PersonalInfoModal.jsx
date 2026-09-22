import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, User, Mail, Phone, BadgeCheck, Save, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import api from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";
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
  disabledBg: "#a6a6a6",
  disabledText: "#ffffff",
};

const InputField = ({
  label,
  value,
  onChange,
  icon,
  disabled = false,
  placeholder = "",
  type = "text",
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
          {icon}
        </span>

        <input
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          className="h-[42px] w-full rounded-[4px] border pl-10 pr-3 text-[14px] outline-none disabled:cursor-not-allowed"
          style={{
            backgroundColor: disabled ? colors.sectionBg : colors.inputBg,
            color: disabled ? colors.mutedText : colors.inputText,
            borderColor: colors.inputBorder,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = colors.inputFocusBorder;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = colors.inputBorder;
          }}
        />
      </div>
    </div>
  );
};

const PersonalInfoModal = ({ open, onClose, onUpdated }) => {
  const { isBangla } = useLanguage();

  const modalColorSetting = useSelector(selectModalColorSetting);
  const colors = {
    ...defaultModalColors,
    ...(modalColorSetting || {}),
  };

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    userId: "",
    countryCode: "",
    phone: "",
    email: "",
    firstName: "",
    lastName: "",
  });

  const t = {
    title: isBangla ? "ব্যক্তিগত তথ্য" : "Personal Info",
    subtitle: isBangla
      ? "আপনার অ্যাকাউন্টের তথ্য দেখুন এবং প্রয়োজনীয় তথ্য আপডেট করুন।"
      : "View your account information and update your details.",
    username: isBangla ? "ইউজারনেম" : "Username",
    usernameNote: isBangla
      ? "ইউজারনেম পরিবর্তন করা যাবে না"
      : "Username cannot be changed",
    countryCode: isBangla ? "দেশের কোড" : "Country Code",
    phone: isBangla ? "ফোন নাম্বার" : "Phone Number",
    email: isBangla ? "ইমেইল" : "Email",
    firstName: isBangla ? "ফার্স্ট নেম" : "First Name",
    lastName: isBangla ? "লাস্ট নেম" : "Last Name",
    loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
    save: isBangla ? "সেভ করুন" : "Save Changes",
    saving: isBangla ? "সেভ হচ্ছে..." : "Saving...",
    required: isBangla
      ? "দেশের কোড এবং ফোন নাম্বার প্রয়োজন"
      : "Country code and phone number are required",
    updateSuccess: isBangla
      ? "তথ্য সফলভাবে আপডেট হয়েছে"
      : "Information updated successfully",
    updateFailed: isBangla
      ? "তথ্য আপডেট করা যায়নি"
      : "Failed to update information",
    fetchFailed: isBangla ? "তথ্য লোড করা যায়নি" : "Failed to load information",
  };

  const fullName = useMemo(() => {
    const name = `${form.firstName || ""} ${form.lastName || ""}`.trim();
    return name || form.userId || "User";
  }, [form.firstName, form.lastName, form.userId]);

  const setField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const fetchUserInfo = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/user-info/me");
      const user = res?.data?.data?.user || {};

      setForm({
        userId: user.userId || "",
        countryCode: user.countryCode || "",
        phone: user.phone || "",
        email: user.email || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || t.fetchFailed);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchUserInfo();
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    if (!form.countryCode.trim() || !form.phone.trim()) {
      toast.error(t.required);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        countryCode: form.countryCode.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
      };

      const res = await api.patch("/api/user-info/me", payload);
      const user = res?.data?.data?.user || {};

      setForm({
        userId: user.userId || "",
        countryCode: user.countryCode || "",
        phone: user.phone || "",
        email: user.email || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      });

      toast.success(res?.data?.message || t.updateSuccess);
      onUpdated?.(user);
    } catch (error) {
      toast.error(error?.response?.data?.message || t.updateFailed);
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
            className="relative flex h-screen w-full flex-col overflow-hidden shadow-2xl sm:h-[700px] sm:max-w-[430px] sm:rounded-[8px]"
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
                onClick={onClose}
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
                    <User size={24} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-bold">{fullName}</p>
                    <p className="mt-1 text-[12px] opacity-80">{t.subtitle}</p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="flex-1 overflow-y-auto px-4 py-4"
              style={{ backgroundColor: colors.sectionBg }}
            >
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <div
                    className="flex items-center gap-2 rounded-[6px] px-4 py-3 text-[14px] font-bold shadow-sm"
                    style={{
                      backgroundColor: colors.cardBg,
                      color: colors.primaryBg,
                    }}
                  >
                    <Loader2 size={18} className="animate-spin" />
                    {t.loading}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div
                    className="rounded-[6px] border p-4 shadow-sm"
                    style={{
                      backgroundColor: colors.cardBg,
                      borderColor: colors.cardBorder,
                    }}
                  >
                    <InputField
                      label={t.username}
                      value={form.userId}
                      onChange={() => {}}
                      disabled
                      icon={<BadgeCheck size={17} />}
                      colors={colors}
                    />

                    <p
                      className="mt-2 text-[12px] font-medium"
                      style={{ color: colors.mutedText }}
                    >
                      {t.usernameNote}
                    </p>
                  </div>

                  <div
                    className="rounded-[6px] border p-4 shadow-sm"
                    style={{
                      backgroundColor: colors.cardBg,
                      borderColor: colors.cardBorder,
                    }}
                  >
                    <div className="grid grid-cols-[95px_1fr] gap-3">
                      <InputField
                        label={t.countryCode}
                        value={form.countryCode}
                        onChange={(e) =>
                          setField("countryCode", e.target.value)
                        }
                        icon={<Phone size={17} />}
                        placeholder="+880"
                        colors={colors}
                      />

                      <InputField
                        label={t.phone}
                        value={form.phone}
                        onChange={(e) =>
                          setField(
                            "phone",
                            e.target.value.replace(/[^\d]/g, ""),
                          )
                        }
                        icon={<Phone size={17} />}
                        placeholder="1XXXXXXXXX"
                        type="tel"
                        colors={colors}
                      />
                    </div>
                  </div>

                  <div
                    className="rounded-[6px] border p-4 shadow-sm"
                    style={{
                      backgroundColor: colors.cardBg,
                      borderColor: colors.cardBorder,
                    }}
                  >
                    <InputField
                      label={t.email}
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      icon={<Mail size={17} />}
                      placeholder="example@mail.com"
                      type="email"
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
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <InputField
                        label={t.firstName}
                        value={form.firstName}
                        onChange={(e) => setField("firstName", e.target.value)}
                        icon={<User size={17} />}
                        placeholder="First Name"
                        colors={colors}
                      />

                      <InputField
                        label={t.lastName}
                        value={form.lastName}
                        onChange={(e) => setField("lastName", e.target.value)}
                        icon={<User size={17} />}
                        placeholder="Last Name"
                        colors={colors}
                      />
                    </div>
                  </div>
                </form>
              )}
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
                disabled={loading || saving}
                className="flex h-[42px] w-full cursor-pointer items-center justify-center gap-2 rounded-[4px] text-[14px] font-bold disabled:cursor-not-allowed"
                style={{
                  backgroundColor:
                    loading || saving ? colors.disabledBg : colors.primaryBg,
                  color:
                    loading || saving
                      ? colors.disabledText
                      : colors.primaryText,
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

export default PersonalInfoModal;
