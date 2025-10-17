// src/pages/Registro.jsx
import React, { useState } from "react";
import "./Registro.css";
import fondo from "../imagenes/login.jpg";
import cohete from "../imagenes/cohete.png";

function Registro({ onBackToLogin }) {
  const [formData, setFormData] = useState({
    cedula: "",
    nombre_completo: "",
    correo: "",
    fecha_nacimiento: "",
    contrasena: "",
    confirmar_contrasena: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí se enviaría al backend
    console.log("Datos del registro:", formData);
    alert("¡Registro enviado! (esto se manejará en el backend)");
  };

  return (
    <div className="registro-background" style={{ backgroundImage: `url(${fondo})` }}>
      {/* Botón de retroceso */}
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
              placeholder="Correo"
              value={formData.correo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="date"
              name="fecha_nacimiento"
              placeholder="Fecha de nacimiento"
              value={formData.fecha_nacimiento}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              name="contrasena"
              placeholder="Contraseña"
              value={formData.contrasena}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              name="confirmar_contrasena"
              placeholder="Confirmar Contraseña"
              value={formData.confirmar_contrasena}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="register-btn">
            Registra
          </button>
        </form>
      </div>
    </div>
  );
}

export default Registro;