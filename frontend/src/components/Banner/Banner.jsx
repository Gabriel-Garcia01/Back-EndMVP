import React from "react";
import styles from './Banner.module.css'
import InfoSection from "../InfoSection/InfoSection";
import InfoGeral from "../InfoGeral/InfoGeral";

const Banner = () => {
  return (
    <div>
      <div className={styles.bannerHome}>
        <h1 className={styles.title}>Terê Verde</h1>
        <h2 className={styles.subtitle}>Explore a natureza serrana</h2>
        <p className={styles.description}>
          Informações sobre os principais parques, reservas e trilhas da região,
          além de nossos melhores guias turísticos.
        </p>
        <InfoSection />
        <InfoGeral />
      </div>
    </div>
  );
};

export default Banner;
