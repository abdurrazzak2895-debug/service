import React, { useEffect } from "react";
import { Outlet } from "react-router";
import { useDispatch, useSelector } from "react-redux";

import Navber from "../components/Navber/Navber";
import Footer from "../components/Footer/Footer";
import { useLanguage } from "../context/LanguageProvider";

import { fetchAffiliateGlobalData } from "../features/global/globalSlice";
import {
  selectAffSiteIdentify,
  selectGlobalLoaded,
  selectGlobalLoading,
} from "../features/global/globalSelectors";
import SocialLink from "../components/SocialLink/SocialLink";

const DEFAULT_BG_URL =
  "https://crickexpartner.com/wp-content/uploads/2025/10/BG-1917x1080-3.jpg";

const RootLayout = () => {
  const dispatch = useDispatch();
  const { isBangla } = useLanguage();

  const loaded = useSelector(selectGlobalLoaded);
  const loading = useSelector(selectGlobalLoading);
  const affSiteIdentify = useSelector(selectAffSiteIdentify);

  useEffect(() => {
    if (!loaded && !loading) {
      dispatch(fetchAffiliateGlobalData());
    }
  }, [dispatch, loaded, loading]);

  const bgUrl = affSiteIdentify?.backgroundImageUrl || DEFAULT_BG_URL;

  const siteTitle = isBangla
    ? affSiteIdentify?.siteName?.bn || affSiteIdentify?.siteName?.en
    : affSiteIdentify?.siteName?.en || affSiteIdentify?.siteName?.bn;

  useEffect(() => {
    if (siteTitle) {
      document.title = siteTitle;
    }
  }, [siteTitle]);

  useEffect(() => {
    const faviconUrl = affSiteIdentify?.faviconImageUrl;

    if (!faviconUrl) return;

    let favicon = document.querySelector("link[rel='icon']");

    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }

    favicon.href = faviconUrl;
  }, [affSiteIdentify?.faviconImageUrl]);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundImage: `url(${bgUrl})`,
      }}
    >
      <SocialLink />
      <Navber />

      <main>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default RootLayout;
