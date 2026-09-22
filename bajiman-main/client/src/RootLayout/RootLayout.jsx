import React, { useEffect, useState } from "react";
import { Outlet } from "react-router";
import { useDispatch, useSelector } from "react-redux";

import Navber from "../components/Navber/Navber";
import Sidebar from "../components/Sidebar/Sidebar";
import BottomNavbar from "../components/BottomNavbar/BottomNavbar";
import SiteIdentity from "../components/SiteIdentity/SiteIdentity";
import SiteLoader from "../components/SiteLoader/SiteLoader";

import { fetchGlobalClientData } from "../features/global/globalSlice";
import { selectGlobalLoaded } from "../features/global/globalSelectors";

import { fetchGlobalGameData } from "../features/globalGame/globalGameSlice";
import { selectGlobalGameLoaded } from "../features/globalGame/globalGameSelectors";
import Footer from "../components/Footer/Footer";
import CheckInLauncher from "../components/CheckInLauncher/CheckInLauncher";
import WheelLauncher from "../components/WheelLauncher/WheelLauncher";
import DownloadAppBanner from "../components/DownloadAppBanner/DownloadAppBanner";

const RootLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const loaded = useSelector(selectGlobalLoaded);

  const gameLoaded = useSelector(selectGlobalGameLoaded);

  useEffect(() => {
    if (!gameLoaded) {
      dispatch(fetchGlobalGameData());
    }
  }, [dispatch, gameLoaded]);

  useEffect(() => {
    if (!loaded) {
      dispatch(fetchGlobalClientData());
    }
  }, [dispatch, loaded]);

  if (!loaded || !gameLoaded) {
    return <SiteLoader />;
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <SiteIdentity />
      <CheckInLauncher />
      <WheelLauncher />

      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        desktopOpen={desktopSidebarOpen}
        setDesktopOpen={setDesktopSidebarOpen}
      />
      <Navber setOpen={setSidebarOpen} desktopOpen={desktopSidebarOpen} />

      <main
        className={`min-h-screen pt-[56px] transition-all duration-300 ease-in-out lg:pt-[64px] ${
          desktopSidebarOpen ? "lg:pl-[250px]" : ""
        }`}
      >
        <div className="block md:hidden">
          <DownloadAppBanner />
        </div>
        <Outlet />
      </main>
      <Footer desktopOpen={desktopSidebarOpen} />
      <BottomNavbar />
    </div>
  );
};

export default RootLayout;
