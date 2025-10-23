import React, { useState } from "react";
import "./Login.css";
import fondo from "../imagenes/login.jpg";
import cohete from "../imagenes/cohete.png";
import usuarioIcon from "../imagenes/usuario.png";
import estrella from "../imagenes/estrella-fugaz.png";
import ojoCerrado from "../imagenes/ojo-cerrado.png";
import ojoAbierto from "../imagenes/ojo.png";

function Login({ onBackToHome, onRegisterClick, onLoginSuccess }) {
  const [showPassword, setShowPassword] = useState(false);
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Manejo del envío del formulario
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!correo || !contrasena) {
      alert("⚠️ Por favor, completa todos los campos.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contrasena }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.mensaje);
        // 👇 Llamamos al Home o página principal
        if (onLoginSuccess) onLoginSuccess(data.usuario);
      } else {
        alert(data.mensaje || "❌ Error al iniciar sesión");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("❌ Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="login-background"
      style={{ backgroundImage: `url(${fondo})` }}
    >
      <button className="back-btn" onClick={onBackToHome}>
        ← Volver al inicio
      </button>

      <div className="login-container">
        <div className="login-header">
          <h2>Bienvenido al</h2>
          <h1>Inicio de Sesión</h1>
          <img src={cohete} alt="Cohete" className="cohete-img" />
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <h3>LOGIN</h3>

          {/* Campo Correo */}
          <div className="input-group">
            <img src={usuarioIcon} alt="Usuario" className="input-icon" />
            <input
              type="email"
              placeholder="Correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          {/* Campo Contraseña */}
          <div className="input-group password-wrapper">
            <img src={estrella} alt="Contraseña" className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              <img
                src={showPassword ? ojoAbierto : ojoCerrado}
                alt={showPassword ? "Ocultar" : "Mostrar"}
                className="eye-icon"
              />
            </button>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Ingresando..." : "Entrar"}
          </button>

          <span
            className="register-link"
            onClick={onRegisterClick}
            style={{ cursor: "pointer" }}
          >
            Registrate
          </span>
        </form>
      </div>
    </div>
  );
}

export default Login;
