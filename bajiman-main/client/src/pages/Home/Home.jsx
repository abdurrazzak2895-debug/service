import React from "react";
import Notice from "../../components/Notice/Notice";
import Slider from "../../components/Slider/Slider";
import BalanceSection from "../../components/BalanceSection/BalanceSection";
import Categories from "../../components/Categories/Categories";
import PopularGames from "../../components/PopularGames/PopularGames";
import JackpotBanner from "../../components/JackpotBanner/JackpotBanner";
import Favourites from "../../components/Favourites/Favourites";
import WhyUs from "../../components/WhyUs/WhyUs";

const Home = () => {
  return (
    <div data-testid="home-page" className="pb-6">
      <Slider />
      <Notice />
      <BalanceSection />
      <JackpotBanner />
      <Categories />
      <PopularGames />
      <Favourites />
      <WhyUs />
    </div>
  );
};

export default Home;
