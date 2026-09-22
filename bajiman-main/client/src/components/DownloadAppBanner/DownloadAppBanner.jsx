import React, { useState } from "react";
import { useLocation } from "react-router";
import { useSelector } from "react-redux";
import { X } from "lucide-react";

import { useLanguage } from "../../Context/LanguageProvider";
import { selectDownloadHeader } from "../../features/global/globalSelectors";

const DownloadAppBanner = () => {
  const location = useLocation();
  const { isBangla } = useLanguage();
  const t = (bn, en) => (isBangla ? bn : en);

  const downloadHeader = useSelector(selectDownloadHeader);
  const [dismissed, setDismissed] = useState(false);

  const isHome = location.pathname === "/";

  if (
    !isHome ||
    dismissed ||
    !downloadHeader?.isActive ||
    !downloadHeader?.apkUrl
  ) {
    return null;
  }

  const appName =
    (isBangla ? downloadHeader.appNameBn : downloadHeader.appNameEn) ||
    downloadHeader.appNameEn ||
    downloadHeader.appNameBn ||
    "APP";

  const title =
    (isBangla ? downloadHeader.titleBn : downloadHeader.titleEn) ||
    t(`${appName} অ্যাপ ডাউনলোড করুন`, `Download the ${appName} App`);

  const btnText =
    (isBangla ? downloadHeader.btnTextBn : downloadHeader.btnTextEn) ||
    t("ডাউনলোড", "Download");

  const bar = (
    <div className="flex items-center gap-3 bg-white p-2 pr-3 shadow-lg shadow-black/25">
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Close"
        className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full bg-black/5 text-black/50 transition hover:bg-black/10"
      >
        <X size={14} />
      </button>

      {downloadHeader.iconUrl ? (
        <img
          src={downloadHeader.iconUrl}
          alt={appName}
          className="h-10 w-10 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black text-sm font-black text-[#ffc800]">
          {String(appName).slice(0, 1)}
        </div>
      )}

      <p className="min-w-0 flex-1 truncate text-[13px] font-bold text-black">
        {title}
      </p>

      <a
        href="https://apps.bajiman.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-[13px] font-extrabold text-white transition hover:bg-red-700 active:scale-95"
      >
        {btnText}
      </a>
    </div>
  );

  return (
    <>
      {/* Mobile: normal document flow, sits between the fixed navbar and page content */}
      <div className="block lg:hidden">{bar}</div>

      {/* Desktop: floating, stacked below the Check-In / Wheel launcher icons */}
      <div className="fixed bottom-20 right-4 z-[998] hidden w-[300px] lg:block lg:right-12">
        {bar}
      </div>
    </>
  );
};

export default DownloadAppBanner;
