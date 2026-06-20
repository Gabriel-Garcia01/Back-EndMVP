import React from "react";
import { useOutletContext } from "react-router-dom";
import Banner from "../../components/Banner/Banner";
import InfoSection from "../../components/InfoSection/InfoSection";
import InfoGeral from "../../components/InfoGeral/InfoGeral";
import ParkSelection from "../../components/ParkSelection/ParkSelection";
import Separator from "../../components/Separator/Separator";

const Home = () => {
  const { parks = [] } = useOutletContext();

  return (
    <>
      <Banner />
      <Separator>Parques e reservas</Separator>
      <ParkSelection parks={parks} />
    </>
  );
};

export default Home;
