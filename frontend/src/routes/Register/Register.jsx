import React, { useState } from "react";
import styles from "./Register.module.css";
import { MdEmail } from "react-icons/md";
import { MdLock } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { register } from "../../services/api";
import { IoIosReturnLeft } from "react-icons/io";


const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    try {
      await register(name, email, password);
      navigate("/login");
    } catch (err) {
      setError(err.message);
      return;
    }

    setError("");
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

        <h1 className={styles.title}>Bem-vindo</h1>
        <h2 className={styles.subtitle}>Criar uma conta</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <FaUserCircle className={styles.icon} />
            <input
              type="text"
              placeholder="Seu nome"
              id="name"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <MdEmail className={styles.icon} />
            <input
              type="email"
              placeholder="Email"
              id="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div
            className={`${styles.formGroup} ${error ? styles.inputError : ""}`}
          >
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
          <div
            className={`${styles.formGroup} ${error ? styles.inputError : ""}`}
          >
            <MdLock className={styles.icon} />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirme a Senha"
              id="confirmPassword"
              name="confirmPassword"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <FaEye className={styles.icon} />
            </button>
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.loginBtn} type="submit">
            Criar Conta
          </button>
        </form>
        <p className={styles.register}>
          Já tem uma conta? <Link to="/login">Entre</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
