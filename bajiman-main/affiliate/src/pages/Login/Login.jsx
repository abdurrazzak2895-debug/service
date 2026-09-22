import React, { useEffect, useMemo, useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  RefreshCw,
  ShieldCheck,
  User,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";

import { useLanguage } from "../../Context/LanguageProvider";
import api from "../../api/axios";
import { setCredentials } from "../../features/auth/authSlice";
import { fetchAffiliateGlobalData } from "../../features/global/globalSlice";
import {
  selectAffiliateLoginSetting,
  selectGlobalLoaded,
  selectGlobalLoading,
} from "../../features/global/globalSelectors";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const makeImageUrl = (path = "") => {
  if (!path) return "";
  if (
    String(path).startsWith("http://") ||
    String(path).startsWith("https://")
  ) {
    return path;
  }
  return `${API_URL}/${String(path).replace(/^\/+/, "")}`;
};

const getText = (obj, isBangla, fallback = "") => {
  if (!obj) return fallback;
  return isBangla ? obj.bn || obj.en || fallback : obj.en || obj.bn || fallback;
};

const getColor = (setting, key, fallback) => setting?.[key] || fallback;

const makeCode = () => {
  const chars = "0123456789";
  let code = "";

  for (let i = 0; i < 5; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
};

const LoginSkeleton = () => (
  <div className="min-h-auto bg-[#061532] px-4 py-10 text-white">
    <div className="mx-auto grid max-w-[1120px] items-center gap-8 lg:grid-cols-2">
      <div className="hidden animate-pulse rounded-[28px] border border-white/10 bg-white/5 p-8 shadow-2xl md:block">
        <div className="h-9 w-40 rounded-full bg-white/15" />
        <div className="mt-6 h-12 w-full rounded-xl bg-white/15" />
        <div className="mt-3 h-12 w-4/5 rounded-xl bg-white/15" />
        <div className="mt-5 h-5 w-full rounded bg-white/15" />
        <div className="mt-2 h-5 w-3/4 rounded bg-white/15" />
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="h-14 rounded-xl bg-white/15" />
          <div className="h-14 rounded-xl bg-white/15" />
          <div className="h-14 rounded-xl bg-white/15" />
        </div>
      </div>

      <div className="animate-pulse rounded-[28px] border border-white/10 bg-white p-5 shadow-2xl md:p-7">
        <div className="mx-auto h-[42px] w-[160px] rounded bg-gray-200" />
        <div className="mx-auto mt-4 h-8 w-32 rounded bg-gray-200" />

        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item}>
              <div className="mb-2 h-4 w-28 rounded bg-gray-200" />
              <div className="h-[50px] rounded-xl bg-gray-200" />
            </div>
          ))}

          <div className="ml-auto h-4 w-36 rounded bg-gray-200" />
          <div className="h-[52px] rounded-xl bg-gray-200" />
          <div className="mx-auto h-4 w-56 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  </div>
);

