import React from "react";
import { Outlet } from "react-router";

import GuideNavbar from "../components/GuideNavbar/GuideNavbar";
import GuideFooter from "../components/GuideFooter/GuideFooter";

const RootLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <GuideNavbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <GuideFooter />
    </div>
  );
};

export default RootLayout;
