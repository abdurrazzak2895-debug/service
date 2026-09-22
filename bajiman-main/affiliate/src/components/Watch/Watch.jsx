import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import { fetchAffiliateGlobalData } from "../../features/global/globalSlice";
import {
  selectAffiliateWatchSetting,
  selectGlobalLoaded,
  selectGlobalLoading,
} from "../../features/global/globalSelectors";

const DEFAULT_VIDEO_ID = "EP-NFy9IpK8";

const getText = (obj, isBangla, fallback = "") => {
  if (!obj) return fallback;
  return isBangla ? obj.bn || obj.en || fallback : obj.en || obj.bn || fallback;
};

const getColor = (setting, key, fallback) => setting?.[key] || fallback;

const getEmbedUrl = (setting) => {
  if (setting?.embedUrl) return setting.embedUrl;

  const videoId = setting?.videoId || DEFAULT_VIDEO_ID;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
};

const WatchSkeleton = () => (
  <section className="w-full px-4 py-8 sm:px-6 lg:px-8">
    <div className="mx-auto w-full max-w-[1425px] animate-pulse rounded-md bg-white px-4 py-10 shadow-lg sm:px-8 md:py-16">
      <div className="mx-auto mb-10 h-9 w-full max-w-[640px] rounded bg-slate-300" />

      <div className="mx-auto w-full max-w-[920px] overflow-hidden rounded-md border border-[#333] bg-black shadow-md">
        <div className="relative aspect-video w-full">
          <div className="absolute inset-0 bg-slate-800" />
          <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-600" />
        </div>
      </div>
    </div>
  </section>
);

const Watch = () => {
  const { isBangla } = useLanguage();
  const dispatch = useDispatch();

  const globalLoading = useSelector(selectGlobalLoading);
  const globalLoaded = useSelector(selectGlobalLoaded);
  const setting = useSelector(selectAffiliateWatchSetting);

  useEffect(() => {
    if (!globalLoaded && !globalLoading) {
      dispatch(fetchAffiliateGlobalData());
    }
  }, [dispatch, globalLoaded, globalLoading]);

  const colors = {
    sectionBg: getColor(setting, "sectionBg", "transparent"),
    cardBg: getColor(setting, "cardBg", "#ffffff"),
    titleColor: getColor(setting, "titleColor", "#17227a"),
    videoBorderColor: getColor(setting, "videoBorderColor", "#333333"),
    videoBg: getColor(setting, "videoBg", "#000000"),
  };

  const contentMaxWidth = setting?.contentMaxWidth || "1425px";
  const videoMaxWidth = setting?.videoMaxWidth || "920px";

  const title = getText(
    setting?.sectionTitle,
    isBangla,
    isBangla
      ? "দেখুন ক্রিকেক্স অ্যাফিলিয়েট প্রোগ্রাম কীভাবে কাজ করে"
      : "WATCH HOW CRICKEX AFFILIATE PROGRAM WORKS",
  );

  const embedUrl = getEmbedUrl(setting);

  if (!globalLoaded && globalLoading) {
    return <WatchSkeleton />;
  }

  return (
    <section
      className="w-full px-4 py-8 sm:px-6 lg:px-8"
      style={{ backgroundColor: colors.sectionBg }}
    >
      <div
        className="mx-auto w-full rounded-md px-4 py-10 shadow-lg sm:px-8 md:py-16"
        style={{
          maxWidth: contentMaxWidth,
          backgroundColor: colors.cardBg,
        }}
      >
        <h2
          className="mb-10 text-center text-[24px] font-extrabold uppercase tracking-wide drop-shadow-md sm:text-[32px]"
          style={{ color: colors.titleColor }}
        >
          {title}
        </h2>

        <div
          className="mx-auto w-full overflow-hidden rounded-md border shadow-md"
          style={{
            maxWidth: videoMaxWidth,
            borderColor: colors.videoBorderColor,
            backgroundColor: colors.videoBg,
          }}
        >
          <div className="relative aspect-video w-full">
            {embedUrl ? (
              <iframe
                className="absolute inset-0 h-full w-full"
                src={embedUrl}
                title="How Crickex Affiliate Program Works"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                No video selected
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Watch;
