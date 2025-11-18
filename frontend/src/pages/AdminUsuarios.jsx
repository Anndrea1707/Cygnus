import React, { useEffect, useState } from "react";
import axios from "axios";
import NavbarPrincipal from "../components/NavbarPrincipal";
import Footer from "../components/Footer";
import "./AdminUsuarios.css";

export default function AdminUsuarios({ usuario, onNavigate, onLogout }) {
  const [imagen, setImagen] = useState(null);
  const [avatares, setAvatares] = useState([]);
  const [fondos, setFondos] = useState([]);
  const [loading, setLoading] = useState(false);

  const cargarRecursos = async () => {
    try {
      const [resA, resF] = await Promise.all([
        axios.get("/api/adminusuarios/avatar"),
        axios.get("/api/adminusuarios/fondo"),
      ]);
      setAvatares(resA.data);
      setFondos(resF.data);
    } catch (err) {
      console.error("Error al cargar recursos:", err);
    }
  };

  useEffect(() => {
    cargarRecursos();
  }, []);

  const subirImagen = async (tipo) => {
    if (!imagen) {
      alert("Selecciona una imagen primero");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("imagen", imagen);

    try {
      await axios.post(`/api/adminusuarios/${tipo}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(`${tipo === "avatar" ? "Avatar" : "Fondo"} subido con éxito 🚀`);
      setImagen(null);
      document.querySelectorAll('input[type="file"]').forEach(input => input.value = "");
      cargarRecursos();
    } catch (err) {
      alert("Error al subir la imagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-wrapper">
      {/* NAVBAR */}
      <NavbarPrincipal
        usuario={usuario}
        onLogout={onLogout}
        onNavigate={onNavigate}
        currentPage="usuarios"
      />

      {/* CONTENIDO PRINCIPAL - OCUPA TODO EL ESPACIO DISPONIBLE */}
      <main className="admin-main-content">
        <div className="admin-container">
          <h1 className="admin-title">Administración de Avatares y Fondos</h1>

          {/* SUBIR AVATAR */}
          <div className="upload-section">
            <h2>Subir Avatar</h2>
            <div className="upload-box">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImagen(e.target.files[0])}
                id="avatar-input"
              />
              <label htmlFor="avatar-input" className="upload-label">
                {imagen ? imagen.name : "Seleccionar archivo"}
              </label>
              <button
                onClick={() => subirImagen("avatar")}
                disabled={loading || !imagen}
                className="btn-subir"
              >
                {loading ? "Subiendo..." : "Subir Avatar"}
              </button>
            </div>
          </div>

          <h3 className="lista-title">Lista de Avatares</h3>
          <div className="grid-container">
            {avatares.length === 0 ? (
              <p className="empty-text">No hay avatares aún</p>
            ) : (
              avatares.map((a) => (
                <div key={a._id} className="item-card">
                  <img src={a.url} alt="Avatar" className="avatar-img" />
                  <p className="item-url">{a.url.split("/").pop()}</p>
                </div>
              ))
            )}
          </div>

          <div className="divider" />

          {/* SUBIR FONDO */}
          <div className="upload-section">
            <h2>Subir Fondo</h2>
            <div className="upload-box">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImagen(e.target.files[0])}
                id="fondo-input"
              />
              <label htmlFor="fondo-input" className="upload-label">
                {imagen ? imagen.name : "Seleccionar archivo"}
              </label>
              <button
                onClick={() => subirImagen("fondo")}
                disabled={loading || !imagen}
                className="btn-subir"
              >
                {loading ? "Subiendo..." : "Subir Fondo"}
              </button>
            </div>
          </div>

          <h3 className="lista-title">Lista de Fondos</h3>
          <div className="grid-container">
            {fondos.length === 0 ? (
              <p className="empty-text">No hay fondos aún</p>
            ) : (
              fondos.map((f) => (
                <div key={f._id} className="item-card fondo-card">
                  <img src={f.url} alt="Fondo" className="fondo-img" />
                  <p className="item-url">{f.url.split("/").pop()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* FOOTER PEGADO ABAJO */}
      <Footer />
    </div>
  );
}