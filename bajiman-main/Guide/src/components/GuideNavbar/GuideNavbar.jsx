import React, { useState } from "react";
import { Link, NavLink } from "react-router";
import { Menu, X, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { useLanguage } from "../../Context/LanguageProvider";
import { siteConfig } from "../../data/siteConfig";
import { topics } from "../../data/topicsData";
import flagBd from "../../assets/navbar/flag-bd.png";
import flagUs from "../../assets/navbar/flag-us.png";

const CLIENT_URL = import.meta.env.VITE_CLIENT_URL || "http://localhost:5173";

const flagUrl = {
  Bangla: flagBd,
  English: flagUs,
};

const colors = {
  headerBg: "#285b98",
  registerBg: "#53d313",
  registerHoverBg: "#48c20c",
  loginBg: "#ffffff",
  loginText: "#285b98",
  loginHoverBg: "#eaf3fb",
  navText: "rgba(255,255,255,0.92)",
  navActiveText: "#ffffff",
};

const GuideNavbar = () => {
  const { language, isBangla, changeLanguage } = useLanguage();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [topicsOpen, setTopicsOpen] = useState(false);

  const logoUrl = siteConfig.logo;

  const siteName = isBangla
    ? siteConfig.siteName.bn
    : siteConfig.siteName.en;

  const texts = {
    home: isBangla ? "হোম" : "Home",
    referral: isBangla ? "রেফারেল" : "Referral",
    vip: isBangla ? "ভিআইপি প্রোগ্রাম" : "VIP Program",
    topics: isBangla ? "টপিকস" : "Topics",

    news: siteName
      ? isBangla
        ? `${siteName} নিউজ`
        : `${siteName} News`
      : isBangla
        ? "নিউজ"
        : "News",

    login: isBangla ? "লগইন" : "Login",
    register: isBangla ? "রেজিস্টার" : "Register",
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-1 text-[16px] font-medium transition-colors duration-200 hover:text-white ${
      isActive ? "text-white" : "text-white/90"
    }`;

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const toggleLanguage = () => {
    changeLanguage(isBangla ? "English" : "Bangla");
  };

  return (
    <header
      className="sticky top-0 z-40 w-full"
      style={{
        backgroundColor: colors.headerBg,
        color: colors.navText,
        boxShadow: "0 2px 9px rgba(0,0,0,0.22)",
      }}
    >
      {/* Main navbar */}
      <div className="mx-auto flex h-[80px] w-full max-w-[1310px] items-center justify-between gap-4 px-4 sm:px-6 xl:px-5">
        {/* Logo and navigation */}
        <div className="flex min-w-0 items-center">
          <div className="flex shrink-0 items-center gap-3">
            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex cursor-pointer items-center justify-center text-white xl:hidden"
              aria-label="Open menu"
            >
              <Menu size={26} strokeWidth={2} />
            </button>

            {/* Logo */}
            <Link to="/" className="flex shrink-0 items-center">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={siteName || "Logo"}
                  className="h-[34px] w-auto object-contain xl:h-[39px] xl:max-w-[180px]"
                  draggable={false}
                />
              ) : (
                <span className="text-[28px] font-black italic tracking-[-1px] text-white">
                  {siteName || "GUIDE"}
                </span>
              )}
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="ml-[70px] hidden items-center gap-[35px] xl:flex 2xl:ml-[220px] 2xl:gap-[47px]">
            <NavLink to="/" className={navLinkClass} end>
              {texts.home}
            </NavLink>

            <Link
              to="/referral"
              className="whitespace-nowrap text-[16px] font-medium text-white/90 transition-colors duration-200 hover:text-white"
            >
              {texts.referral}
            </Link>

            <Link
              to="/vip-program"
              className="whitespace-nowrap text-[16px] font-medium text-white/90 transition-colors duration-200 hover:text-white"
            >
              {texts.vip}
            </Link>

            {/* Topics dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setTopicsOpen(true)}
              onMouseLeave={() => setTopicsOpen(false)}
            >
              <button
                type="button"
                onClick={() => setTopicsOpen((previous) => !previous)}
                className="flex cursor-pointer items-center gap-1 whitespace-nowrap text-[16px] font-medium text-white/90 transition-colors duration-200 hover:text-white"
              >
                {texts.topics}

                <ChevronDown
                  size={17}
                  strokeWidth={2.5}
                  className={`transition-transform duration-200 ${
                    topicsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {topicsOpen && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -8,
                      scale: 0.98,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                      scale: 0.98,
                    }}
                    transition={{
                      duration: 0.16,
                      ease: "easeOut",
                    }}
                    className="absolute left-1/2 top-[30px] z-50 w-[210px] -translate-x-1/2 overflow-hidden rounded-[6px] border border-black/5 bg-white py-2 text-[#1c2b3a] shadow-2xl"
                  >
                    {topics.map((topic) => (
                      <Link
                        key={topic.slug}
                        to={`/topic/${topic.slug}`}
                        onClick={() => setTopicsOpen(false)}
                        className="block px-4 py-[10px] text-[13px] font-medium transition-colors duration-150 hover:bg-[#eef6ff] hover:text-[#0b66a8]"
                      >
                        {isBangla ? topic.title.bn : topic.title.en}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* News */}
            {/* <a
              href={CLIENT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap text-[16px] font-medium text-white/90 transition-colors duration-200 hover:text-white"
            >
              {texts.news}
            </a> */}
          </nav>
        </div>

        {/* Desktop right section */}
        <div className="hidden shrink-0 items-center gap-3 xl:flex">
          {/* Login */}
          <a
            href={`${CLIENT_URL}`}
            className="min-w-[93px] cursor-pointer rounded-[5px] px-5 py-[8px] text-center text-[16px] font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.25)] transition-all duration-200 hover:-translate-y-px"
            style={{
              backgroundColor: colors.loginBg,
              color: colors.loginText,
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.backgroundColor = colors.loginHoverBg;
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.backgroundColor = colors.loginBg;
            }}
          >
            {texts.login}
          </a>

          {/* Register */}
          <a
            href={`${CLIENT_URL}`}
            className="min-w-[116px] cursor-pointer rounded-[5px] px-5 py-[8px] text-center text-[16px] font-semibold text-white shadow-[0_2px_8px_rgba(0,0,0,0.22)] transition-all duration-200 hover:-translate-y-px"
            style={{
              backgroundColor: colors.registerBg,
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.backgroundColor =
                colors.registerHoverBg;
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.backgroundColor = colors.registerBg;
            }}
          >
            {texts.register}
          </a>

          {/* Language toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="ml-5 flex h-[43px] w-[43px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white transition hover:scale-105"
            title={isBangla ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
            aria-label={`Change language from ${language}`}
          >
            <img
              src={isBangla ? flagUrl.Bangla : flagUrl.English}
              alt={language}
              className="h-full w-full rounded-full object-cover"
              draggable={false}
            />
          </button>
        </div>

        {/* Mobile language toggle */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="flex h-[36px] w-[36px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white transition hover:scale-105 xl:hidden"
          title={isBangla ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
          aria-label={`Change language from ${language}`}
        >
          <img
            src={isBangla ? flagUrl.Bangla : flagUrl.English}
            alt={language}
            className="h-full w-full rounded-full object-cover"
            draggable={false}
          />
        </button>
      </div>

      {/* Bottom green border */}
      <div
        className="h-[2px] w-full"
        style={{
          backgroundColor: "#62e327",
          boxShadow: "0 0 5px rgba(98,227,39,0.8)",
        }}
      />

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Mobile backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[998] bg-black/50 backdrop-blur-[1px] xl:hidden"
              onClick={closeMobileMenu}
            />

            {/* Mobile sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                duration: 0.22,
                ease: "easeOut",
              }}
              className="fixed left-0 top-0 z-[999] h-full w-[280px] overflow-y-auto bg-white text-[#1c2b3a] shadow-2xl xl:hidden"
            >
              {/* Mobile header */}
              <div
                className="flex h-[80px] items-center justify-between border-b-2 border-[#62e327] px-4"
                style={{
                  backgroundColor: colors.headerBg,
                }}
              >
                <Link
                  to="/"
                  onClick={closeMobileMenu}
                  className="flex items-center"
                >
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={siteName || "Logo"}
                      className="h-[30px] max-w-[165px] object-contain"
                      draggable={false}
                    />
                  ) : (
                    <span className="text-[22px] font-black italic tracking-[-1px] text-white">
                      {siteName || "GUIDE"}
                    </span>
                  )}
                </Link>

                <button
                  type="button"
                  onClick={closeMobileMenu}
                  className="flex cursor-pointer items-center justify-center rounded-full p-1 text-white transition hover:bg-white/10"
                  aria-label="Close menu"
                >
                  <X size={25} strokeWidth={2} />
                </button>
              </div>

              {/* Mobile links */}
              <div className="flex flex-col gap-1 p-3">
                <NavLink
                  to="/"
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `rounded-[6px] px-3 py-3 text-[14px] font-semibold transition-colors ${
                      isActive
                        ? "bg-[#eaf4ff] text-[#285b98]"
                        : "hover:bg-[#eef6ff]"
                    }`
                  }
                  end
                >
                  {texts.home}
                </NavLink>

                <Link
                  to="/referral"
                  onClick={closeMobileMenu}
                  className="rounded-[6px] px-3 py-3 text-[14px] font-semibold transition-colors hover:bg-[#eef6ff] hover:text-[#285b98]"
                >
                  {texts.referral}
                </Link>

                <Link
                  to="/vip-program"
                  onClick={closeMobileMenu}
                  className="rounded-[6px] px-3 py-3 text-[14px] font-semibold transition-colors hover:bg-[#eef6ff] hover:text-[#285b98]"
                >
                  {texts.vip}
                </Link>

                {/* Topics title */}
                <div className="mt-2 px-3 pb-1 pt-2 text-[12px] font-bold uppercase tracking-wide text-[#8a97a6]">
                  {texts.topics}
                </div>

                {/* Topic links */}
                {topics.map((topic) => (
                  <Link
                    key={topic.slug}
                    to={`/topic/${topic.slug}`}
                    onClick={closeMobileMenu}
                    className="rounded-[6px] px-3 py-[9px] text-[13px] font-medium transition-colors hover:bg-[#eef6ff] hover:text-[#285b98]"
                  >
                    {isBangla ? topic.title.bn : topic.title.en}
                  </Link>
                ))}

                {/* News */}
                {/* <a
                  href={CLIENT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMobileMenu}
                  className="mt-1 rounded-[6px] px-3 py-3 text-[14px] font-semibold transition-colors hover:bg-[#eef6ff] hover:text-[#285b98]"
                >
                  {texts.news}
                </a> */}

                {/* Mobile buttons */}
                <div className="mt-3 flex gap-2 border-t border-black/10 p-3">
                  <a
                    href={`${CLIENT_URL}/login`}
                    className="flex-1 rounded-[5px] py-[10px] text-center text-[13px] font-bold transition hover:bg-[#eaf3fb]"
                    style={{
                      backgroundColor: colors.loginBg,
                      color: colors.loginText,
                      boxShadow: "inset 0 0 0 1px #d8e6f2",
                    }}
                  >
                    {texts.login}
                  </a>

                  <a
                    href={`${CLIENT_URL}/register`}
                    className="flex-1 rounded-[5px] py-[10px] text-center text-[13px] font-bold text-white transition hover:opacity-90"
                    style={{
                      backgroundColor: colors.registerBg,
                    }}
                  >
                    {texts.register}
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default GuideNavbar;
