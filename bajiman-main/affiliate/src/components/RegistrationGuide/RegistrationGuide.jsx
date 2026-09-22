import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import { fetchAffiliateGlobalData } from "../../features/global/globalSlice";
import {
  selectAffiliateRegistrationGuideSetting,
  selectGlobalLoaded,
  selectGlobalLoading,
} from "../../features/global/globalSelectors";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const DEFAULT_GUIDE_CARDS = [
  {
    icon: "https://crickexpartner.com/wp-content/uploads/2025/09/Sign-up.png",
    enTitle: "Sign up Form",
    bnTitle: "সাইন আপ ফর্ম",
    enDesc: "Quick registration process",
    bnDesc: "দ্রুত রেজিস্ট্রেশন প্রক্রিয়া",
  },
  {
    icon: "https://crickexpartner.com/wp-content/uploads/2025/09/Approval.png",
    enTitle: "Approval Period",
    bnTitle: "অনুমোদনের সময়",
    enDesc: "Agent manager will contact you on WhatApp/Telegram & on email",
    bnDesc: "এজেন্ট ম্যানেজার WhatsApp/Telegram এবং ইমেইলে যোগাযোগ করবেন",
  },
  {
    icon: "https://crickexpartner.com/wp-content/uploads/2025/09/Start-Earning.png",
    enTitle: "Start Earning Commission",
    bnTitle: "কমিশন আয় শুরু করুন",
    enDesc: "Monthly commission will be transferred on your bank account",
    bnDesc: "মাসিক কমিশন আপনার ব্যাংক অ্যাকাউন্টে ট্রান্সফার করা হবে",
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

const RegistrationGuideSkeleton = () => (
  <section className="w-full px-4 py-8 sm:px-6 lg:px-9">
    <div className="mx-auto w-full max-w-[1425px] animate-pulse">
      <div className="mb-24 rounded-md bg-[#e8f8ff]/95 px-4 py-5 text-center shadow-lg">
        <div className="mx-auto h-9 w-72 rounded bg-slate-300" />
      </div>

      <div className="grid grid-cols-1 gap-24 md:grid-cols-3 md:gap-20">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="relative flex min-h-[335px] flex-col rounded-md bg-[#dff8ff]/95 px-7 pb-10 pt-24 shadow-lg"
          >
            <div className="absolute left-1/2 top-0 h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg">
              <div className="h-full w-full rounded-full bg-slate-300" />
            </div>

            <div className="mx-auto mb-12 h-8 w-56 rounded bg-slate-300" />

            <div className="mx-auto w-full max-w-[320px] pl-5">
              <div className="h-5 w-full rounded bg-slate-300" />
              <div className="mt-3 h-5 w-9/12 rounded bg-slate-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const RegistrationGuide = () => {
  const { isBangla } = useLanguage();
  const dispatch = useDispatch();

  const globalLoading = useSelector(selectGlobalLoading);
  const globalLoaded = useSelector(selectGlobalLoaded);
  const setting = useSelector(selectAffiliateRegistrationGuideSetting);

  useEffect(() => {
    if (!globalLoaded && !globalLoading) {
      dispatch(fetchAffiliateGlobalData());
    }
  }, [dispatch, globalLoaded, globalLoading]);

  const guideCards = useMemo(() => {
    const list = Array.isArray(setting?.cards) ? setting.cards : [];

    const activeCards = list
      .filter((card) => card?.status !== "inactive")
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .map((card) => ({
        icon: card.iconUrl || makeImageUrl(card.icon),
        title: getText(card.title, isBangla),
        description: getText(card.description, isBangla),
      }))
      .filter((card) => card.icon || card.title || card.description);

    if (activeCards.length) return activeCards;

    return DEFAULT_GUIDE_CARDS.map((card) => ({
      icon: card.icon,
      title: isBangla ? card.bnTitle : card.enTitle,
      description: isBangla ? card.bnDesc : card.enDesc,
    }));
  }, [setting, isBangla]);

  const colors = {
    sectionBg: getColor(setting, "sectionBg", "transparent"),
    titleBoxBg: getColor(setting, "titleBoxBg", "#e8f8ff"),
    titleColor: getColor(setting, "titleColor", "#17227a"),
    cardBg: getColor(setting, "cardBg", "#dff8ff"),
    iconCircleBg: getColor(setting, "iconCircleBg", "#ffffff"),
    cardTitleColor: getColor(setting, "cardTitleColor", "#002d68"),
    cardDescColor: getColor(setting, "cardDescColor", "#5f607e"),
  };

  const contentMaxWidth = setting?.contentMaxWidth || "1425px";
  const iconCircleSize = setting?.iconCircleSize || "150px";

  const sectionTitle = getText(
    setting?.sectionTitle,
    isBangla,
    isBangla ? "রেজিস্ট্রেশন গাইড" : "REGISTRATION GUIDE",
  );

  if (!globalLoaded && globalLoading) {
    return <RegistrationGuideSkeleton />;
  }

  return (
    <section
      className="w-full px-4 py-8 sm:px-6 lg:px-9"
      style={{ backgroundColor: colors.sectionBg }}
    >
      <div
        className="mx-auto w-full"
        style={{
          maxWidth: contentMaxWidth,
        }}
      >
        <div
          className="mb-24 rounded-md px-4 py-5 text-center shadow-lg"
          style={{ backgroundColor: colors.titleBoxBg }}
        >
          <h2
            className="text-[28px] font-extrabold uppercase tracking-wide drop-shadow-md sm:text-[32px]"
            style={{ color: colors.titleColor }}
          >
            {sectionTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-24 md:grid-cols-3 md:gap-20">
          {guideCards.map((card, index) => (
            <div
              key={`${card.title}-${index}`}
              className="relative flex min-h-[335px] flex-col rounded-md px-7 pb-10 pt-24 shadow-lg"
              style={{ backgroundColor: colors.cardBg }}
            >
              <div
                className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full p-3 shadow-lg"
                style={{
                  backgroundColor: colors.iconCircleBg,
                  width: iconCircleSize,
                  height: iconCircleSize,
                }}
              >
                {card.icon && (
                  <img
                    src={card.icon}
                    alt={card.title || `Registration Guide ${index + 1}`}
                    className="h-full w-full object-contain"
                    draggable={false}
                  />
                )}
              </div>

              <h3
                className="mb-12 text-center text-[26px] font-semibold"
                style={{ color: colors.cardTitleColor }}
              >
                {card.title}
              </h3>

              <ul className="mx-auto w-full max-w-[320px] list-disc pl-5">
                <li
                  className="text-[17px] font-semibold leading-[1.45]"
                  style={{ color: colors.cardDescColor }}
                >
                  {card.description}
                </li>
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RegistrationGuide;
