// src/pages/Registro.jsx
import React, { useState, useEffect } from "react";
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
    aceptarTerminos: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState("Debes completar todos los campos");

  // ✅ Verificar campos llenos y actualizar mensaje dinámico
  useEffect(() => {
    const camposLlenos =
      formData.cedula &&
      formData.nombre_completo &&
      formData.correo &&
      formData.fecha_nacimiento &&
      formData.contrasena &&
      formData.confirmar_contrasena;

    if (!camposLlenos) {
      setMensajeEstado("Debes completar todos los campos");
    } else if (!formData.aceptarTerminos) {
      setMensajeEstado("No olvides aceptar los términos y condiciones");
    } else {
      setMensajeEstado("");
    }
  }, [formData]);

  // ✅ Validar entrada de texto
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "cedula" && !/^\d*$/.test(value)) return; // Solo números
    if (name === "nombre_completo" && /[0-9]/.test(value)) return; // Sin números

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ✅ Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    const camposLlenos =
      formData.cedula &&
      formData.nombre_completo &&
      formData.correo &&
      formData.fecha_nacimiento &&
      formData.contrasena &&
      formData.confirmar_contrasena;

    if (!camposLlenos) {
      alert("⚠️ Por favor completa todos los campos antes de continuar.");
      return;
    }

    if (!formData.aceptarTerminos) {
      alert("⚠️ Debes aceptar los términos y condiciones.");
      return;
    }

    if (formData.contrasena !== formData.confirmar_contrasena) {
      alert("⚠️ Las contraseñas no coinciden");
      return;
    }

    try {
      const response = await fetch("/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.mensaje);
        onBackToLogin();
      } else {
        alert(data.mensaje || "❌ Error al registrar usuario");
      }
    } catch (error) {
      alert("❌ Error al conectar con el servidor");
      console.error(error);
    }
  };

  const handleTerminos = () => {
    alert(
      "🔒 Tus datos personales están protegidos.\n\nEste registro se realiza únicamente con fines académicos. La información se mantiene privada y segura según nuestra política de datos."
    );
  };

  const camposCompletos =
    formData.cedula &&
    formData.nombre_completo &&
    formData.correo &&
    formData.fecha_nacimiento &&
    formData.contrasena &&
    formData.confirmar_contrasena;

  const botonDeshabilitado = !(
    camposCompletos && formData.aceptarTerminos
  );

  return (
    <div
      className="registro-background"
      style={{ backgroundImage: `url(${fondo})` }}
    >
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
              placeholder="Documento"
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

          {/* Confirmar contraseña */}
          <div className="input-group password-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmar_contrasena"
              placeholder="Confirmar contraseña"
              value={formData.confirmar_contrasena}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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

          {/* Checkbox */}
          <div className="checkbox-group">
            <input
              type="checkbox"
              name="aceptarTerminos"
              checked={formData.aceptarTerminos}
              onChange={handleChange}
            />
            <label onClick={handleTerminos}>
              Acepto los términos y condiciones
            </label>
          </div>

          <button
            type="submit"
            className={`register-btn ${botonDeshabilitado ? "disabled" : ""}`}
            disabled={botonDeshabilitado}
          >
            Registrar
          </button>

          {/* Mensaje dinámico */}
          {mensajeEstado && (
            <p className="estado-mensaje">{mensajeEstado}</p>
          )}

          <p className="back-text" onClick={onBackToLogin}>
            ← Volver al inicio
          </p>
        </form>
      </div>
    </div>
  );
}

export default Registro;
