// src/pages/Login.jsx
import React, { useState } from "react";
import "./Login.css";
import fondo from "../imagenes/login.jpg";
import cohete from "../imagenes/cohete.png";
import usuarioIcon from "../imagenes/usuario.png";
import estrella from "../imagenes/estrella-fugaz.png";
import ojoCerrado from "../imagenes/ojo-cerrado.png"; 
import ojoAbierto from "../imagenes/ojo.png";        

function Login({ onBackToHome, onRegisterClick }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-background" style={{ backgroundImage: `url(${fondo})` }}>
      <button className="back-btn" onClick={onBackToHome}>
        ← Volver al inicio
      </button>

      <div className="login-container">
        <div className="login-header">
          <h2>Bienvenido al</h2>
          <h1>Inicio de Sesión</h1>
          <img src={cohete} alt="Cohete" className="cohete-img" />
        </div>

        <div className="login-form">
          <h3>LOGIN</h3>

          {/* Campo Usuario */}
          <div className="input-group">
            <img src={usuarioIcon} alt="Usuario" className="input-icon" />
            <input type="text" placeholder="Usuario" />
          </div>

          {/* Campo Contraseña */}
          <div className="input-group password-wrapper">
            <img src={estrella} alt="Contraseña" className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              className="password-input"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              <img
                src={showPassword ? ojoAbierto : ojoCerrado}
                alt={showPassword ? "Ocultar" : "Mostrar"}
                className="eye-icon"
              />
            </button>
          </div>

          <button className="login-btn">Entrar</button>
          <span 
            className="register-link" 
            onClick={onRegisterClick}
            style={{ cursor: 'pointer' }}
          >
            Registrate
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;