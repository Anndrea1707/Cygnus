import React, { useEffect, useState } from "react";
import NavbarPrincipal from "../components/NavbarPrincipal";
import Footer from "../components/Footer";
import "./BibliotecaAdmin.css";

// Íconos locales o URLs
const iconos = {
  documento: "https://cdn-icons-png.flaticon.com/128/337/337946.png",
  imagen: "https://cdn-icons-png.flaticon.com/128/1829/1829586.png",
  audio: "https://cdn-icons-png.flaticon.com/128/727/727245.png",
  video: "https://cdn-icons-png.flaticon.com/128/1160/1160358.png",
};

export default function BibliotecaAdmin({ usuario, onNavigate, onLogout, currentPage }) {
  const [recursos, setRecursos] = useState([]);
  const [categoria, setCategoria] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [archivo, setArchivo] = useState(null);

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    tipo: "documento",
    categoria: "matematicas",
  });

  // Obtener recursos
  useEffect(() => {
    fetch("/api/biblioteca")
      .then((res) => res.json())
      .then((data) => setRecursos(data))
      .catch((err) => console.error(err));
  }, []);

  // Guardar formulario
  const handleSubirRecurso = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("titulo", formData.titulo);
    data.append("descripcion", formData.descripcion);
    data.append("tipo", formData.tipo);
    data.append("categoria", formData.categoria);
    data.append("archivo", archivo);

    const res = await fetch("/api/biblioteca/nuevo", {
      method: "POST",
      body: data,
    });

    const json = await res.json();

    if (json.ok) {
      setRecursos([json.recurso, ...recursos]);
      setMostrarFormulario(false);
    }
  };

  const recursosFiltrados = recursos.filter((r) => {
    const matchCat = categoria === "todos" || r.tipo === categoria;
    const matchSearch = r.titulo.toLowerCase().includes(busqueda.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="biblioteca-background">
      <NavbarPrincipal usuario={usuario} onNavigate={onNavigate} onLogout={onLogout} currentPage={currentPage} />

      <div className="biblioteca-container">
        <h2 className="bib-title">📚 Biblioteca Administrador</h2>

        {/* BOTÓN AGREGAR */}
        <button className="btn-agregar" onClick={() => setMostrarFormulario(true)}>
          ➕ Agregar recurso
        </button>

        {/* FILTROS */}
        <div className="bib-filtros">
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
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
            <span className="search-icon">🔍</span>
          </div>
        </div>

        {/* GRID */}
        <div className="bib-grid">
          {recursosFiltrados.map((r) => (
            <div className="bib-card" key={r._id}>
              <img src={iconos[r.tipo]} alt="icono" className="bib-icon" />
              <span className={`bib-tag ${r.tipo}`}>{r.tipo.toUpperCase()}</span>
              <h3>{r.titulo}</h3>
              <p>{r.descripcion}</p>

              <button className="bib-btn" onClick={() => onNavigate(`editarRecurso/${r._id}`)}>
                ✏ Editar recurso
              </button>
            </div>
          ))}
        </div>
      </div>

      <Footer />

      {/* MODAL FORMULARIO */}
      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Agregar nuevo recurso</h3>

            <form onSubmit={handleSubirRecurso}>
              <input
                type="text"
                placeholder="Título"
                required
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              />

              <textarea
                placeholder="Descripción"
                required
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              ></textarea>

              <select onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}>
                <option value="documento">Documento</option>
                <option value="imagen">Imagen</option>
                <option value="audio">Audio</option>
                <option value="video">Video</option>
              </select>

              <select onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}>
                <option value="matematicas">Matemáticas</option>
                <option value="tecnologia">Tecnología</option>
                <option value="idiomas">Idiomas</option>
              </select>

              <input type="file" required onChange={(e) => setArchivo(e.target.files[0])} />

              <div className="modal-buttons">
                <button type="submit">Guardar</button>
                <button type="button" className="btn-cancelar" onClick={() => setMostrarFormulario(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
