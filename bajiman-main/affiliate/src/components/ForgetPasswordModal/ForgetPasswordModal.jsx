import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Eye, EyeOff, Search, X } from "lucide-react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import { useLanguage } from "../../Context/LanguageProvider";
import api from "../../api/axios";
import { selectForgetPasswordModalSetting } from "../../features/global/globalSelectors";

const fallbackLogoUrl =
  "https://img.c88rx.com/cx/h5/assets/images/member-logo.png?v=1780386038573";

const defaultSetting = {
  logo: "",
  logoUrl: "",

  overlayBg: "rgba(0,0,0,0.45)",
  modalBg: "#ffffff",
  headerBg: "#0865a9",
  headerText: "#ffffff",

  labelText: "#333333",
  inputBg: "#eeeeee",
  inputText: "#222222",
  inputBorder: "#d7d7d7",
  placeholderText: "#8c98a3",

  iconText: "#999999",

  buttonBg: "#0865a9",
  buttonText: "#ffffff",
  buttonDisabledBg: "#a6a6a6",

  secondaryButtonBg: "#ffffff",
  secondaryButtonText: "#0865a9",
  secondaryButtonBorder: "#0865a9",

  linkText: "#0069b4",
  footerText: "#8d8d8d",

  dropdownBg: "#ffffff",
  dropdownText: "#111111",
  dropdownBorder: "#dddddd",
  dropdownHoverBg: "#f5f5f5",
};

const normalizePhoneForBd = (phone = "") => {
  const cleanPhone = String(phone || "").replace(/\D/g, "");

  if (cleanPhone && !cleanPhone.startsWith("0")) {
    return `0${cleanPhone}`;
  }

  return cleanPhone;
};

