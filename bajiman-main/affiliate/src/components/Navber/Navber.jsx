import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { Check, ChevronDown, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import { fetchAffiliateGlobalData } from "../../features/global/globalSlice";
import {
  selectAffiliateNavbarSetting,
  selectGlobalLoaded,
  selectGlobalLoading,
} from "../../features/global/globalSelectors";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const LOGO_URL =
  "https://crickexpartner.com/wp-content/uploads/2024/03/logo-2.png";

const flagUrl = {
  Bangla: "https://flagcdn.com/w40/bd.png",
  English: "https://flagcdn.com/w40/us.png",
};

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

const NavbarSkeleton = () => (
  <header className="sticky top-0 z-50 w-full border-t border-[#0b1f33] bg-[#dff8ff] shadow-sm">
    <nav className="mx-auto flex h-[95px] w-full max-w-[1500px] animate-pulse items-center justify-between px-4 sm:px-8 lg:px-24">
      <div className="h-[44px] w-[150px] rounded bg-slate-300" />

      <div className="hidden items-center gap-9 lg:flex">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-full bg-slate-300" />
          <div className="h-5 w-20 rounded bg-slate-300" />
          <div className="h-4 w-4 rounded bg-slate-300" />
        </div>

        <div className="h-10 w-[90px] rounded-[7px] bg-slate-300" />
        <div className="h-10 w-[110px] rounded-[7px] bg-slate-300" />
      </div>

      <div className="flex h-11 w-11 rounded-lg bg-slate-300 lg:hidden" />
    </nav>
  </header>
);

const Navber = () => {
  const { language, changeLanguage, isBangla } = useLanguage();
  const dispatch = useDispatch();

  const globalLoading = useSelector(selectGlobalLoading);
  const globalLoaded = useSelector(selectGlobalLoaded);
  const setting = useSelector(selectAffiliateNavbarSetting);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    if (!globalLoaded && !globalLoading) {
      dispatch(fetchAffiliateGlobalData());
    }
  }, [dispatch, globalLoaded, globalLoading]);

  const texts = {
    login: getText(
      setting?.loginText,
      isBangla,
      isBangla ? "প্রবেশ করুন" : "Login",
    ),
    register: getText(
      setting?.registerText,
      isBangla,
      isBangla ? "নিবন্ধন করুন" : "Register",
    ),
    selectLanguage: getText(
      setting?.selectLanguageText,
      isBangla,
      isBangla ? "ভাষা নির্বাচন করুন" : "Select Language",
    ),
  };

  const languages = [
    { key: "Bangla", label: "বাংলা", flag: flagUrl.Bangla },
    { key: "English", label: "English", flag: flagUrl.English },
  ];

  const colors = {
    navbarBg: getColor(setting, "navbarBg", "#dff8ff"),
    navbarBorderColor: getColor(setting, "navbarBorderColor", "#0b1f33"),
    textColor: getColor(setting, "textColor", "#18344d"),

    loginButtonBg: getColor(setting, "loginButtonBg", "#2069b7"),
    loginButtonHoverBg: getColor(setting, "loginButtonHoverBg", "#175ba3"),
    loginButtonBorderColor: getColor(
      setting,
      "loginButtonBorderColor",
      "#0e62b8",
    ),

    registerButtonBg: getColor(setting, "registerButtonBg", "#48b948"),
    registerButtonHoverBg: getColor(
      setting,
      "registerButtonHoverBg",
      "#37a937",
    ),

    buttonTextColor: getColor(setting, "buttonTextColor", "#ffffff"),
  };

  const contentMaxWidth = setting?.contentMaxWidth || "1500px";
  const navbarHeight = setting?.navbarHeight || "95px";
  const logoHeight = setting?.logoHeight || "44px";

  const logo = setting?.logoUrl || makeImageUrl(setting?.logo) || LOGO_URL;

  const loginPath = setting?.loginPath || "/login";
  const registerPath = setting?.registerPath || "/register";

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
    setLangOpen(false);
    setMobileOpen(false);
  };

  if (!globalLoaded && globalLoading) {
    return <NavbarSkeleton />;
  }

  return (
    <header
      className="sticky top-0 z-50 w-full border-t shadow-sm"
      style={{
        backgroundColor: colors.navbarBg,
        borderColor: colors.navbarBorderColor,
      }}
    >
      <nav
        className="mx-auto flex w-full items-center justify-between px-4 sm:px-8 lg:px-24"
        style={{
          maxWidth: contentMaxWidth,
          height: navbarHeight,
        }}
      >
        <Link to="/" className="flex cursor-pointer items-center">
          <img
            src={logo}
            alt="Crickex Partner"
            className="w-auto cursor-pointer object-contain"
            style={{ height: logoHeight }}
            draggable={false}
          />
        </Link>

        <div className="hidden items-center gap-9 lg:flex">
          <div
            className="relative cursor-pointer"
            onMouseEnter={() => setLangOpen(true)}
            onMouseLeave={() => setLangOpen(false)}
          >
            <button
              type="button"
              className="flex cursor-pointer items-center gap-4 px-2 py-4 text-[17px] font-medium"
              style={{ color: colors.textColor }}
            >
              <img
                src={flagUrl[language]}
                alt={language}
                className="h-8 w-8 rounded-full object-cover"
              />

              <span>{language === "Bangla" ? "বাংলা" : "English"}</span>

              <ChevronDown
                size={18}
                className={`transition ${langOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.16 }}
                  className="absolute left-1/2 top-full z-50 w-[190px] -translate-x-1/2 overflow-hidden rounded-xl border border-[#b5dbff] bg-white shadow-xl"
                >
                  {languages.map((item) => {
                    const active = language === item.key;

                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handleLanguageChange(item.key)}
                        className={`flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left text-[15px] font-medium transition ${
                          active
                            ? "bg-[#e8f6ff] text-[#145ca8]"
                            : "text-[#23384d] hover:bg-[#f2fbff]"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <img
                            src={item.flag}
                            alt={item.label}
                            className="h-6 w-6 rounded-full object-cover"
                          />
                          {item.label}
                        </span>

                        {active && <Check size={18} />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            to={loginPath}
            className="cursor-pointer rounded-[7px] border px-5 py-[8px] text-[16px] font-semibold shadow-[inset_0_0_0_1px_rgba(255,255,255,0.45)] transition"
            style={{
              backgroundColor: colors.loginButtonBg,
              borderColor: colors.loginButtonBorderColor,
              color: colors.buttonTextColor,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.loginButtonHoverBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.loginButtonBg;
            }}
          >
            {texts.login}
          </Link>

          <Link
            to={registerPath}
            className="cursor-pointer rounded-[7px] px-5 py-[9px] text-[16px] font-semibold shadow-sm transition"
            style={{
              backgroundColor: colors.registerButtonBg,
              color: colors.buttonTextColor,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                colors.registerButtonHoverBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.registerButtonBg;
            }}
          >
            {texts.register}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-[#2b77c8] bg-white text-[#1d5f9e] lg:hidden"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-[#bfe8f5] lg:hidden"
            style={{ backgroundColor: colors.navbarBg }}
          >
            <div className="mx-auto flex w-full max-w-[480px] flex-col gap-3 px-4 py-5">
              <div className="rounded-xl border border-[#b5dbff] bg-white p-2">
                <p
                  className="mb-2 px-2 text-sm font-semibold"
                  style={{ color: colors.textColor }}
                >
                  {texts.selectLanguage}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {languages.map((item) => {
                    const active = language === item.key;

                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handleLanguageChange(item.key)}
                        className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-semibold transition ${
                          active
                            ? "border-[#2b77c8] bg-[#e8f6ff] text-[#145ca8]"
                            : "border-[#e1eef8] bg-white text-[#23384d]"
                        }`}
                      >
                        <img
                          src={item.flag}
                          alt={item.label}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                        {item.label}
                        {active && <Check size={16} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <Link
                  to={loginPath}
                  onClick={() => setMobileOpen(false)}
                  className="cursor-pointer rounded-lg border px-4 py-3 text-center text-[15px] font-semibold"
                  style={{
                    backgroundColor: colors.loginButtonBg,
                    borderColor: colors.loginButtonBorderColor,
                    color: colors.buttonTextColor,
                  }}
                >
                  {texts.login}
                </Link>

                <Link
                  to={registerPath}
                  onClick={() => setMobileOpen(false)}
                  className="cursor-pointer rounded-lg px-4 py-3 text-center text-[15px] font-semibold"
                  style={{
                    backgroundColor: colors.registerButtonBg,
                    color: colors.buttonTextColor,
                  }}
                >
                  {texts.register}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navber;
