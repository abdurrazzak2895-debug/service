import React, { useEffect, useMemo } from "react";
import { Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import { fetchAffiliateGlobalData } from "../../features/global/globalSlice";
import {
  selectAffiliateFooterSetting,
  selectGlobalLoaded,
  selectGlobalLoading,
} from "../../features/global/globalSelectors";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const LOGO_URL =
  "https://crickexpartner.com/wp-content/uploads/2024/03/logo-2.png";

const DEFAULT_LINKS = [
  {
    label: { bn: "শর্তাবলী", en: "Terms & Condition" },
    path: "/terms",
    order: 0,
  },
  {
    label: { bn: "ডিসকানেকশন পলিসি", en: "Disconnection Policy" },
    path: "/disconnection-policy",
    order: 1,
  },
  {
    label: { bn: "প্রাইভেসি পলিসি", en: "Privacy Policy" },
    path: "/privacy-policy",
    order: 2,
  },
  {
    label: { bn: "যোগাযোগ করুন", en: "Contact Us" },
    path: "/contact",
    order: 3,
  },
];

const DEFAULT_SOCIALS = [
  {
    name: "Facebook",
    icon: "https://crickexpartner.com/wp-content/uploads/2025/10/facebook.png",
    url: "#",
    order: 0,
  },
  {
    name: "Instagram",
    icon: "https://crickexpartner.com/wp-content/uploads/2025/10/Instagram.png",
    url: "#",
    order: 1,
  },
  {
    name: "Telegram",
    icon: "https://crickexpartner.com/wp-content/uploads/2025/10/telegram.png",
    url: "#",
    order: 2,
  },
  {
    name: "X",
    icon: "https://crickexpartner.com/wp-content/uploads/2025/10/x.png",
    url: "#",
    order: 3,
  },
  {
    name: "Pinterest",
    icon: "https://crickexpartner.com/wp-content/uploads/2025/10/pinterest.png",
    url: "#",
    order: 4,
  },
];

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

const FooterSkeleton = () => (
  <footer className="w-full bg-[#dff8ff] px-4 py-8 sm:px-8 lg:px-20">
    <div className="mx-auto grid w-full max-w-[1400px] animate-pulse grid-cols-1 gap-10 md:grid-cols-3">
      <div className="flex flex-col items-center gap-7 md:items-start">
        <div className="h-5 w-40 rounded bg-slate-300" />
        <div className="h-5 w-52 rounded bg-slate-300" />
      </div>

      <div className="flex flex-col items-center gap-7 md:items-start">
        <div className="h-5 w-44 rounded bg-slate-300" />
        <div className="h-5 w-36 rounded bg-slate-300" />
      </div>

      <div className="flex flex-col items-center md:items-start">
        <div className="mb-5 h-6 w-32 rounded bg-slate-300" />

        <div className="mb-8 flex items-center gap-5">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="h-[45px] w-[45px] rounded-full bg-slate-300 sm:h-[48px] sm:w-[48px]"
            />
          ))}
        </div>

        <div className="mb-8 h-5 w-72 rounded bg-slate-300" />
        <div className="h-12 w-[180px] rounded-md bg-slate-300" />
      </div>
    </div>

    <div className="mx-auto mt-12 grid w-full max-w-[1400px] animate-pulse grid-cols-1 items-end gap-5 md:grid-cols-3">
      <div className="flex justify-center md:justify-start">
        <div className="h-12 w-[140px] rounded bg-slate-300" />
      </div>

      <div className="mx-auto h-5 w-72 rounded bg-slate-300" />

      <div />
    </div>
  </footer>
);

