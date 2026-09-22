import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, X } from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";

import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

import api from "../../api/axios";
import { setCredentials } from "../../features/auth/authSlice";
import { selectLoginModalSetting } from "../../features/global/globalSelectors";

const fallbackLogoUrl =
  "https://img.c88rx.com/cx/h5/assets/images/member-logo.png?v=1780386038573";

const getErrorField = (message = "") => {
  const lower = String(message || "").toLowerCase();

  if (lower.includes("username")) return "username";
  if (lower.includes("password")) return "password";

  return null;
};

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
  inputFocusBorder: "#0a68b1",
  placeholderText: "#8c98a3",

  iconText: "#999999",

  buttonBg: "#0865a9",
  buttonText: "#ffffff",
  buttonDisabledBg: "#a6a6a6",

  linkText: "#0069b4",
  footerText: "#8d8d8d",
};

const LoginModal = ({ open, onClose, onRegisterClick, onForgotClick }) => {
  const { isBangla } = useLanguage();
  const dispatch = useDispatch();

  const loginModalSetting = useSelector(selectLoginModalSetting);

  const setting = {
    ...defaultSetting,
    ...(loginModalSetting || {}),
  };

  const logoUrl = setting.logoUrl || setting.logo || fallbackLogoUrl;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({ username: "", password: "" });
  const [generalError, setGeneralError] = useState("");

  const text = useMemo(
    () => ({
      title: isBangla ? "লগইন" : "Login",
      username: isBangla ? "ইউজারনেম" : "Username",
      usernamePh: isBangla
        ? "৪-১৬ অক্ষর, নাম্বার চলবে, স্পেস নয়"
        : "4-16 char, allow numbers, no space",
      password: isBangla ? "পাসওয়ার্ড" : "Password",
      passwordPh: isBangla
        ? "৬-২০ অক্ষর ও নাম্বার"
        : "6-20 characters and numbers",
      forgot: isBangla ? "পাসওয়ার্ড ভুলে গেছেন?" : "Forgot password?",
      login: isBangla ? "লগইন" : "Login",
      loading: isBangla ? "লগইন হচ্ছে..." : "Logging in...",
      noAccount: isBangla ? "একাউন্ট নেই?" : "Do not have an account?",
      signUp: isBangla ? "সাইন আপ" : "Sign Up",

      enterUsername: isBangla ? "ইউজারনেম দিন" : "Enter username",
      usernameLength: isBangla
        ? "ইউজারনেম ৪-১৫ অক্ষরের হতে হবে"
        : "Username must be 4-15 characters",
      enterPassword: isBangla ? "পাসওয়ার্ড দিন" : "Enter password",
      passwordLength: isBangla
        ? "পাসওয়ার্ড ৬-২০ অক্ষরের হতে হবে"
        : "Password must be 6-20 characters",
      success: isBangla ? "লগইন সফল হয়েছে" : "Login successful",
      failed: isBangla ? "লগইন ব্যর্থ হয়েছে" : "Login failed",
    }),
    [isBangla],
  );

  const cleanUsername = username.trim().toLowerCase();
  const cleanPassword = String(password || "");

  const canLogin =
    cleanUsername.length >= 4 &&
    cleanUsername.length <= 15 &&
    cleanPassword.length >= 6 &&
    cleanPassword.length <= 20;

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setShowPassword(false);
    setErrors({ username: "", password: "" });
    setGeneralError("");
  };

  const loginMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/api/users/login", payload);
      return data;
    },

    onSuccess: (res) => {
      const user = res?.data?.user;
      const token = res?.data?.token;

      if (user && token) {
        dispatch(setCredentials({ user, token }));
      }

      toast.success(res?.message || text.success);
      resetForm();
      onClose?.();
    },

    onError: (error) => {
      const message =
        error?.response?.data?.message || error?.message || text.failed;
      const field = getErrorField(message);

      if (field) {
        setErrors((prev) => ({ ...prev, [field]: message }));
      } else {
        setGeneralError(message);
      }
    },
  });

  const validateForm = () => {
    const newErrors = { username: "", password: "" };

    if (!cleanUsername) {
      newErrors.username = text.enterUsername;
    } else if (cleanUsername.length < 4 || cleanUsername.length > 15) {
      newErrors.username = text.usernameLength;
    }

    if (!cleanPassword) {
      newErrors.password = text.enterPassword;
    } else if (cleanPassword.length < 6 || cleanPassword.length > 20) {
      newErrors.password = text.passwordLength;
    }

    setErrors(newErrors);

    return !newErrors.username && !newErrors.password;
  };

  const handleLogin = () => {
    if (loginMutation.isPending) return;

    setGeneralError("");
    if (!validateForm()) return;

    loginMutation.mutate({
      username: cleanUsername,
      password: cleanPassword,
    });
  };

  const handleClose = () => {
    if (loginMutation.isPending) return;
    onClose?.();
  };

  const handleForgotClick = () => {
    if (loginMutation.isPending) return;

    resetForm();
    onClose?.();

    setTimeout(() => {
      onForgotClick?.();
    }, 150);
  };

  const handleRegisterClick = () => {
    if (loginMutation.isPending) return;

    resetForm();
    onClose?.();

    setTimeout(() => {
      onRegisterClick?.();
    }, 150);
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
            className="relative flex h-dvh w-full flex-col overflow-hidden shadow-2xl sm:h-[700px] sm:max-w-[375px] sm:rounded-[8px]"
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
                disabled={loginMutation.isPending}
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

              <div>
                <label
                  className="mb-3 block text-[14px]"
                  style={{ color: setting.labelText }}
                >
                  {text.username}
                </label>

                <input
                  autoFocus
                  value={username}
                  onChange={(e) => {
                    setUsername(
                      e.target.value
                        .toLowerCase()
                        .replace(/\s/g, "")
                        .replace(/[^a-z0-9]/g, "")
                        .slice(0, 15),
                    );
                    setErrors((prev) => ({ ...prev, username: "" }));
                  }}
                  placeholder={text.usernamePh}
                  disabled={loginMutation.isPending}
                  className="login-dynamic-input h-[45px] w-full rounded-[4px] border px-4 text-[13px] outline-none disabled:cursor-not-allowed"
                  style={{
                    ...inputStyle,
                    borderColor: username
                      ? setting.inputFocusBorder
                      : setting.inputBorder,
                  }}
                />

                {errors.username && (
                  <p className="mt-1.5 text-[12px] text-red-500">
                    {errors.username}
                  </p>
                )}
              </div>

              <div className="mt-5">
                <label
                  className="mb-3 block text-[14px]"
                  style={{ color: setting.labelText }}
                >
                  {text.password}
                </label>

                <div
                  className="flex h-[45px] items-center rounded-[4px] border px-4"
                  style={inputStyle}
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value.slice(0, 20));
                      setErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    placeholder={text.passwordPh}
                    disabled={loginMutation.isPending}
                    className="login-dynamic-input h-full min-w-0 flex-1 bg-transparent text-[13px] outline-none disabled:cursor-not-allowed"
                    style={{
                      color: setting.inputText,
                      "--placeholder-color": setting.placeholderText,
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={loginMutation.isPending}
                    className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ color: setting.iconText }}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-1.5 text-[12px] text-red-500">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleForgotClick}
                  disabled={loginMutation.isPending}
                  className="cursor-pointer text-[14px] disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ color: setting.linkText }}
                >
                  {text.forgot}
                </button>
              </div>

              {generalError && (
                <p className="mt-3 text-center text-[12px] text-red-500">
                  {generalError}
                </p>
              )}

              <button
                type="button"
                onClick={handleLogin}
                disabled={!canLogin || loginMutation.isPending}
                className="mt-6 h-[46px] w-full cursor-pointer rounded-[3px] text-[14px] font-medium disabled:cursor-not-allowed"
                style={{
                  backgroundColor:
                    !canLogin || loginMutation.isPending
                      ? setting.buttonDisabledBg
                      : setting.buttonBg,
                  color: setting.buttonText,
                }}
              >
                {loginMutation.isPending ? text.loading : text.login}
              </button>

              <div
                className="mt-6 text-center text-[14px]"
                style={{ color: setting.footerText }}
              >
                {text.noAccount}{" "}
                <button
                  type="button"
                  onClick={handleRegisterClick}
                  disabled={loginMutation.isPending}
                  className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ color: setting.linkText }}
                >
                  {text.signUp}
                </button>
              </div>
            </div>

            <style>{`
              .login-dynamic-input::placeholder {
                color: var(--placeholder-color);
              }
            `}</style>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
