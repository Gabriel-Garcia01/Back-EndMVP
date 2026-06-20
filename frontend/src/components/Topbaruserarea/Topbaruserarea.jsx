import React, { useEffect, useState } from "react";
import styles from "./Topbaruserarea.module.css";
import { Link } from 'react-router-dom'

const Topbaruserarea = () => {
  const [user, setUser] = useState(() => {
    const currentUser = localStorage.getItem("currentUser");
    return currentUser ? JSON.parse(currentUser) : null;
  });

  const isAdmin = user && (user.email === "admin" || user.name === "admin");
  const displayName = !isAdmin ? (user?.name || user?.email || "Usuário") : null;
  const avatarAlt = displayName || "Usuário";

  return (
    <div>
      {user ? (
        <div className={styles.userInfo}>
          <img src={user.avatar} alt={avatarAlt} />
          {displayName && <span>{displayName}</span>}
          {isAdmin && (
            <a href="/admin.html" className={styles.adminBtn}>
              Admin
            </a>
          )}
          <button
            className={styles.logoutBtn}
            onClick={() => {
              localStorage.removeItem("currentUser");
              setUser(null);
            }}
          >
            sair
          </button>
        </div>
      ) : (
        <div className={styles.loginRegisterUser}>
          <Link to="/login">
            <button className={styles.loginBtn}>Entrar</button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Topbaruserarea;
