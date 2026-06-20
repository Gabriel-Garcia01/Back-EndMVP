import React from "react";
import styles from "./WaterfallSection.module.css";
import { MdOutlineWatchLater } from "react-icons/md";
import { IoTrailSignOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { GiWaterfall } from "react-icons/gi";

const WaterfallSection = ({ waterfalls = [], park }) => {
  return (
    <section className={styles.waterfallSection} >
      {waterfalls.map((waterfall) => (
        <Link key={waterfall.id} to={`/parques/${park.slug}/cachoeiras/${waterfall.slug}`}>
          <div className={styles.waterfallCard}>
            <img src={waterfall.mainImage} alt={waterfall.name} />

            <div className={styles.waterfallInfo}>
              <h3 className={styles.waterfallName}>
                <GiWaterfall className={styles.icon} />
                <span>{waterfall.name}</span>
              </h3>

              <p className={styles.waterfallDuration}>
                <MdOutlineWatchLater className={styles.icon} />
                {waterfall.duration}
              </p>

              <p className={styles.waterfallDifficulty}>{waterfall.difficulty}</p>
            </div>
          </div>
        </Link>
      ))}
    </section>
  );
};

export default WaterfallSection;
