import React, { useState } from "react";
import NavbarPrincipal from "../components/NavbarPrincipal";
import Footer from "../components/Footer";
import "./ModificarPerfil.css";

function ModificarPerfil({ usuario, onNavigate, onLogout }) {
  const [nombre, setNombre] = useState(usuario?.nombre_completo || "");
  const [apodo, setApodo] = useState(usuario?.apodo || "");
  const [correo, setCorreo] = useState(usuario?.correo || usuario?.email || "");

  const [avatarVista, setAvatarVista] = useState(
    usuario?.avatar || "https://cdn-icons-png.flaticon.com/128/4712/4712108.png"
  );
  const [avatarFile, setAvatarFile] = useState(null);

  const [fondo, setFondo] = useState(usuario?.fondo || "default");

  const [mostrarModal, setMostrarModal] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const seleccionarImagen = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarFile(file);

    const previewURL = URL.createObjectURL(file);
    setAvatarVista(previewURL);
  };

  const abrirConfirmacion = () => setMostrarModal(true);
  const cancelarModal = () => setMostrarModal(false);

  const guardarCambios = async () => {
    setGuardando(true);

    let avatarFinal = usuario.avatar;

    // Subida de avatar si hay archivo nuevo
    if (avatarFile) {
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      try {
        const uploadRes = await fetch("http://localhost:5000/api/subirAvatar", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        avatarFinal = uploadData.url;
      } catch (err) {
        console.error("Error subiendo avatar:", err);
      }
    }

    // Petición para actualizar datos
    try {
      const res = await fetch("http://localhost:5000/api/modificarPerfil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: usuario._id,
          nombre_completo: nombre,
          apodo,
          correo,
          avatar: avatarFinal,
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
        <div className="editar-card">
          <h1 className="titulo-editar">Modificar Perfil</h1>

          {/* ===== AVATAR ===== */}
          <div className="avatar-container">
            <img src={avatarVista} alt="Avatar" className="avatar-preview" />

            <label className="avatar-overlay">
              <span>Subir imagen</span>
              <input type="file" accept="image/*" onChange={seleccionarImagen} />
            </label>
          </div>

          {/* ===== CAMPOS ===== */}
          <div className="campo">
            <label>Nombre completo</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="input-editar"
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

          <div className="campo">
            <label>Fondo del perfil</label>
            <select
              value={fondo}
              onChange={(e) => setFondo(e.target.value)}
              className="input-editar select-editar"
            >
              <option value="default">Morado clásico Cygnus</option>
              <option value="galaxia">Galaxia</option>
              <option value="espacio">Espacio profundo</option>
              <option value="neon">Neón azul</option>
            </select>
          </div>

          {/* ===== BOTONES ===== */}
          <div className="botones-editar">
            <button className="btn-cancelar" onClick={() => onNavigate("perfil")}>
              Volver al perfil
            </button>
            <button className="btn-guardar" onClick={abrirConfirmacion}>
              Guardar cambios
            </button>
          </div>
        </div>
      </div>

      {/* ===== MODAL ===== */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>¿Guardar cambios?</h2>
            <p>Se actualizarán tus datos en Cygnus.</p>

            <div className="modal-buttons-vertical">
              <button className="btn-modal-cancelar" onClick={cancelarModal}>
                Volver al perfil
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
