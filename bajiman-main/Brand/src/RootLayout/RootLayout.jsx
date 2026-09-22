import React from "react";
import { Outlet } from "react-router";

import BrandNavbar from "../components/BrandNavbar/BrandNavbar";
import BrandFooter from "../components/BrandFooter/BrandFooter";

const RootLayout = () => {
  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <BrandNavbar />

      <main>
        <Outlet />
      </main>

      <BrandFooter />
    </div>
  );
};

export default RootLayout;
