import styles from "./InfoLocation.module.css";
import React from "react";

function Location({ hq = [], infoLocation }) {
  return (
    <section className={styles.locationSection}>
      <p className={styles.infoLocation}>{infoLocation}</p>

      {hq.map((headquarter) => (
        <article key={headquarter.name} className={styles.locationBlock}>
          <div
            className={styles.imageSide}
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.16), rgba(0,0,0,0.8)), url(${headquarter.image})`,
            }}
          >
            <div className={styles.imageOverlay}>
              <span className={styles.label}>Sede</span>
              <h3>{headquarter.name}</h3>
              <p className={styles.address}>
                {headquarter.address}
              </p>
              <p className={styles.phone}>
                Telefone: <strong>{headquarter.telephone}</strong>
              </p>
            </div>
          </div>

          <div className={styles.mapWrap}>
            <iframe
              src={headquarter.mapEmbed}
              className={styles.map}
              loading="lazy"
              allowFullScreen
              title={headquarter.name}
            />
          </div>
        </article>
      ))}
    </section>
  );
}

export default Location;
