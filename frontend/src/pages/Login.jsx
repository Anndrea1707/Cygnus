// src/pages/Login.jsx
import React, { useState } from "react";
import api from "../api/axios"; // 🔥 AGREGAR IMPORT
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

  // Modal SOLO para errores (dejado así para avisos importantes)
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modalMensaje, setModalMensaje] = useState("");
  const [modalTitulo, setModalTitulo] = useState("");
  const [modalIcono, setModalIcono] = useState("🚀");

  // Ya NO se usa para inicio exitoso → queda solo para errores
  const cerrarModal = () => {
    setMostrarModal(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!correo || !contrasena) {
      setModalIcono("❌");
      setModalTitulo("Campos incompletos");
      setModalMensaje("Por favor, completa todos los campos.");
      setMostrarModal(true);
      return;
    }

    setLoading(true);

    try {
      // 🔥 CORREGIR: Usar api en lugar de fetch
      const response = await api.post("/api/login", { 
        correo, 
        contrasena 
      });

      const data = response.data;

      if (response.status === 200) {
        const usuario = data.usuario || {};

        // ⭐ Redirección inmediata sin modal
        onLoginSuccess(usuario);
        return;
      } else {
        setModalIcono("❌");
        setModalTitulo("No hemos podido iniciar tu sesión");
        setModalMensaje("Por favor, vuelve a intentarlo.");
        setMostrarModal(true);
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);

      // 🔥 CORREGIR: Manejar errores de axios
      if (error.response) {
        // El servidor respondió con un código de error
        setModalIcono("❌");
        setModalTitulo("Error al iniciar sesión");
        setModalMensaje(error.response.data.message || "Credenciales incorrectas.");
      } else {
        // Error de conexión
        setModalIcono("❌");
        setModalTitulo("Error de conexión");
        setModalMensaje("No se pudo conectar al servidor.");
      }
      setMostrarModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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

            <div className="input-groupC">
              <img src={usuarioIcon} alt="Usuario" className="input-icon" />
              <input
                type="email"
                placeholder="Correo"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>

            <div className="input-groupC password-wrapper">
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
              >
                <img
                  src={showPassword ? ojoAbierto : ojoCerrado}
                  alt="Mostrar"
                  className="eye-icon"
                />
              </button>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Ingresando..." : "Entrar"}
            </button>

            <span className="register-link" onClick={onRegisterClick}>
              Registrate
            </span>
          </form>
        </div>
      </div>

      {/* 🟣 MODAL SOLO PARA ERRORES */}
      {mostrarModal && (
        <div className="modal-overlay-login">
          <div className="modal-login">
            <div className="modal-icon-login">{modalIcono}</div>

            <h3>{modalTitulo}</h3>
            <p>{modalMensaje}</p>

            <button className="modal-btn-aceptar" onClick={cerrarModal}>
              Aceptar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Login;