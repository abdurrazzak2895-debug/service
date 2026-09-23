import React from "react";
import Notice from "../../components/Notice/Notice";
import Slider from "../../components/Slider/Slider";
import BalanceSection from "../../components/BalanceSection/BalanceSection";
import MarbajiLobby from "../../components/MarbajiLobby/MarbajiLobby";

const Home = () => {
  return (
    <div>
      <Slider />
      <Notice />
      <BalanceSection />
      <MarbajiLobby />
    </div>
  );
};

export default Home;
