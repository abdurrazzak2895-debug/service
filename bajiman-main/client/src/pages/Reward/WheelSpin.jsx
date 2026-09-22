import React from "react";
import { useNavigate } from "react-router";
import { FaTimes } from "react-icons/fa";
import WhileOfFortune from "./WhileOfFortune";
import WheelTermsCondition from "../../components/WheelTermsCondition/WheelTermsCondition";

const WheelSpin = () => {
  const navigate = useNavigate();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => navigate("/")}
        aria-label="Close"
        className="fixed right-4 top-4 z-[1000] flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-black/60 text-xl text-white shadow-lg backdrop-blur-sm transition hover:bg-black/80 active:scale-95"
      >
        <FaTimes />
      </button>

      <WhileOfFortune />
      <WheelTermsCondition />
    </div>
  );
};

export default WheelSpin;
