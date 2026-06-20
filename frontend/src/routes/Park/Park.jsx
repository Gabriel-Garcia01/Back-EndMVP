import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getParkBySlug, getTrailByParkId, getWaterfallsByParkId } from "../../services/api";
import styles from "./Park.module.css";
import ParkGallery from "../../components/ParkGallery/ParkGallery";
import Separator from "../../components/Separator/Separator";
import InfoLocation from "../../components/Location/InfoLocation";
import TrailSection from "../../components/TrailSection/TrailSection";
import WaterfallSection from "../../components/WaterfallSection/WaterfallSection";
import Loading from "../../components/Loading/Loading";

const Park = () => {
  const { parkSlug } = useParams();
  const [park, setPark] = useState(null);
  const [trails, setTrails] = useState([]);
  const [waterfalls, setWaterfalls] = useState([]);

  useEffect(() => {
    async function loadData() {
      const parkData = await getParkBySlug(parkSlug);
      setPark(parkData);

      const trailData = await getTrailByParkId(parkData.id);
      setTrails(trailData);

      const waterfallsData = await getWaterfallsByParkId(parkData.id);
      setWaterfalls(waterfallsData);
    }

    loadData();
  }, [parkSlug]);

  if (!park) return <Loading />;

  return (
    <div>
      <div
        className={styles.parkContainer}
        style={{
          backgroundImage: `
    linear-gradient(
      to top,
      rgba(0,0,0,0.75) 10%,
      rgba(0,0,0,0.4) 50%,
      rgba(0,0,0,0.3) 100%
    ),
    url(${park?.images?.[0]})
  `,
        }}
      >
        <h1 className={styles.parkName}>{park.name}</h1>
        
        <p className={styles.parkDescription}>{park.description}</p>
        <ParkGallery images={park.images} start={0} end={4} />
      </div>
      <Separator>Como chegar</Separator>
      <InfoLocation hq={park.hq} infoLocation={park.infolocation} park={park} />
      <Separator>Trilhas</Separator>
      <TrailSection trails={trails} park={park}/>
      <Separator>Cachoeiras</Separator>
      <WaterfallSection waterfalls={waterfalls} park={park} />
    </div>
  );
};

export default Park;
