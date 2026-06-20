import React from "react";
import styles from "./ParkSelection.module.css";
import { Link } from "react-router-dom";

const ParkSelection = ({ parks = [] }) => {
  return (
    <div>
      <div className={styles.parkList}>
        {parks.map((park) => (
          <Link
            key={park.id}
            to={`/parques/${park.slug}`}
            className={styles.parkLink}
          >
            <div className={styles.parkItem}>
              <img src={park.images[0]} alt={park.name} />

              <div className={styles.overlay}>
                <h3 className={styles.parkName}>{park.name}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ParkSelection;
