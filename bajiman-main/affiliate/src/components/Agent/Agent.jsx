import React, { useEffect, useMemo } from "react";
import { ArrowUpRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import { fetchAffiliateGlobalData } from "../../features/global/globalSlice";
import {
  selectAffiliateAgentSetting,
  selectGlobalLoaded,
  selectGlobalLoading,
} from "../../features/global/globalSelectors";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const DEFAULT_BG =
  "https://crickexpartner.com/wp-content/uploads/2025/09/Artboard-1-copy-2.jpg";

const DEFAULT_RIGHT_IMAGE =
  "https://crickexpartner.com/wp-content/uploads/2025/09/mob-scr-1.png";

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

const AgentSkeleton = () => (
  <section className="w-full overflow-hidden bg-[#061532] px-5 py-10 sm:px-10 lg:px-20">
    <div className="mx-auto flex min-h-[515px] w-full max-w-[1400px] animate-pulse items-center justify-between gap-8">
      <div className="w-full max-w-[520px]">
        <div className="h-12 w-72 rounded-full bg-white/20" />
        <div className="mt-6 h-20 w-80 rounded-xl bg-white/20" />
        <div className="mt-5 h-7 w-full rounded bg-white/20" />
        <div className="mt-2 h-7 w-4/5 rounded bg-white/20" />
        <div className="mt-8 h-16 w-56 rounded-full bg-white/20" />
      </div>

      <div className="hidden flex-1 justify-end lg:flex">
        <div className="h-[430px] w-full max-w-[520px] rounded-3xl bg-white/20" />
      </div>
    </div>

    <div className="relative z-10 -mt-8 flex justify-center px-4 pb-8 lg:hidden">
      <div className="h-[300px] w-full max-w-[430px] animate-pulse rounded-3xl bg-white/20" />
    </div>
  </section>
);

const Agent = () => {
  const { isBangla } = useLanguage();
  const dispatch = useDispatch();

  const globalLoading = useSelector(selectGlobalLoading);
  const globalLoaded = useSelector(selectGlobalLoaded);
  const setting = useSelector(selectAffiliateAgentSetting);

  useEffect(() => {
    if (!globalLoaded && !globalLoading) {
      dispatch(fetchAffiliateGlobalData());
    }
  }, [dispatch, globalLoaded, globalLoading]);

  const text = useMemo(
    () => ({
      top: getText(
        setting?.topText,
        isBangla,
        isBangla ? "ক্রিকেক্স এজেন্ট হতে" : "Become a Crickex Agent",
      ),
      title: getText(
        setting?.title,
        isBangla,
        isBangla ? "আবেদন করুন" : "Apply Now",
      ),
      line1: getText(
        setting?.line1,
        isBangla,
        isBangla ? "এখানেই আপনার সাফল্য!" : "Your success starts here!",
      ),
      line2: getText(
        setting?.line2,
        isBangla,
        isBangla
          ? "সরাসরি উপার্জন করুন ৫০% কমিশন আজীবন।"
          : "Earn directly with 50% lifetime commission.",
      ),
      button: getText(
        setting?.buttonText,
        isBangla,
        isBangla ? "এখনই যোগদিন" : "Join Now",
      ),
    }),
    [isBangla, setting],
  );

  const colors = {
    topBg: getColor(setting, "topBg", "#ffffff"),
    topTextColor: getColor(setting, "topTextColor", "#0067bd"),
    titleColor: getColor(setting, "titleColor", "#32e414"),
    lineColor: getColor(setting, "lineColor", "#ffffff"),
    buttonBg: getColor(setting, "buttonBg", "#42ea08"),
    buttonTextColor: getColor(setting, "buttonTextColor", "#0067bd"),
    buttonIconBg: getColor(setting, "buttonIconBg", "#d2cc27"),
    buttonIconColor: getColor(setting, "buttonIconColor", "#ffffff"),
  };

  const bgImage =
    setting?.backgroundImageUrl ||
    makeImageUrl(setting?.backgroundImage) ||
    DEFAULT_BG;

  const rightImage =
    setting?.rightImageUrl ||
    makeImageUrl(setting?.rightImage) ||
    DEFAULT_RIGHT_IMAGE;

  const sectionMinHeight = setting?.sectionMinHeight || "515px";
  const contentMaxWidth = setting?.contentMaxWidth || "1400px";

  const openLink = () => {
    const link = setting?.buttonLink || "";
    if (!link) return;

    if (link.startsWith("http://") || link.startsWith("https://")) {
      window.open(link, "_blank", "noopener,noreferrer");
      return;
    }

    window.location.href = link;
  };

  if (!globalLoaded && globalLoading) {
    return <AgentSkeleton />;
  }

  return (
    <section
      className="relative w-full overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: bgImage ? `url(${bgImage})` : "none" }}
    >
      <div
        className="mx-auto flex w-full items-center justify-between px-5 py-10 sm:px-10 lg:px-20"
        style={{
          minHeight: sectionMinHeight,
          maxWidth: contentMaxWidth,
        }}
      >
        <div className="relative z-10 w-full max-w-[520px] text-white">
          <div
            className="mb-4 inline-flex rounded-full px-8 py-2 text-[24px] font-semibold leading-none shadow-md sm:text-[30px]"
            style={{
              backgroundColor: colors.topBg,
              color: colors.topTextColor,
            }}
          >
            {text.top}
          </div>

          <h2
            className="text-[48px] font-extrabold leading-[1.05] drop-shadow-lg sm:text-[64px] lg:text-[76px]"
            style={{ color: colors.titleColor }}
          >
            {text.title}
          </h2>

          <div
            className="mt-5 space-y-1 text-[22px] font-semibold leading-[1.35] sm:text-[26px]"
            style={{ color: colors.lineColor }}
          >
            <p>{text.line1}</p>
            <p>{text.line2}</p>
          </div>

          <button
            type="button"
            onClick={openLink}
            className="mt-8 flex cursor-pointer items-center gap-5 rounded-full py-3 pl-8 pr-2 text-[22px] font-bold shadow-[0_5px_0_rgba(0,0,0,0.22)] transition hover:scale-105 sm:text-[26px]"
            style={{
              backgroundColor: colors.buttonBg,
              color: colors.buttonTextColor,
            }}
          >
            {text.button}
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full"
              style={{
                backgroundColor: colors.buttonIconBg,
                color: colors.buttonIconColor,
              }}
            >
              <ArrowUpRight size={26} />
            </span>
          </button>
        </div>

        <div className="relative z-10 hidden flex-1 justify-end lg:flex">
          {rightImage && (
            <img
              src={rightImage}
              alt="Crickex Agent"
              className="h-auto w-full max-w-[650px] object-contain"
              draggable={false}
            />
          )}
        </div>
      </div>

      <div className="relative z-10 -mt-8 flex justify-center px-4 pb-8 lg:hidden">
        {rightImage && (
          <img
            src={rightImage}
            alt="Crickex Agent"
            className="w-full max-w-[430px] object-contain"
            draggable={false}
          />
        )}
      </div>
    </section>
  );
};

export default Agent;