const Login = () => {
  const { isBangla } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const globalLoading = useSelector(selectGlobalLoading);
  const globalLoaded = useSelector(selectGlobalLoaded);
  const setting = useSelector(selectAffiliateLoginSetting);

  const [form, setForm] = useState({
    username: "",
    password: "",
    validationCode: "",
  });

  const [captcha, setCaptcha] = useState(makeCode());
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!globalLoaded && !globalLoading) {
      dispatch(fetchAffiliateGlobalData());
    }
  }, [dispatch, globalLoaded, globalLoading]);

  const text = useMemo(
    () => ({
      badge: getText(
        setting?.badgeText,
        isBangla,
        isBangla ? "ক্রিকেক্স অ্যাফিলিয়েট" : "Crickex Affiliate",
      ),
      title: getText(
        setting?.title,
        isBangla,
        isBangla ? "অ্যাফিলিয়েট লগইন" : "Affiliate Login",
      ),
      sub: getText(
        setting?.subTitle,
        isBangla,
        isBangla
          ? "আপনার অ্যাফিলিয়েট ড্যাশবোর্ডে প্রবেশ করুন।"
          : "Access your affiliate dashboard securely.",
      ),
      username: getText(
        setting?.usernameLabel,
        isBangla,
        isBangla ? "ইউজারনেম" : "Username",
      ),
      password: getText(
        setting?.passwordLabel,
        isBangla,
        isBangla ? "পাসওয়ার্ড" : "Password",
      ),
      validationCode: getText(
        setting?.validationCodeLabel,
        isBangla,
        isBangla ? "ভ্যালিডেশন কোড" : "Validation Code",
      ),
      login: getText(
        setting?.loginText,
        isBangla,
        isBangla ? "লগইন করুন" : "Login",
      ),
      loggingIn: getText(
        setting?.loggingInText,
        isBangla,
        isBangla ? "লগইন হচ্ছে..." : "Logging in...",
      ),
      noAccount: getText(
        setting?.noAccountText,
        isBangla,
        isBangla ? "অ্যাকাউন্ট নেই?" : "Don’t have an account?",
      ),
      register: getText(
        setting?.registerText,
        isBangla,
        isBangla ? "রেজিস্টার করুন" : "Register",
      ),
      forgot: getText(
        setting?.forgotText,
        isBangla,
        isBangla ? "পাসওয়ার্ড ভুলে গেছেন?" : "Forgot password?",
      ),

      enterUsername: isBangla ? "ইউজারনেম দিন" : "Enter username",
      enterPassword: isBangla ? "পাসওয়ার্ড দিন" : "Enter password",
      enterCode: isBangla ? "ভ্যালিডেশন কোড দিন" : "Enter validation code",
      invalidCode: isBangla
        ? "ভ্যালিডেশন কোড সঠিক নয়"
        : "Validation code is incorrect",
      success: isBangla ? "লগইন সফল হয়েছে" : "Login successful",
      failed: isBangla ? "লগইন ব্যর্থ হয়েছে" : "Login failed",
      pending: isBangla
        ? "আপনার অ্যাফিলিয়েট অ্যাকাউন্ট pending আছে। Admin approve করলে লগইন করতে পারবেন।"
        : "Your affiliate account is pending. You can login after admin approval.",
    }),
    [isBangla, setting],
  );

  const features = useMemo(() => {
    const list = Array.isArray(setting?.features) ? setting.features : [];

    if (list.length) {
      return list
        .filter((item) => item?.status !== "inactive")
        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
        .map((item) => getText(item.text, isBangla))
        .filter(Boolean);
    }

    return isBangla
      ? ["নিরাপদ লগইন", "লাইফটাইম কমিশন", "দ্রুত সাপোর্ট"]
      : ["Secure Login", "Lifetime Commission", "Fast Support"];
  }, [isBangla, setting]);

  const colors = {
    pageBg: getColor(setting, "pageBg", "#061532"),
    leftCardBg: getColor(setting, "leftCardBg", "rgba(255,255,255,0.05)"),
    leftCardBorder: getColor(
      setting,
      "leftCardBorder",
      "rgba(255,255,255,0.10)",
    ),

    badgeBg: getColor(setting, "badgeBg", "#ffcc18"),
    badgeTextColor: getColor(setting, "badgeTextColor", "#061532"),
    titleColor: getColor(setting, "titleColor", "#ffffff"),
    subTitleColor: getColor(setting, "subTitleColor", "rgba(255,255,255,0.75)"),

    featureBg: getColor(setting, "featureBg", "#0c2c62"),
    featureTextColor: getColor(setting, "featureTextColor", "#ffffff"),

    formCardBg: getColor(setting, "formCardBg", "#ffffff"),
    formTextColor: getColor(setting, "formTextColor", "#111111"),
    formTitleColor: getColor(setting, "formTitleColor", "#061532"),

    labelColor: getColor(setting, "labelColor", "#061532"),
    inputBg: getColor(setting, "inputBg", "#f4f7fb"),
    inputBorder: getColor(setting, "inputBorder", "#d9e2ef"),
    inputFocusBorder: getColor(setting, "inputFocusBorder", "#ffcc18"),
    inputIconColor: getColor(setting, "inputIconColor", "#0b66a8"),

    captchaBg: getColor(setting, "captchaBg", "#061532"),
    captchaBorder: getColor(setting, "captchaBorder", "#ffcc18"),
    captchaTextColor: getColor(setting, "captchaTextColor", "#ffcc18"),

    refreshBg: getColor(setting, "refreshBg", "#ffcc18"),
    refreshTextColor: getColor(setting, "refreshTextColor", "#061532"),

    submitBg: getColor(setting, "submitBg", "#ffcc18"),
    submitTextColor: getColor(setting, "submitTextColor", "#061532"),

    forgotLinkColor: getColor(setting, "forgotLinkColor", "#0b66a8"),
    registerLinkColor: getColor(setting, "registerLinkColor", "#0b66a8"),
  };

  const logo = setting?.logoUrl || makeImageUrl(setting?.logo);

  const refreshCode = () => {
    setCaptcha(makeCode());
    setForm((prev) => ({ ...prev, validationCode: "" }));
  };

  const handleChange = (key, value) => {
    if (key === "username") {
      value = value
        .toLowerCase()
        .replace(/\s/g, "")
        .replace(/[^a-z0-9]/g, "");
    }

    if (key === "validationCode") {
      value = value.replace(/\D/g, "").slice(0, 5);
    }

    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    if (!form.username.trim()) {
      toast.error(text.enterUsername);
      return false;
    }

    if (!form.password.trim()) {
      toast.error(text.enterPassword);
      return false;
    }

    if (!form.validationCode.trim()) {
      toast.error(text.enterCode);
      return false;
    }

    if (form.validationCode.trim() !== captcha) {
      refreshCode();
      toast.error(text.invalidCode);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;
    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload = {
        username: form.username.trim().toLowerCase(),
        password: form.password,
      };

      const { data } = await api.post("/api/affiliate/login", payload);

      const user = data?.data?.user;
      const token = data?.data?.token;

      if (!user || !token) {
        toast.error(text.failed);
        refreshCode();
        return;
      }

      if (user?.role !== "aff-user") {
        toast.error("Only affiliate user can login here");
        refreshCode();
        return;
      }

      dispatch(setCredentials({ user, token }));

      toast.success(data?.message || text.success);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      refreshCode();

      toast.error(
        error?.response?.data?.message || error?.message || text.failed,
      );
    } finally {
      setLoading(false);
    }
  };

  if (!globalLoaded && globalLoading) {
    return <LoginSkeleton />;
  }

  return (
    <div
      className="min-h-auto px-4 py-10 text-white"
      style={{ backgroundColor: colors.pageBg }}
    >
      <div className="mx-auto grid max-w-[1120px] items-center gap-8 lg:grid-cols-2">
        <div
          className="hidden rounded-[28px] border p-6 shadow-2xl backdrop-blur md:block md:p-8"
          style={{
            backgroundColor: colors.leftCardBg,
            borderColor: colors.leftCardBorder,
          }}
        >
          <span
            className="inline-flex rounded-full px-4 py-2 text-sm font-bold"
            style={{
              backgroundColor: colors.badgeBg,
              color: colors.badgeTextColor,
            }}
          >
            {text.badge}
          </span>

          <h1
            className="mt-6 text-3xl font-black leading-tight md:text-5xl"
            style={{ color: colors.titleColor }}
          >
            {text.title}
          </h1>

          <p
            className="mt-4 max-w-[520px] text-base"
            style={{ color: colors.subTitleColor }}
          >
            {text.sub}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {features.map((item) => (
              <div
                key={item}
                className="flex items-center justify-center rounded-xl px-3 py-4 text-center text-sm font-bold"
                style={{
                  backgroundColor: colors.featureBg,
                  color: colors.featureTextColor,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-[28px] border border-white/10 p-5 shadow-2xl md:p-7"
          style={{
            backgroundColor: colors.formCardBg,
            color: colors.formTextColor,
          }}
        >
          <div className="mb-6 text-center">
            {logo ? (
              <img
                src={logo}
                alt="Crickex"
                className="mx-auto h-[42px] object-contain"
              />
            ) : null}

            <h2
              className="mt-4 text-2xl font-black"
              style={{ color: colors.formTitleColor }}
            >
              {text.login}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="mb-2 block text-sm font-bold"
                style={{ color: colors.labelColor }}
              >
                {text.username}
              </label>

              <div
                className="flex h-[50px] items-center rounded-xl border px-4"
                style={{
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.inputFocusBorder;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.inputBorder;
                }}
              >
                <User size={18} style={{ color: colors.inputIconColor }} />
                <input
                  type="text"
                  value={form.username}
                  disabled={loading}
                  onChange={(e) => handleChange("username", e.target.value)}
                  placeholder={text.username}
                  className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-bold"
                style={{ color: colors.labelColor }}
              >
                {text.password}
              </label>

              <div
                className="flex h-[50px] items-center rounded-xl border px-4"
                style={{
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.inputFocusBorder;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.inputBorder;
                }}
              >
                <Lock size={18} style={{ color: colors.inputIconColor }} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  disabled={loading}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder={text.password}
                  className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
                />

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="cursor-pointer text-gray-500 disabled:cursor-not-allowed"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-bold"
                style={{ color: colors.labelColor }}
              >
                {text.validationCode}
              </label>

              <div className="grid grid-cols-[1fr_130px_44px] gap-2">
                <div
                  className="flex h-[50px] items-center rounded-xl border px-4"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.inputFocusBorder;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.inputBorder;
                  }}
                >
                  <ShieldCheck
                    size={18}
                    style={{ color: colors.inputIconColor }}
                  />
                  <input
                    type="text"
                    value={form.validationCode}
                    disabled={loading}
                    onChange={(e) =>
                      handleChange("validationCode", e.target.value)
                    }
                    placeholder={text.validationCode}
                    className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm uppercase outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
                  />
                </div>

                <div
                  className="flex h-[50px] select-none items-center justify-center rounded-xl border text-xl font-black tracking-[5px]"
                  style={{
                    backgroundColor: colors.captchaBg,
                    borderColor: colors.captchaBorder,
                    color: colors.captchaTextColor,
                  }}
                >
                  {captcha}
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={refreshCode}
                  className="flex h-[50px] cursor-pointer items-center justify-center rounded-xl transition disabled:cursor-not-allowed disabled:opacity-70"
                  style={{
                    backgroundColor: colors.refreshBg,
                    color: colors.refreshTextColor,
                  }}
                >
                  <RefreshCw size={19} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                className="cursor-pointer text-sm font-bold hover:underline"
                style={{ color: colors.forgotLinkColor }}
              >
                {text.forgot}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-base font-black transition disabled:cursor-not-allowed disabled:opacity-70"
              style={{
                backgroundColor: colors.submitBg,
                color: colors.submitTextColor,
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  {text.loggingIn}
                </>
              ) : (
                text.login
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            {text.noAccount}{" "}
            <Link
              to="/register"
              className="cursor-pointer font-bold hover:underline"
              style={{ color: colors.registerLinkColor }}
            >
              {text.register}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
