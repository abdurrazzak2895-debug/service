import React from "react";
import { useLocation, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

import { selectWheelReward } from "../../features/global/globalSelectors";

const WheelLauncher = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const wheelReward = useSelector(selectWheelReward);

  const isHome = location.pathname === "/";

  if (!isHome || !wheelReward?.isActive || !wheelReward?.launcherIconUrl) {
    return null;
  }

  return (
    <motion.button
      type="button"
      onClick={() => navigate("/wheel-of-fortune")}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      className="fixed bottom-[236px] right-4 z-[998] flex h-14 w-14 cursor-pointer items-center justify-center rounded-full shadow-[0_6px_20px_rgba(0,0,0,0.35)] md:right-12"
    >
      <img
        src={wheelReward.launcherIconUrl}
        alt="Wheel of Fortune"
        className="h-14 w-14 object-contain"
      />
    </motion.button>
  );
};

export default WheelLauncher;
