import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getWaterfallBySlug } from "../../services/api";
import styles from "./Waterfall.module.css";
import Loading from "../../components/Loading/Loading";

const Waterfall = () => {
  const { waterfallSlug } = useParams();
  const [waterfall, setWaterfall] = useState(null);

  useEffect(() => {
    async function loadWaterfall() {
      const data = await getWaterfallBySlug(waterfallSlug);
      setWaterfall(data);
    }

    loadWaterfall();
  }, [waterfallSlug]);

  if(waterfall === null) return <Loading />;
  if (!waterfall) return <p className={styles.loading}>Cachoeira não encontrada.</p>;

  return (
    <div className={styles.waterfallPage}>
      <div
        className={styles.hero}
        style={{
          backgroundImage: `linear-gradient(to top, rgba(2, 10, 6, 0.88) 12%, rgba(2, 10, 6, 0.28) 55%, rgba(2, 10, 6, 0) 100%), url(${waterfall.mainImage})`,
        }}
      >
        <div className={styles.heroContent}>
          <span className={styles.category}>Cachoeira</span>
          <h1 className={styles.waterfallName}>{waterfall.name}</h1>
          <div className={styles.metaRow}>
            <span className={styles.metaBadge}>{waterfall.difficulty}</span>
            <span className={styles.metaBadge}>{waterfall.duration}</span>
            <span className={styles.metaBadge}>{waterfall.park}</span>
          </div>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.summaryCard}>
          <h2>Sobre a cachoeira</h2>
          <p>{waterfall.description}</p>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.detailCard}>
            <h3>Facilidade</h3>
            <p>
              Essa cachoeira é classificada como{" "}
              <strong>{waterfall.difficulty}</strong>, ótima para quem busca uma
              jornada visualmente intensa e desafiadora.
            </p>
          </div>
          <div className={styles.detailCard}>
            <h3>Tempo estimado</h3>
            <p>
              Planeje entre <strong>{waterfall.duration}</strong> de caminhada, com
              paradas em pontos de vista e trechos de mata e montanha.
            </p>
          </div>
        </div>
      </div>
      <div className={styles.gallerySection}>
        {waterfall.images.map((image, index) => (
          <img
            className={styles.galleryImage}
            key={index}
            src={image}
            alt={`Foto da cachoeira ${waterfall.name}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Waterfall;
