import React from "react";
import styles from "./InfoGeral.module.css";
import regiaoserrana1 from "/regiaoserrana.webp";
import regiaoserrana2 from "/regiaoserrana2.webp";
import regiaoserrana3 from "/regiaoserrana3.jpg";
import { FaCircleArrowDown } from "react-icons/fa6";

const InfoGeral = () => {
  return (
    <div className={styles.infoGeral}>
      <div className={styles.gallery}>
        <img
        className={styles.image}
        src={regiaoserrana1}
        alt="Região Serrana do Rio de Janeiro"
      />
      <img
        className={styles.image}
        src={regiaoserrana2}
        alt="Região Serrana do Rio de Janeiro"
      />
      <img
        className={styles.image}
        src={regiaoserrana3}
        alt="Região Serrana do Rio de Janeiro"
      />
      </div>
      <div className={styles.navigate}>
        <FaCircleArrowDown />
        <p>ENCONTRAR DESTINOS</p>
        <FaCircleArrowDown />
      </div>
    </div>
  );
};

export default InfoGeral;
