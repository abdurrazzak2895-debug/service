import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import { fetchAffiliateGlobalData } from "../../features/global/globalSlice";
import {
  selectAffiliateAdvantageSetting,
  selectGlobalLoaded,
  selectGlobalLoading,
} from "../../features/global/globalSelectors";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const DEFAULT_CARDS = [
  {
    icon: "https://crickexpartner.com/wp-content/uploads/2025/10/account.png",
    enTitle: "FREE ACCOUNT",
    bnTitle: "ফ্রি অ্যাকাউন্ট",
    enDesc: "Free Agent Account Self Account Creation",
    bnDesc: "ফ্রি এজেন্ট অ্যাকাউন্ট নিজেই তৈরি করুন",
  },
  {
    icon: "https://crickexpartner.com/wp-content/uploads/2025/10/investment.png",
    enTitle: "ZERO INVESTMENT",
    bnTitle: "জিরো ইনভেস্টমেন্ট",
    enDesc: "Start Your Agent Account Without Any Investment",
    bnDesc: "কোনো ইনভেস্টমেন্ট ছাড়াই এজেন্ট অ্যাকাউন্ট শুরু করুন",
  },
  {
    icon: "https://crickexpartner.com/wp-content/uploads/2025/10/global-brand.png",
    enTitle: "INTERNATIONAL BRAND",
    bnTitle: "আন্তর্জাতিক ব্র্যান্ড",
    enDesc: "Focused on Expanding & Accepting Agents Worldwide",
    bnDesc: "বিশ্বব্যাপী এজেন্ট গ্রহণ ও সম্প্রসারণে ফোকাসড",
  },
  {
    icon: "https://crickexpartner.com/wp-content/uploads/2025/10/commision.png",
    enTitle: "PROFITABLE COMMISSION",
    bnTitle: "লাভজনক কমিশন",
    enDesc: "Life Commission of Flat 50% For Per Active Player",
    bnDesc: "প্রতি অ্যাকটিভ প্লেয়ারের জন্য ৫০% লাইফ কমিশন",
  },
  {
    icon: "https://crickexpartner.com/wp-content/uploads/2025/10/auto-pay-1.png",
    enTitle: "AUTO PAYMENTS",
    bnTitle: "অটো পেমেন্ট",
    enDesc: "Automatic Commission Payments",
    bnDesc: "স্বয়ংক্রিয় কমিশন পেমেন্ট",
  },
  {
    icon: "https://crickexpartner.com/wp-content/uploads/2025/10/promo.png",
    enTitle: "PROMO MATERIALS",
    bnTitle: "প্রোমো ম্যাটেরিয়াল",
    enDesc: "Providing Advertising Materials For Agents To Promote",
    bnDesc: "প্রোমোশনের জন্য এজেন্টদের বিজ্ঞাপন সামগ্রী প্রদান",
  },
  {
    icon: "https://crickexpartner.com/wp-content/uploads/2025/10/support.png",
    enTitle: "SUPPORT MANAGER",
    bnTitle: "সাপোর্ট ম্যানেজার",
    enDesc: "Dedicated Agent Manager For Any Type of Support",
    bnDesc: "যেকোনো সাপোর্টের জন্য ডেডিকেটেড এজেন্ট ম্যানেজার",
  },
  {
    icon: "https://crickexpartner.com/wp-content/uploads/2025/10/Equal.png",
    enTitle: "FAIR & TRANSPARENT",
    bnTitle: "ন্যায্য ও স্বচ্ছ",
    enDesc: "Easy Software & Transparent To Track the Daily Date of Downtime",
    bnDesc: "সহজ সফটওয়্যার ও দৈনিক তথ্য ট্র্যাক করার স্বচ্ছ সিস্টেম",
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

const AdvantageSkeleton = () => (
  <section className="w-full px-4 py-6 sm:px-6 lg:px-9">
    <div className="mx-auto w-full max-w-[1425px] animate-pulse">
      <div className="mb-12 rounded-md bg-[#e8f8ff]/95 px-4 py-5 text-center shadow-lg">
        <div className="mx-auto h-9 w-72 rounded bg-slate-300" />
      </div>

      <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <div
            key={item}
            className="flex min-h-[175px] flex-col items-center justify-center rounded-md bg-[#e8f8ff]/95 px-3 py-7 text-center shadow-lg sm:min-h-[208px] sm:px-6"
          >
            <div className="mb-6 h-[48px] w-[48px] rounded bg-slate-300 sm:h-[52px] sm:w-[52px]" />
            <div className="mb-3 h-5 w-32 rounded bg-slate-300" />
            <div className="h-4 w-44 rounded bg-slate-300" />
            <div className="mt-2 h-4 w-36 rounded bg-slate-300" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

const CrickexAdvantage = () => {
  const { isBangla } = useLanguage();
  const dispatch = useDispatch();

  const globalLoading = useSelector(selectGlobalLoading);
  const globalLoaded = useSelector(selectGlobalLoaded);
  const setting = useSelector(selectAffiliateAdvantageSetting);

  useEffect(() => {
    if (!globalLoaded && !globalLoading) {
      dispatch(fetchAffiliateGlobalData());
    }
  }, [dispatch, globalLoaded, globalLoading]);

  const cards = useMemo(() => {
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

    return DEFAULT_CARDS.map((card) => ({
      icon: card.icon,
      title: isBangla ? card.bnTitle : card.enTitle,
      description: isBangla ? card.bnDesc : card.enDesc,
    }));
  }, [setting, isBangla]);

  const colors = {
    sectionBg: getColor(setting, "sectionBg", "transparent"),
    titleBoxBg: getColor(setting, "titleBoxBg", "#e8f8ff"),
    titleColor: getColor(setting, "titleColor", "#17227a"),
    cardBg: getColor(setting, "cardBg", "#e8f8ff"),
    cardTitleColor: getColor(setting, "cardTitleColor", "#002d68"),
    cardDescColor: getColor(setting, "cardDescColor", "#001d55"),
  };

  const contentMaxWidth = setting?.contentMaxWidth || "1425px";
  const iconSize = setting?.iconSize || "52px";

  const sectionTitle = getText(
    setting?.sectionTitle,
    isBangla,
    isBangla ? "ক্রিকেক্স সুবিধাসমূহ" : "CRICKEX ADVANTAGE",
  );

  if (!globalLoaded && globalLoading) {
    return <AdvantageSkeleton />;
  }

  return (
    <section
      className="w-full px-4 py-6 sm:px-6 lg:px-9"
      style={{ backgroundColor: colors.sectionBg }}
    >
      <div
        className="mx-auto w-full"
        style={{
          maxWidth: contentMaxWidth,
        }}
      >
        <div
          className="mb-12 rounded-md px-4 py-5 text-center shadow-lg"
          style={{ backgroundColor: colors.titleBoxBg }}
        >
          <h2
            className="text-[28px] font-extrabold uppercase tracking-wide drop-shadow-md sm:text-[32px]"
            style={{ color: colors.titleColor }}
          >
            {sectionTitle}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, index) => (
            <div
              key={`${card.title}-${index}`}
              className="flex min-h-[175px] flex-col items-center justify-center rounded-md px-3 py-7 text-center shadow-lg sm:min-h-[208px] sm:px-6"
              style={{ backgroundColor: colors.cardBg }}
            >
              {card.icon && (
                <img
                  src={card.icon}
                  alt={card.title || `Advantage ${index + 1}`}
                  className="mb-6 object-contain"
                  style={{
                    width: iconSize,
                    height: iconSize,
                  }}
                  draggable={false}
                />
              )}

              <h3
                className="mb-2 text-[14px] font-extrabold uppercase leading-tight sm:text-[20px]"
                style={{ color: colors.cardTitleColor }}
              >
                {card.title}
              </h3>

              <p
                className="max-w-[230px] text-[12px] font-medium leading-[1.35] sm:text-[15px]"
                style={{ color: colors.cardDescColor }}
              >
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CrickexAdvantage;
