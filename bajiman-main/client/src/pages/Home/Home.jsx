import React from "react";
import Notice from "../../components/Notice/Notice";
import Slider from "../../components/Slider/Slider";
import Categories from "../../components/Categories/Categories";
import Favourites from "../../components/Favourites/Favourites";
import PopularGames from "../../components/PopularGames/PopularGames";
import BalanceSection from "../../components/BalanceSection/BalanceSection";

const Home = () => {
  return (
    <div>
      <Slider />
      <Notice />
      <BalanceSection />
      <Categories />
      <Favourites />
      <PopularGames />
    </div>
  );
};

export default Home;
