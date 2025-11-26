import React, { useEffect, useState } from "react";
import api from "../api/axios";
import NavbarPrincipal from "../components/NavbarPrincipal";
import Footer from "../components/Footer";
import "./AdminUsuarios.css";

export default function AdminUsuarios({ usuario, onNavigate, onLogout }) {
  /* ============================
        ESTADOS AVATAR
  ============================ */
  const [imagenAvatar, setImagenAvatar] = useState(null);
  const [nombreAvatar, setNombreAvatar] = useState("");
  const [categoria, setCategoria] = useState("");

  /* ============================
        ESTADOS FONDO
  ============================ */
  const [imagenFondo, setImagenFondo] = useState(null);
  const [nombreFondo, setNombreFondo] = useState("");

  /* ============================
        LISTAS
  ============================ */
  const [avatares, setAvatares] = useState([]);
  const [fondos, setFondos] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ============================
        MODALES
  ============================ */
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modalTipo, setModalTipo] = useState("");
  const [eliminarModal, setEliminarModal] = useState(false);
  const [recursoAEliminar, setRecursoAEliminar] = useState({ tipo: "", id: "" });

  const cargarRecursos = async () => {
    try {
      const [A, F] = await Promise.all([
        api.get("/api/adminusuarios/avatar"),
        api.get("/api/adminusuarios/fondo")
      ]);
      setAvatares(A.data);
      setFondos(F.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    cargarRecursos();
  }, []);

  /* ============================
        ABRIR MODAL SUBIDA
  ============================ */
  const abrirModal = (tipo) => {
    if (tipo === "avatar") {
      if (!imagenAvatar) return alert("Selecciona una imagen");
      if (!nombreAvatar.trim()) return alert("Escribe un nombre");
      if (!categoria) return alert("Selecciona una categoría");
    }

    if (tipo === "fondo") {
      if (!imagenFondo) return alert("Selecciona una imagen");
      if (!nombreFondo.trim()) return alert("Escribe un nombre");
    }

    setModalTipo(tipo);
    setMostrarModal(true);
  };

  /* ============================
        CONFIRMAR SUBIDA
  ============================ */
  const confirmarSubida = async () => {
    setMostrarModal(false);
    setLoading(true);

    try {
      const form = new FormData();

      if (modalTipo === "avatar") {
        form.append("imagen", imagenAvatar);
        form.append("nombre", nombreAvatar);
        form.append("categoria", categoria);
      } else {
        form.append("imagen", imagenFondo);
        form.append("nombre", nombreFondo);
      }

      await axios.post(`/api/adminusuarios/${modalTipo}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (modalTipo === "avatar") {
        setImagenAvatar(null);
        setNombreAvatar("");
        setCategoria("");
        document.getElementById("file-avatar").value = "";
      } else {
        setImagenFondo(null);
        setNombreFondo("");
        document.getElementById("file-fondo").value = "";
      }

      cargarRecursos();
    } catch (err) {
      alert("Error al subir");
    }

    setLoading(false);
  };

  const cerrarModal = () => setMostrarModal(false);

  /* ============================
        ABRIR MODAL ELIMINAR
  ============================ */
  const abrirModalEliminar = (tipo, id) => {
    setRecursoAEliminar({ tipo, id });
    setEliminarModal(true);
  };

  const confirmarEliminar = async () => {
    setEliminarModal(false);
    try {
      await axios.delete(`/api/adminusuarios/${recursoAEliminar.tipo}/${recursoAEliminar.id}`);
      cargarRecursos();
    } catch (err) {
      alert("Error al eliminar");
    }
  };

  const cerrarEliminarModal = () => setEliminarModal(false);

  return (
    <div className="admin-page-wrapper">

      {/* 🔥 CORRECCIÓN: AQUÍ ESTÁ EL FIX */}
      <NavbarPrincipal
        usuario={usuario}
        onNavigate={onNavigate}
        onLogout={onLogout}
        currentPage="usuarios"
      />

      <main className="admin-main-content">
        <div className="admin-container">
          <h1 className="admin-title">Administración de Avatares y Fondos</h1>

          {/* ============================
                SUBIR AVATAR
          ============================ */}
          <div className="upload-section">
            <h2>Subir Avatar</h2>
            <div className="upload-box">
              <input
                type="text"
                className="input-nombre"
                placeholder="Nombre del avatar"
                value={nombreAvatar}
                onChange={(e) => setNombreAvatar(e.target.value)}
              />

              <select
                className="select-categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              >
                <option value="">Selecciona categoría</option>
                <option value="Humanos">Humanos</option>
                <option value="Animales">Animales</option>
                <option value="Robots">Robots</option>
                <option value="Alien">Alien</option>
                <option value="Abstracto">Abstracto</option>
              </select>

              <input
                type="file"
                id="file-avatar"
                accept="image/*"
                onChange={(e) => setImagenAvatar(e.target.files[0])}
              />
              <label className="upload-label" htmlFor="file-avatar">
                {imagenAvatar ? imagenAvatar.name : "Seleccionar imagen"}
              </label>

              <button
                className="btn-subir"
                disabled={!imagenAvatar || !nombreAvatar || !categoria}
                onClick={() => abrirModal("avatar")}
              >
                {loading ? "Subiendo..." : "Subir Avatar"}
              </button>
            </div>
          </div>

          {/* ============================
                LISTA AVATARES
          ============================ */}
          <h3 className="lista-title">Lista de Avatares</h3>
          <div className="grid-container">
            {avatares.length === 0 ? (
              <p className="empty-text">No hay avatares</p>
            ) : (
              avatares.map((a) => (
                <div key={a._id} className="item-card">
                  <img src={a.url} className="avatar-img" />
                  <p className="item-nombre">{a.nombre}</p>
                  <p className="item-categoria">{a.categoria}</p>

                  <button
                    className="btn-eliminar"
                    onClick={() => abrirModalEliminar("avatar", a._id)}
                  >
                    Eliminar
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="divider" />

          {/* ============================
                SUBIR FONDO
          ============================ */}
          <div className="upload-section">
            <h2>Subir Fondo</h2>
            <div className="upload-box">
              <input
                type="text"
                className="input-nombre"
                placeholder="Nombre del fondo"
                value={nombreFondo}
                onChange={(e) => setNombreFondo(e.target.value)}
              />

              <input
                type="file"
                id="file-fondo"
                accept="image/*"
                onChange={(e) => setImagenFondo(e.target.files[0])}
              />
              <label className="upload-label" htmlFor="file-fondo">
                {imagenFondo ? imagenFondo.name : "Seleccionar imagen"}
              </label>

              <button
                className="btn-subir"
                disabled={!imagenFondo || !nombreFondo}
                onClick={() => abrirModal("fondo")}
              >
                {loading ? "Subiendo..." : "Subir Fondo"}
              </button>
            </div>
          </div>

          {/* ============================
                LISTA FONDOS
          ============================ */}
          <h3 className="lista-title">Lista de Fondos</h3>
          <div className="grid-container">
            {fondos.length === 0 ? (
              <p className="empty-text">No hay fondos</p>
            ) : (
              fondos.map((f) => (
                <div key={f._id} className="item-card fondo-card">
                  <img src={f.url} className="fondo-img" />
                  <p className="item-nombre">{f.nombre}</p>

                  <button
                    className="btn-eliminar"
                    onClick={() => abrirModalEliminar("fondo", f._id)}
                  >
                    Eliminar
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* ============================
            MODAL DE SUBIDA
      ============================ */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-exito">
            <div className="modal-icon">⚠️</div>
            <h3>¿Deseas subir este {modalTipo}?</h3>
            <p>Se guardará en la base de datos.</p>
            <button className="modal-btn-aceptar" onClick={confirmarSubida}>
              Aceptar
            </button>
            <button
              className="modal-btn-aceptar"
              style={{ background: "#666", marginTop: "10px" }}
              onClick={cerrarModal}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ============================
            MODAL ELIMINAR
      ============================ */}
      {eliminarModal && (
        <div className="modal-overlay">
          <div className="modal-exito">
            <div className="modal-icon">🗑️</div>
            <h3>¿Deseas eliminar este {recursoAEliminar.tipo}?</h3>
            <p>Esta acción no se puede deshacer.</p>

            <button className="modal-btn-aceptar" onClick={confirmarEliminar}>
              Eliminar
            </button>

            <button
              className="modal-btn-aceptar"
              style={{ background: "#666", marginTop: "10px" }}
              onClick={cerrarEliminarModal}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
