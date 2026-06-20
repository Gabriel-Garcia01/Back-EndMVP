import React from "react";
import styles from "./Loading.module.css";

const Loading = () => (
  <div className={styles.wrapper}>
    <div className={styles.spinner} />
    <p>Carregando...</p>
  </div>
);

export default Loading;