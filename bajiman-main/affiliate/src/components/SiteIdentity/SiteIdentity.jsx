import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectSiteIdentify } from "../../features/global/globalSelectors";
import { useLanguage } from "../../context/LanguageProvider";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const imageUrl = (path = "") => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_URL}/${path.replace(/^\/+/, "")}`;
};

const SiteIdentity = () => {
  const siteIdentify = useSelector(selectSiteIdentify);
  const { isBangla } = useLanguage();

  useEffect(() => {
    if (!siteIdentify) return;

    const title = isBangla
      ? siteIdentify?.siteName?.bn
      : siteIdentify?.siteName?.en;

    if (title) document.title = title;

    const favicon = imageUrl(siteIdentify?.faviconImage);

    if (favicon) {
      let link = document.querySelector("link[rel='icon']");

      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }

      link.href = favicon;
    }
  }, [siteIdentify, isBangla]);

  return null;
};

export default SiteIdentity;
