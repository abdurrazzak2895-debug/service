import React from "react";
import ReferSteps from "../../components/ReferSteps/ReferSteps";
import UnlimitedRebate from "../../components/UnlimitedRebate/UnlimitedRebate";
import HeroSlider from "../../components/HeroSlider/HeroSlider";
import RebateCalculation from "../../components/RebateCalculation/RebateCalculation";
import ReferralEarningCalculator from "../../components/ReferralEarningCalculator/ReferralEarningCalculator";
import ReferAndEarnBonus from "../../components/ReferAndEarnBonus/ReferAndEarnBonus";
import MonthlyAchievementBonus from "../../components/MonthlyAchievementBonus/MonthlyAchievementBonus";
import ReferralDailyLeaderboard from "../../components/ReferralDailyLeaderboard/ReferralDailyLeaderboard";

const Referral = () => {
  return (
    <div>
      <HeroSlider />
      <ReferSteps />
      <UnlimitedRebate />
      <RebateCalculation />
      <ReferralEarningCalculator />
      <ReferAndEarnBonus />
      <ReferralDailyLeaderboard />
      <MonthlyAchievementBonus />
    </div>
  );
};

export default Referral;
