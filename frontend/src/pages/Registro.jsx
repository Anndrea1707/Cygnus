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
    pass_user: "",
    pass_confirm: "",
    aceptarTerminos: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState("Debes completar todos los campos");
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // ✅ Validar contraseña
  const validarContrasena = (pass) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/;
    return regex.test(pass);
  };

  useEffect(() => {
    const valida = validarContrasena(formData.pass_user);
    setPasswordValid(valida);

    const coinciden =
      formData.pass_user &&
      formData.pass_confirm &&
      formData.pass_user === formData.pass_confirm;
    setPasswordsMatch(coinciden);

    setShowValidation(
      formData.pass_user.length > 0 || formData.pass_confirm.length > 0
    );
  }, [formData.pass_user, formData.pass_confirm]);

  useEffect(() => {
    const camposLlenos =
      formData.cedula &&
      formData.nombre_completo &&
      formData.correo &&
      formData.fecha_nacimiento &&
      formData.pass_user &&
      formData.pass_confirm;

    if (!camposLlenos) setMensajeEstado("Debes completar todos los campos");
    else if (!formData.aceptarTerminos)
      setMensajeEstado("No olvides aceptar los términos y condiciones");
    else if (!passwordValid)
      setMensajeEstado("La contraseña no cumple con los requisitos");
    else if (!passwordsMatch)
      setMensajeEstado("Las contraseñas no coinciden");
    else setMensajeEstado("");
  }, [formData, passwordValid, passwordsMatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "cedula" && !/^\d*$/.test(value)) return;
    if (name === "nombre_completo" && /[0-9]/.test(value)) return;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passwordValid) {
      alert("⚠️ La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo especial.");
      return;
    }
    if (!passwordsMatch) {
      alert("⚠️ Las contraseñas no coinciden.");
      return;
    }

    if (!formData.aceptarTerminos) {
      alert("⚠️ Debes aceptar los términos y condiciones.");
      return;
    }

    try {
      const response = await fetch("/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          contrasena: formData.pass_user, // se envía al backend igual
          confirmar_contrasena: formData.pass_confirm,
        }),
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

  const botonDeshabilitado = !(
    formData.cedula &&
    formData.nombre_completo &&
    formData.correo &&
    formData.fecha_nacimiento &&
    passwordValid &&
    passwordsMatch &&
    formData.aceptarTerminos
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

        <form className="registro-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="input-group">
            <input
              type="text"
              name="cedula"
              placeholder="Documento"
              value={formData.cedula}
              onChange={handleChange}
              required
              autoComplete="off"
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
              autoComplete="off"
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
              autoComplete="off"
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
              name="pass_user"
              placeholder="Contraseña"
              value={formData.pass_user}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              <img
                src={showPassword ? ojoAbierto : ojoCerrado}
                alt="Mostrar/Ocultar"
                className="eye-icon"
              />
            </button>
          </div>

          {/* Confirmar contraseña */}
          <div className="input-group password-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="pass_confirm"
              placeholder="Confirmar contraseña"
              value={formData.pass_confirm}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <img
                src={showConfirmPassword ? ojoAbierto : ojoCerrado}
                alt="Mostrar/Ocultar"
                className="eye-icon"
              />
            </button>
          </div>

          {showValidation && (
            <ul className="password-validation fade-in">
              <li style={{ color: passwordValid ? "#b4ff9f" : "#ffd1d1" }}>
                {passwordValid
                  ? "✅ Contraseña válida"
                  : "❌ Usa mayúsculas, minúsculas, número y símbolo (mín. 8 caracteres)"}
              </li>
              <li style={{ color: passwordsMatch ? "#b4ff9f" : "#ffd1d1" }}>
                {passwordsMatch
                  ? "✅ Las contraseñas coinciden"
                  : "❌ Las contraseñas no coinciden"}
              </li>
            </ul>
          )}

          {/* Checkbox con modal */}
          <div className="checkbox-group">
            <input
              type="checkbox"
              checked={formData.aceptarTerminos}
              onChange={() => setShowModal(true)}
            />
            <label onClick={() => setShowModal(true)}>
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

          {mensajeEstado && <p className="estado-mensaje">{mensajeEstado}</p>}

          <p className="back-text" onClick={onBackToLogin}>
            ← Volver al inicio
          </p>
        </form>
      </div>

      {/* Modal de términos */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Términos y Condiciones</h2>
            <p>
              🔒 Tus datos personales están protegidos.  
              Este registro se realiza únicamente con fines académicos.  
              La información se mantiene privada y segura según nuestra política de datos.
            </p>
            <button
              className="modal-btn"
              onClick={() => {
                setShowModal(false);
                setFormData({ ...formData, aceptarTerminos: true });
              }}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Registro;
