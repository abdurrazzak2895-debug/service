import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Eye,
  EyeOff,
  Search,
  X,
  CheckCircle,
  PartyPopper,
} from "lucide-react";
import { useLocation } from "react-router";
import { useLanguage } from "../../Context/LanguageProvider";

import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

import api from "../../api/axios";
import { setCredentials } from "../../features/auth/authSlice";
import { selectRegisterModalSetting } from "../../features/global/globalSelectors";
import useOtpSetting from "../../hook/useOtpSetting";
import SuccessConfirmModal from "../SuccessConfirmModal/SuccessConfirmModal";

import slide1 from "../../assets/register/1.jpg";
import slide2 from "../../assets/register/2.jpg";
import slide3 from "../../assets/register/3.jpg";
import slide4 from "../../assets/register/4.jpg";

const fallbackLogo =
  "https://img.c88rx.com/cx/h5/assets/images/member-logo.png?v=1780386038573";

const fallbackSlides = [slide1, slide2, slide3, slide4];

const defaultSetting = {
  logo: "",
  logoUrl: "",

  overlayBg: "rgba(1,8,17,0.78)",
  modalBg: "#071321",
  headerBg: "#0d1d30",
  headerText: "#ffffff",

  labelText: "#dbe7f2",
  inputBg: "#10243a",
  inputText: "#ffffff",
  inputBorder: "rgba(255,255,255,0.12)",
  placeholderText: "#8195aa",

  helperText: "#91a5ba",
  helperIcon: "#f5b942",

  buttonBg: "#f5b942",
  buttonText: "#1e1606",
  buttonDisabledBg: "#40536a",

  linkText: "#ffcf67",
  footerText: "#91a5ba",

  sliderDotActive: "#f5b942",
  sliderDotInactive: "#40536a",
  bannerBg: "#10243a",

  dropdownBg: "#10243a",
  dropdownText: "#ffffff",
  dropdownBorder: "rgba(255,255,255,0.12)",
  dropdownHoverBg: "#173250",

  sliderImages: [],
};

const getRefFromSearch = (search = "") => {
  const params = new URLSearchParams(search);
  const ref = params.get("ref") || params.get("referCode") || "";

  return String(ref)
    .toUpperCase()
    .replace(/\s/g, "")
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
};

const getErrorField = (message = "") => {
  const lower = String(message || "").toLowerCase();

  if (lower.includes("username")) return "username";
  if (lower.includes("phone")) return "phone";
  if (lower.includes("otp")) return "otp";

  return null;
};

const normalizePhoneForBd = (phone = "") => {
  const cleanPhone = String(phone || "").replace(/\D/g, "");

  if (cleanPhone && !cleanPhone.startsWith("0")) {
    return `0${cleanPhone}`;
  }

  return cleanPhone;
};

