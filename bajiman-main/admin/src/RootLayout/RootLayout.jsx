import React from "react";
import { Outlet } from "react-router";
import Sidebar from "../components/Sidebar/Sidebar";

const RootLayout = () => {
  return (
    <div>
      <Sidebar />
    </div>
  );
};

export default RootLayout;
