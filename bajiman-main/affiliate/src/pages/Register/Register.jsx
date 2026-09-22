import React, { useEffect, useMemo, useState } from "react";
import {
  Eye,
  EyeOff,
  User,
  Phone,
  Mail,
  Lock,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import api from "../../api/axios";
import { fetchAffiliateGlobalData } from "../../features/global/globalSlice";
import {
  selectAffiliateRegisterSetting,
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

const RegisterSkeleton = () => (
  <div className="min-h-screen bg-[#061532] px-4 py-10 text-white">
    <div className="mx-auto grid max-w-[1120px] items-center gap-8 lg:grid-cols-2">
      <div className="hidden animate-pulse rounded-[28px] border border-white/10 bg-white/5 p-8 shadow-2xl md:block">
        <div className="h-9 w-40 rounded-full bg-white/15" />
        <div className="mt-6 h-12 w-full rounded-xl bg-white/15" />
        <div className="mt-3 h-12 w-4/5 rounded-xl bg-white/15" />
        <div className="mt-5 h-5 w-full rounded bg-white/15" />
        <div className="mt-2 h-5 w-3/4 rounded bg-white/15" />
        <div className="mt-6 h-24 rounded-2xl bg-white/15" />
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="h-12 rounded-xl bg-white/15" />
          <div className="h-12 rounded-xl bg-white/15" />
          <div className="h-12 rounded-xl bg-white/15" />
        </div>
      </div>

      <div className="animate-pulse rounded-[28px] border border-white/10 bg-white p-5 shadow-2xl md:p-7">
        <div className="mx-auto h-[42px] w-[160px] rounded bg-gray-200" />
        <div className="mx-auto mt-4 h-8 w-32 rounded bg-gray-200" />

        <div className="mt-6 space-y-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item}>
              <div className="mb-2 h-4 w-28 rounded bg-gray-200" />
              <div className="h-[50px] rounded-xl bg-gray-200" />
            </div>
          ))}

          <div className="h-[52px] rounded-xl bg-gray-200" />
          <div className="mx-auto h-4 w-56 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  </div>
);

