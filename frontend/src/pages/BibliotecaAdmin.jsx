import React, { useEffect, useState } from "react";
import NavbarPrincipal from "../components/NavbarPrincipal";
import Footer from "../components/Footer";
import "./BibliotecaAdmin.css";

export default function BibliotecaAdmin({ usuario, onNavigate, onLogout, currentPage }) {
  const [recursos, setRecursos] = useState([]);
  const [categoria, setCategoria] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  // 🔹 Obtener recursos desde backend
  useEffect(() => {
    fetch("/api/biblioteca")
      .then((res) => res.json())
      .then((data) => setRecursos(data))
      .catch((err) => console.error("Error cargando biblioteca:", err));
  }, []);

  // 🔹 Filtrar recursos
  const recursosFiltrados = recursos.filter((r) => {
    const coincideCategoria = categoria === "todos" || r.tipo === categoria;
    const coincideBusqueda = r.titulo.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  return (
    <div className="biblioteca-background">
      <NavbarPrincipal
        usuario={usuario}
        onNavigate={onNavigate}
        onLogout={onLogout}
        currentPage={currentPage}
      />

      <div className="biblioteca-container">
        <h2 className="bib-title">📚 Biblioteca de Recursos</h2>

        {/* === FILTROS === */}
        <div className="bib-filtros">
          <select
            className="bib-select"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option value="todos">Todas las categorías</option>
            <option value="video">Videos</option>
            <option value="audio">Audios</option>
            <option value="documento">Documentos</option>
            <option value="imagen">Imágenes</option>
          </select>

          <div className="bib-buscador">
            <input
              type="text"
              placeholder="Buscar recurso…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bib-input"
            />
            <img
              src="https://cdn-icons-png.flaticon.com/128/622/622669.png"
              className="bib-icono"
              alt="Buscar"
            />
          </div>
        </div>

        {/* === GRID DE RECURSOS === */}
        <div className="bib-grid">
          {recursosFiltrados.length === 0 ? (
            <p className="no-result">No se encontraron recursos</p>
          ) : (
            recursosFiltrados.map((r) => (
              <div className="bib-card" key={r._id}>
                <div className="bib-header">
                  <span className={`bib-tag ${r.tipo}`}>{r.tipo}</span>
                </div>

                <h3>{r.titulo}</h3>
                <p>{r.descripcion}</p>

                <a href={r.url} target="_blank" rel="noopener noreferrer" className="bib-btn">
                  Ver recurso
                </a>
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
