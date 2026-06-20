import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTrailBySlug } from "../../services/api";
import styles from "./Trail.module.css";
import ParkGallery from "../../components/ParkGallery/ParkGallery";
import Separator from "../../components/Separator/Separator";
import Loading from "../../components/Loading/Loading";

const Trail = () => {
  const { trailSlug } = useParams();
  const [trail, setTrail] = useState(null);

  useEffect(() => {
    async function loadTrail() {
      const data = await getTrailBySlug(trailSlug);
      setTrail(data);
    }

    loadTrail();
  }, [trailSlug]);

  if (!trail) return <Loading />;

  return (
    <div className={styles.trailPage}>
      <div
        className={styles.hero}
        style={{
          backgroundImage: `linear-gradient(to top, rgba(2, 10, 6, 0.88) 12%, rgba(2, 10, 6, 0.28) 55%, rgba(2, 10, 6, 0) 100%), url(${trail.mainImage})`,
        }}
      >
        <div className={styles.heroContent}>
          <span className={styles.category}>Trilha</span>
          <h1 className={styles.trailName}>{trail.name}</h1>
          <div className={styles.metaRow}>
            <span className={styles.metaBadge}>{trail.difficulty}</span>
            <span className={styles.metaBadge}>{trail.duration}</span>
            <span className={styles.metaBadge}>{trail.park}</span>
          </div>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.summaryCard}>
          <h2>Sobre a trilha</h2>
          <p>{trail.description}</p>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.detailCard}>
            <h3>Facilidade</h3>
            <p>
              Essa trilha é classificada como{" "}
              <strong>{trail.difficulty}</strong>, ótima para quem busca uma
              jornada visualmente intensa e desafiadora.
            </p>
          </div>
          <div className={styles.detailCard}>
            <h3>Tempo estimado</h3>
            <p>
              Planeje entre <strong>{trail.duration}</strong> de caminhada, com
              paradas em pontos de vista e trechos de mata e montanha.
            </p>
          </div>
        </div>
      </div>
      <div className={styles.gallerySection}>
        {trail.images.map((image, index) => (
          <img
            className={styles.galleryImage}
            key={index}
            src={image}
            alt={`Foto da trilha ${trail.name}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Trail;
