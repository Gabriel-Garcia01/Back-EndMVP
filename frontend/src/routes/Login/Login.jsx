import React, { useState } from "react";
import styles from "./Login.module.css";
import { MdEmail } from "react-icons/md";
import { MdLock } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { IoIosReturnLeft } from "react-icons/io";
import { login } from "../../services/api";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await login(email, password);
      localStorage.setItem("currentUser", JSON.stringify(response.user));
      navigate("/");
    } catch (err) {
      setError(err.message || "Erro ao realizar login.");
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginForm}>
        <button className={styles.brandBtn}>
          <Link to="/" className={styles.brandText}>
            <IoIosReturnLeft className={styles.brandIcon} />
            <p>Terê Verde</p>
          </Link>
        </button>

        <h1 className={styles.title}>Olá</h1>
        <h2 className={styles.subtitle}>Acessar sua conta</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <MdEmail className={styles.icon} />
            <input
              type="text"
              placeholder="Usuário ou email"
              id="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <MdLock className={styles.icon} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              id="password"
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPassword(!showPassword)}
            >
              <FaEye className={styles.icon} />
            </button>
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.loginBtn} type="submit">
            Entrar
          </button>
        </form>
        <p className={styles.register}>
          Não tem uma conta? <Link to="/register">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
