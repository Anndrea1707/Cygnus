import React, { useEffect, useState } from "react";
import api from "../api/axios"; // 🔥 AGREGAR IMPORT
import NavbarPrincipal from "../components/NavbarPrincipal";
import Footer from "../components/Footer";
import "./BibliotecaAdmin.css";

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
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [recursoAEliminar, setRecursoAEliminar] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    tipo: "documento",
    archivo: null,
  });

  useEffect(() => {
    cargarRecursos();
  }, []);

  const cargarRecursos = async () => {
    try {
      // 🔥 CORREGIR: Usar api en lugar de fetch
      const res = await api.get("/api/biblioteca");
      setRecursos(res.data);
    } catch (error) {
      console.error("Error cargando recursos:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const data = new FormData();
      data.append("titulo", form.titulo);
      data.append("descripcion", form.descripcion);
      data.append("tipo", form.tipo);
      if (form.archivo) data.append("archivo", form.archivo);

      // 🔥 CORREGIR: Usar api en lugar de fetch
      if (editando) {
        await api.put(`/api/biblioteca/${editando._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/api/biblioteca/nuevo", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      cargarRecursos();
      setMostrarForm(false);
      setEditando(null);
      setForm({ titulo: "", descripcion: "", tipo: "documento", archivo: null });
    } catch (error) {
      console.error("Error guardando recurso:", error);
      alert("Error al guardar el recurso");
    } finally {
      setGuardando(false);
    }
  };

  // 🔥 CORREGIR: Usar api en lugar de fetch
  const eliminarRecurso = async () => {
    if (!recursoAEliminar) return;
    try {
      await api.delete(`/api/biblioteca/${recursoAEliminar._id}`);
      cargarRecursos();
      setRecursoAEliminar(null);
    } catch (error) {
      console.error("Error eliminando recurso:", error);
      alert("Error al eliminar el recurso");
    }
  };

  const abrirModalEliminar = (recurso) => {
    setRecursoAEliminar(recurso);
  };

  const iniciarEdicion = (r) => {
    setEditando(r);
    setForm({ titulo: r.titulo, descripcion: r.descripcion, tipo: r.tipo, archivo: null });
    setMostrarForm(true);
  };

  const recursosFiltrados = recursos.filter((r) => {
    const matchCat = categoria === "todos" || r.tipo === categoria;
    const matchSearch = r.titulo.toLowerCase().includes(busqueda.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="biblioteca-page">
      <NavbarPrincipal usuario={usuario} onNavigate={onNavigate} onLogout={onLogout} currentPage={currentPage} />

      <main className="biblioteca-main">
        <div className="biblioteca-container">
          <h2 className="bib-title">Gestión de Biblioteca - Recursos</h2>

          <button className="btn-agregar" onClick={() => { setEditando(null); setForm({ titulo: "", descripcion: "", tipo: "documento", archivo: null }); setMostrarForm(true); }}>
            + Agregar Recurso
          </button>

          <div className="bib-filtros">
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="bib-select">
              <option value="todos">Todas las categorías</option>
              <option value="video">Videos</option>
              <option value="audio">Audios</option>
              <option value="documento">Documentos</option>
              <option value="imagen">Imágenes</option>
            </select>

            <div className="search-box">
              <input type="text" placeholder="Buscar recurso..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
              <span className="search-icon">Buscar</span>
            </div>
          </div>

          <div className="bib-grid">
            {recursosFiltrados.map((r) => (
              <div key={r._id} className="bib-card">
                <div className="card-header">
                  <img src={iconos[r.tipo]} alt={r.tipo} className="bib-icon" />
                  <span className={`bib-tag ${r.tipo}`}>{r.tipo.toUpperCase()}</span>
                </div>
                <h3>{r.titulo}</h3>
                <p>{r.descripcion}</p>
                <div className="card-actions">
                  <button onClick={() => iniciarEdicion(r)} className="btn-edit">Editar</button>
                  <button onClick={() => abrirModalEliminar(r)} className="btn-delete">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />

      {/* MODAL DE AGREGAR/EDITAR */}
      {mostrarForm && (
        <div className="modal-overlay" onClick={() => setMostrarForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editando ? "Editar Recurso" : "Nuevo Recurso"}</h3>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Título" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />
              <textarea placeholder="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} required />
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                <option value="documento">Documento</option>
                <option value="imagen">Imagen</option>
                <option value="audio">Audio</option>
                <option value="video">Video</option>
              </select>
              <input type="file" onChange={(e) => setForm({ ...form, archivo: e.target.files?.[0] || null })} />
              <div className="modal-buttons">
                <button type="submit" className="btn-guardar" disabled={guardando}>
                  {guardando
                    ? "Guardando..."
                    : editando
                      ? "Actualizar"
                      : "Guardar"}
                </button>
                <button type="button" className="btn-cancelar" onClick={() => setMostrarForm(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {recursoAEliminar && (
        <div className="modal-overlay">
          <div className="modal-delete">
            <div className="delete-icon">Eliminar</div>
            <h3>¿Eliminar recurso?</h3>
            <p>Estás a punto de eliminar permanentemente:</p>
            <strong>{recursoAEliminar.titulo}</strong>
            <p>Esta acción <strong>no se puede deshacer</strong>.</p>
            <div className="modal-buttons">
              <button onClick={eliminarRecurso} className="btn-delete-confirm">Sí, eliminar</button>
              <button onClick={() => setRecursoAEliminar(null)} className="btn-cancelar">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}