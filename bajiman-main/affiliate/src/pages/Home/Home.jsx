import React from "react";
import Slider from "../../components/Slider/Slider";
import Agent from "../../components/Agent/Agent";
import AboutUs from "../../components/AboutUs/AboutUs";
import Sponsorship from "../../components/Sponsorship/Sponsorship";
import Commission from "../../components/Commission/Commission";
import CrickexAdvantage from "../../components/CrickexAdvantage/CrickexAdvantage";
import RegistrationGuide from "../../components/RegistrationGuide/RegistrationGuide";
import Watch from "../../components/Watch/Watch";
import AboutCrickex from "../../components/AboutCrickex/AboutCrickex";

const Home = () => {
  return (
    <div>
      <Slider />
      <Agent />
      <AboutUs />
      <Sponsorship />
      <Commission />
      <CrickexAdvantage />
      <RegistrationGuide />
      <Watch />
      <AboutCrickex />
    </div>
  );
};

export default Home;
