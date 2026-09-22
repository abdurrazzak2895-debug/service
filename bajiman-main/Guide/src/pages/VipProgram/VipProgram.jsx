import React from "react";
import WhyBajimanVipClub from "../../components/WhyBajimanVipClub/WhyBajimanVipClub";
import VipExperiencePoint from "../../components/VipExperiencePoint/VipExperiencePoint";
import GameVipConversion from "../../components/GameVipConversion/GameVipConversion";
import VipExperienceExample from "../../components/VipExperienceExample/VipExperienceExample";
import VipPointsExample from "../../components/VipPointsExample/VipPointsExample";
import AnimatedGamesGallerty from "../../components/AnimatedGamesGallery/AnimatedGamesGallery";
import VipTierBenefits from "../../components/VipTierBenefits/VipTierBenefits";

const VipProgram = () => {
  return (
    <div>
      {" "}
      <WhyBajimanVipClub />
      <VipTierBenefits />
      <VipExperiencePoint />
      <GameVipConversion />
      <VipExperienceExample />
      <VipPointsExample />
      <AnimatedGamesGallerty />
    </div>
  );
};

export default VipProgram;
