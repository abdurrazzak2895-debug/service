import React from "react";
import Hero from "../../components/Hero/Hero";
import BeautyQueenTitles from "../../components/BeautyQueenTitles/BeautyQueenTitles";
import MovieHostAwards from "../../components/MovieHostAwards/MovieHostAwards";
import Gallery from "../../components/Gallery/Gallery";
import ExploreCrickexWorld from "../../components/ExploreCrickexWorld/ExploreCrickexWorld";

const Home = () => {
  return (
    <>
      <Hero />
      <BeautyQueenTitles />
      <MovieHostAwards />
      <Gallery />
      <ExploreCrickexWorld />
    </>
  );
};

export default Home;
