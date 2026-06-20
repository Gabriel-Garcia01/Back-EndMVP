import React from "react";
import styles from './Separator.module.css'

const Separator = ({ children }) => {
  return (
    <div>
      <div className={styles.separator}>
        <p className={styles.title}>{children}</p>
      </div>
    </div>
  );
};

export default Separator;
