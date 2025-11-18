import React, { useState } from "react";
import NavbarPrincipal from "../components/NavbarPrincipal";
import Footer from "../components/Footer";
import "./ModificarPerfil.css";

function ModificarPerfil({ usuario, onNavigate, onLogout }) {
  const [nombre] = useState(usuario?.nombre_completo || "");
  const [apodo, setApodo] = useState(usuario?.apodo || "");
  const [correo, setCorreo] = useState(usuario?.correo || usuario?.email || "");

  const [avatarVista, setAvatarVista] = useState(
    usuario?.avatar || "/assets/avatars/avatar1.png"
  );

  const [fondo, setFondo] = useState(usuario?.fondo || "/assets/fondos/fondo1.jpg");

  const [mostrarModal, setMostrarModal] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [seccion, setSeccion] = useState("general");

  // ============================
  // LISTA DE AVATARES DEL ADMIN
  // ============================
  const avataresDisponibles = [
    "/assets/avatars/avatar1.png",
    "/assets/avatars/avatar2.png",
    "/assets/avatars/avatar3.png",
    "/assets/avatars/avatar4.png",
  ];

  // ============================
  // LISTA DE FONDOS DEL ADMIN
  // ============================
  const fondosDisponibles = [
    "/assets/fondos/fondo1.jpg",
    "/assets/fondos/fondo2.jpg",
    "/assets/fondos/fondo3.jpg",
    "/assets/fondos/fondo4.jpg",
  ];

  // DESCRIPCIONES SEGÚN SECCIÓN
  const descripciones = {
    general:
      "Modifica tus datos principales dentro de Cygnus. Solo el apodo y el correo pueden cambiarse.",
    avatar:
      "Selecciona un avatar de la galería prediseñada por Cygnus. No se permiten imágenes externas.",
    fondo:
      "Personaliza el fondo de tu perfil eligiendo entre estilos oficiales de Cygnus.",
    info:
      "Aprende cómo mantener tu cuenta segura dentro de Cygnus.",
  };

  // ============================
  // GUARDAR CAMBIOS
  // ============================
  const abrirConfirmacion = () => setMostrarModal(true);
  const cancelarModal = () => setMostrarModal(false);

  const guardarCambios = async () => {
    setGuardando(true);

    try {
      const res = await fetch("http://localhost:4000/api/perfil/modificarPerfil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: usuario._id,
          nombre_completo: nombre, // Ya no cambia
          apodo,
          correo,
          avatar: avatarVista,
          fondo,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        localStorage.setItem("usuario", JSON.stringify(data.usuarioActualizado));
        onNavigate("perfil");
      }
    } catch (err) {
      console.error("Error guardando perfil:", err);
    } finally {
      setGuardando(false);
      setMostrarModal(false);
    }
  };

  return (
    <>
      <NavbarPrincipal usuario={usuario} onLogout={onLogout} onNavigate={onNavigate} />

      <div className="editar-container">

        {/* BOTÓN VOLVER ARRIBA */}
        <button className="btn-volver-top" onClick={() => onNavigate("perfil")}>
          ← Volver al perfil
        </button>

        {/* PANEL LATERAL */}
        <div className="panel-lateral">
          <button
            className={seccion === "general" ? "opcion-lateral activa" : "opcion-lateral"}
            onClick={() => setSeccion("general")}
          >
            General
          </button>

          <button
            className={seccion === "avatar" ? "opcion-lateral activa" : "opcion-lateral"}
            onClick={() => setSeccion("avatar")}
          >
            Avatar
          </button>

          <button
            className={seccion === "fondo" ? "opcion-lateral activa" : "opcion-lateral"}
            onClick={() => setSeccion("fondo")}
          >
            Fondo del perfil
          </button>

          <button
            className={seccion === "info" ? "opcion-lateral activa" : "opcion-lateral"}
            onClick={() => setSeccion("info")}
          >
            Seguridad
          </button>
        </div>

        {/* CONTENIDO DERECHO */}
        <div className="editar-contenido">
          <h1 className="titulo-seccion">{seccion.toUpperCase()}</h1>
          <p className="descripcion-seccion">{descripciones[seccion]}</p>

          {/* ----------------- GENERAL ----------------- */}
          {seccion === "general" && (
            <>
              <div className="campo">
                <label>Nombre completo</label>
                <input
                  type="text"
                  value={nombre}
                  className="input-editar"
                  readOnly
                  style={{ opacity: 0.6, cursor: "not-allowed" }}
                />
              </div>

              <div className="campo">
                <label>Apodo</label>
                <input
                  type="text"
                  value={apodo}
                  onChange={(e) => setApodo(e.target.value)}
                  className="input-editar"
                />
              </div>

              <div className="campo">
                <label>Correo</label>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="input-editar"
                />
              </div>
            </>
          )}

          {/* ----------------- AVATAR ----------------- */}
          {seccion === "avatar" && (
            <div className="galeria">
              {avataresDisponibles.map((img, index) => (
                <div
                  key={index}
                  className={
                    avatarVista === img ? "item-galeria seleccionado" : "item-galeria"
                  }
                  onClick={() => setAvatarVista(img)}
                >
                  <img src={img} alt="avatar" className="img-galeria" />
                </div>
              ))}
            </div>
          )}

          {/* ----------------- FONDO ----------------- */}
          {seccion === "fondo" && (
            <div className="galeria">
              {fondosDisponibles.map((img, index) => (
                <div
                  key={index}
                  className={fondo === img ? "item-galeria seleccionado" : "item-galeria"}
                  onClick={() => setFondo(img)}
                >
                  <img src={img} alt="fondo" className="img-galeria" />
                </div>
              ))}
            </div>
          )}

          {/* ----------------- SEGURIDAD ----------------- */}
          {seccion === "info" && (
            <div className="info-seguridad">
              <h2>Seguridad de tu cuenta</h2>
              <p>
                En Cygnus nos tomamos muy en serio la seguridad de nuestros usuarios.
                Aquí encontrarás recomendaciones para proteger tu información.
              </p>

              <h3>1. Tu correo electrónico</h3>
              <p>
                Es tu principal medio de recuperación de cuenta. Asegúrate de mantenerlo actualizado.
              </p>

              <h3>2. Contraseña segura</h3>
              <p>
                Usa una contraseña larga y segura. No compartas tus credenciales con nadie.
              </p>

              <h3>3. Actividad sospechosa</h3>
              <p>
                Si detectas algo inusual, cambia tu contraseña y comunícate con el soporte.
              </p>

              <h3>4. Próximas funciones</h3>
              <p>
                Implementaremos verificación en dos pasos (2FA) y control de sesiones activas.
              </p>
            </div>
          )}

          {/* BOTÓN GUARDAR */}
          {(seccion === "general" ||
            seccion === "avatar" ||
            seccion === "fondo") && (
            <div className="guardar-container">
              <button className="btn-guardar" onClick={abrirConfirmacion}>
                Guardar cambios
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>¿Guardar cambios?</h2>
            <p>Se actualizarán tus datos en Cygnus.</p>

            <div className="modal-buttons-vertical">
              <button className="btn-modal-cancelar" onClick={cancelarModal}>
                Cancelar
              </button>

              <button
                className="btn-modal-confirmar"
                onClick={guardarCambios}
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Confirmar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default ModificarPerfil;
