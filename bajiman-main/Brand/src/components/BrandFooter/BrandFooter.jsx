import React from "react";
import { FaFacebookF, FaInstagram, FaTelegramPlane } from "react-icons/fa";
import { RiTwitterXLine } from "react-icons/ri";
import { Hand } from "lucide-react";

import { useLanguage } from "../../Context/LanguageProvider";
import BRAND_LOGO from "../../assets/brand/bajiman-logo.png";
import GAMCARE_LOGO from "../../assets/footer/gamcare.png";

const CLIENT_URL = (import.meta.env.VITE_CLIENT_URL || "/").replace(/\/$/, "");
const REGISTER_URL = `${CLIENT_URL}`;
const AFFILIATE_URL = "https://m-affiliate.bajiman.com/"

const socialLinks = [
  {
    id: "twitter",
    label: "X",
    href: "https://x.com/",
    icon: RiTwitterXLine,
    className: "bg-black",
  },
  {
    id: "facebook",
    label: "Facebook",
    href: "https://facebook.com/",
    icon: FaFacebookF,
    className: "bg-[#1877f2]",
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://instagram.com/",
    icon: FaInstagram,
    className: "bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5]",
  },
  {
    id: "telegram",
    label: "Telegram",
    href: "https://t.me/",
    icon: FaTelegramPlane,
    className: "bg-[#29b6f6]",
  },
];

const BrandFooter = () => {
  const { isBangla } = useLanguage();

  return (
    <footer
      className="relative w-full border-t border-white/10 px-5 py-7 sm:px-8 lg:px-12 xl:px-16"
      style={{
        background: "linear-gradient(180deg, #1d4f8c 0%, #143a68 100%)",
      }}
    >
      <div className="mx-auto flex max-w-[1536px] flex-col flex-wrap items-center gap-8 lg:flex-row lg:justify-between lg:gap-6">
        {/* Logo */}
        <a
          href={CLIENT_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit Bajiman"
          className="shrink-0 transition hover:opacity-90"
        >
          <img
            src={BRAND_LOGO}
            alt="Bajiman"
            draggable={false}
            className="h-auto w-[130px] object-contain sm:w-[150px]"
          />
        </a>

        {/* Copyright + legal links */}
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-8 lg:text-left">
          <p className="text-[13px] leading-[1.5] text-white/90">
            {isBangla ? (
              <>
                © ২০২৫ বাজিমান কপিরাইট।
                <br />
                সর্বস্বত্ব সংরক্ষিত
              </>
            ) : (
              <>
                © 2025 BAJIMAN Copyrights.
                <br />
                All Rights Reserved
              </>
            )}
          </p>

          <div className="flex flex-col gap-1 text-[13px] leading-[1.5]">
            <a
              href={REGISTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline underline-offset-2 hover:text-[#4ee000]"
            >
              {isBangla ? "রেজিস্ট্রেশন" : "Registration"}
            </a>
            <a
              href={AFFILIATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline underline-offset-2 hover:text-[#4ee000]"
            >
              {isBangla ? "অ্যাফিলিয়েট" : "Affiliate"}
            </a>
          </div>
        </div>

        {/* Social icons */}
        <div className="flex items-center gap-3">
          {socialLinks.map(({ id, label, href, icon: Icon, className }) => (
            <a
              key={id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className={`flex h-[34px] w-[34px] items-center justify-center rounded-full text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:brightness-110 ${className}`}
            >
              <Icon className="text-[15px]" />
            </a>
          ))}
        </div>

        {/* Responsible gaming */}
        <div className="flex items-center gap-4">
          <p className="text-[13px] leading-[1.4] text-white/90">
            {isBangla ? (
              <>
                দায়িত্বশীল
                <br />
                গেমিং:
              </>
            ) : (
              <>
                Responsible
                <br />
                gaming:
              </>
            )}
          </p>

          <img
            src={GAMCARE_LOGO}
            alt="GamCare"
            draggable={false}
            className="h-[30px] w-auto object-contain sm:h-[34px]"
          />

          <span
            aria-label="Self-exclusion"
            className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#e2262c] text-white sm:h-[34px] sm:w-[34px]"
          >
            <Hand size={15} />
          </span>

          <span
            aria-label="18 plus"
            className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#e2262c] text-[11px] font-extrabold text-white sm:h-[34px] sm:w-[34px] sm:text-[12px]"
          >
            18+
          </span>
        </div>
      </div>
    </footer>
  );
};

export default BrandFooter;
