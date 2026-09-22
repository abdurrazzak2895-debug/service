import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import { fetchAffiliateGlobalData } from "../../features/global/globalSlice";
import {
  selectAffiliateAboutSetting,
  selectGlobalLoaded,
  selectGlobalLoading,
} from "../../features/global/globalSelectors";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const DEFAULT_LOGO =
  "https://crickexpartner.com/wp-content/uploads/2024/03/logo-2.png";

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

const defaultDesc = (isBangla) =>
  isBangla
    ? `Crickex হলো Sports Exchange এবং Sports Betting ওয়েবসাইটের একটি শীর্ষস্থানীয় প্রোভাইডার। এখানে Back & Lay, Fancy এবং Premium Bets সহ Live Match Streaming সুবিধা রয়েছে। Sports Exchange এর পাশাপাশি Crickex Live Casino, Slots এবং Virtual Games-ও প্রদান করে।

Crickex সহজ, দ্রুত এবং ইউজার-ফ্রেন্ডলি অনলাইন স্পোর্টস বেটিং অভিজ্ঞতা নিশ্চিত করে। ডিপোজিট ও উইথড্র করার জন্য একাধিক পদ্ধতি এবং ২৪ ঘণ্টা সাপোর্ট রয়েছে, যাতে আমাদের এজেন্টরা নতুন মেম্বার যুক্ত করে আয় বৃদ্ধি করতে পারে। এখনই Crickex Affiliate-এ যোগ দিন এবং আয় শুরু করুন!`
    : `Crickex is a leading provider in Sports Exchange and Sports Betting websites having Back & Lay, Fancy, and Premium Bets with Live Match Streaming. Along with sports exchange, Crickex also provides a wide variety of live casinos, slots, and virtual games.

Crickex ensures the ultimate online sports betting experience and simple quick user-friendly deposit and withdrawal methods with 24-hour support available for all members to help our agents to boost joining new members to Crickex. Join Crickex Affiliate Now & Begin Earning!`;

const AboutSkeleton = () => (
  <section className="w-full px-4 py-4 md:py-10 lg:px-8">
    <div className="mx-auto flex w-full max-w-[1425px] animate-pulse flex-col items-center gap-8 rounded-md bg-[#eef6fb]/95 px-6 py-10 shadow-lg md:flex-row md:px-14 lg:px-16">
      <div className="hidden w-full items-center justify-center md:flex md:w-[32%]">
        <div className="h-[120px] w-full max-w-[340px] rounded-xl bg-slate-300" />
      </div>

      <div className="w-full md:w-[68%]">
        <div className="mb-5 h-9 w-48 rounded bg-slate-300" />
        <div className="space-y-3">
          <div className="h-5 w-full rounded bg-slate-300" />
          <div className="h-5 w-full rounded bg-slate-300" />
          <div className="h-5 w-11/12 rounded bg-slate-300" />
          <div className="h-5 w-full rounded bg-slate-300" />
          <div className="h-5 w-10/12 rounded bg-slate-300" />
          <div className="mt-5 h-5 w-full rounded bg-slate-300" />
          <div className="h-5 w-11/12 rounded bg-slate-300" />
        </div>
      </div>
    </div>
  </section>
);

const AboutUs = () => {
  const { isBangla } = useLanguage();
  const dispatch = useDispatch();

  const globalLoading = useSelector(selectGlobalLoading);
  const globalLoaded = useSelector(selectGlobalLoaded);
  const setting = useSelector(selectAffiliateAboutSetting);

  useEffect(() => {
    if (!globalLoaded && !globalLoading) {
      dispatch(fetchAffiliateGlobalData());
    }
  }, [dispatch, globalLoaded, globalLoading]);

  const text = useMemo(
    () => ({
      title: getText(
        setting?.title,
        isBangla,
        isBangla ? "আমাদের সম্পর্কে" : "ABOUT US",
      ),
      desc: getText(setting?.description, isBangla, defaultDesc(isBangla)),
    }),
    [isBangla, setting],
  );

  const logo = setting?.logoUrl || makeImageUrl(setting?.logo) || DEFAULT_LOGO;

  const colors = {
    sectionBg: getColor(setting, "sectionBg", "transparent"),
    cardBg: getColor(setting, "cardBg", "#eef6fb"),
    titleColor: getColor(setting, "titleColor", "#161f7a"),
    descriptionColor: getColor(setting, "descriptionColor", "#161f7a"),
  };

  const cardMaxWidth = setting?.cardMaxWidth || "1425px";
  const logoMaxWidth = setting?.logoMaxWidth || "340px";

  if (!globalLoaded && globalLoading) {
    return <AboutSkeleton />;
  }

  return (
    <section
      className="w-full px-4 py-4 md:py-10 lg:px-8"
      style={{ backgroundColor: colors.sectionBg }}
    >
      <div
        className="mx-auto flex w-full flex-col items-center gap-8 rounded-md px-6 py-10 shadow-lg md:flex-row md:px-14 lg:px-16"
        style={{
          maxWidth: cardMaxWidth,
          backgroundColor: colors.cardBg,
        }}
      >
        <div className="hidden w-full items-center justify-center md:flex md:w-[32%]">
          {logo && (
            <img
              src={logo}
              alt="Crickex Affiliates"
              className="w-full object-contain"
              style={{ maxWidth: logoMaxWidth }}
              draggable={false}
            />
          )}
        </div>

        <div className="w-full md:w-[68%]">
          <h2
            className="mb-5 text-center text-[28px] font-bold uppercase tracking-wide md:text-left md:text-[30px]"
            style={{ color: colors.titleColor }}
          >
            {text.title}
          </h2>

          <p
            className="whitespace-pre-line text-[16px] font-semibold leading-[1.5] md:text-[17px] lg:text-[18px]"
            style={{ color: colors.descriptionColor }}
          >
            {text.desc}
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
