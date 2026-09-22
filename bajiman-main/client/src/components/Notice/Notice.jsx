import React from "react";
import { Volume2 } from "lucide-react";
import { useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import {
  selectNotice,
  selectGlobalLoading,
  selectGlobalLoaded,
} from "../../features/global/globalSelectors";

const defaultColors = {
  sectionBg: "#0B66A8",
  desktopSectionBg: "transparent",
  iconColor: "#ffffff",
  desktopIconColor: "#4b5563",
  textColor: "#ffffff",
  desktopTextColor: "#444444",
  skeletonBg: "rgba(255,255,255,0.4)",
  desktopSkeletonBg: "#d1d5db",
};

const getColor = (notice, key) => {
  return notice?.[key] || defaultColors[key];
};

const Notice = () => {
  const { isBangla } = useLanguage();

  const notice = useSelector(selectNotice);
  const loading = useSelector(selectGlobalLoading);
  const loaded = useSelector(selectGlobalLoaded);

  const noticeText = isBangla ? notice?.text?.bn : notice?.text?.en;

  const showSkeleton = loading || !loaded;

  const mobileSectionBg = getColor(notice, "sectionBg");
  const desktopSectionBg = getColor(notice, "desktopSectionBg");

  const mobileIconColor = getColor(notice, "iconColor");
  const desktopIconColor = getColor(notice, "desktopIconColor");

  const mobileTextColor = getColor(notice, "textColor");
  const desktopTextColor = getColor(notice, "desktopTextColor");

  const mobileSkeletonBg = getColor(notice, "skeletonBg");
  const desktopSkeletonBg = getColor(notice, "desktopSkeletonBg");

  return (
    <section
      className="notice-section w-full py-1"
      style={{
        "--notice-mobile-bg": mobileSectionBg,
        "--notice-desktop-bg": desktopSectionBg,
        "--notice-mobile-icon": mobileIconColor,
        "--notice-desktop-icon": desktopIconColor,
        "--notice-mobile-text": mobileTextColor,
        "--notice-desktop-text": desktopTextColor,
        "--notice-mobile-skeleton": mobileSkeletonBg,
        "--notice-desktop-skeleton": desktopSkeletonBg,
      }}
    >
      <div className="mx-auto w-full max-w-[480px] px-1 md:max-w-[1120px] md:px-0">
        <div className="flex h-[22px] items-center overflow-hidden rounded-sm">
          <div className="flex h-full w-9 shrink-0 items-center justify-center">
            <Volume2 size={20} className="notice-icon" />
          </div>

          <div className="relative flex-1 overflow-hidden">
            {showSkeleton ? (
              <div className="notice-skeleton h-[14px] w-full animate-pulse rounded" />
            ) : (
              <div className="notice-track">
                <span className="notice-text text-[14px] font-medium md:text-[16px]">
                  {noticeText || ""}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .notice-section {
          background: var(--notice-mobile-bg);
        }

        .notice-icon {
          color: var(--notice-mobile-icon);
        }

        .notice-text {
          color: var(--notice-mobile-text);
        }

        .notice-skeleton {
          background: var(--notice-mobile-skeleton);
        }

        .notice-track {
          display: inline-block;
          white-space: nowrap;
          padding-left: 100%;
          animation: marqueeMove 35s linear infinite;
        }

        @keyframes marqueeMove {
          0% {
            transform: translateX(0%);
          }

          100% {
            transform: translateX(-100%);
          }
        }

        @media (min-width: 768px) {
          .notice-section {
            background: var(--notice-desktop-bg);
          }

          .notice-icon {
            color: var(--notice-desktop-icon);
          }

          .notice-text {
            color: var(--notice-desktop-text);
          }

          .notice-skeleton {
            background: var(--notice-desktop-skeleton);
          }
        }

        @media (max-width: 768px) {
          .notice-track {
            animation-duration: 25s;
          }
        }
      `}</style>
    </section>
  );
};

export default Notice;
