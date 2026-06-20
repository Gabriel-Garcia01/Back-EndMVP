import React from 'react'
import styles from './InfoSection.module.css'
import { FaMountainSun } from "react-icons/fa6";
import { FaPersonHiking } from "react-icons/fa6";
import { GiWaterfall } from "react-icons/gi";

const InfoSection = () => {
  return (
    <div className={styles.infoSection}>
      <div className={styles.infoItem}>
        <FaMountainSun className={styles.infoIcon} />
        <h3 className={styles.infoTitle}>Parques e reservas</h3>
        <p className={styles.infoDescription}>Encontre parques e reservas naturais, repletos de beleza e aventuras na região serrana</p>
      </div>
      <div className={styles.infoItem}>
        <FaPersonHiking className={styles.infoIcon} />
        <h3 className={styles.infoTitle}>Trilhas</h3>
        <p className={styles.infoDescription}>Descubra as melhores trilhas, diversos níveis de dificuldade, extensão e duração.</p>
      </div>
      <div className={styles.infoItem}>
        <GiWaterfall className={styles.infoIcon} />
        <h3 className={styles.infoTitle}>Cachoeiras</h3>
        <p className={styles.infoDescription}>Descubras as melhores e mais bonitas cachoeiras da região</p>
      </div>

    </div>
  )
}

export default InfoSection