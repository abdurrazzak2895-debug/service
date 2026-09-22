import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import { fetchAffiliateGlobalData } from "../../features/global/globalSlice";
import {
  selectAffiliateSponsorshipSetting,
  selectGlobalLoaded,
  selectGlobalLoading,
} from "../../features/global/globalSelectors";

const API_URL = import.meta.env.VITE_API_URL;

const DEFAULT_SPONSORS = [
  {
    name: "Antigua & Barbuda Falcons",
    image: "https://crickexpartner.com/wp-content/uploads/2025/10/ABF.png",
  },
  {
    name: "Saint Lucia Kings",
    image:
      "https://crickexpartner.com/wp-content/uploads/2025/10/lucia-kings.png",
  },
  {
    name: "Morrisville Samp Army",
    image:
      "https://crickexpartner.com/wp-content/uploads/2025/10/samp-army.png",
  },
  {
    name: "Chepauk Super Gillies",
    image:
      "http://crickexpartner.com/wp-content/uploads/2025/10/super-gillies.png",
  },
  {
    name: "Galle Titans",
    image: "https://crickexpartner.com/wp-content/uploads/2025/10/Titans.png",
  },
  {
    name: "LAKR",
    image: "https://crickexpartner.com/wp-content/uploads/2025/12/LAKR.png",
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

const SponsorshipSkeleton = () => (
  <section className="w-full bg-[#226f2d] py-5">
    <div className="mx-auto flex w-full max-w-[1250px] animate-pulse flex-col items-center justify-center gap-6 px-4 md:flex-row md:gap-10 lg:gap-12">
      <div className="text-center md:min-w-[230px]">
        <div className="mx-auto h-8 w-40 rounded bg-white/20" />
        <div className="mx-auto mt-3 h-8 w-44 rounded bg-white/20" />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-7 sm:gap-9 lg:gap-12">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="h-[78px] w-[78px] rounded-full bg-white/20 sm:h-[92px] sm:w-[92px] md:h-[105px] md:w-[105px]"
          />
        ))}
      </div>
    </div>
  </section>
);

const Sponsorship = () => {
  const { isBangla } = useLanguage();
  const dispatch = useDispatch();

  const globalLoading = useSelector(selectGlobalLoading);
  const globalLoaded = useSelector(selectGlobalLoaded);
  const setting = useSelector(selectAffiliateSponsorshipSetting);

  useEffect(() => {
    if (!globalLoaded && !globalLoading) {
      dispatch(fetchAffiliateGlobalData());
    }
  }, [dispatch, globalLoaded, globalLoading]);

  const title = getText(
    setting?.title,
    isBangla,
    isBangla ? "প্রধান\nস্পনসরশিপ" : "PRINCIPAL\nSPONSORSHIP",
  );

  const sponsors = useMemo(() => {
    const list = Array.isArray(setting?.sponsors) ? setting.sponsors : [];

    const activeSponsors = list
      .filter((item) => item?.status !== "inactive")
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .map((item) => ({
        name: item.name || "",
        image: item.imageUrl || makeImageUrl(item.image),
      }))
      .filter((item) => item.image);

    return activeSponsors.length ? activeSponsors : DEFAULT_SPONSORS;
  }, [setting]);

  const colors = {
    sectionBg: getColor(setting, "sectionBg", "#226f2d"),
    titleColor: getColor(setting, "titleColor", "#ffffff"),
  };

  const sectionPaddingY = setting?.sectionPaddingY || "20px";
  const contentMaxWidth = setting?.contentMaxWidth || "1250px";
  const sponsorImageHeight = setting?.sponsorImageHeight || "105px";

  if (!globalLoaded && globalLoading) {
    return <SponsorshipSkeleton />;
  }

  return (
    <section
      className="w-full"
      style={{
        backgroundColor: colors.sectionBg,
        paddingTop: sectionPaddingY,
        paddingBottom: sectionPaddingY,
      }}
    >
      <div
        className="mx-auto flex w-full flex-col items-center justify-center gap-6 px-4 md:flex-row md:gap-10 lg:gap-12"
        style={{ maxWidth: contentMaxWidth }}
      >
        <div
          className="text-center md:min-w-[230px]"
          style={{ color: colors.titleColor }}
        >
          <h2 className="whitespace-pre-line text-[26px] font-bold uppercase leading-[1.55] tracking-[1px] sm:text-[30px]">
            {title}
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-7 sm:gap-9 md:flex-nowrap lg:gap-12">
          {sponsors.map((item, index) => (
            <img
              key={`${item.name}-${index}`}
              src={item.image}
              alt={item.name || `Sponsor ${index + 1}`}
              className="w-auto object-contain drop-shadow-xl"
              style={{ height: sponsorImageHeight }}
              draggable={false}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Sponsorship;