const ForgetPasswordModal = ({
  open,
  onClose,
  onLoginClick,
  setting: customSetting = {},
}) => {
  const { isBangla } = useLanguage();

  const forgetPasswordModalSetting = useSelector(
    selectForgetPasswordModalSetting,
  );

  const setting = {
    ...defaultSetting,
    ...(forgetPasswordModalSetting || {}),
    ...(customSetting || {}),
  };

  const logoUrl = setting.logoUrl || setting.logo || fallbackLogoUrl;

  const [step, setStep] = useState(1);

  const [phone, setPhone] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState(0);
  const [countdown, setCountdown] = useState(0);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [countries, setCountries] = useState([]);
  const [countryOpen, setCountryOpen] = useState(false);
  const [search, setSearch] = useState("");

  const countryRef = useRef(null);

  const [selected, setSelected] = useState({
    name: "Bangladesh",
    code: "+880",
    cca2: "BD",
    flag: "https://flagcdn.com/w40/bd.png",
  });

  const isBangladeshSelected =
    selected?.cca2 === "BD" || selected?.code === "+880";

  const text = useMemo(
    () => ({
      title: isBangla ? "পাসওয়ার্ড ভুলে গেছেন" : "Forgot Password",

      phone: isBangla ? "ফোন নম্বর" : "Phone Number",
      phonePh: isBangla ? "আপনার ফোন নম্বর দিন।" : "Enter your phone number.",
      searchCountry: isBangla ? "দেশ খুঁজুন..." : "Search country...",

      sendOtp: isBangla ? "OTP পাঠান" : "Send OTP",
      resendOtp: isBangla ? "আবার OTP পাঠান" : "Resend OTP",
      sendingOtp: isBangla ? "OTP পাঠানো হচ্ছে..." : "Sending OTP...",
      otpCode: isBangla ? "OTP কোড" : "OTP Code",
      otpPh: isBangla ? "OTP কোড লিখুন" : "Enter OTP code",
      verifyOtp: isBangla ? "OTP যাচাই করুন" : "Verify OTP",
      verifying: isBangla ? "যাচাই হচ্ছে..." : "Verifying...",

      next: isBangla ? "পরবর্তী" : "Next",
      back: isBangla ? "আগের ধাপে যান" : "Back",

      newPassword: isBangla ? "নতুন পাসওয়ার্ড" : "New Password",
      newPasswordPh: isBangla ? "নতুন পাসওয়ার্ড দিন" : "Enter new password",
      confirmPassword: isBangla ? "কনফার্ম পাসওয়ার্ড" : "Confirm Password",
      confirmPasswordPh: isBangla
        ? "কনফার্ম পাসওয়ার্ড দিন"
        : "Enter confirm password",

      resetPassword: isBangla ? "পাসওয়ার্ড সেট করুন" : "Reset Password",
      resetting: isBangla ? "সেট হচ্ছে..." : "Resetting...",

      backLogin: isBangla ? "লগইন পেজে যান" : "Back to Login",

      enterPhone: isBangla ? "ফোন নম্বর দিন" : "Enter phone number",
      phoneLength: isBangla
        ? "সঠিক ফোন নম্বর দিন"
        : "Enter a valid phone number",
      enterOtp: isBangla ? "OTP কোড দিন" : "Enter OTP code",
      otpExpired: isBangla
        ? "OTP মেয়াদ শেষ। আবার OTP পাঠান"
        : "OTP expired. Send OTP again",

      enterPassword: isBangla ? "নতুন পাসওয়ার্ড দিন" : "Enter new password",
      passwordLength: isBangla
        ? "পাসওয়ার্ড ৬-২০ অক্ষরের হতে হবে"
        : "Password must be 6-20 characters",
      confirmRequired: isBangla
        ? "কনফার্ম পাসওয়ার্ড দিন"
        : "Enter confirm password",
      passwordMismatch: isBangla
        ? "পাসওয়ার্ড মিলছে না"
        : "Password does not match",
      success: isBangla
        ? "পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে"
        : "Password reset successful",
    }),
    [isBangla],
  );

  const cleanPhone = String(phone || "").replace(/\D/g, "");
  const finalSubmitPhone = isBangladeshSelected
    ? normalizePhoneForBd(cleanPhone)
    : cleanPhone;

  const resetOtp = () => {
    setOtpInput("");
    setOtpVerified(false);
    setOtpExpiresAt(0);
    setCountdown(0);
  };

  const resetForm = () => {
    setStep(1);
    setPhone("");
    resetOtp();
    setNewPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setCountryOpen(false);
    setSearch("");
  };

  const handleClose = () => {
    if (otpSending || otpVerifying || resetting) return;
    onClose?.();
    setCountryOpen(false);
    setSearch("");
  };

  const handleBackToLogin = () => {
    if (otpSending || otpVerifying || resetting) return;

    resetForm();

    if (onLoginClick) {
      onLoginClick();
    } else {
      onClose?.();
    }
  };

  useEffect(() => {
    if (!open) return;

    const loadCountries = async () => {
      try {
        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca2,idd,flags",
        );
        const data = await res.json();

        const list = (Array.isArray(data) ? data : [])
          .map((c) => {
            const root = c?.idd?.root || "";
            const suffix = c?.idd?.suffixes?.[0] || "";
            const code = `${root}${suffix}`.trim();

            return {
              name: c?.name?.common || "",
              code,
              cca2: c?.cca2 || "",
              flag:
                c?.flags?.png ||
                `https://flagcdn.com/w40/${String(
                  c?.cca2 || "",
                ).toLowerCase()}.png`,
            };
          })
          .filter((item) => item.name && item.code && item.cca2)
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(list);

        const bd = list.find((item) => item.cca2 === "BD");
        if (bd) setSelected(bd);
      } catch (error) {
        console.error("Country fetch failed:", error);
      }
    };

    loadCountries();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (countryRef.current && !countryRef.current.contains(event.target)) {
        setCountryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (!isBangladeshSelected) {
      resetOtp();
    }
  }, [isBangladeshSelected]);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    if (!otpExpiresAt) return;

    const timer = setTimeout(
      () => {
        resetOtp();
      },
      Math.max(0, otpExpiresAt - Date.now()),
    );

    return () => clearTimeout(timer);
  }, [otpExpiresAt]);

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return countries;

    return countries.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.cca2.toLowerCase().includes(q),
    );
  }, [countries, search]);

  const validatePhone = () => {
    if (!cleanPhone) {
      toast.error(text.enterPhone);
      return false;
    }

    if (cleanPhone.length < 6) {
      toast.error(text.phoneLength);
      return false;
    }

    return true;
  };

  const handleSendOtp = async () => {
    if (!isBangladeshSelected) return;
    if (!validatePhone()) return;

    try {
      setOtpSending(true);
      setOtpInput("");
      setOtpVerified(false);
      setOtpExpiresAt(0);

      const { data } = await api.post("/api/users/forgot-password/send-otp", {
        countryCode: selected.code,
        phone: finalSubmitPhone,
      });

      if (!data?.success) {
        throw new Error(data?.message || "OTP send failed");
      }

      setOtpExpiresAt(Date.now() + 3 * 60 * 1000);
      setCountdown(Number(data?.resendAfter || 60));

      toast.success(
        data?.message ||
          (isBangla ? "OTP সফলভাবে পাঠানো হয়েছে" : "OTP sent successfully"),
      );
    } catch (error) {
      const waitSeconds = error?.response?.data?.waitSeconds;

      if (waitSeconds) {
        setCountdown(Number(waitSeconds));
      }

      toast.error(
        error?.response?.data?.message || error?.message || "OTP send failed",
      );
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!validatePhone()) return;

    if (!isBangladeshSelected) {
      setOtpVerified(true);
      setStep(2);
      return;
    }

    if (!otpExpiresAt || Date.now() > otpExpiresAt) {
      toast.error(text.otpExpired);
      return;
    }

    if (!otpInput.trim()) {
      toast.error(text.enterOtp);
      return;
    }

    try {
      setOtpVerifying(true);

      const { data } = await api.post("/api/users/forgot-password/verify-otp", {
        countryCode: selected.code,
        phone: finalSubmitPhone,
        otp: otpInput.trim(),
      });

      if (!data?.success) {
        throw new Error(data?.message || "OTP verification failed");
      }

      setOtpVerified(true);
      setStep(2);

      toast.success(
        data?.message ||
          (isBangla ? "OTP যাচাই সফল হয়েছে" : "OTP verified successfully"),
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "OTP verification failed",
      );
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleResetPassword = async () => {
    if (isBangladeshSelected && !otpVerified) {
      toast.error(isBangla ? "আগে OTP যাচাই করুন" : "Please verify OTP first");
      setStep(1);
      return;
    }

    if (!newPassword.trim()) {
      toast.error(text.enterPassword);
      return;
    }

    if (newPassword.length < 6 || newPassword.length > 20) {
      toast.error(text.passwordLength);
      return;
    }

    if (!confirmPassword.trim()) {
      toast.error(text.confirmRequired);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(text.passwordMismatch);
      return;
    }

    try {
      setResetting(true);

      const { data } = await api.post(
        "/api/users/forgot-password/reset-password",
        {
          countryCode: selected.code,
          phone: finalSubmitPhone,
          otp: isBangladeshSelected ? otpInput.trim() : "",
          password: newPassword,
          confirmPassword,
        },
      );

      if (!data?.success) {
        throw new Error(data?.message || "Password reset failed");
      }

      toast.success(data?.message || text.success);
      resetForm();

      if (onLoginClick) {
        onLoginClick();
      } else {
        onClose?.();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Password reset failed",
      );
    } finally {
      setResetting(false);
    }
  };

  const inputStyle = {
    backgroundColor: setting.inputBg,
    color: setting.inputText,
    borderColor: setting.inputBorder,
    "--placeholder-color": setting.placeholderText,
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center px-0 backdrop-blur-[3px] sm:px-4"
          style={{ background: setting.overlayBg }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative flex h-screen w-full flex-col overflow-hidden shadow-2xl sm:h-[700px] sm:max-w-[375px] sm:rounded-[8px]"
            style={{ backgroundColor: setting.modalBg }}
          >
            <div
              className="relative flex h-[50px] shrink-0 items-center justify-center"
              style={{
                backgroundColor: setting.headerBg,
                color: setting.headerText,
              }}
            >
              <h2 className="text-[18px] font-semibold">{text.title}</h2>

              <button
                type="button"
                onClick={handleClose}
                disabled={otpSending || otpVerifying || resetting}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
                style={{ color: setting.headerText }}
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-[21px] pb-8 pt-8">
              <div className="flex justify-center pb-10">
                <img
                  src={logoUrl}
                  alt="CRICKEX"
                  className="h-[28px] object-contain"
                />
              </div>

              <div className="mb-7 flex items-center justify-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      step === 1 ? setting.buttonBg : setting.linkText,
                  }}
                />
                <div
                  className="h-[2px] w-16"
                  style={{ backgroundColor: setting.inputBorder }}
                />
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      step === 2 ? setting.buttonBg : setting.inputBorder,
                  }}
                />
              </div>

              {step === 1 && (
                <>
                  <div>
                    <label
                      className="mb-3 block text-[14px]"
                      style={{ color: setting.labelText }}
                    >
                      {text.phone}
                    </label>

                    <div ref={countryRef} className="relative">
                      <div
                        className="flex h-[45px] items-center rounded-[4px] border"
                        style={inputStyle}
                      >
                        <button
                          type="button"
                          onClick={() => setCountryOpen((prev) => !prev)}
                          disabled={otpSending || otpVerifying}
                          className="flex h-full cursor-pointer items-center gap-2 px-4 disabled:cursor-not-allowed"
                        >
                          <img
                            src={selected.flag}
                            alt={selected.name}
                            className="h-[22px] w-[22px] rounded-full object-cover"
                          />

                          <span className="text-[13px] font-semibold">
                            {selected.code}
                          </span>

                          <ChevronDown size={16} />
                        </button>

                        <div
                          className="h-[22px] w-px"
                          style={{ backgroundColor: setting.inputBorder }}
                        />

                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => {
                            setPhone(
                              e.target.value.replace(/\D/g, "").slice(0, 15),
                            );
                            resetOtp();
                          }}
                          placeholder={text.phonePh}
                          disabled={otpSending || otpVerifying}
                          className="forgot-dynamic-input h-full min-w-0 flex-1 bg-transparent px-4 text-[13px] outline-none disabled:cursor-not-allowed"
                          style={{
                            color: setting.inputText,
                            "--placeholder-color": setting.placeholderText,
                          }}
                        />
                      </div>

                      {countryOpen && (
                        <div
                          className="absolute left-0 top-[50px] z-30 w-full overflow-hidden rounded-md border shadow-xl"
                          style={{
                            backgroundColor: setting.dropdownBg,
                            color: setting.dropdownText,
                            borderColor: setting.dropdownBorder,
                          }}
                        >
                          <div
                            className="border-b p-2"
                            style={{ borderColor: setting.dropdownBorder }}
                          >
                            <div
                              className="flex h-9 items-center gap-2 rounded border px-2"
                              style={{
                                borderColor: setting.dropdownBorder,
                                color: setting.dropdownText,
                              }}
                            >
                              <Search size={15} />

                              <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={text.searchCountry}
                                className="forgot-dynamic-input h-full w-full bg-transparent text-sm outline-none"
                                style={{
                                  color: setting.dropdownText,
                                  "--placeholder-color":
                                    setting.placeholderText,
                                }}
                              />
                            </div>
                          </div>

                          <div className="max-h-[220px] overflow-y-auto">
                            {filteredCountries.map((item) => (
                              <button
                                type="button"
                                key={`${item.cca2}-${item.code}`}
                                onClick={() => {
                                  setSelected(item);
                                  setCountryOpen(false);
                                  setSearch("");
                                  resetOtp();
                                }}
                                className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left"
                                style={{
                                  color: setting.dropdownText,
                                  backgroundColor: setting.dropdownBg,
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    setting.dropdownHoverBg;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    setting.dropdownBg;
                                }}
                              >
                                <span className="flex items-center gap-2">
                                  <img
                                    src={item.flag}
                                    alt={item.name}
                                    className="h-[15px] w-[22px] object-cover"
                                  />
                                  <span className="text-sm">{item.name}</span>
                                </span>

                                <span className="text-sm font-semibold">
                                  {item.code}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {isBangladeshSelected && (
                    <div className="mt-5">
                      <label
                        className="mb-3 block text-[14px]"
                        style={{ color: setting.labelText }}
                      >
                        {text.otpCode}
                      </label>

                      <div className="flex gap-2">
                        <input
                          type="tel"
                          value={otpInput}
                          onChange={(e) =>
                            setOtpInput(e.target.value.replace(/\D/g, ""))
                          }
                          placeholder={text.otpPh}
                          disabled={otpSending || otpVerifying}
                          className="forgot-dynamic-input h-[45px] min-w-0 flex-1 rounded-[4px] border px-4 text-[13px] outline-none disabled:cursor-not-allowed"
                          style={inputStyle}
                        />

                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={otpSending || countdown > 0 || otpVerifying}
                          className="h-[45px] shrink-0 cursor-pointer rounded-[4px] px-3 text-[12px] font-medium disabled:cursor-not-allowed disabled:opacity-70"
                          style={{
                            backgroundColor:
                              otpSending || countdown > 0 || otpVerifying
                                ? setting.buttonDisabledBg
                                : setting.buttonBg,
                            color: setting.buttonText,
                          }}
                        >
                          {otpSending
                            ? text.sendingOtp
                            : countdown > 0
                              ? `${text.resendOtp} (${countdown}s)`
                              : text.sendOtp}
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otpVerifying || otpSending}
                    className="mt-7 h-[46px] w-full cursor-pointer rounded-[3px] text-[14px] font-medium disabled:cursor-not-allowed disabled:opacity-70"
                    style={{
                      backgroundColor:
                        otpVerifying || otpSending
                          ? setting.buttonDisabledBg
                          : setting.buttonBg,
                      color: setting.buttonText,
                    }}
                  >
                    {otpVerifying
                      ? text.verifying
                      : isBangladeshSelected
                        ? text.verifyOtp
                        : text.next}
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <div>
                    <label
                      className="mb-3 block text-[14px]"
                      style={{ color: setting.labelText }}
                    >
                      {text.newPassword}
                    </label>

                    <div
                      className="flex h-[45px] items-center rounded-[4px] border px-4"
                      style={inputStyle}
                    >
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) =>
                          setNewPassword(e.target.value.slice(0, 20))
                        }
                        placeholder={text.newPasswordPh}
                        disabled={resetting}
                        className="forgot-dynamic-input h-full min-w-0 flex-1 bg-transparent text-[13px] outline-none disabled:cursor-not-allowed"
                        style={{
                          color: setting.inputText,
                          "--placeholder-color": setting.placeholderText,
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        disabled={resetting}
                        className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                        style={{ color: setting.iconText }}
                      >
                        {showPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mt-5">
                    <label
                      className="mb-3 block text-[14px]"
                      style={{ color: setting.labelText }}
                    >
                      {text.confirmPassword}
                    </label>

                    <div
                      className="flex h-[45px] items-center rounded-[4px] border px-4"
                      style={inputStyle}
                    >
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) =>
                          setConfirmPassword(e.target.value.slice(0, 20))
                        }
                        placeholder={text.confirmPasswordPh}
                        disabled={resetting}
                        className="forgot-dynamic-input h-full min-w-0 flex-1 bg-transparent text-[13px] outline-none disabled:cursor-not-allowed"
                        style={{
                          color: setting.inputText,
                          "--placeholder-color": setting.placeholderText,
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        disabled={resetting}
                        className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                        style={{ color: setting.iconText }}
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={resetting}
                    className="mt-7 h-[46px] w-full cursor-pointer rounded-[3px] text-[14px] font-medium disabled:cursor-not-allowed disabled:opacity-70"
                    style={{
                      backgroundColor: resetting
                        ? setting.buttonDisabledBg
                        : setting.buttonBg,
                      color: setting.buttonText,
                    }}
                  >
                    {resetting ? text.resetting : text.resetPassword}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={resetting}
                    className="mt-4 h-[42px] w-full cursor-pointer rounded-[3px] border text-[14px] font-medium disabled:cursor-not-allowed disabled:opacity-70"
                    style={{
                      backgroundColor: setting.secondaryButtonBg,
                      color: setting.secondaryButtonText,
                      borderColor: setting.secondaryButtonBorder,
                    }}
                  >
                    {text.back}
                  </button>
                </>
              )}

              <div
                className="mt-6 text-center text-[14px]"
                style={{ color: setting.footerText }}
              >
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  disabled={otpSending || otpVerifying || resetting}
                  className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ color: setting.linkText }}
                >
                  {text.backLogin}
                </button>
              </div>
            </div>

            <style>{`
              .forgot-dynamic-input::placeholder {
                color: var(--placeholder-color);
              }
            `}</style>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ForgetPasswordModal;