const Register = () => {
  const { isBangla } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const globalLoading = useSelector(selectGlobalLoading);
  const globalLoaded = useSelector(selectGlobalLoaded);
  const setting = useSelector(selectAffiliateRegisterSetting);

  const [form, setForm] = useState({
    username: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
        isBangla
          ? "অ্যাফিলিয়েট অ্যাকাউন্ট তৈরি করুন"
          : "Create Affiliate Account",
      ),
      sub: getText(
        setting?.subTitle,
        isBangla,
        isBangla
          ? "আজই জয়েন করুন এবং লাইফটাইম কমিশন আয়ের সুযোগ নিন।"
          : "Join today and start earning lifetime commission.",
      ),
      commission: getText(
        setting?.commissionText,
        isBangla,
        isBangla ? "৫০% লাইফটাইম কমিশন" : "50% Lifetime Commission",
      ),
      username: getText(
        setting?.usernameLabel,
        isBangla,
        isBangla ? "ইউজারনেম" : "Username",
      ),
      phone: getText(
        setting?.phoneLabel,
        isBangla,
        isBangla ? "ফোন নম্বর" : "Phone",
      ),
      email: getText(
        setting?.emailLabel,
        isBangla,
        isBangla ? "ইমেইল" : "Email",
      ),
      password: getText(
        setting?.passwordLabel,
        isBangla,
        isBangla ? "পাসওয়ার্ড" : "Password",
      ),
      confirmPassword: getText(
        setting?.confirmPasswordLabel,
        isBangla,
        isBangla ? "কনফার্ম পাসওয়ার্ড" : "Confirm Password",
      ),
      submit: getText(
        setting?.submitText,
        isBangla,
        isBangla ? "রেজিস্টার করুন" : "Register",
      ),
      submitting: getText(
        setting?.submittingText,
        isBangla,
        isBangla ? "রেজিস্টার হচ্ছে..." : "Registering...",
      ),
      already: getText(
        setting?.alreadyText,
        isBangla,
        isBangla ? "আগেই অ্যাকাউন্ট আছে?" : "Already have an account?",
      ),
      login: getText(setting?.loginText, isBangla, isBangla ? "লগইন" : "Login"),

      usernameRequired: isBangla ? "ইউজারনেম দিন" : "Enter username",
      usernameInvalid: isBangla
        ? "ইউজারনেম ৪-১৫ অক্ষর হবে এবং শুধু ইংরেজি অক্ষর/নাম্বার ব্যবহার করুন"
        : "Username must be 4-15 characters and only letters/numbers allowed",
      phoneRequired: isBangla ? "ফোন নম্বর দিন" : "Enter phone number",
      emailRequired: isBangla ? "ইমেইল দিন" : "Enter email",
      emailInvalid: isBangla ? "সঠিক ইমেইল দিন" : "Enter valid email",
      passwordRequired: isBangla ? "পাসওয়ার্ড দিন" : "Enter password",
      passwordInvalid: isBangla
        ? "পাসওয়ার্ড ৬-২০ অক্ষরের হতে হবে"
        : "Password must be 6-20 characters",
      confirmRequired: isBangla
        ? "কনফার্ম পাসওয়ার্ড দিন"
        : "Enter confirm password",
      passwordNotMatch: isBangla
        ? "পাসওয়ার্ড মিলছে না"
        : "Password does not match",
      success: isBangla
        ? "রেজিস্ট্রেশন সফল হয়েছে। অ্যাডমিন approve করলে আপনি লগইন করতে পারবেন।"
        : "Registration successful. You can login after admin approval.",
    }),
    [isBangla, setting],
  );

  const notes = useMemo(() => {
    const list = Array.isArray(setting?.notes) ? setting.notes : [];

    if (list.length) {
      return list
        .filter((item) => item?.status !== "inactive")
        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
        .map((item) => getText(item.text, isBangla))
        .filter(Boolean);
    }

    return isBangla
      ? ["ফ্রি অ্যাকাউন্ট", "জিরো ইনভেস্টমেন্ট", "দ্রুত সাপোর্ট"]
      : ["Free Account", "Zero Investment", "Fast Support"];
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
    commissionBg: getColor(setting, "commissionBg", "#ffcc18"),
    commissionTextColor: getColor(setting, "commissionTextColor", "#061532"),
    noteBg: getColor(setting, "noteBg", "#0c2c62"),
    noteTextColor: getColor(setting, "noteTextColor", "#ffffff"),
    noteIconColor: getColor(setting, "noteIconColor", "#ffcc18"),

    formCardBg: getColor(setting, "formCardBg", "#ffffff"),
    formTextColor: getColor(setting, "formTextColor", "#111111"),
    formTitleColor: getColor(setting, "formTitleColor", "#061532"),
    labelColor: getColor(setting, "labelColor", "#061532"),
    inputBg: getColor(setting, "inputBg", "#f4f7fb"),
    inputBorder: getColor(setting, "inputBorder", "#d9e2ef"),
    inputFocusBorder: getColor(setting, "inputFocusBorder", "#ffcc18"),
    inputIconColor: getColor(setting, "inputIconColor", "#0b66a8"),
    submitBg: getColor(setting, "submitBg", "#ffcc18"),
    submitTextColor: getColor(setting, "submitTextColor", "#061532"),
    loginLinkColor: getColor(setting, "loginLinkColor", "#0b66a8"),
  };

  const logo = setting?.logoUrl || makeImageUrl(setting?.logo);

  const handleChange = (key, value) => {
    if (key === "username") {
      value = value
        .toLowerCase()
        .replace(/\s/g, "")
        .replace(/[^a-z0-9]/g, "");
    }

    if (key === "phone") {
      value = value.replace(/\D/g, "");
    }

    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    const username = form.username.trim().toLowerCase();
    const phone = form.phone.trim();
    const email = form.email.trim().toLowerCase();

    if (!username) return toast.error(text.usernameRequired);
    if (
      username.length < 4 ||
      username.length > 15 ||
      !/^[a-z0-9]+$/.test(username)
    ) {
      return toast.error(text.usernameInvalid);
    }

    if (!phone) return toast.error(text.phoneRequired);
    if (!email) return toast.error(text.emailRequired);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return toast.error(text.emailInvalid);

    if (!form.password) return toast.error(text.passwordRequired);
    if (form.password.length < 6 || form.password.length > 20) {
      return toast.error(text.passwordInvalid);
    }

    if (!form.confirmPassword) return toast.error(text.confirmRequired);
    if (form.password !== form.confirmPassword)
      return toast.error(text.passwordNotMatch);

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
        phone: form.phone.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        countryCode: "+880",
        currency: "BDT",
      };

      const { data } = await api.post("/api/affiliate/register", payload);

      toast.success(data?.message || text.success);

      setForm({
        username: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 900);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          (isBangla ? "রেজিস্ট্রেশন ব্যর্থ হয়েছে" : "Registration failed"),
      );
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      key: "username",
      label: text.username,
      type: "text",
      icon: User,
      placeholder: isBangla ? "আপনার ইউজারনেম" : "Enter username",
    },
    {
      key: "phone",
      label: text.phone,
      type: "tel",
      icon: Phone,
      placeholder: isBangla ? "আপনার ফোন নম্বর" : "Enter phone number",
    },
    {
      key: "email",
      label: text.email,
      type: "email",
      icon: Mail,
      placeholder: isBangla ? "আপনার ইমেইল" : "Enter email address",
    },
  ];

  if (!globalLoaded && globalLoading) {
    return <RegisterSkeleton />;
  }

  return (
    <div
      className="min-h-screen px-4 py-10 text-white"
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

          <div
            className="mt-6 rounded-2xl p-5"
            style={{
              backgroundColor: colors.commissionBg,
              color: colors.commissionTextColor,
            }}
          >
            <p className="text-2xl font-black md:text-4xl">{text.commission}</p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {notes.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold"
                style={{
                  backgroundColor: colors.noteBg,
                  color: colors.noteTextColor,
                }}
              >
                <CheckCircle
                  size={17}
                  style={{ color: colors.noteIconColor }}
                />
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
              {text.submit}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => {
              const Icon = field.icon;

              return (
                <div key={field.key}>
                  <label
                    className="mb-2 block text-sm font-bold"
                    style={{ color: colors.labelColor }}
                  >
                    {field.label}
                  </label>

                  <div
                    className="flex h-[50px] items-center rounded-xl border px-4"
                    style={{
                      backgroundColor: colors.inputBg,
                      borderColor: colors.inputBorder,
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor =
                        colors.inputFocusBorder;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = colors.inputBorder;
                    }}
                  >
                    <Icon size={18} style={{ color: colors.inputIconColor }} />
                    <input
                      type={field.type}
                      value={form[field.key]}
                      disabled={loading}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              );
            })}

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
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  disabled={loading}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder={isBangla ? "পাসওয়ার্ড লিখুন" : "Enter password"}
                  className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowPass((prev) => !prev)}
                  className="cursor-pointer text-gray-500 disabled:cursor-not-allowed"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-bold"
                style={{ color: colors.labelColor }}
              >
                {text.confirmPassword}
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
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  disabled={loading}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  placeholder={
                    isBangla ? "আবার পাসওয়ার্ড লিখুন" : "Confirm password"
                  }
                  className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="cursor-pointer text-gray-500 disabled:cursor-not-allowed"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
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
                  {text.submitting}
                </>
              ) : (
                text.submit
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            {text.already}{" "}
            <Link
              to="/login"
              className="cursor-pointer font-bold hover:underline"
              style={{ color: colors.loginLinkColor }}
            >
              {text.login}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