const RegisterModal = ({ open, onClose, onLoginClick }) => {
  const { isBangla } = useLanguage();
  const dispatch = useDispatch();
  const location = useLocation();

  const registerModalSetting = useSelector(selectRegisterModalSetting);

  const setting = {
    ...defaultSetting,
    ...(registerModalSetting || {}),
  };

  const logoUrl = setting.logoUrl || setting.logo || fallbackLogo;

  const slides = useMemo(() => {
    const dbSlides = Array.isArray(setting.sliderImages)
      ? setting.sliderImages
          .filter((item) => item?.status !== "inactive")
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          .map((item) => item?.imageUrl || item?.image)
          .filter(Boolean)
      : [];

    return dbSlides.length > 0 ? dbSlides : fallbackSlides;
  }, [setting.sliderImages]);

  const [showPassword, setShowPassword] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [showBonusCongrats, setShowBonusCongrats] = useState(false);
  const [bonusAmountWon, setBonusAmountWon] = useState(0);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [refCode, setRefCode] = useState("");

  const [errors, setErrors] = useState({
    username: "",
    phone: "",
    otp: "",
  });
  const [generalError, setGeneralError] = useState("");

  const [otpInput, setOtpInput] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState(0);
  const [countdown, setCountdown] = useState(0);

  const [countries, setCountries] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);

  const countryRef = useRef(null);

  const [selected, setSelected] = useState({
    name: "Bangladesh",
    code: "+880",
    cca2: "BD",
    flag: "https://flagcdn.com/w40/bd.png",
  });

  const isBangladeshSelected =
    selected?.cca2 === "BD" || selected?.code === "+880";

  const { registerEnabled: registerOtpEnabled } = useOtpSetting();
  const otpRequired = isBangladeshSelected && registerOtpEnabled;

  const text = {
    title: isBangla ? "সাইন আপ" : "Sign up",
    chooseCurrency: isBangla ? "কারেন্সি নির্বাচন করুন" : "Choose currency",
    username: isBangla ? "ইউজারনেম" : "Username",
    usernamePh: isBangla
      ? "৪-১৬ অক্ষর, নাম্বার চলবে, স্পেস নয়"
      : "4-16 char, allow numbers, no space",
    password: isBangla ? "পাসওয়ার্ড" : "Password",
    passwordPh: isBangla
      ? "৬-২০ অক্ষর ও নাম্বার"
      : "6-20 characters and numbers",
    rule1: isBangla ? "৬~২০ অক্ষরের মধ্যে।" : "Between 6~20 characters.",
    rule2: isBangla ? "কমপক্ষে একটি অক্ষর।" : "At least one alphabet.",
    rule3: isBangla
      ? "কমপক্ষে একটি নাম্বার। (স্পেশাল ক্যারেক্টার ব্যবহার করা যাবে)"
      : "At least one number. (Special character, symbols are allowed)",
    phone: isBangla ? "ফোন নম্বর" : "Phone Number",
    phonePh: isBangla ? "আপনার ফোন নম্বর দিন।" : "Enter your phone number.",
    refCode: isBangla ? "রেফার কোড" : "Refer Code",
    refPh: isBangla ? "রেফার কোড লিখুন" : "Enter refer code",
    submit: isBangla ? "সাবমিট" : "Submit",
    loading: isBangla ? "রেজিস্টার হচ্ছে..." : "Registering...",
    already: isBangla ? "আগেই একাউন্ট আছে ?" : "Already a member ?",
    login: isBangla ? "লগইন" : "Log in",
    terms: isBangla
      ? "রেজিস্টার করার মাধ্যমে আপনি নিশ্চিত করছেন যে আপনার বয়স ১৮ বছরের বেশি এবং আপনি Terms & Conditions পড়েছেন ও সম্মত হয়েছেন।"
      : "Registering means you are over 18 years old, have read and agree to the Terms & Conditions.",
    searchCountry: isBangla ? "দেশ খুঁজুন..." : "Search country...",

    sendOtp: isBangla ? "OTP পাঠান" : "Send OTP",
    resendOtp: isBangla ? "আবার OTP পাঠান" : "Resend OTP",
    sendingOtp: isBangla ? "OTP পাঠানো হচ্ছে..." : "Sending OTP...",
    otpCode: isBangla ? "OTP কোড" : "OTP Code",
    otpPh: isBangla ? "OTP কোড লিখুন" : "Enter OTP code",
    enterOtp: isBangla ? "OTP কোড দিন" : "Enter OTP code",
    otpExpired: isBangla
      ? "OTP মেয়াদ শেষ। আবার OTP পাঠান"
      : "OTP expired. Send OTP again",

    enterUsername: isBangla ? "ইউজারনেম দিন" : "Enter username",
    usernameLength: isBangla
      ? "ইউজারনেম ৪-১৫ অক্ষরের হতে হবে"
      : "Username must be 4-15 characters",
    usernameInvalid: isBangla
      ? "ইউজারনেমে শুধু ইংরেজি অক্ষর ও নাম্বার ব্যবহার করুন"
      : "Username only allows letters and numbers",
    enterPassword: isBangla ? "পাসওয়ার্ড দিন" : "Enter password",
    passwordLength: isBangla
      ? "পাসওয়ার্ড ৬-২০ অক্ষরের হতে হবে"
      : "Password must be 6-20 characters",
    passwordAlphabet: isBangla
      ? "পাসওয়ার্ডে কমপক্ষে একটি অক্ষর থাকতে হবে"
      : "Password must contain at least one alphabet",
    passwordNumber: isBangla
      ? "পাসওয়ার্ডে কমপক্ষে একটি নাম্বার থাকতে হবে"
      : "Password must contain at least one number",
    enterPhone: isBangla ? "ফোন নম্বর দিন" : "Enter phone number",
    phoneLength: isBangla ? "সঠিক ফোন নম্বর দিন" : "Enter a valid phone number",
    success: isBangla ? "রেজিস্ট্রেশন সফল হয়েছে" : "Registration successful",
    congratsTitle: isBangla ? "অভিনন্দন!" : "Congratulations!",
    congratsButton: isBangla ? "ঠিক আছে" : "OK",
    congratsDesc: (amount) =>
      isBangla
        ? `আপনি রেজিস্ট্রেশন বোনাস হিসেবে ৳${amount} পেয়েছেন! বোনাসটি আপনার ব্যালেন্সে যোগ হয়ে গেছে।`
        : `You've received a ৳${amount} registration bonus! It's already been added to your balance.`,
  };

  const resetOtp = () => {
    setOtpInput("");
    setOtpExpiresAt(0);
    setCountdown(0);
  };

  useEffect(() => {
    const queryRef = getRefFromSearch(location.search);

    if (queryRef) {
      setRefCode(queryRef);
    }
  }, [location.search]);

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setPhone("");
    setRefCode(getRefFromSearch(location.search));
    setShowPassword(false);
    setCurrencyOpen(false);
    setCountryOpen(false);
    setSearch("");
    setErrors({ username: "", phone: "", otp: "" });
    setGeneralError("");
    resetOtp();
  };

  const handleClose = () => {
    onClose?.();
    setCurrencyOpen(false);
    setCountryOpen(false);
    setSearch("");
  };

  useEffect(() => {
    if (!open) return;
    if (!slides.length) return;

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 2600);

    return () => clearInterval(timer);
  }, [open, slides.length]);

  useEffect(() => {
    if (activeSlide >= slides.length) {
      setActiveSlide(0);
    }
  }, [activeSlide, slides.length]);

  useEffect(() => {
    if (!open) return;

    const loadCountries = async () => {
      try {
        const res = await api.get("/api/countries");
        const data = res?.data?.data || [];

        const list = (Array.isArray(data) ? data : [])
          .map((c) => ({
            name: c?.name || "",
            code: c?.code || "",
            cca2: c?.cca2 || "",
            flag:
              c?.flag ||
              `https://flagcdn.com/w40/${String(c?.cca2 || "").toLowerCase()}.png`,
          }))
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
    if (!otpRequired) {
      resetOtp();
    }
  }, [otpRequired]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryRef.current && !countryRef.current.contains(event.target)) {
        setCountryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const cleanUsername = username.trim().toLowerCase();
  const cleanPassword = String(password || "");
  const cleanPhone = String(phone || "").replace(/\D/g, "");
  const finalSubmitPhone = isBangladeshSelected
    ? normalizePhoneForBd(cleanPhone)
    : cleanPhone;

  const passwordLengthValid =
    cleanPassword.length >= 6 && cleanPassword.length <= 20;
  const passwordHasAlphabet = /[a-zA-Z]/.test(cleanPassword);
  const passwordHasNumber = /\d/.test(cleanPassword);
  const passwordValid =
    passwordLengthValid && passwordHasAlphabet && passwordHasNumber;

  const canSubmit =
    cleanUsername.length >= 4 &&
    cleanUsername.length <= 15 &&
    /^[a-z0-9]+$/.test(cleanUsername) &&
    passwordValid &&
    cleanPhone.length >= 6 &&
    (!otpRequired || otpInput.trim().length > 0);

  const handleSendOtp = async () => {
    if (!otpRequired) return;

    if (!cleanPhone) {
      setErrors((prev) => ({ ...prev, phone: text.enterPhone }));
      return;
    }

    if (cleanPhone.length < 6) {
      setErrors((prev) => ({ ...prev, phone: text.phoneLength }));
      return;
    }

    try {
      setOtpSending(true);
      setOtpInput("");
      setOtpExpiresAt(0);
      setErrors((prev) => ({ ...prev, phone: "" }));

      const { data } = await api.post(
        "/api/users/forgot-password/register/send-otp",
        {
          countryCode: selected.code,
          phone: normalizePhoneForBd(cleanPhone),
        },
      );

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

      setErrors((prev) => ({
        ...prev,
        phone:
          error?.response?.data?.message ||
          error?.message ||
          "OTP send failed",
      }));
    } finally {
      setOtpSending(false);
    }
  };

  const verifyRegisterOtp = async () => {
    const { data } = await api.post(
      "/api/users/forgot-password/register/verify-otp",
      {
        countryCode: selected.code,
        phone: finalSubmitPhone,
        otp: otpInput.trim(),
      },
    );

    if (!data?.success) {
      throw new Error(data?.message || "OTP verification failed");
    }

    return data;
  };

  const registerMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/api/users/register", payload);
      return data;
    },

    onSuccess: (res) => {
      const user = res?.data?.user;
      const token = res?.data?.token;

      if (user && token) {
        dispatch(setCredentials({ user, token }));
        try {
          const demoUserId = user?._id || user?.id || user?.userId;
          if (demoUserId) {
            const saved = JSON.parse(
              localStorage.getItem("bajiman_demo_wallet_v1") || "{}",
            );
            if (!saved[demoUserId]) {
              localStorage.setItem(
                "bajiman_demo_wallet_v1",
                JSON.stringify({
                  ...saved,
                  [demoUserId]: { balance: 2000, plays: 0 },
                }),
              );
            }
          }
        } catch {
          // Demo credits are best-effort local state and never affect real balance.
        }
      }

      toast.success(res?.message || text.success);

      const bonus = res?.data?.registerBonus;
      if (bonus?.bonusAmount > 0) {
        setBonusAmountWon(bonus.bonusAmount);
        setShowBonusCongrats(true);
      }

      handleClose();

      setTimeout(() => {
        resetForm();
      }, 250);
    },

    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        (isBangla ? "রেজিস্ট্রেশন ব্যর্থ হয়েছে" : "Registration failed");
      const field = getErrorField(message);

      if (field) {
        setErrors((prev) => ({ ...prev, [field]: message }));
      } else {
        setGeneralError(message);
      }
    },
  });

  const validateForm = () => {
    const newErrors = { username: "", phone: "", otp: "" };

    if (!cleanUsername) {
      newErrors.username = text.enterUsername;
    } else if (cleanUsername.length < 4 || cleanUsername.length > 15) {
      newErrors.username = text.usernameLength;
    } else if (!/^[a-z0-9]+$/.test(cleanUsername)) {
      newErrors.username = text.usernameInvalid;
    }

    if (!cleanPhone) {
      newErrors.phone = text.enterPhone;
    } else if (cleanPhone.length < 6) {
      newErrors.phone = text.phoneLength;
    }

    if (otpRequired) {
      if (!otpExpiresAt || Date.now() > otpExpiresAt) {
        newErrors.otp = text.otpExpired;
      } else if (!otpInput.trim()) {
        newErrors.otp = text.enterOtp;
      }
    }

    setErrors(newErrors);

    return (
      !newErrors.username &&
      passwordValid &&
      !newErrors.phone &&
      !newErrors.otp
    );
  };

  const handleSubmit = async () => {
    if (registerMutation.isPending) return;

    setGeneralError("");
    if (!validateForm()) return;

    try {
      if (otpRequired) {
        await verifyRegisterOtp();
      }

      registerMutation.mutate({
        currency: "BDT",
        username: cleanUsername,
        password: cleanPassword,
        countryCode: selected.code,
        phone: finalSubmitPhone,
        referCode: refCode.trim().toUpperCase(),
        otp: otpRequired ? otpInput.trim() : "",
      });
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        otp:
          error?.response?.data?.message ||
          error?.message ||
          "OTP verification failed",
      }));
    }
  };

  const inputStyle = {
    backgroundColor: setting.inputBg,
    color: setting.inputText,
    borderColor: setting.inputBorder,
    "--placeholder-color": setting.placeholderText,
  };

  return (
    <>
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
                disabled={registerMutation.isPending}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
                style={{ color: setting.headerText }}
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pb-5 [scrollbar-width:none]">
              <div className="flex justify-center py-5">
                <img
                  src={logoUrl}
                  alt="CRICKEX"
                  className="h-[28px] object-contain"
                />
              </div>

              <div className="w-full overflow-hidden">
                <div
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{
                    transform: `translateX(-${activeSlide * 100}%)`,
                  }}
                >
                  {slides.map((img, index) => (
                    <div key={index} className="min-w-full px-[21px]">
                      <div
                        className="h-[104px] overflow-hidden rounded-[4px]"
                        style={{ backgroundColor: setting.bannerBg }}
                      >
                        <img
                          src={img}
                          alt={`register-banner-${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex justify-center gap-1.5">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    className="h-[6px] cursor-pointer rounded-full transition-all"
                    style={{
                      width: activeSlide === index ? "18px" : "6px",
                      backgroundColor:
                        activeSlide === index
                          ? setting.sliderDotActive
                          : setting.sliderDotInactive,
                    }}
                  />
                ))}
              </div>

              <div className="px-[21px] pt-6">
                <label
                  className="mb-3 block text-[14px]"
                  style={{ color: setting.labelText }}
                >
                  {text.chooseCurrency}
                </label>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCurrencyOpen((prev) => !prev)}
                    className="flex h-[45px] w-full cursor-pointer items-center justify-between rounded-[4px] border px-3"
                    style={inputStyle}
                  >
                    <span className="flex items-center gap-3 text-[14px]">
                      <img
                        src="https://flagcdn.com/w40/bd.png"
                        alt="BD"
                        className="h-[22px] w-[22px] rounded-full object-cover"
                      />
                      BDT
                    </span>

                    <ChevronDown size={17} />
                  </button>

                  {currencyOpen && (
                    <div
                      className="absolute left-0 top-[49px] z-20 w-full rounded border shadow"
                      style={{
                        backgroundColor: setting.dropdownBg,
                        color: setting.dropdownText,
                        borderColor: setting.dropdownBorder,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setCurrencyOpen(false)}
                        className="flex w-full cursor-pointer items-center gap-3 px-3 py-3 text-left text-sm"
                      >
                        <img
                          src="https://flagcdn.com/w40/bd.png"
                          alt="BD"
                          className="h-[22px] w-[22px] rounded-full object-cover"
                        />
                        BDT
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-8">
                  <label
                    className="mb-3 block text-[14px]"
                    style={{ color: setting.labelText }}
                  >
                    {text.username}
                  </label>

                  <input
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
                    disabled={registerMutation.isPending}
                    className="register-dynamic-input h-[45px] w-full rounded-[4px] border px-4 text-[13px] outline-none disabled:cursor-not-allowed"
                    style={inputStyle}
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
                      onChange={(e) =>
                        setPassword(e.target.value.slice(0, 20))
                      }
                      placeholder={text.passwordPh}
                      disabled={registerMutation.isPending}
                      className="register-dynamic-input h-full min-w-0 flex-1 bg-transparent text-[13px] outline-none disabled:cursor-not-allowed"
                      style={{
                        color: setting.inputText,
                        "--placeholder-color": setting.placeholderText,
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      disabled={registerMutation.isPending}
                      className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                      style={{ color: setting.placeholderText }}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>

                  <div className="mt-3 space-y-1.5 text-[13px] leading-[18px]">
                    {[
                      { met: passwordLengthValid, label: text.rule1 },
                      { met: passwordHasAlphabet, label: text.rule2 },
                      { met: passwordHasNumber, label: text.rule3 },
                    ].map((rule) => (
                      <div
                        key={rule.label}
                        className={`flex items-start gap-2 ${
                          rule.met ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        <CheckCircle
                          size={15}
                          className="mt-[1px] shrink-0"
                        />
                        <span>{rule.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
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
                        disabled={registerMutation.isPending}
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
                          setErrors((prev) => ({ ...prev, phone: "" }));
                        }}
                        placeholder={text.phonePh}
                        disabled={registerMutation.isPending}
                        className="register-dynamic-input h-full min-w-0 flex-1 bg-transparent px-4 text-[13px] outline-none disabled:cursor-not-allowed"
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
                              className="register-dynamic-input h-full w-full bg-transparent text-sm outline-none"
                              style={{
                                color: setting.dropdownText,
                                "--placeholder-color": setting.placeholderText,
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

                  {errors.phone && (
                    <p className="mt-1.5 text-[12px] text-red-500">
                      {errors.phone}
                    </p>
                  )}
                </div>

                {otpRequired && (
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
                        onChange={(e) => {
                          setOtpInput(e.target.value.replace(/\D/g, ""));
                          setErrors((prev) => ({ ...prev, otp: "" }));
                        }}
                        placeholder={text.otpPh}
                        disabled={registerMutation.isPending}
                        className="register-dynamic-input h-[45px] min-w-0 flex-1 rounded-[4px] border px-4 text-[13px] outline-none disabled:cursor-not-allowed"
                        style={inputStyle}
                      />

                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={
                          otpSending ||
                          countdown > 0 ||
                          registerMutation.isPending
                        }
                        className="h-[45px] shrink-0 cursor-pointer rounded-[4px] px-3 text-[12px] font-medium disabled:cursor-not-allowed disabled:opacity-70"
                        style={{
                          backgroundColor:
                            otpSending ||
                            countdown > 0 ||
                            registerMutation.isPending
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

                    {errors.otp && (
                      <p className="mt-1.5 text-[12px] text-red-500">
                        {errors.otp}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-5">
                  <label
                    className="mb-3 block text-[14px]"
                    style={{ color: setting.labelText }}
                  >
                    {text.refCode}
                  </label>

                  <input
                    value={refCode}
                    onChange={(e) =>
                      setRefCode(
                        e.target.value
                          .toUpperCase()
                          .replace(/\s/g, "")
                          .replace(/[^A-Z0-9]/g, "")
                          .slice(0, 6),
                      )
                    }
                    placeholder={text.refPh}
                    disabled={registerMutation.isPending}
                    className="register-dynamic-input h-[45px] w-full rounded-[4px] border px-4 text-[13px] outline-none disabled:cursor-not-allowed"
                    style={inputStyle}
                  />
                </div>

                {generalError && (
                  <p className="mt-3 text-center text-[12px] text-red-500">
                    {generalError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit || registerMutation.isPending}
                  className="mt-8 h-[44px] w-full cursor-pointer rounded-[3px] text-[14px] font-medium disabled:cursor-not-allowed"
                  style={{
                    backgroundColor:
                      !canSubmit || registerMutation.isPending
                        ? setting.buttonDisabledBg
                        : setting.buttonBg,
                    color: setting.buttonText,
                  }}
                >
                  {registerMutation.isPending ? text.loading : text.submit}
                </button>

                <div
                  className="mt-5 text-center text-[14px]"
                  style={{ color: setting.footerText }}
                >
                  {text.already}{" "}
                  <button
                    type="button"
                    onClick={onLoginClick}
                    disabled={registerMutation.isPending}
                    className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ color: setting.linkText }}
                  >
                    {text.login}
                  </button>
                </div>

                <p
                  className="mx-auto mt-5 max-w-[320px] text-center text-[14px] leading-[18px]"
                  style={{ color: setting.footerText }}
                >
                  {text.terms}
                </p>
              </div>
            </div>

            <style>{`
              .register-dynamic-input::placeholder {
                color: var(--placeholder-color);
              }
            `}</style>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

      <SuccessConfirmModal
        open={showBonusCongrats}
        icon={PartyPopper}
        title={text.congratsTitle}
        description={text.congratsDesc(bonusAmountWon)}
        buttonText={text.congratsButton}
        onButtonClick={() => setShowBonusCongrats(false)}
        colors={{
          successBg: setting.buttonBg,
          successText: setting.buttonText,
          modalBg: setting.modalBg,
          primaryBg: setting.buttonBg,
          primaryText: setting.buttonText,
          mutedText: setting.footerText,
        }}
      />
    </>
  );
};

export default RegisterModal;
