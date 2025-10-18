// src/pages/Registro.jsx
import React, { useState } from "react";
import "./Registro.css";
import fondo from "../imagenes/login.jpg";
import cohete from "../imagenes/cohete.png";
import ojoCerrado from "../imagenes/ojo-cerrado.png";
import ojoAbierto from "../imagenes/ojo.png";

function Registro({ onBackToLogin }) {
  const [formData, setFormData] = useState({
    cedula: "",
    nombre_completo: "",
    correo: "",
    fecha_nacimiento: "",
    contrasena: "",
    confirmar_contrasena: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ✅ Manejar cambios en los inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificar contraseñas
    if (formData.contrasena !== formData.confirmar_contrasena) {
      alert("⚠️ Las contraseñas no coinciden");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.mensaje);
        onBackToLogin(); // 👈 Redirige al Login.jsx
      } else {
        alert(data.mensaje || "❌ Error al registrar usuario");
      }
    } catch (error) {
      alert("❌ Error al conectar con el servidor");
      console.error(error);
    }
  };

  return (
    <div
      className="registro-background"
      style={{ backgroundImage: `url(${fondo})` }}
    >
      <button className="back-btn" onClick={onBackToLogin}>
        ← Volver al inicio
      </button>

      <div className="registro-container">
        <div className="registro-header">
          <img src={cohete} alt="Cohete" className="cohete-img" />
          <h1>REGÍSTRATE</h1>
        </div>

        <form className="registro-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              name="cedula"
              placeholder="Cédula"
              value={formData.cedula}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="text"
              name="nombre_completo"
              placeholder="Nombre completo"
              value={formData.nombre_completo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="email"
              name="correo"
              placeholder="Correo electrónico"
              value={formData.correo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="date"
              name="fecha_nacimiento"
              value={formData.fecha_nacimiento}
              onChange={handleChange}
              required
            />
          </div>

          {/* Contraseña */}
          <div className="input-group password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="contrasena"
              placeholder="Contraseña"
              value={formData.contrasena}
              onChange={handleChange}
              required
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

          {/* Confirmar contraseña */}
          <div className="input-group password-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmar_contrasena"
              placeholder="Confirmar Contraseña"
              value={formData.confirmar_contrasena}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              aria-label={
                showConfirmPassword
                  ? "Ocultar confirmación"
                  : "Mostrar confirmación"
              }
            >
              <img
                src={showConfirmPassword ? ojoAbierto : ojoCerrado}
                alt={showConfirmPassword ? "Ocultar" : "Mostrar"}
                className="eye-icon"
              />
            </button>
          </div>

          <button type="submit" className="register-btn">
            Registrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Registro;
