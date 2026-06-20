import React from "react";
import styles from "./TrailSection.module.css";
import { MdOutlineWatchLater } from "react-icons/md";
import { IoTrailSignOutline } from "react-icons/io5";
import { Link } from "react-router-dom";

const TrailSection = ({ trails = [], park }) => {
  return (
    <section className={styles.trailSection} >
      {trails.map((trail) => (
        <Link key={trail.id} to={`/parques/${park.slug}/trilhas/${trail.slug}`}>
          <div className={styles.trailCard}>
            <img src={trail.mainImage} alt={trail.name} />

            <div className={styles.trailInfo}>
              <h3 className={styles.trailName}>
                <IoTrailSignOutline className={styles.icon} />
                <span>{trail.name}</span>
              </h3>

              <p className={styles.trailDuration}>
                <MdOutlineWatchLater className={styles.icon} />
                {trail.duration}
              </p>

              <p className={styles.trailDifficulty}>{trail.difficulty}</p>
            </div>
          </div>
        </Link>
      ))}
    </section>
  );
};

export default TrailSection;
