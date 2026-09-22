import React from "react";
import { FaFacebookF, FaInstagram, FaTelegramPlane } from "react-icons/fa";
import { RiTwitterXLine } from "react-icons/ri";

import { useLanguage } from "../../Context/LanguageProvider";
import NAVBAR_BACKGROUND from "../../assets/hero/hero-background.png";
import BRAND_LOGO from "../../assets/brand/bajiman-logo.png";
import flagBd from "../../assets/navbar/flag-bd.png";
import flagUs from "../../assets/navbar/flag-us.png";

const CLIENT_URL = (import.meta.env.VITE_CLIENT_URL || "/").replace(/\/$/, "");
const REGISTER_URL = `${CLIENT_URL}`;
const LOGIN_URL = `${CLIENT_URL}`;

const flagUrl = {
  Bangla: flagBd,
  English: flagUs,
};

const socialLinks = [
  {
    id: "twitter",
    label: "X",
    href: "https://x.com/",
    icon: RiTwitterXLine,
  },
  {
    id: "facebook",
    label: "Facebook",
    href: "https://facebook.com/",
    icon: FaFacebookF,
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://instagram.com/",
    icon: FaInstagram,
  },
  {
    id: "telegram",
    label: "Telegram",
    href: "https://t.me/",
    icon: FaTelegramPlane,
  },
];

const BrandNavbar = () => {
  const { language, changeLanguage, isBangla } = useLanguage();

  const toggleLanguage = () => {
    changeLanguage(isBangla ? "English" : "Bangla");
  };

  return (
    <header
      className="relative z-50 w-full h-[68px] bg-[#104d96] bg-cover bg-center shadow-[0_3px_18px_rgba(0,0,0,0.2)] sm:h-[78px] lg:h-[106px]"
      style={{
        backgroundImage: `url("${NAVBAR_BACKGROUND}")`,
      }}
    >
      {/* Background color overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[#064992]/15" />

      <div className="relative mx-auto flex h-full w-full max-w-[1536px] items-center justify-between px-4 pb-[6px] sm:px-7 lg:px-12 lg:pb-[8px] xl:px-16">
        {/* Brand logo */}
        <a
          href={CLIENT_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit Bajiman"
          className="relative z-10 shrink-0 transition hover:opacity-90"
        >
          <img
            src={BRAND_LOGO}
            alt="Bajiman"
            draggable={false}
            className="block h-auto w-[125px] object-contain sm:w-[155px] lg:w-[202px]"
          />
        </a>

        {/* Desktop menu */}
        <div className="relative z-10 hidden items-center md:flex">
          {/* Join button */}
          <a
            href={REGISTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-[40px] w-[158px] items-center justify-center bg-[#fb494d] text-[15px] font-extrabold text-white transition duration-200 hover:brightness-110 lg:h-[42px] lg:w-[184px] lg:text-[17px]"
            style={{
              clipPath: "polygon(6% 0, 100% 0, 94% 100%, 0% 100%)",
            }}
          >
            <span className="transition-transform duration-200 group-hover:scale-105">
              {isBangla ? "এখনই যোগ দিন" : "Join Now"}
            </span>
          </a>

          {/* Login button */}
          <a
            href={LOGIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group ml-2 flex h-[40px] w-[158px] items-center justify-center bg-[#4de000] text-[15px] font-extrabold text-white transition duration-200 hover:brightness-110 lg:ml-3 lg:h-[42px] lg:w-[184px] lg:text-[17px]"
            style={{
              clipPath: "polygon(6% 0, 100% 0, 94% 100%, 0% 100%)",
            }}
          >
            <span className="transition-transform duration-200 group-hover:scale-105">
              {isBangla ? "লগইন" : "Login"}
            </span>
          </a>

          {/* Social icons */}
          <div className="ml-5 flex items-center gap-3 lg:ml-7 lg:gap-4">
            {socialLinks.map(({ id, label, href, icon: Icon }) => (
              <a
                key={id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-[31px] w-[31px] items-center justify-center rounded-full bg-white text-[#154d93] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#4de000] hover:text-white lg:h-[34px] lg:w-[34px]"
              >
                <Icon className="text-[15px] lg:text-[17px]" />
              </a>
            ))}

            {/* Language button */}
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label={`Change language from ${language}`}
              title={isBangla ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
              className="ml-1 flex h-[32px] w-[32px] cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white transition hover:scale-105 lg:h-[35px] lg:w-[35px]"
            >
              <img
                src={isBangla ? flagUrl.Bangla : flagUrl.English}
                alt={language}
                className="h-full w-full rounded-full object-cover"
              />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="relative z-10 flex items-center gap-1.5 md:hidden">
          <button
            type="button"
            onClick={toggleLanguage}
            aria-label={`Change language from ${language}`}
            className="mr-1 flex h-[28px] w-[28px] cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white"
          >
            <img
              src={isBangla ? flagUrl.Bangla : flagUrl.English}
              alt={language}
              className="h-full w-full rounded-full object-cover"
            />
          </button>

          <a
            href={REGISTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-[31px] min-w-[66px] items-center justify-center bg-[#fb494d] px-3 text-[10px] font-extrabold text-white"
            style={{
              clipPath: "polygon(7% 0, 100% 0, 93% 100%, 0% 100%)",
            }}
          >
            {isBangla ? "যোগ দিন" : "Join"}
          </a>

          <a
            href={LOGIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-[31px] min-w-[66px] items-center justify-center bg-[#4de000] px-3 text-[10px] font-extrabold text-white"
            style={{
              clipPath: "polygon(7% 0, 100% 0, 93% 100%, 0% 100%)",
            }}
          >
            {isBangla ? "লগইন" : "Login"}
          </a>
        </div>

        {/* Navbar bottom line */}
        <div className="pointer-events-none absolute bottom-[6px] left-4 right-4 h-px bg-[#32a9e5]/80 sm:left-7 sm:right-7 lg:bottom-[7px] lg:left-12 lg:right-12 xl:left-16 xl:right-16" />
      </div>
    </header>
  );
};

export default BrandNavbar;
