// src/pages/ModificarPerfil.jsx
import React, { useState } from "react";
import NavbarPrincipal from "../components/NavbarPrincipal";
import Footer from "../components/Footer";
import "./ModificarPerfil.css";

function ModificarPerfil({ usuario, onNavigate, onLogout }) {
  const [nombre, setNombre] = useState(usuario?.nombre_completo || "");
  const [apodo, setApodo] = useState(usuario?.apodo || "");
  const [email, setEmail] = useState(usuario?.email || "");
  const [avatar, setAvatar] = useState(usuario?.avatar || "https://cdn-icons-png.flaticon.com/128/1068/1068549.png");

  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Cambiar imagen de perfil (URL simple)
  const handleAvatarChange = () => {
    const nuevaUrl = prompt("Ingresa la URL de tu nueva foto de perfil:");
    if (nuevaUrl) setAvatar(nuevaUrl);
  };

  // GUARDAR CAMBIOS EN BD
  const guardarCambios = async () => {
    setGuardando(true);
    setMensaje(null);
    setError(null);

    try {
      const response = await fetch("http://localhost/cygnus/actualizarPerfil.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: usuario.id,
          nombre_completo: nombre,
          apodo: apodo,
          email: email,
          avatar: avatar,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        setMensaje("Cambios guardados correctamente 🎉");
        localStorage.setItem("usuario", JSON.stringify(data.usuarioActualizado));
      } else {
        setError("Error al guardar los cambios.");
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor.");
    }

    setGuardando(false);
  };

  return (
    <>
      <NavbarPrincipal usuario={usuario} onNavigate={onNavigate} onLogout={onLogout} />

      <div className="editar-container">
        <div className="editar-card">
          <h1 className="editar-titulo">Modificar Perfil</h1>

          {/* AVATAR */}
          <div className="editar-avatar-section">
            <img src={avatar} alt="Avatar" className="editar-avatar" />
            <button className="btn-cambiar-foto" onClick={handleAvatarChange}>
              Cambiar foto
            </button>
          </div>

          {/* FORMULARIO */}
          <div className="editar-form">
            <label>Nombre completo</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />

            <label>Apodo (Nuevo campo)</label>
            <input
              type="text"
              value={apodo}
              onChange={(e) => setApodo(e.target.value)}
              placeholder="Ej: ÁngelDev, CygnusBoy, etc."
            />

            <label>Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* MENSAJES */}
          {mensaje && <p className="mensaje-exito">{mensaje}</p>}
          {error && <p className="mensaje-error">{error}</p>}

          {/* BOTÓN GUARDAR */}
          <button className="btn-guardar" onClick={guardarCambios} disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>

          <button className="btn-volver" onClick={() => onNavigate("perfil")}>
            Volver al perfil
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default ModificarPerfil;
