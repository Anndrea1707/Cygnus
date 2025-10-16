// src/pages/Login.jsx
import React from "react";
import "./Login.css";
import fondo from "../imagenes/login.jpg";
import cohete from "../imagenes/cohete.png";
import usuarioIcon from "../imagenes/usuario.png";
import estrella from "../imagenes/estrella-fugaz.png";

function Login({ onBackToHome }) {
  return (
    <div className="login-background" style={{ backgroundImage: `url(${fondo})` }}>
      
      {/* ✅ Botón fuera de la tarjeta, en esquina superior izquierda */}
      <button className="back-btn" onClick={onBackToHome}>
        ← Volver al inicio
      </button>

      {/* Tarjeta principal */}
      <div className="login-container">
        <div className="login-header">
          <h2>Bienvenido al</h2>
          <h1>Inicio de Sesión</h1>
          <img src={cohete} alt="Cohete" className="cohete-img" />
        </div>

        <div className="login-form">
          <h3>LOGIN</h3>

          <div className="input-group">
            <img src={usuarioIcon} alt="Usuario" className="input-icon" />
            <input type="text" placeholder="Usuario" />
          </div>

          <div className="input-group">
            <img src={estrella} alt="Contraseña" className="input-icon" />
            <input type="password" placeholder="Contraseña" />
          </div>

          <button className="login-btn">Entrar</button>
          <a href="#" className="register-link">Registrate</a>
        </div>
      </div>
    </div>
  );
}

export default Login;