const Footer = () => {
  const { isBangla } = useLanguage();
  const dispatch = useDispatch();

  const globalLoading = useSelector(selectGlobalLoading);
  const globalLoaded = useSelector(selectGlobalLoaded);
  const setting = useSelector(selectAffiliateFooterSetting);

  useEffect(() => {
    if (!globalLoaded && !globalLoading) {
      dispatch(fetchAffiliateGlobalData());
    }
  }, [dispatch, globalLoaded, globalLoading]);

  const links = useMemo(() => {
    const list = Array.isArray(setting?.links) ? setting.links : [];

    const activeLinks = list
      .filter((item) => item?.status !== "inactive")
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .map((item) => ({
        label: getText(item.label, isBangla),
        path: item.path || "#",
      }))
      .filter((item) => item.label);

    if (activeLinks.length) return activeLinks;

    return DEFAULT_LINKS.map((item) => ({
      label: getText(item.label, isBangla),
      path: item.path,
    }));
  }, [setting, isBangla]);

  const socials = useMemo(() => {
    const list = Array.isArray(setting?.socials) ? setting.socials : [];

    const activeSocials = list
      .filter((item) => item?.status !== "inactive")
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .map((item) => ({
        name: item.name || "Social",
        icon: item.iconUrl || makeImageUrl(item.icon),
        url: item.url || "#",
      }))
      .filter((item) => item.icon);

    return activeSocials.length ? activeSocials : DEFAULT_SOCIALS;
  }, [setting]);

  const colors = {
    footerBg: getColor(setting, "footerBg", "#dff8ff"),
    textColor: getColor(setting, "textColor", "#07192c"),
    linkHoverColor: getColor(setting, "linkHoverColor", "#176bb5"),
    buttonBg: getColor(setting, "buttonBg", "#4bd914"),
    buttonHoverBg: getColor(setting, "buttonHoverBg", "#3ec40d"),
    buttonTextColor: getColor(setting, "buttonTextColor", "#ffffff"),
  };

  const contentMaxWidth = setting?.contentMaxWidth || "1400px";
  const logoWidth = setting?.logoWidth || "140px";
  const socialIconSize = setting?.socialIconSize || "48px";

  const logo = setting?.logoUrl || makeImageUrl(setting?.logo) || LOGO_URL;

  const followText = getText(
    setting?.followText,
    isBangla,
    isBangla ? "ফলো করুন:" : "FOLLOW US:",
  );

  const signupText = getText(
    setting?.signupText,
    isBangla,
    isBangla
      ? "আজই Crickex Affiliate-এ সাইন আপ করুন!"
      : "Sign up today at Crickex Affiliate!",
  );

  const signupButtonText = getText(
    setting?.signupButtonText,
    isBangla,
    isBangla ? "সাইন আপ" : "SIGN UP",
  );

  const signupButtonPath = setting?.signupButtonPath || "/register";

  const copyrightText = getText(
    setting?.copyrightText,
    isBangla,
    isBangla
      ? "©2026 Crickex. সর্বস্বত্ব সংরক্ষিত।"
      : "©2026 Crickex. All Rights Reserved.",
  );

  const firstColumnLinks = links.slice(0, Math.ceil(links.length / 2));
  const secondColumnLinks = links.slice(Math.ceil(links.length / 2));

  if (!globalLoaded && globalLoading) {
    return <FooterSkeleton />;
  }

  return (
    <footer
      className="w-full px-4 py-8 sm:px-8 lg:px-20"
      style={{ backgroundColor: colors.footerBg }}
    >
      <div
        className="mx-auto grid w-full grid-cols-1 gap-10 md:grid-cols-3"
        style={{ maxWidth: contentMaxWidth }}
      >
        <div className="flex flex-col items-center gap-7 text-center md:items-start md:text-left">
          {firstColumnLinks.map((item, index) => (
            <Link
              key={`${item.path}-${index}`}
              to={item.path}
              className="cursor-pointer text-[17px] font-medium transition"
              style={{ color: colors.textColor }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = colors.linkHoverColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.textColor;
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col items-center gap-7 text-center md:items-start md:text-left">
          {secondColumnLinks.map((item, index) => (
            <Link
              key={`${item.path}-${index}`}
              to={item.path}
              className="cursor-pointer text-[17px] font-medium transition"
              style={{ color: colors.textColor }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = colors.linkHoverColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.textColor;
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col items-center md:items-start">
          <h3
            className="mb-5 text-[18px] font-semibold uppercase"
            style={{ color: colors.textColor }}
          >
            {followText}
          </h3>

          <div className="mb-8 flex flex-wrap items-center gap-5">
            {socials.map((item, index) => (
              <a
                key={`${item.name}-${index}`}
                href={item.url || "#"}
                target="_blank"
                rel="noreferrer"
                className="cursor-pointer transition hover:scale-110"
              >
                <img
                  src={item.icon}
                  alt={item.name}
                  className="object-contain"
                  style={{
                    width: socialIconSize,
                    height: socialIconSize,
                  }}
                  draggable={false}
                />
              </a>
            ))}
          </div>

          <p
            className="mb-8 text-center text-[17px] font-medium md:text-left"
            style={{ color: colors.textColor }}
          >
            {signupText}
          </p>

          <Link
            to={signupButtonPath}
            className="w-[180px] cursor-pointer rounded-md py-3 text-center text-[16px] font-bold uppercase transition"
            style={{
              backgroundColor: colors.buttonBg,
              color: colors.buttonTextColor,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.buttonHoverBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.buttonBg;
            }}
          >
            {signupButtonText}
          </Link>
        </div>
      </div>

      <div
        className="mx-auto mt-12 grid w-full grid-cols-1 items-end gap-5 md:grid-cols-3"
        style={{ maxWidth: contentMaxWidth }}
      >
        <div className="flex justify-center md:justify-start">
          <Link to="/" className="cursor-pointer">
            <img
              src={logo}
              alt="Crickex Affiliates"
              className="h-auto object-contain"
              style={{ width: logoWidth }}
              draggable={false}
            />
          </Link>
        </div>

        <p
          className="text-center text-[16px] font-medium md:col-span-1"
          style={{ color: colors.textColor }}
        >
          {copyrightText}
        </p>

        <div />
      </div>
    </footer>
  );
};

export default Footer;
