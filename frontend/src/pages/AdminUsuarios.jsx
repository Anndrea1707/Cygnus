import React, { useEffect, useState } from "react";
import axios from "axios";
import NavbarPrincipal from "../components/NavbarPrincipal";
import Footer from "../components/Footer";
import "./AdminUsuarios.css";

export default function AdminUsuarios({ usuario, onNavigate, onLogout }) {
  const [imagen, setImagen] = useState(null);
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState(""); // ← categoría avatar

  const [avatares, setAvatares] = useState([]);
  const [fondos, setFondos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [modalTipo, setModalTipo] = useState("");

  const cargarRecursos = async () => {
    try {
      const [A, F] = await Promise.all([
        axios.get("/api/adminusuarios/avatar"),
        axios.get("/api/adminusuarios/fondo"),
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

  const abrirModal = (tipo) => {
    if (!imagen) return alert("Selecciona una imagen");
    if (!nombre) return alert("Escribe un nombre");

    if (tipo === "avatar" && !categoria)
      return alert("Selecciona una categoría");

    setModalTipo(tipo);
    setMostrarModal(true);
  };

  const confirmarSubida = async () => {
    setMostrarModal(false);
    setLoading(true);

    const formData = new FormData();
    formData.append("imagen", imagen);
    formData.append("nombre", nombre);

    if (modalTipo === "avatar") formData.append("categoria", categoria);

    try {
      await axios.post(`/api/adminusuarios/${modalTipo}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImagen(null);
      setNombre("");
      setCategoria("");
      document.querySelectorAll('input[type="file"]').forEach((i) => (i.value = ""));

      cargarRecursos();
    } catch (err) {
      alert("Error al subir");
    } finally {
      setLoading(false);
    }
  };

  const cerrarModal = () => setMostrarModal(false);

  const eliminarRecurso = async (tipo, id) => {
    await axios.delete(`/api/adminusuarios/${tipo}/${id}`);
    cargarRecursos();
  };

  return (
    <div className="admin-page-wrapper">
      <NavbarPrincipal usuario={usuario} onLogout={onLogout} onNavigate={onNavigate} />

      <main className="admin-main-content">
        <div className="admin-container">
          <h1 className="admin-title">Administración de Avatares y Fondos</h1>

          {/* ===========================
              SUBIR AVATAR
          =========================== */}
          <div className="upload-section">
            <h2>Subir Avatar</h2>

            <div className="upload-box">

              <input
                type="text"
                placeholder="Nombre del avatar"
                className="input-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />

              {/* SELECT CATEGORÍA */}
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
                accept="image/*"
                id="file-avatar"
                onChange={(e) => setImagen(e.target.files[0])}
              />
              <label className="upload-label" htmlFor="file-avatar">
                {imagen ? imagen.name : "Seleccionar imagen"}
              </label>

              <button
                className="btn-subir"
                disabled={!imagen || !nombre || !categoria}
                onClick={() => abrirModal("avatar")}
              >
                {loading ? "Subiendo..." : "Subir Avatar"}
              </button>
            </div>
          </div>

          {/* ===========================
              LISTA AVATARES
          =========================== */}
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
                    onClick={() => eliminarRecurso("avatar", a._id)}
                  >
                    Eliminar
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="divider" />

          {/* ===========================
              SUBIR FONDO
          =========================== */}
          <div className="upload-section">
            <h2>Subir Fondo</h2>

            <div className="upload-box">
              <input
                type="text"
                placeholder="Nombre del fondo"
                className="input-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />

              <input
                type="file"
                accept="image/*"
                id="file-fondo"
                onChange={(e) => setImagen(e.target.files[0])}
              />
              <label className="upload-label" htmlFor="file-fondo">
                {imagen ? imagen.name : "Seleccionar imagen"}
              </label>

              <button
                className="btn-subir"
                disabled={!imagen || !nombre}
                onClick={() => abrirModal("fondo")}
              >
                {loading ? "Subiendo..." : "Subir Fondo"}
              </button>
            </div>
          </div>

          {/* ===========================
              LISTA FONDOS
          =========================== */}
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
                    onClick={() => eliminarRecurso("fondo", f._id)}
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

      {/* ===========================
          MODAL CONFIRMACIÓN
      =========================== */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-confirmacion">
            <div className="modal-icon">⚠️</div>

            <h3>¿Deseas subir este {modalTipo}?</h3>
            <p>Será guardado en Cloudinary y la base de datos.</p>

            <div className="modal-btns">
              <button className="modal-btn-cancelar" onClick={cerrarModal}>
                Cancelar
              </button>

              <button className="modal-btn-aceptar" onClick={confirmarSubida}>
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
