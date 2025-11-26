import React, { useEffect, useState } from "react";
import NavbarPrincipal from "../components/NavbarPrincipal";
import Footer from "../components/Footer";
import "./BibliotecaUsuario.css";

const iconos = {
  documento: "https://cdn-icons-png.flaticon.com/128/337/337946.png",
  imagen: "https://cdn-icons-png.flaticon.com/128/1829/1829586.png",
  audio: "https://cdn-icons-png.flaticon.com/128/727/727245.png",
  video: "https://cdn-icons-png.flaticon.com/128/1160/1160358.png",
};

export default function Biblioteca({ usuario, onNavigate, onLogout, currentPage }) {
  const [recursos, setRecursos] = useState([]);
  const [categoria, setCategoria] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargarRecursos();
  }, []);

  const cargarRecursos = async () => {
    const res = await fetch("https://cygnus-xjo4.onrender.com/api/biblioteca");
    const data = await res.json();
    setRecursos(data);
  };

  const recursosFiltrados = recursos.filter((r) => {
    const matchCat = categoria === "todos" || r.tipo === categoria;
    const matchSearch = r.titulo.toLowerCase().includes(busqueda.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="biblioteca-page">
      <NavbarPrincipal
        usuario={usuario}
        onNavigate={onNavigate}
        onLogout={onLogout}
        currentPage={currentPage}
      />

      <main className="biblioteca-main">
        <div className="biblioteca-container">
          <h2 className="bib-title">Biblioteca Cygnus</h2>

          {/* Filtros */}
          <div className="bib-filtros">
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="bib-select"
            >
              <option value="todos">Todas las categorías</option>
              <option value="video">Videos</option>
              <option value="audio">Audios</option>
              <option value="documento">Documentos</option>
              <option value="imagen">Imágenes</option>
            </select>

            <div className="search-box">
              <input
                type="text"
                placeholder="Buscar recurso..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          {/* GRID */}
          <div className="bib-grid">
            {recursosFiltrados.length === 0 ? (
              <p className="no-result">No se encontraron recursos</p>
            ) : (
              recursosFiltrados.map((r) => (
                <div key={r._id} className="bib-card">
                  <div className="card-header">
                    <img src={iconos[r.tipo]} alt={r.tipo} className="bib-icon" />
                    <span className={`bib-tag ${r.tipo}`}>{r.tipo.toUpperCase()}</span>
                  </div>

                  <h3>{r.titulo}</h3>
                  <p>{r.descripcion}</p>

                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-descargar"
                    download
                  >
                    Descargar recurso
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
