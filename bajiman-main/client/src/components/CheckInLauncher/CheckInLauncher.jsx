import React, { useState } from "react";
import { useLocation } from "react-router";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

import { selectCheckInReward } from "../../features/global/globalSelectors";
import CheckInModal from "../CheckInModal/CheckInModal";

const CheckInLauncher = () => {
  const location = useLocation();
  const checkInReward = useSelector(selectCheckInReward);

  const [open, setOpen] = useState(false);

  const isHome = location.pathname === "/";

  if (!isHome || !checkInReward?.isActive || !checkInReward?.launcherIconUrl) {
    return null;
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="fixed bottom-40 right-4 z-[998] flex h-14 w-14 cursor-pointer items-center justify-center rounded-full shadow-[0_6px_20px_rgba(0,0,0,0.35)] md:right-12"
      >
        <img
          src={checkInReward.launcherIconUrl}
          alt="Daily Check In"
          className="h-14 w-14 object-contain"
        />
      </motion.button>

      <CheckInModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default CheckInLauncher;
